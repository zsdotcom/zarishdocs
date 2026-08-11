// ZarishDocs LLM proxy — stateless edge function.
// The ONLY server-side piece of the app. It exists because Google documents
// that embedding a Gemini API key in client JS is prototyping-only: the key
// can be extracted from the bundle. A key in Worker secrets solves that AND
// the CORS restriction, at $0 on Cloudflare's free tier.
//
// One Gemini call = one outbound subrequest (well under the 50/request free
// limit) and the passthrough keeps CPU inside the 10ms free-tier budget.
// Nothing here may grow into an app server — see AGENTS.md Protected Areas.

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta";

// Free-tier grounding on 2.5 models is retired for new users (404, 2026-08-11),
// and google_search grounding is quota-blocked on new accounts. The free path
// today is url_context grounding on the current 3.x models. Whitelisting the
// model string also closes the SSRF/abuse vector of forwarding arbitrary names.
const ALLOWED_MODELS = new Set([
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
]);

const CORS_HEADERS = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
});

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowed = (env.ALLOWED_ORIGIN || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Validate the origin when the request carries one (browsers always do).
    // Requests without an Origin header (curl, server-to-server) are allowed
    // for testing, but present origins must be on the allowlist — never echo
    // an arbitrary origin back with credentials-friendly CORS.
    if (origin && !allowed.includes(origin)) {
      return json({ error: { message: "Origin not allowed" } }, 403);
    }
    const allowOrigin = origin && allowed.includes(origin) ? origin : "";

    // Preflight: browsers ask before a cross-origin POST.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS(allowOrigin),
      });
    }

    if (request.method !== "POST") {
      return json({ error: { message: "Method not allowed" } }, 405);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: { message: "Invalid JSON body" } }, 400);
    }

    const model = payload?.model;
    if (!model || !ALLOWED_MODELS.has(model)) {
      return json(
        { error: { message: `Model not allowed: ${model ?? "(missing)"}` } },
        400,
      );
    }

    // Which quota bucket is this call consuming? Grounding (google_search or
    // url_context tools) and plain generation are tracked separately by
    // Google, and a misconfiguration can miscount grounded calls against the
    // wrong bucket (ADR-001). Surface a hint so this is visible in testing.
    const isGrounded = Array.isArray(payload.tools) && payload.tools.some(
      (t) => t && (typeof t.google_search === "object" || typeof t.url_context === "object"),
    );
    const quotaBucket = isGrounded ? "grounding" : "generation";

    const upstream = await fetch(
      `${GEMINI_API}/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify(payload),
      },
    );

    // Re-emit the Gemini response with scoped CORS. Buffering is fine here —
    // responses are small JSON. If Gemini errored, surface a user-safe message
    // and keep the upstream status code so the client can branch on 429.
    const upstreamBody = await upstream.text();
    const headers = {
      "Content-Type": "application/json",
      "x-zarish-quota-bucket": quotaBucket,
      ...CORS_HEADERS(allowOrigin),
    };
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          error: {
            status: upstream.status,
            message:
              upstream.status === 429
                ? "The free-tier rate limit was reached. Wait a moment and try again."
                : `The model service returned an error (${upstream.status}).`,
          },
        }),
        { status: upstream.status, headers },
      );
    }
    return new Response(upstreamBody, { status: upstream.status, headers });
  },
};

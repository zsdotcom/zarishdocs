export function architectDocument(input) {
  if (!input || typeof input !== "object") {
    throw new Error("A research result is required before the architect can write.");
  }

  if (!Array.isArray(input.findings) || input.findings.length === 0) {
    throw new Error("At least one research finding is required.");
  }

  const architecture = {
    title: "ZarishDocs MVP Architecture",
    status: "draft",
    decisions: [
      {
        title: "Browser-first technical shell",
        detail: "The user interface, workflow orchestration, and local document generation run in the browser.",
      },
      {
        title: "Server proxy boundary",
        detail: "LLM access is normalized through a small Cloudflare Worker proxy that injects the API key.",
      },
    ],
    requirements: input.findings.map((finding) => ({
      id: finding.requirementId || "requirement",
      title: finding.title || "Requirement",
    })),
  };

  return architecture;
}

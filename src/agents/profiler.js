import { DEFAULT_MODELS } from "../api.js";

export function validateIdea(ideaText) {
  const clean = String(ideaText || "").trim();
  if (!clean) {
    return {
      ok: false,
      error: "Idea is required.",
    };
  }

  if (clean.length < 12) {
    return {
      ok: false,
      error: "Please provide more detail about the app idea.",
    };
  }

  return { ok: true, value: clean };
}

export async function profileIdea(ideaText) {
  const validation = validateIdea(ideaText);

  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const requirements = [
    {
      id: "research-scope",
      title: "Problem and target user",
      detail: "Describe the user problem, value proposition, and founder context.",
    },
    {
      id: "technical-risk",
      title: "Technical risks and integrations",
      detail: "Identify major system boundaries, external dependencies, and constraints.",
    },
    {
      id: "launch-scope",
      title: "Launch shape",
      detail: "Define an MVP that can be shipped safely and measured.",
    },
  ];

  return {
    model: DEFAULT_MODELS.profiler,
    idea: validation.value,
    requirements,
    tags: ["mvp", "research", "technical-design"],
    generatedAt: new Date().toISOString(),
  };
}

export function writeDocuments(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Architect output is required before writing.");
  }

  return {
    prd: {
      title: input.title || "ZarishDocs MVP",
      sections: ["Problem", "MVP feature set", "Success metrics"],
    },
    adr: {
      title: "ADR-001: LLM + Search Backend Architecture",
      decision: "Use the Worker proxy as the only outbound LLM edge function.",
    },
    techDesign: {
      title: "Tech Design",
      status: "draft",
      sections: ["Architecture", "Agent Pipeline", "Output Schema"],
    },
    generatedAt: new Date().toISOString(),
  };
}

// Small pure helpers shared by the agent pipeline.

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "idea";
}

// Extract ```mermaid ... ``` fenced blocks from markdown as {name, content}.
export function extractMermaid(markdown) {
  const blocks = String(markdown || "").match(/```mermaid\s*\n([\s\S]*?)```/g) || [];
  return blocks.map((block, index) => {
    const content = block.replace(/```mermaid\s*\n?/, "").replace(/```$/, "").trim();
    const firstLine = content.split("\n").find((line) => line.trim()) || "";
    const name = slugify(firstLine.replace(/^flowchart\s+\w+\s*/, "").trim() || `diagram-${index + 1}`);
    return { name, content };
  });
}

export function uniqueByUrl(citations) {
  const seen = new Set();
  return (citations || []).filter((c) => {
    if (!c?.url || seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
}

import { profileIdea } from "./agents/profiler.js";
import { researchIdea } from "./agents/research.js";
import { architectDocument } from "./agents/architect.js";
import { writeDocuments } from "./agents/writer.js";

const ideaInput = document.getElementById("idea-input");
const generateButton = document.getElementById("generate");
const clearButton = document.getElementById("clear");
const output = document.getElementById("output");
const statusTitle = document.getElementById("status-title");
const statusBadge = document.getElementById("status-badge");

function setStatus(label, type = "idle") {
  statusTitle.textContent = label;
  statusBadge.textContent = label;
  statusBadge.className = `badge badge--${type}`;
}

async function runAgents() {
  const idea = ideaInput.value;

  try {
    setStatus("Profiling", "active");
    const profile = await profileIdea(idea);

    setStatus("Researching", "active");
    const research = await researchIdea({ requirements: profile.requirements });

    setStatus("Architecting", "active");
    const architecture = architectDocument(research);

    setStatus("Writing documents", "active");
    const documents = writeDocuments(architecture);

    output.innerHTML = `
      <ul>
        <li><strong>PRD:</strong> ${documents.prd.title}</li>
        <li><strong>ADR:</strong> ${documents.adr.title}</li>
        <li><strong>Tech Design:</strong> ${documents.techDesign.title}</li>
      </ul>
    `;

    setStatus("Documents ready", "done");
  } catch (error) {
    output.innerHTML = `<p class="error">${error.message}</p>`;
    setStatus("Needs attention", "idle");
  }
}

generateButton.addEventListener("click", runAgents);
clearButton.addEventListener("click", () => {
  ideaInput.value = "";
  output.innerHTML = `<p class="empty-state">No documents generated yet.</p>`;
});

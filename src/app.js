import { profileIdea } from "./agents/profiler.js";
import { researchIdea } from "./agents/research.js";
import { architectDocument } from "./agents/architect.js";
import {
  writeDocuments,
  renderResearchMarkdown,
  documentFilenames,
  diagramFilenames,
} from "./agents/writer.js";
import { classifyFetchError } from "./errors.js";
import { isSupported, saveFiles } from "./file-writer.js";
import { incrementSessionCount, persistStorage, saveProject, saveSession } from "./db.js";

const ideaInput = document.getElementById("idea-input");
const generateButton = document.getElementById("generate");
const clearButton = document.getElementById("clear");
const saveDocsButton = document.getElementById("save-docs");
const chooseFolderButton = document.getElementById("choose-folder");
const themeToggle = document.getElementById("theme-toggle");
const output = document.getElementById("output");
const statusTitle = document.getElementById("status-title");
const statusBadge = document.getElementById("status-badge");
const fsBanner = document.getElementById("fs-banner");
const offlineBanner = document.getElementById("offline-banner");
const steps = {
  brief: document.getElementById("step-brief"),
  research: document.getElementById("step-research"),
  design: document.getElementById("step-design"),
};

const state = { profile: null, research: null, architecture: null, documents: null };

function setStatus(label, type = "idle") {
  statusTitle.textContent = label;
  statusBadge.textContent = label;
  statusBadge.className = `badge badge--${type}`;
}

function setStep(step) {
  for (const key of ["brief", "research", "design"]) {
    steps[key].classList.toggle("is-active", key === step);
  }
}

function renderError(error) {
  const normalized = error?.kind ? error : classifyFetchError(error, { status: error?.status });
  output.innerHTML = `<p class="error">${escapeHtml(normalized.message)}</p>`;
  setStatus("Needs attention", "idle");
}

async function runAgents() {
  const idea = ideaInput.value.trim();
  if (!idea) {
    renderError(new Error("Please describe your app idea first."));
    return;
  }

  generateButton.disabled = true;
  const apiKey = sessionStorage.getItem("zarishdocs:apiKey") || undefined;
  const options = { apiKey };

  try {
    setStep("brief");
    setStatus("Profiling", "active");
    state.profile = await profileIdea(idea, options);

    setStep("research");
    setStatus("Researching", "active");
    state.research = await researchIdea({ requirements: state.profile.requirements }, options);

    setStep("design");
    setStatus("Architecting", "active");
    state.architecture = await architectDocument(state.research, options);

    setStatus("Writing documents", "active");
    state.documents = await writeDocuments(state.architecture, options);

    setStatus("Documents ready", "done");
    await persistResult(idea);
    renderDocuments();
  } catch (error) {
    renderError(error);
  } finally {
    generateButton.disabled = false;
  }
}

function renderDocuments() {
  const docs = state.documents;
  const titles = [
    ["PRD", docs.prd.title],
    ["ADR", docs.adr.title],
    ["Tech Design", docs.techDesign.title],
    ["Research", "Verified facts"],
  ];
  output.innerHTML = `
    <p class="results-summary">Ready to save. Files are written to your folder or downloaded.</p>
    <ul>
      ${titles.map(([label, title]) => `<li><strong>${label}:</strong> ${escapeHtml(title)}</li>`).join("")}
    </ul>
  `;
  saveDocsButton.classList.remove("hidden");
  setStep("design");
}

function buildFiles() {
  const appName = state.profile.summary || "zarishdocs-app";
  const names = documentFilenames(appName);
  const docs = state.documents;
  const files = [
    { name: names.research, content: renderResearchMarkdown(state.research.findings) },
    { name: names.prd, content: docs.prd.content },
    { name: names.adr, content: docs.adr.content },
    { name: names.techDesign, content: docs.techDesign.content },
  ];
  for (const diagram of diagramFilenames(docs.diagrams)) {
    files.push({ name: diagram.name, content: diagram.content });
  }
  return files;
}

async function saveToFolder() {
  const files = buildFiles();
  let dirHandle = state.folderHandle;
  try {
    const result = await saveFiles(files, { dirHandle, allowPick: !dirHandle });
    state.folderHandle = result.dirHandle || dirHandle;
    if (state.folderHandle) {
      try {
        await saveProject({
          id: slugFromState(),
          createdAt: new Date().toISOString(),
          docSet: {
            prd: state.documents.prd.title,
            adr: state.documents.adr.title,
            techDesign: state.documents.techDesign.title,
          },
        });
      } catch {
        // IndexedDB is best-effort; never block saving.
      }
    }
    output.innerHTML = `<p class="success">Saved ${result.count} file(s) via ${result.mode}.</p>`;
  } catch (error) {
    renderError(error);
  }
}

async function persistResult(idea) {
  try {
    const sessionCount = await incrementSessionCount();
    await saveSession({
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      ideaText: idea.slice(0, 500),
      status: "done",
      mode: "proxy",
      sessionCount,
    });
  } catch {
    // Local persistence is best-effort.
  }
}

function slugFromState() {
  return (
    String(state.profile?.summary || "zarishdocs-app")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "zarishdocs-app"
  );
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function setupTheme() {
  const stored = localStorage.getItem("zarishdocs:theme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = stored ? stored === "dark" : prefersDark;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.querySelector(".theme-label").textContent = dark ? "Light" : "Dark";
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("zarishdocs:theme", next ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", String(next));
    themeToggle.querySelector(".theme-label").textContent = next ? "Light" : "Dark";
  });
}

function setupFileFallback() {
  if (!isSupported()) {
    fsBanner.classList.remove("hidden");
  }
  chooseFolderButton.addEventListener("click", async () => {
    try {
      const { pickFolder } = await import("./file-writer.js");
      state.folderHandle = await pickFolder();
      setStatus("Folder connected", "done");
    } catch (error) {
      renderError(error);
    }
  });
}

function setupOffline() {
  const update = () => offlineBanner.classList.toggle("hidden", navigator.onLine);
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // SW is progressive enhancement — fail silently.
    });
  }
}

function main() {
  generateButton.addEventListener("click", runAgents);
  clearButton.addEventListener("click", () => {
    ideaInput.value = "";
    output.innerHTML = `<p class="empty-state">No documents generated yet.</p>`;
    saveDocsButton.classList.add("hidden");
    setStatus("Idle");
    setStep("brief");
  });
  saveDocsButton.addEventListener("click", saveToFolder);
  setupTheme();
  setupFileFallback();
  setupOffline();
  persistStorage().catch(() => {});
  registerServiceWorker();
}

main();

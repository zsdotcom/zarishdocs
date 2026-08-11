# Gemini CLI — copy GEMINI.md, or point it at AGENTS.md

Gemini CLI's native context file is `GEMINI.md` — it does **not** read
`AGENTS.md` by default. Two ways to wire it up:

1. **Copy `GEMINI.md` from this folder** to the project root. It is a thin
   3-line pointer to `AGENTS.md`, so the universal contract stays the single
   source of truth. This works out of the box.
2. **Point Gemini CLI at `AGENTS.md` directly** by adding `AGENTS.md` to the
   context-file list in `~/.gemini/settings.json`:

   ```json
   {
     "context": {
       "fileName": ["AGENTS.md", "CONTEXT.md", "GEMINI.md"]
     }
   }
   ```

   Then no `GEMINI.md` is needed at all — Gemini CLI loads the project's
   `AGENTS.md` through the same hierarchical mechanism as its own files.

Global, all-project context lives in `~/.gemini/GEMINI.md`; add `AGENTS.md` to
`context.fileName` if you want it picked up there too.

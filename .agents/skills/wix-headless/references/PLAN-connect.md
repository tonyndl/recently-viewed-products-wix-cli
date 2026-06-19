# Plan — connect operation (custom)

The pre-approval funnel when `operation === "connect"` (the user brought a finished site to connect; `frontend: custom`, `frontendBuild: none` for static HTML or `own` for a framework SPA — resolved in `DISCOVERY-connect.md` § 1.5). Shared funnel rules — concurrency vocabulary, the two-track model, the Plan→Build contract, user-facing output, batching discipline — live in `PLAN.md`; this file is the connect funnel only. Domain (parse + infer + plan content) is owned by `DISCOVERY-connect.md`. **The funnel is framework-blind** — it parses, presents a light plan, and approves identically whether the brought-in frontend is static HTML or an SPA; only the downstream Build mechanics differ (Build routes on `frontendBuild`).

**Input = the brought-in site**, processed by parse + infer (`DISCOVERY-connect.md` §§ 1–2). **Plan shape = a light plan** (detected-site summary + what to wire/add/persist + apps, `DISCOVERY-connect.md` § 3) — not the astro Design-Direction card. The plan also resolves the **connection plan** that fills the contract's operation section (binding-map / augmentation / persistence-swap), consumed downstream only at the wiring cell.

## Wave 0 — Connect discovery → plan → approval (Path B)

**The funnel dispatches nothing.** Its only job is to parse the site, present the plan, and get approval. Same three-step shape as the create funnel, planning content aside:

1. **Parse + infer** — apply `DISCOVERY-connect.md` §§ 1–2: read the brought-in site (markup, copy, tokens; opportunistically a Claude-Design bundle), infer the domain → Wix capability (the universal floor is a Wix Forms contact/lead form), and infer the brand.
2. **Compose and PRESENT the light plan — as a standalone assistant message.** Render the connect plan (`DISCOVERY-connect.md` § 3): _what I found_ (site type + detected regions) and _what I'll connect_ (regions to **wire** + the component to **add** + apps to install). The user sees the plan before being asked to approve — do not fold the plan into the approval question.
3. **Approval gate** — _only after_ the plan message has been sent, ask the approval question (`AskUserQuestion`).

**On approval** — hold the contract in scratch (`frontend: custom` + inferred capabilities + brand + `frontendBuild`), then **open `BUILD.md`** — it routes Build on `frontendBuild` to `BUILD-own-build.md`:

- **`none` (static HTML):** bootstrap cell (`init` + connection plan) → shared Setup (app installs only; **no `env pull`, no per-pack `npm install`**) → shared Seed → wiring cell (inject `<script>`) → **inline no-build release** (`npx @wix/cli@latest release` — no `wix build`).
- **`own` (framework SPA):** bootstrap cell (`init` over the SPA + connection plan reading source) → shared Setup + **bundled `npm install @wix/sdk`** → shared Seed (incl. the CMS collection a persistence swap targets) → wiring cell (rewrite the source data layer → `@wix/data`) → **the project's own `npm run build`** → release. Never `wix build`.

> **Always connect.** The connect operation must end with the site reading from or writing to Wix; `init`+`release` of a static page with no connection is not acceptable (`references/custom/INSTRUCTIONS.md` § "Two locked principles"). The per-capability `custom/<cap>/WIRING.md` guides own the wiring step.

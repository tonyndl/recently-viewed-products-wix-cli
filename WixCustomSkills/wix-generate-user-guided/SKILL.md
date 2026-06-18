---
name: wix-generate-user-guided
description: Guides the user through Wix CLI generation (wix generate / npm run generate). The agent NEVER runs generate or creates elements; it only provides step-by-step instructions on what to pick. Use when creating a new Wix app, adding dashboards, panels, widgets, plugins, site elements, or web methods.
---

# Wix Generate — User-Guided Mode

**Rule:** The agent does **not** run `wix generate` or `npm run generate`. The agent does **not** create dashboards, panels, widgets, plugins, site elements, or web methods by running commands or writing generator output. The **user** runs the generator and makes the selections. The agent **guides** them.

## Agent Role

1. **Tell the user what to run**: e.g. `npm run generate`
2. **Tell the user what to pick** at each step of the wizard
3. **Explain the purpose** of each choice briefly
4. **Do NOT** execute generate
5. **Do NOT** create files that the generator would create (dashboard pages, panels, widgets, extensions, web methods)
6. **Do** implement logic and UI *inside* the files the user generates, once they exist

## Wizard Guidance by Scenario

### New Wix app (blank)

1. Run: `npm run generate`
2. Pick: **Wix App**
3. Follow prompts for app name and basic setup

### Dashboard page

1. Run: `npm run generate`
2. Pick: **Dashboard Page**
3. Name it (e.g. `main`, `overview`, `settings`)
4. Agent can then implement the page content in the generated file

### Settings panel (for a widget)

1. Run: `npm run generate`
2. Pick: **Panel** (or equivalent for widget settings)
3. Associate with the target widget
4. Agent implements the panel UI and `getProp`/`setProp` logic

### Site widget / custom element

1. Run: `npm run generate`
2. Pick: **Custom Element** or **Site Widget**
3. Name it (e.g. `product-viewer-360`)
4. Agent implements widget component and panel

### Backend web method

1. Run: `npm run generate`
2. Pick: **Web Method**
3. Name it (use `snake_case` or `camelCase`, e.g. `check_premium_plan` or `checkPremiumPlan`)
4. Agent merges the actual logic into the generated file

**IMPORTANT:** When implementing web methods, always use `"Anyone" as any` (or `"Admin" as any`) for permissions instead of `Permissions.Anyone`. The `Permissions` enum is not exported in all versions of `@wix/web-methods` and will silently crash the module.

### Plugin or site plugin

1. Run: `npm run generate`
2. Pick: **Plugin** or **Site Plugin**
3. Follow prompts for name and scope
4. Agent implements the plugin logic

## What the Agent Does After Generation

Once the user has generated the files:

- Implement UI, logic, and integrations
- Refactor and optimize
- Add imports, types, and error handling
- Fix bugs and lint issues
- Update related files (e.g. `extensions.ts`, routing)

## Quick Reference

| User wants to add…        | User runs generate, picks… | Agent then…                          |
|---------------------------|----------------------------|--------------------------------------|
| Dashboard page            | Dashboard Page             | Implements page content              |
| Widget settings panel     | Panel                      | Implements panel UI and props        |
| New site widget           | Custom Element / Site Widget | Implements widget + panel          |
| Backend API               | Web Method                 | Merges logic into generated file     |
| Plugin                    | Plugin / Site Plugin       | Implements plugin logic              |

## Anti-Patterns

- ❌ Agent runs `npm run generate` or `wix generate`
- ❌ Agent creates `page.tsx`, `panel.tsx`, `*.web.ts` from scratch when those should come from the generator
- ❌ Agent assumes files exist before the user has generated them

## Correct Pattern

```
User: "I need a new web method for premium check"
Agent: "Run `npm run generate`, choose Web Method, and name it e.g. checkPremiumPlan.
       Once the file is created, tell me and I'll add the premium-check logic to it."
```

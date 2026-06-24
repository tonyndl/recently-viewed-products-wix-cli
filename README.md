# Recently Viewed Products

A Wix CLI app that adds a **Recently Viewed Products** experience to a Wix Stores site. It tracks the products a visitor browses and displays them in a customizable storefront widget, with a dashboard for configuration and a plan/upgrade flow.

## Features

- **Storefront widget** — a custom element that shows each visitor's recently viewed products, with configurable layout, styling, and an optional watermark.
- **View tracker** — a lightweight embedded script injected on every storefront page that records viewed products in the visitor's own `localStorage` (first-party, no personal data, no third parties).
- **Dashboard** — manage settings, view plan status, and access how-to guidance.
- **Plan & upgrade** — premium gating with backend event handlers for install, removal, and plan changes.

## Tech stack

- [Wix CLI](https://dev.wix.com/docs/build-apps) + [`@wix/astro`](https://www.npmjs.com/package/@wix/astro) (Astro on Cloudflare)
- [`@wix/design-system`](https://www.wixdesignsystem.com/) for dashboard and panel UI
- [`@wix/data`](https://dev.wix.com/docs/sdk) for app-owned collections
- [Supabase](https://supabase.com/) for backend billing sync

## Project structure

```
src/
├── constants/                  # App-wide constants
├── extensions/
│   ├── backend/events/         # Backend event handlers (install, remove, plan changes)
│   ├── dashboard/pages/        # Dashboard UI (manage, plan & upgrade, how-to)
│   └── embedded-scripts/       # Storefront view tracker
├── pages/api/                  # API routes (check-plan, etc.)
├── site/widgets/               # Storefront custom-element widget + editor panel
└── utils/                      # HTTP, Wix Data, and JSON helpers
```

## Getting started

```bash
# install dependencies
yarn install

# run the local dev environment
yarn dev

# type-check
yarn typecheck

# build / preview / release
yarn build
yarn preview
yarn release
```

> Requires the [Wix CLI](https://dev.wix.com/docs/build-apps/develop-your-app/frameworks/wix-cli/get-started/about-the-wix-cli) and access to the app in the Wix Dev Center.

## Configuration

Backend integration files under `src/backend/_shared/` (`supabase-client.ts`, `sync-billing.ts`) hold credentials and are **git-ignored**. Create them locally before running features that depend on Supabase billing sync.

## License

Private — © prpl-io. All rights reserved.

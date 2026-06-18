@AGENTS.md

@WIX_BASE_PROJECT/CLAUDE.md

## Custom Skills

This project includes custom skill documentation in the `WixCustomSkills/` folder at the root of the app directory. Always read the relevant files in that folder before implementing any feature that has a matching skill — they contain project-specific patterns, conventions, and reusable code that take precedence over general Wix documentation.

Read all files in `WixCustomSkills/` at the start of any new task so you are aware of every available skill.
 
## Project Structure

```
src/
├── constants/
│   └── index.ts                  # App-wide constants: COLLECTION_ID, APP_ID, free limits, etc.
├── extensions/
│   └── dashboard/
│       ├── types.d.ts            # Shared dashboard types — declared globally, no import needed
│       └── pages/
│           └── <page-name>/
│               ├── <page-name>.extension.ts      # Wix extension registration
│               ├── <page-name>.tsx               # Main dashboard page component
│               ├── <page-name>-actions.ts        # All API calls for this page
│               ├── upgradeUtils.ts               # Premium/upgrade helpers
│               ├── ManageItemsTab/               # "Manage Items" tab
│               │   ├── index.tsx
│               │   ├── styles/
│               │   │   └── index.ts
│               │   └── ui/
│               │       ├── <SubComponent>.tsx
│               │       └── styles/
│               │           └── <SubComponent>.ts
│               ├── PlanUpgradeTab/               # "Plan & Upgrade" tab
│               │   ├── index.tsx
│               │   ├── utils.ts
│               │   ├── styles/
│               │   │   └── index.ts
│               │   └── ui/
│               │       ├── cardHeader.tsx
│               │       ├── pricingTierCard.tsx
│               │       └── styles/
│               │           ├── cardHeader.ts
│               │           └── pricingTierCard.ts
│               ├── HowToUseTab/                  # "How to Use" tab
│               │   ├── index.tsx
│               │   └── styles/
│               │       └── index.ts
│               ├── OnboardingSlideshow/          # First-run onboarding slideshow
│               │   ├── index.tsx
│               │   └── styles/
│               │       └── index.ts
│               ├── MoreAppsByUs/                 # Footer — cross-promotion section
│               │   ├── index.tsx
│               │   ├── styles/
│               │   │   └── index.ts
│               │   └── ui/
│               │       ├── appCard.tsx
│               │       └── styles/
│               │           └── appCard.ts
│               └── CurrentPlanCard/              # Current plan status card
│                   ├── index.tsx
│                   └── styles/
│                       └── index.ts
├── pages/
│   └── api/
│       ├── check-plan.ts         # GET → { isPremium, upgradeUrl }
│       └── <collection>.ts       # CRUD endpoints for your Wix Data collection
├── site/
│   └── widgets/
│       └── custom-elements/
│           └── <widget-name>/
│               ├── <widget-name>.extension.ts
│               ├── types.ts
│               ├── constants.ts
│               ├── panel/                        # Editor settings panel
│               │   ├── index.tsx
│               │   └── ui/
│               │       ├── <section>.tsx
│               │       └── styles/
│               │           └── <section>.ts
│               └── widget/                       # Site-facing widget
│                   ├── index.tsx
│                   ├── styles/
│                   │   └── widget.ts
│                   └── ui/
│                       ├── <component>.tsx
│                       └── styles/
│                           └── <component>.ts
└── utils/
    ├── request.ts                # Authenticated HTTP helpers (httpGet/Post/Patch/Delete)
    ├── api.ts                    # Wix Data CRUD helpers (getAPI/postAPI/patchAPI/deleteAPI)
    └── customJson.ts             # JSON Response factory
```

---

## Wix Data Collections

### Always create collections via a data extension — never manually
Do NOT create collections manually through the Wix CMS dashboard UI, and do NOT use the REST API or MCP. The correct approach for Wix CLI apps is a **data collection extension** in code. Collections created manually in the CMS are site-level collections that `auth.elevate` cannot write to — only app-owned collections (created via the extension) support `PRIVILEGED` write access.

### Step-by-step: adding a new collection

**Step 1 — Create `src/extensions/data/extensions.ts`**

```ts
import { extensions } from '@wix/astro/builders';

export const dataExtension = extensions.genericExtension({
  compId: '<unique-uuid>',
  compName: 'data-extension',
  compType: 'DATA_COMPONENT',
  compData: {
    dataComponent: {
      collections: [
        {
          schemaUrl: 'https://www.wix.com/',
          idSuffix: '<CollectionName>',
          displayName: '<Display Name>',
          displayField: 'title',
          fields: [
            { key: 'title',      displayName: 'Title',      type: 'TEXT',     required: true },
            { key: 'myDate',     displayName: 'My Date',    type: 'DATETIME', required: true },
            { key: 'myText',     displayName: 'My Text',    type: 'TEXT'                     },
            { key: 'order',      displayName: 'Order',      type: 'NUMBER'                   },
          ],
          dataPermissions: {
            itemRead:   'ANYONE',
            itemInsert: 'PRIVILEGED',
            itemUpdate: 'PRIVILEGED',
            itemRemove: 'PRIVILEGED',
          },
        },
      ],
    },
  },
});
```

Valid field types: `TEXT`, `RICH_TEXT`, `NUMBER`, `BOOLEAN`, `DATETIME`, `URL`, `EMAIL`.

**Step 2 — Register in `src/extensions.ts`**

```ts
import { dataExtension } from './extensions/data/extensions.ts';

export default app()
  .use(countdownTimer)
  .use(dataExtension)
```

**Step 3 — Release and install**

```bash
wix release
```

Then go to **Wix dashboard → Apps → Manage Apps → [Your App]** and click the **Update** button if it appears, or reinstall the app. The collection is created automatically on install/update.

**Step 4 — Verify COLLECTION_ID**

The collection ID format is: `@{namespace}/{idSuffix}` (e.g. `@lebohangmdl/countdown-timer/CountdownTimers`). The namespace comes from `wix.config.json`. Confirm the actual ID by checking the CMS — the collection appears grouped under the namespace header.

Set it in `src/constants/index.ts`:
```ts
export const COLLECTION_ID = '@lebohangmdl/countdown-timer/CountdownTimers';
```

### Important rules
- Only one `DATA_COMPONENT` is allowed per app. If a Self-hosted extension already exists in the Wix Dev Center, delete it before adding the TypeScript one — otherwise `wix dev` will fail with "There can be only a single [DATA_COMPONENT] per app."
- The collection is **only created at app install/update time**, not during `wix dev`. You must release and install/update for the collection to appear.
- Collection changes take up to 5 minutes to propagate after install — if the API reports the collection doesn't exist immediately after install, wait and retry.
- After the collection appears, restart `wix dev` to pick up the new context.

For this project the collection is defined in [src/extensions/data/extensions.ts](src/extensions/data/extensions.ts) with `COLLECTION_ID = '@lebohangmdl/countdown-timer/CountdownTimers'`.

---

## Component Architecture Rules

### Global CSS — import only in the root page file
Only import `@wix/design-system/styles.global.css` once, in the top-level dashboard page component. Never import it in sub-components — it is a single global stylesheet and duplicate imports cause TypeScript errors (`Cannot find module or type declarations for side-effect import`).

```tsx
// ✅ countdown-timer.tsx (root page only)
import '@wix/design-system/styles.global.css';

// ❌ ManageItemsTab/index.tsx, MoreAppsByUs/index.tsx, etc. — never here
```

### Text buttons — always use `TextButton`
For any clickable text link or inline action that is not a full button, use the `TextButton` component from `@wix/design-system`. Never use a plain `<a>` or `<span onClick>` for these.

```tsx
import { TextButton } from '@wix/design-system';

<TextButton onClick={handleAction}>Do Something</TextButton>
```

### Text rendering — ALWAYS use the WDS `Text` component — no exceptions
Every piece of visible text — numbers, digits, labels, descriptions, headings — MUST use the `Text` component from `@wix/design-system`. **Never** use bare `<p>`, `<span>`, or `<div>` to render visible text under any circumstances, including in widget unit components when rendered in a panel context (`isPanel=true`). Using bare HTML elements causes the wrong font family in the Wix editor panel.

```tsx
import { Text } from '@wix/design-system';

// ✅ correct
<Text size="small" secondary>Description</Text>
<Text weight="bold">Label</Text>
<Text size="tiny" weight="bold">{digit}</Text>   // countdown digit in panel
<Text size="tiny">{label}</Text>                  // "DAYS", "HOURS" etc.

// ❌ never — even for numbers or short text
<span style={...}>{digit}</span>
<div>{label}</div>
```

### Shared types — always use `types.d.ts`
Each folder that has types used across multiple files must have a `types.d.ts` file at its root. Declare these as global interfaces (no `export` keyword) so they are available everywhere in that folder without any imports.

Example `src/extensions/dashboard/types.d.ts`:
```ts
interface PlanPrice {
  priceBeforeTax: string;
  totalPrice: string;
  billingCycle: {
    cycleType: string;
    cycleDuration?: { unit: string; count: number };
  };
}

interface AppPlan {
  _id: string;
  name: string;
  benefits: string[];
  prices: PlanPrice[];
}

interface PlanPricing {
  plans: AppPlan[];
  currency: string;
  showPriceWithTax: boolean;
}

interface PricingTier {
  name: string;
  planId?: string;
  yearlyPlanId?: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  savingsPercent?: number;
  features: string[];
  popular?: boolean;
}
```

### Component decomposition — always break large components apart
No single component should handle more than one logical section. Split into focused sub-components inside a `ui/` subfolder — each gets its own file.

```
ManageItemsTab/
  index.tsx              ← orchestrates the tab, passes props down
  styles/index.ts        ← tab-level styles
  ui/
    itemRow.tsx          ← single item row
    itemSkeletonRow.tsx  ← loading skeleton
    freeLimitBanner.tsx  ← upgrade nudge banner
    styles/
      itemRow.ts
      itemSkeletonRow.ts
      freeLimitBanner.ts
```

### Styles — always in a separate file
Never put component styles inside the component file. Create a `styles/` subfolder with a `.ts` file that exports a `styles` object and any dynamic style functions.

```ts
// ui/styles/itemRow.ts
import type { CSSProperties } from 'react';

export const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #E5E5E5',
  } as CSSProperties,
};
```

```tsx
// ui/itemRow.tsx
import { styles } from './styles/itemRow';

<div style={styles.row}>...</div>
```

### Actions — always in `<page>-actions.ts`
All API calls for a dashboard page live in a dedicated `<page-name>-actions.ts` file. The component only calls these functions — it never constructs URLs or calls `httpGet`/`httpPost` directly.

```ts
// item-manager-actions.ts
import { httpGet, httpPost, httpPatch, httpDelete } from '../../../../utils/request';

const baseApiUrl = new URL(import.meta.url).origin;

export interface ItemRecord {
  _id: string;
  name: string;
  order?: number;
}

export const fetchItems = () =>
  httpGet(`${baseApiUrl}/api/items`).then((res) => res.json() as Promise<ItemRecord[]>);

export const postItem = (name: string, order: number) =>
  httpPost(`${baseApiUrl}/api/items`, { name, order }).then((res) => res.json() as Promise<ItemRecord>);

export const patchItem = (id: string, name: string, order?: number) =>
  httpPatch(`${baseApiUrl}/api/items`, { _id: id, name, order }).then((res) => res.json() as Promise<ItemRecord>);

export const deleteItemById = (id: string) =>
  httpDelete(`${baseApiUrl}/api/items`, id);

export const fetchPlan = () =>
  httpGet(`${baseApiUrl}/api/check-plan`).then((res) => res.json());

// Synchronous — reads directly from the Wix Dashboard SDK, no API route needed
export const fetchEditorUrl = (): string | null =>
  dashboard.getSiteInfo()?.editorUrl ?? null;
```

### Panel and Widget — always in their own subfolders
The editor settings panel and the site-facing widget must each live in their own subfolder (`panel/` and `widget/`) within the custom element folder. Never mix panel and widget code at the same level.

---

## Dashboard Structure

Every dashboard page follows this layout:

### Header
- **Top-left**: page title and subtitle  
- **Top-right action bar** (order matters):
  1. "Upgrade to Premium" button — `skin="premium"`, `PremiumFilled` icon — visible only when `!isPremium && upgradeUrl`
  2. "Open in Editor" button — `skin="inverted"`, `Edit` icon — always visible
  3. Primary action button (e.g. "Add Item") — always visible

```tsx
import { Page, Box, Button } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { Add } from '@wix/wix-ui-icons-common/classic-editor';

<Page.Header
  title="[App Name]"
  subtitle="[Short description]"
  actionsBar={
    <Box gap="12px" align="center">
      {!isPremium && upgradeUrl && (
        <Button
          skin="premium"
          prefixIcon={<Icons.PremiumFilled />}
          onClick={() => window.open(upgradeUrl, '_blank')}
        >
          Upgrade to Premium
        </Button>
      )}
      <Button
        skin="inverted"
        prefixIcon={<Icons.Edit />}
        onClick={() => editorUrl && window.open(editorUrl, '_blank')}
      >
        Open in Editor
      </Button>
      <Button prefixIcon={<Add />} onClick={openAddModal}>
        Add Item
      </Button>
    </Box>
  }
/>
```

### Navigation — 3 tabs
```tsx
import { Tabs } from '@wix/design-system';

<Tabs
  activeId={activeTab + 1}
  onClick={({ id }) => setActiveTab((id as number) - 1)}
  items={[
    { id: 1, title: 'Manage Items' },
    { id: 2, title: 'Plan & Upgrade' },
    { id: 3, title: 'How to Use' },
  ]}
/>
```

### Body
- **Tab 0 — Manage Items**: On first visit with zero items, show `<OnboardingSlideshow />`. Otherwise show `<ManageItemsTab />`.
- **Tab 1 — Plan & Upgrade**: `<PlanUpgradeTab />` — see `WIX_BASE_PROJECT/docs/components/plan-upgrade-tab.md`
- **Tab 2 — How to Use**: `<HowToUseTab />` — see `WIX_BASE_PROJECT/docs/components/how-to-use-tab.md`

Placeholder `ManageItemsTab` (replace body with your app's logic):
```tsx
// ManageItemsTab/index.tsx
import type { FC } from 'react';
import { Box, Text } from '@wix/design-system';

export const ManageItemsTab: FC = () => (
  <Box marginTop="SP5">
    <Text>Your items will appear here.</Text>
  </Box>
);
```

### Footer
Always render `<MoreAppsByUs />` below Tab 0. See `WIX_BASE_PROJECT/docs/components/more-apps-by-us.md`.

```tsx
{activeTab === 0 && <MoreAppsByUs />}
```

**AppCard description text must always be centered.** WDS `Text` does not forward `style` props, so `textAlign: 'center'` must go on the wrapping `div`, not on `<Text>` itself:

```tsx
// styles/appCard.ts
descriptionWrapper: {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
} as CSSProperties,

// appCard.tsx
<div style={styles.descriptionWrapper}>
  <Text size="tiny" secondary>{description}</Text>
</div>
```

---

## Add / Edit Modal Pattern

Every "Add Item" and "Edit Item" modal in a dashboard page follows this exact pattern. Deviating from it causes scrollbars, layout gaps, or textarea clipping.

### Rules
- **Never set a fixed `height`** on `CustomModalLayout` — let it auto-size to its content.
- **Never use `rows` on `InputArea`** for modals — use `autoGrow` + `minRowsAutoGrow` instead. Using `rows` creates a fixed-height textarea that causes a second inner scrollbar when content overflows.
- **Always add `paddingBottom="SP4"`** to the content `Box` — this ensures breathing room between the last field and the modal footer, preventing the outer modal scroll from triggering.
- Use `screen="desktop"` on `Modal`.
- Use `width="500px"` on `CustomModalLayout` (adjust as needed, but never add `height`).

### Full example

```tsx
import {
  Modal,
  CustomModalLayout,
  Box,
  FormField,
  Input,
  InputArea,
  Loader,
  Text,
} from '@wix/design-system';

{/* Add / Edit Modal */}
<Modal isOpen={isModalOpen} onRequestClose={closeModal} screen="desktop">
  <CustomModalLayout
    title={editingItem ? 'Edit Item' : 'Add Item'}
    subtitle={editingItem ? 'Update your item.' : 'Create a new item.'}
    primaryButtonText={saving ? 'Saving...' : editingItem ? 'Update' : 'Save'}
    primaryButtonOnClick={handleSave}
    primaryButtonProps={{ disabled: saving, prefixIcon: saving ? <Loader size="tiny" /> : undefined }}
    secondaryButtonText="Cancel"
    secondaryButtonOnClick={closeModal}
    onCloseButtonClick={closeModal}
    width="500px"
  >
    <Box direction="vertical" gap="SP4" paddingBottom="SP4">
      {formError && (
        <Text size="small" skin="error">{formError}</Text>
      )}
      <FormField label="Title" required>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. My Item"
          status={formError && !form.title.trim() ? 'error' : undefined}
        />
      </FormField>
      <FormField label="Description (optional)">
        <InputArea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Optional description"
          autoGrow
          minRowsAutoGrow={4}
        />
      </FormField>
    </Box>
  </CustomModalLayout>
</Modal>

{/* Delete Confirmation Modal */}
<Modal isOpen={deleteConfirmId !== null} onRequestClose={() => setDeleteConfirmId(null)} screen="desktop">
  <CustomModalLayout
    title="Delete Item"
    subtitle="Are you sure you want to delete this item? This cannot be undone."
    primaryButtonText={deleting ? 'Deleting...' : 'Delete'}
    primaryButtonOnClick={handleDeleteConfirm}
    primaryButtonProps={{ disabled: deleting, skin: 'destructive' }}
    secondaryButtonText="Cancel"
    secondaryButtonOnClick={() => setDeleteConfirmId(null)}
    onCloseButtonClick={() => setDeleteConfirmId(null)}
    width="400px"
  />
</Modal>
```

### State wiring

```tsx
const emptyForm = { title: '', description: '' };

const [isModalOpen, setIsModalOpen] = useState(false);
const [editingItem, setEditingItem] = useState<ItemRecord | null>(null);
const [form, setForm] = useState(emptyForm);
const [saving, setSaving] = useState(false);
const [formError, setFormError] = useState('');
const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);

const openAddModal = () => {
  setEditingItem(null);
  setForm(emptyForm);
  setFormError('');
  setIsModalOpen(true);
};

const openEditModal = (item: ItemRecord) => {
  setEditingItem(item);
  setForm({ title: item.title, description: item.description ?? '' });
  setFormError('');
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setEditingItem(null);
  setForm(emptyForm);
  setFormError('');
};
```

---

## Backend API: Premium Status

### `src/pages/api/check-plan.ts`
See `WIX_BASE_PROJECT/docs/api/check-plan.md` for the full file.

Returns `{ isPremium: boolean, upgradeUrl?: string }`. Call on mount to gate premium features.

Fetch in actions file:
```ts
export const fetchPlan = () =>
  httpGet(`${baseApiUrl}/api/check-plan`).then((res) => res.json());
```

Use in dashboard component:
```tsx
useEffect(() => {
  fetchPlan().then(({ isPremium, upgradeUrl }) => {
    setIsPremium(isPremium);
    setUpgradeUrl(upgradeUrl);
  });
}, []);
```

### Editor URL — no API route needed
Use `dashboard.getSiteInfo()?.editorUrl` directly from `@wix/dashboard`. This is synchronous — no `useEffect` or `useState` required.

```ts
// in <page>-actions.ts
import { dashboard } from '@wix/dashboard';

export const fetchEditorUrl = (): string | null =>
  dashboard.getSiteInfo()?.editorUrl ?? null;
```

```tsx
// in the dashboard component — call directly, no async wiring
const editorUrl = fetchEditorUrl();
```

---

## Helper Utilities

### `src/utils/request.ts` — Authenticated HTTP client
Wraps `@wix/essentials` `httpClient.fetchWithAuth`. Always use these instead of raw `fetch` — they include Wix auth headers automatically.

```ts
// src/utils/request.ts
import { httpClient } from '@wix/essentials';

export const httpGet = (url: string, options?: RequestInit) =>
  httpClient.fetchWithAuth(url, { ...options, method: 'GET' });

export const httpPost = (url: string, body: unknown, options?: RequestInit) =>
  httpClient.fetchWithAuth(url, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(body),
  });

export const httpPatch = (url: string, body: unknown, options?: RequestInit) =>
  httpClient.fetchWithAuth(url, {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(body),
  });

export const httpDelete = (url: string, id?: unknown, options?: RequestInit) =>
  httpClient.fetchWithAuth(url, {
    ...options,
    method: 'DELETE',
    ...(id !== undefined && {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify({ id }),
    }),
  });
```

Usage:
```ts
const res = await httpGet('/api/items');
const items = await res.json();

await httpPost('/api/items', { name: 'New', order: 1 });
await httpPatch('/api/items', { _id: '123', name: 'Updated' });
await httpDelete('/api/items', itemId);
```

### `src/utils/customJson.ts` — JSON Response factory
Use in every API route to return a typed JSON `Response` without repeating the `Content-Type` header.

```ts
// src/utils/customJson.ts
export const customJson = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
```

Usage in an API route:
```ts
import { customJson } from '../../utils/customJson';

return customJson({ items });
return customJson({ error: 'Not found' }, { status: 404 });
```

### `src/utils/api.ts` — Wix Data CRUD helpers
Pre-wired CRUD helpers for a single Wix Data collection. Reads `COLLECTION_ID` from `src/constants/index.ts`. Handles `auth.elevate` automatically.

```ts
// src/utils/api.ts
import { auth } from '@wix/essentials';
import { customJson } from './customJson';
import { COLLECTION_ID } from '../constants';
import { items } from '@wix/data';

type QueryResult = Awaited<ReturnType<ReturnType<typeof items.query>['find']>>;

export const getAPI = (
  direction: 'ascending' | 'descending',
  directionField: string,
  transform: (result: QueryResult) => unknown = (result) => result.items,
) =>
  items
    .query(COLLECTION_ID)
    [direction](directionField)
    .find()
    .then((result) => customJson(transform(result)))
    .catch((error: unknown) => customJson({ error: String(error) }, { status: 500 }));

type InsertResult = Awaited<ReturnType<typeof items.insert>>;
type UpdateResult = Awaited<ReturnType<typeof items.update>>;

export const postAPI = (
  request: Request,
  transform: (result: InsertResult) => unknown = (result) => result,
) =>
  request
    .json()
    .then((body) => auth.elevate(items.insert)(COLLECTION_ID, body))
    .then((result) => customJson(transform(result)))
    .catch((error: unknown) => customJson({ error: String(error) }, { status: 500 }));

export const patchAPI = (
  request: Request,
  transform: (result: UpdateResult) => unknown = (result) => result,
) =>
  request
    .json()
    .then((body) => auth.elevate(items.update)(COLLECTION_ID, body))
    .then((result) => customJson(transform(result)))
    .catch((error: unknown) => customJson({ error: String(error) }, { status: 500 }));

export const deleteAPI = (
  request: Request,
  transform: () => unknown = () => ({ success: true }),
) =>
  request
    .json()
    .then(({ id }) => auth.elevate(items.remove)(COLLECTION_ID, id))
    .then(() => customJson(transform()))
    .catch((error: unknown) => customJson({ error: String(error) }, { status: 500 }));
```

Usage in an API route file:
```ts
import type { APIRoute } from 'astro';
import { getAPI, postAPI, patchAPI, deleteAPI } from '../../utils/api';

export const GET: APIRoute = () => getAPI('ascending', 'order');
export const POST: APIRoute = ({ request }) => postAPI(request);
export const PATCH: APIRoute = ({ request }) => patchAPI(request);
export const DELETE: APIRoute = ({ request }) => deleteAPI(request);
```

### ⚠️ CRITICAL: Widget extensions MUST include a `presets` configuration

**Without `presets`, the widget will NOT appear in the Wix editor's Add Elements → App Widgets list.** Users will be unable to find or add the widget to their pages. This is a hard requirement for every widget — never skip it.

Always add a `presets` array to `extensions.customElement`. Keep `autoAdd: true` alongside it — `presets` makes the widget discoverable in the panel, `autoAdd` makes "Add to Site" work on install. Both are needed.

```ts
// ✅ Correct — widget appears in App Widgets list AND auto-adds on install
export const myWidget = extensions.customElement({
  id: '<unique-uuid>',
  name: 'My Widget',
  tagName: 'my-widget',
  element: './site/widgets/custom-elements/my-widget/widget/index.tsx',
  settings: './site/widgets/custom-elements/my-widget/panel/index.tsx',
  installation: { autoAdd: true },
  width: { defaultWidth: 650, allowStretch: true },
  height: { defaultHeight: 280 },
  presets: [
    {
      id: '<another-unique-uuid>',
      name: 'My Widget',
      thumbnailUrl: '{{BASE_URL}}/public/my-widget-thumbnail.png',
    },
  ],
});

// ❌ Wrong — widget is invisible in the App Widgets list
export const myWidget = extensions.customElement({
  id: '<unique-uuid>',
  name: 'My Widget',
  tagName: 'my-widget',
  element: '...',
  settings: '...',
  installation: { autoAdd: true },
  // missing presets!
});
```

- `thumbnailUrl` can be a local file via `{{BASE_URL}}/public/filename.png` or any publicly hosted image URL.
- Place the thumbnail image in the `public/` folder at the project root.
- The preset `id` must be a unique UUID — generate a new one, never reuse the widget's `id`.

---

## Component Reference Docs

Before building any of the following, read the corresponding doc so you replicate the exact structure and pattern:

| Component / File | Doc |
|---|---|
| OnboardingSlideshow | `WIX_BASE_PROJECT/docs/components/onboarding-slideshow.md` |
| MoreAppsByUs | `WIX_BASE_PROJECT/docs/components/more-apps-by-us.md` |
| PlanUpgradeTab | `WIX_BASE_PROJECT/docs/components/plan-upgrade-tab.md` |
| HowToUseTab | `WIX_BASE_PROJECT/docs/components/how-to-use-tab.md` |
| check-plan API | `WIX_BASE_PROJECT/docs/api/check-plan.md` |
| upgradeUtils | `WIX_BASE_PROJECT/docs/api/upgrade-utils.md` |
| FreeLimitBanner | `WIX_BASE_PROJECT/docs/api/free-limit-banner.md` |

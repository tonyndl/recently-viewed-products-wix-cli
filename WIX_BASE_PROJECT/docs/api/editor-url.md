# editor-url

Opens the Wix Editor deep-linked to this specific app so the user lands directly on the right context, not the generic editor root.

---

## Preferred implementation — synchronous, no API route

Use `dashboard.getSiteInfo()?.editorUrl` from `@wix/dashboard` and append `?appDefinitionId={APP_ID}` to deep-link into the app. This is synchronous — no `useEffect`, no API route, no async wiring.

Add `APP_ID` to `src/constants/index.ts`:

```ts
// src/constants/index.ts
export const APP_ID = 'e24ccf8c-8cd5-4e03-b1bc-00a93a4b265d'; // from wix.config.json
```

Build the URL in the actions file:

```ts
// <page>-actions.ts
import { dashboard } from '@wix/dashboard';
import { APP_ID } from '../../../../constants';

export const fetchEditorUrl = (): string | null => {
  const base = dashboard.getSiteInfo()?.editorUrl;
  if (!base) return null;
  return `${base}?appDefinitionId=${APP_ID}`;
};
```

Call it directly in the component — no state or effect needed:

```tsx
// dashboard component
const editorUrl = fetchEditorUrl();

// In JSX:
<Button
  skin="inverted"
  prefixIcon={<Icons.Edit />}
  onClick={() => editorUrl && window.open(editorUrl, '_blank')}
>
  Open in Editor
</Button>
```

The `?appDefinitionId` query param tells the Wix Editor to open and focus the app's widget/settings panel, giving the user a direct path instead of landing on the editor root.

---

## Legacy — API route approach

The route below still works but is unnecessary overhead now that `dashboard.getSiteInfo()` is available on the client. Prefer the synchronous approach above for all new pages.

```ts
// src/pages/api/editor-url.ts
import type { APIRoute } from 'astro';
import { auth } from '@wix/essentials';
import { editor } from '@wix/urls';
import { customJson } from '../../utils/customJson';

export const GET: APIRoute = () =>
  auth.elevate(editor.getEditorUrls)()
    .then((res) => customJson({ editorUrl: res.urls?.editorUrl ?? null }))
    .catch((error: unknown) => {
      console.error('[api/editor-url] GET failed:', error);
      return customJson({ error: String(error) }, { status: 500 });
    });
```

Fetching and wiring when using the route:

```ts
// actions file
export const fetchEditorUrl = () =>
  httpGet(`${baseApiUrl}/api/editor-url`)
    .then((res: Response) => res.json())
    .then(({ editorUrl }: { editorUrl: string | null }) => editorUrl);
```

```tsx
// dashboard component
const [editorUrl, setEditorUrl] = useState<string | null>(null);

useEffect(() => {
  fetchEditorUrl()
    .then(setEditorUrl)
    .catch((err) => console.error('[dashboard] editor URL error:', err));
}, []);
```

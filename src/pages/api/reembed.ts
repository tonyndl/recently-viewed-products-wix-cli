import type { APIRoute } from "astro";
import { customJson } from "../../utils/customJson";
import { getSupabase } from "../../backend/_shared/supabase-client";
import { APP_ID } from "../../constants";
import {
  WIX_APP_CLIENT_SECRET,
  REEMBED_ADMIN_TOKEN,
} from "../../backend/_shared/reembed-config";

// One-off backend pass that injects the Recently Viewed tracker into every
// EXISTING install — no merchant interaction, no reinstall. This is the
// Blocks-style approach (see wix-blocks-app/src/backend/embed-utils.jsw):
//
//   for each installed instance:
//     1. POST /oauth2/token (client_credentials + instance_id) → access_token
//     2. POST /apps/v1/scripts (Authorization: access_token) → embed the script
//
// `embedScript()` only ever targets the current auth context's site, which is
// why new installs are handled in the app-install event handler. To reach OTHER
// already-installed sites we mint a per-instance token here, exactly like the
// Blocks app did.
//
//   GET /api/reembed?token=<REEMBED_ADMIN_TOKEN>[&limit=100&offset=0]
//
// Gated by REEMBED_ADMIN_TOKEN so only you can run it. Supports limit/offset so
// large install bases can be processed in batches (avoids worker time limits).

const TOKEN_URL = "https://www.wixapis.com/oauth2/token";
const SCRIPTS_URL = "https://www.wixapis.com/apps/v1/scripts";

// client_credentials token scoped to a single app instance (site).
const getInstanceToken = async (instanceId: string): Promise<string | null> => {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: APP_ID,
      client_secret: WIX_APP_CLIENT_SECRET,
      instance_id: instanceId,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
};

// Embed the (single) embedded script for the instance the token belongs to.
// Our tracker has no dynamic parameters → empty `parameters`; single script →
// no `componentId`.
const embedForInstance = async (token: string): Promise<boolean> => {
  const res = await fetch(SCRIPTS_URL, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ properties: { parameters: {} } }),
  });
  return res.ok;
};

const reembed = async (instanceId: string): Promise<boolean> => {
  const token = await getInstanceToken(instanceId);
  if (!token) return false;
  return embedForInstance(token);
};

// Run `tasks` with bounded concurrency so we don't hammer the token/scripts APIs.
const inBatches = async <T>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<boolean>,
): Promise<{ ok: number; failed: string[] }> => {
  let ok = 0;
  const failed: string[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const results = await Promise.all(
      batch.map((item) =>
        fn(item)
          .then((success) => ({ item, success }))
          .catch(() => ({ item, success: false })),
      ),
    );
    for (const { item, success } of results) {
      if (success) ok += 1;
      else failed.push(String(item));
    }
  }
  return { ok, failed };
};

const run = async (url: URL): Promise<Response> => {
  const token = url.searchParams.get("token");
  if (!REEMBED_ADMIN_TOKEN || token !== REEMBED_ADMIN_TOKEN) {
    return customJson({ error: "unauthorized" }, { status: 401 });
  }

  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit")) || 100, 1),
    500,
  );
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_installations")
    .select("instance_id")
    .eq("is_active", true)
    .range(offset, offset + limit - 1);

  if (error) return customJson({ error: String(error) }, { status: 500 });

  const instanceIds = (data ?? [])
    .map((r) => (r as { instance_id?: string }).instance_id)
    .filter((id): id is string => Boolean(id));

  const { ok, failed } = await inBatches(instanceIds, 5, reembed);

  return customJson({
    processed: instanceIds.length,
    embedded: ok,
    failed: failed.length,
    failedInstanceIds: failed,
    nextOffset: instanceIds.length === limit ? offset + limit : null,
  });
};

export const GET: APIRoute = ({ url }) => run(url);
export const POST: APIRoute = ({ url }) => run(url);

import type { APIRoute } from "astro";
import { auth } from "@wix/essentials";
import { productsV3, products } from "@wix/stores";
import { customJson } from "../../utils/customJson";

// Returns store products with elevated (app-identity) permissions — the modern
// equivalent of the original Blocks app's `.find({ suppressAuth: true })`.
//
// Wix Stores has TWO catalog versions and an app must support BOTH:
//   • Catalog V3 (new) — `@wix/stores` `productsV3`
//   • Catalog V1 (old) — `@wix/stores` `products`
// We query V3 first and fall back to V1 when V3 is unavailable/empty (i.e. the
// merchant's store still runs the V1 catalog). Requires the app's
// `SCOPE.STORES.PRODUCT_READ` (Read Stores) permission.
//
//   GET /api/products?slugs=a,b,c   → products matching those slugs
//   GET /api/products?limit=10      → up to `limit` products (editor preview)

interface OutItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productUrl: string; // relative path for location.to() (works on published site)
  productUrlAbsolute?: string; // absolute URL for opening in a new tab in preview
  formattedPrice: string;
  description?: string; // plain-text product description
  // Natural image dimensions, when known. Masonry/Collage and the orientation-
  // grouped layouts (Bricks/Mix/Alternate) need these to look varied — without
  // them every item is treated as square and the layout collapses to a grid.
  width?: number;
  height?: number;
}

// Wix media is represented as `wix:image://v1/<id>/<file>#originWidth=W&originHeight=H`.
// Pull the natural dimensions out of that hash when present.
const parseWixImageDims = (
  raw: string,
): { width?: number; height?: number } => {
  const hashIndex = raw.indexOf("#");
  if (hashIndex < 0) return {};
  const params = new URLSearchParams(raw.slice(hashIndex + 1));
  const w = Number(params.get("originWidth"));
  const h = Number(params.get("originHeight"));
  return {
    width: Number.isFinite(w) && w > 0 ? w : undefined,
    height: Number.isFinite(h) && h > 0 ? h : undefined,
  };
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(Number.isFinite(n) ? n : min, max));

// ---- Catalog V3 -----------------------------------------------------------
type V3Product = {
  _id?: string | null;
  slug?: string | null;
  name?: string | null;
  // V3 returns the product URL either as a plain string or as an object
  // `{ url, relativePath }` — handle both so we never emit `[object Object]`.
  url?: string | { url?: string | null; relativePath?: string | null } | null;
  media?: { main?: { url?: string; image?: string } };
  actualPriceRange?: { minValue?: { formattedAmount?: string | null } };
  plainDescription?: string | null;
};

// Collapse any stray markup/whitespace into a clean plain-text description.
const toPlainText = (raw: string): string =>
  (raw || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const v3RawMedia = (media: V3Product["media"]): string =>
  media?.main?.url || media?.main?.image || "";

// Resolve the product-page link. Prefer an ABSOLUTE URL — in the editor preview
// the widget renders from static.parastorage.com, so a relative path resolves
// there and 403s ("AccessDenied"); an absolute URL points at the real site. Fall
// back to a root-relative path (resolves correctly on the published site) and
// finally to the standard Wix Stores product route built from the slug.
const productLink = (raw: string, slug: string): string => {
  const s = (raw || "").trim();
  if (/^https?:\/\//i.test(s)) return s; // absolute — preferred
  if (s) return "/" + s.replace(/^\/+/, ""); // relative → root-relative
  return slug ? `/product-page/${slug}` : ""; // standard fallback
};

const isAbsolute = (s: string): boolean =>
  /^https?:\/\//i.test((s || "").trim());

// Resolve the V3 `url` field (a string or `{ url, relativePath }`) into BOTH a
// relative path (for `location.to()` on the published site) and an absolute URL
// (for opening in a new tab in the editor preview, where `to()` won't navigate).
const v3ProductUrls = (
  url: V3Product["url"],
  slug: string,
): { productUrl: string; productUrlAbsolute: string } => {
  const str = typeof url === "string" ? url : "";
  const relRaw =
    (typeof url === "object" && url ? url.relativePath || "" : "") ||
    (str && !isAbsolute(str) ? str : "");
  const absRaw =
    (typeof url === "object" && url && isAbsolute(url.url || "")
      ? url.url || ""
      : "") || (isAbsolute(str) ? str : "");
  return {
    productUrl: productLink(relRaw, slug),
    productUrlAbsolute: absRaw,
  };
};

const v3ImageUrl = (raw: string): string => {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  let id = raw.startsWith("wix:image://")
    ? raw.slice("wix:image://v1/".length)
    : raw;
  id = id.split("/")[0].split("#")[0];
  return id ? `https://static.wixstatic.com/media/${id}` : "";
};

const fromV3 = (p: V3Product): OutItem => {
  const raw = v3RawMedia(p.media);
  return {
    id: p._id ?? p.slug ?? "",
    name: p.name ?? "",
    slug: p.slug ?? "",
    imageUrl: v3ImageUrl(raw),
    ...v3ProductUrls(p.url, p.slug ?? ""),
    formattedPrice: p.actualPriceRange?.minValue?.formattedAmount ?? "",
    description: toPlainText(p.plainDescription ?? ""),
    ...parseWixImageDims(raw),
  };
};

// Fetch a single V3 product by slug. We use the dedicated `getProductBySlug`
// endpoint rather than a `queryProducts().hasSome("slug", …)` filter — the
// `hasSome` operator is rejected for the slug field (INVALID_ARGUMENT), whereas
// the by-slug endpoint is the supported way to resolve a slug.
const getV3BySlug = async (slug: string): Promise<OutItem | null> => {
  try {
    const elevated = auth.elevate(productsV3.getProductBySlug);
    const res = await elevated(slug, {
      fields: ["URL", "CURRENCY", "PLAIN_DESCRIPTION"],
    });
    const p = (res as { product?: V3Product }).product;
    return p ? fromV3(p) : null;
  } catch {
    return null; // not found / not a V3 store — caller falls back to V1
  }
};

const queryV3 = async (slugs: string[], limit: number): Promise<OutItem[]> => {
  if (slugs.length) {
    const results = await Promise.all(slugs.map(getV3BySlug));
    return results.filter((i): i is OutItem => i != null);
  }
  // No slugs → editor-preview path: return up to `limit` products.
  const elevated = auth.elevate(productsV3.queryProducts);
  const res = await elevated({
    fields: ["URL", "CURRENCY", "PLAIN_DESCRIPTION"],
  })
    .limit(limit)
    .find();
  return (res.items as V3Product[]).map(fromV3);
};

// ---- Catalog V1 -----------------------------------------------------------
type V1Product = {
  _id?: string;
  name?: string | null;
  slug?: string;
  media?: {
    mainMedia?: { image?: { url?: string; width?: number; height?: number } };
  };
  convertedPriceData?: {
    formatted?: { price?: string; discountedPrice?: string };
  };
  priceData?: { formatted?: { price?: string; discountedPrice?: string } };
  productPageUrl?: { base?: string; path?: string };
  description?: string | null; // HTML in V1 — stripped to plain text below
};

const fromV1 = (p: V1Product): OutItem => {
  const image = p.media?.mainMedia?.image;
  // V1 gives an absolute base+path; the relative path comes from the slug.
  const v1Abs = `${p.productPageUrl?.base ?? ""}${p.productPageUrl?.path ?? ""}`;
  return {
    id: p._id ?? p.slug ?? "",
    name: p.name ?? "",
    slug: p.slug ?? "",
    imageUrl: image?.url ?? "",
    productUrl: p.slug
      ? `/product-page/${p.slug}`
      : productLink(v1Abs, p.slug ?? ""),
    productUrlAbsolute: isAbsolute(v1Abs) ? v1Abs : "",
    formattedPrice:
      p.convertedPriceData?.formatted?.discountedPrice ||
      p.convertedPriceData?.formatted?.price ||
      p.priceData?.formatted?.discountedPrice ||
      p.priceData?.formatted?.price ||
      "",
    description: toPlainText(p.description ?? ""),
    width:
      typeof image?.width === "number" && image.width > 0
        ? image.width
        : undefined,
    height:
      typeof image?.height === "number" && image.height > 0
        ? image.height
        : undefined,
  };
};

// V1 has no by-slug endpoint, and `hasSome("slug", …)` is rejected here too
// ("Invalid string"). Resolve each slug with an exact-match `.eq("slug", …)`.
const getV1BySlug = async (slug: string): Promise<OutItem | null> => {
  try {
    const elevated = auth.elevate(products.queryProducts);
    const res = await elevated().eq("slug", slug).limit(1).find();
    const p = (res.items as V1Product[])[0];
    return p ? fromV1(p) : null;
  } catch {
    return null;
  }
};

const queryV1 = async (slugs: string[], limit: number): Promise<OutItem[]> => {
  if (slugs.length) {
    const results = await Promise.all(slugs.map(getV1BySlug));
    return results.filter((i): i is OutItem => i != null);
  }
  const elevated = auth.elevate(products.queryProducts);
  const res = await elevated().limit(limit).find();
  return (res.items as V1Product[]).map(fromV1);
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const GET: APIRoute = async ({ url }) => {
  const slugsParam = url.searchParams.get("slugs");
  const slugs = slugsParam
    ? slugsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const limit = clamp(Number(url.searchParams.get("limit")) || 10, 1, 100);

  // Try the V3 catalog first; fall back to V1 if V3 is unavailable or empty.
  let items: OutItem[] | null = null;
  try {
    items = await queryV3(slugs, limit);
  } catch (err) {
    console.warn("[api/products] V3 query failed, trying V1:", err);
  }

  if (!items || items.length === 0) {
    try {
      const v1 = await queryV1(slugs, limit);
      if (v1.length) items = v1;
    } catch (err) {
      console.warn("[api/products] V1 query failed:", err);
    }
  }

  return customJson(items ?? [], { headers: CORS_HEADERS });
};

/**
 * Scrape https://grandvrio.com/list-menu and each venue page into data/grandvrio-menu.json
 *
 *   npx tsx scripts/scrape-grandvrio-menu.ts
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const BASE = "https://grandvrio.com";
const HOTEL_SLUGS = new Set([
  "zen-spa",
  "activities",
  "room-service",
  "event",
  "transportation-services",
  "reception-front-office",
]);

const LOCALES: { site: string; app: string }[] = [
  { site: "en", app: "en" },
  { site: "vi", app: "vi" },
  { site: "ja", app: "ja" },
  { site: "ko", app: "ko" },
  { site: "ch", app: "zh" },
];

type Trans = { name: string; description?: string | null };
type Item = {
  sourceId: string;
  price: number;
  imageUrl: string | null;
  translations: Record<string, Trans>;
};
type Category = {
  sourceId: string;
  translations: Record<string, Trans>;
  items: Item[];
};
type Restaurant = {
  slug: string;
  venueType: "qsr" | "hotel";
  coverUrl: string | null;
  logoUrl: string | null;
  translations: Record<string, Trans>;
  categories: Category[];
};

const jar = new Map<string, string>();

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function storeCookies(res: Response) {
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  const fallback = res.headers.get("set-cookie");
  const cookies = raw.length ? raw : fallback ? [fallback] : [];
  for (const cookie of cookies) {
    const pair = cookie.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

async function request(url: string, init: RequestInit = {}, follow = 8): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    redirect: "manual",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      Cookie: cookieHeader(),
      ...(init.headers ?? {}),
    },
  });
  storeCookies(res);
  if (follow > 0 && [301, 302, 303, 307, 308].includes(res.status)) {
    const loc = res.headers.get("location");
    if (loc) {
      const next = loc.startsWith("http") ? loc : new URL(loc, BASE).href;
      const method = res.status === 303 ? "GET" : (init.method ?? "GET");
      return request(next, { ...init, method, body: method === "GET" ? undefined : init.body }, follow - 1);
    }
  }
  return res;
}

function csrf(html: string) {
  return html.match(/name="_token"\s+type="hidden"\s+value="([^"]+)"/)?.[1]
    ?? html.match(/name="_token"\s+value="([^"]+)"/)?.[1]
    ?? "";
}

function decode(html: string) {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function cleanImage(src: string | undefined) {
  if (!src) return null;
  if (src.startsWith("data:")) return null;
  if (src.includes("default_food") || src.includes("default_category")) return null;
  return src;
}

function parseList(html: string) {
  const venues: { slug: string; name: string; coverUrl: string | null }[] = [];
  const re =
    /href="https:\/\/grandvrio\.com\/([^"]+)"\s+class="[^"]*\bname\b[^"]*">([^<]+)<[\s\S]*?cover_image\/([^'"]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const slug = match[1];
    if (venues.some((v) => v.slug === slug)) continue;
    venues.push({
      slug,
      name: decode(match[2]),
      coverUrl: `${BASE}/public/storage/cover_image/${match[3]}`,
    });
  }
  return venues;
}

function parseVenueName(html: string) {
  const heading = html.match(
    /<p class="text-lg md:text-2xl font-semibold capitalize mb-4">\s*(?:<!--[^>]*-->\s*)?([^<]+)/,
  )?.[1];
  const name = decode(heading ?? "");
  if (!name || /^emenu/i.test(name)) return "";
  return name;
}

function parseClassicItems(block: string) {
  const items: {
    sourceId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
  }[] = [];
  const itemRe =
    /food-item popup-slider[\s\S]*?data-id=['"](\d+)['"][\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?class="[^"]*\bname\b[^"]*">([^<]*)<\/a>[\s\S]*?class="[^"]*\bdescription\b[^"]*">([\s\S]*?)<\/p>[\s\S]*?<span>([^<]*)<\/span>/g;
  let itemMatch: RegExpExecArray | null;
  while ((itemMatch = itemRe.exec(block))) {
    items.push({
      sourceId: itemMatch[1],
      imageUrl: cleanImage(itemMatch[2]),
      name: decode(itemMatch[3]),
      description: decode(itemMatch[4]),
      price: parsePrice(itemMatch[5]),
    });
  }
  return items;
}

function parseCardItems(block: string) {
  const items: {
    sourceId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
  }[] = [];
  const cardRe =
    /class="[^"]*\bfood-item\b[\s\S]*?<img src="([^"]+)"[\s\S]*?data-id=['"]?(\d+)['"]?[\s\S]*?<p class="[^"]*\bname\b[^"]*">([^<]+)<\/p>[\s\S]*?(?:data-description="([^"]*)")?[\s\S]*?\bamount\b[\s\S]*?([\d.,]+)\s*₫/g;
  let match: RegExpExecArray | null;
  while ((match = cardRe.exec(block))) {
    items.push({
      sourceId: match[2],
      imageUrl: cleanImage(match[1]),
      name: decode(match[3]),
      description: decode((match[0].match(/data-description="([^"]*)"/)?.[1] ?? "").replace(/&quot;/g, '"')),
      price: parsePrice(match[5]),
    });
  }
  return items;
}

function parseVenue(html: string) {
  const logo =
    html.match(/https:\/\/grandvrio\.com\/public\/storage\/logo\/[^"]+/)?.[0] ?? null;
  const name = parseVenueName(html);

  const categories: {
    sourceId: string;
    name: string;
    items: { sourceId: string; name: string; description: string; price: number; imageUrl: string | null }[];
  }[] = [];

  const catRe = /<div class="category" id="(\d+)">([\s\S]*?)(?=<div class="category" id="|$)/g;
  let catMatch: RegExpExecArray | null;
  while ((catMatch = catRe.exec(html))) {
    const block = catMatch[2];
    const catName = decode(block.match(/<h3[^>]*title[^>]*>\s*([^<]+)/)?.[1] ?? "");
    if (!catName || catName === "Feedback") continue;
    const items = parseClassicItems(block);
    categories.push({ sourceId: catMatch[1], name: catName, items });
  }

  if (!categories.some((c) => c.items.length)) {
    const tabNameById = new Map<string, string>();
    const tabRe =
      /id="(profile\d+)-tab"[\s\S]*?<a href="javascript:"[^>]*>([^<]+)<\/a>/g;
    let tabMatch: RegExpExecArray | null;
    while ((tabMatch = tabRe.exec(html))) {
      tabNameById.set(tabMatch[1], decode(tabMatch[2]));
    }
    const paneRe =
      /<div class="[^"]*\btab-pane\b[^"]*" id="(profile\d+)"[\s\S]*?>([\s\S]*?)(?=<div class="[^"]*\btab-pane\b|$)/g;
    let paneMatch: RegExpExecArray | null;
    while ((paneMatch = paneRe.exec(html))) {
      const paneId = paneMatch[1];
      const catName = tabNameById.get(paneId) || paneId;
      const items = parseCardItems(paneMatch[2]);
      if (!items.length) continue;
      categories.push({ sourceId: paneId, name: catName, items });
    }
  }

  return { name, logoUrl: logo, categories };
}

async function setLocale(siteLocale: string) {
  const page = await request(`${BASE}/list-menu`);
  const html = await page.text();
  const token = csrf(html);
  if (!token) throw new Error("Missing CSRF token");
  const body = new URLSearchParams({
    _method: "PUT",
    _token: token,
    back: `${BASE}/list-menu`,
  });
  await request(`${BASE}/default/${siteLocale}/languages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: BASE,
      Referer: `${BASE}/list-menu`,
    },
    body,
  });
}

function mergeTrans(
  bag: Record<string, Trans>,
  locale: string,
  name: string,
  description?: string | null,
) {
  if (!name) return;
  const prev = bag[locale];
  bag[locale] = {
    name,
    description: description || prev?.description || null,
  };
}

async function main() {
  console.log("Fetching venue list…");
  await setLocale("en");
  const listHtml = await (await request(`${BASE}/list-menu`)).text();
  const listed = parseList(listHtml);
  if (!listed.length) throw new Error("No venues found on list-menu");
  console.log(`Found ${listed.length} venues`);

  const restaurants: Restaurant[] = listed.map((v) => ({
    slug: v.slug,
    venueType: HOTEL_SLUGS.has(v.slug) ? "hotel" : "qsr",
    coverUrl: v.coverUrl,
    logoUrl: null,
    translations: { en: { name: v.name } },
    categories: [],
  }));

  for (const { site, app } of LOCALES) {
    console.log(`Locale ${site} → ${app}`);
    await setLocale(site);
    for (const restaurant of restaurants) {
      const html = await (await request(`${BASE}/${restaurant.slug}`)).text();
      const parsed = parseVenue(html);
      if (parsed.logoUrl) restaurant.logoUrl = parsed.logoUrl;
      const venueName = parsed.name || restaurant.translations.en?.name || restaurant.slug;
      if (venueName && !/^emenu/i.test(venueName)) {
        mergeTrans(restaurant.translations, app, venueName);
      }

      for (const cat of parsed.categories) {
        let target = restaurant.categories.find((c) => c.sourceId === cat.sourceId);
        if (!target) {
          target = { sourceId: cat.sourceId, translations: {}, items: [] };
          restaurant.categories.push(target);
        }
        mergeTrans(target.translations, app, cat.name);
        for (const item of cat.items) {
          let dest = target.items.find((i) => i.sourceId === item.sourceId);
          if (!dest) {
            dest = {
              sourceId: item.sourceId,
              price: item.price,
              imageUrl: item.imageUrl,
              translations: {},
            };
            target.items.push(dest);
          }
          if (item.imageUrl) dest.imageUrl = item.imageUrl;
          if (item.price) dest.price = item.price;
          mergeTrans(dest.translations, app, item.name, item.description);
        }
      }
      const count = restaurant.categories.reduce((n, c) => n + c.items.length, 0);
      console.log(`  ${restaurant.slug}: ${restaurant.categories.length} cats, ${count} items`);
    }
  }

  const out = {
    version: 1,
    source: `${BASE}/list-menu`,
    exportedAt: new Date().toISOString(),
    restaurants: restaurants.map((r) => ({
      slug: r.slug,
      venueType: r.venueType,
      coverUrl: r.coverUrl,
      logoUrl: r.logoUrl,
      translations: r.translations,
      categories: r.categories
        .filter((c) => c.items.length)
        .map((c) => ({
        translations: c.translations,
        items: c.items.map((i) => ({
          price: i.price,
          imageUrl: i.imageUrl,
          translations: i.translations,
        })),
      })),
    })),
  };

  const dest = path.join(process.cwd(), "data", "grandvrio-menu.json");
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, JSON.stringify(out, null, 2), "utf8");
  const totalItems = out.restaurants.reduce(
    (n, r) => n + r.categories.reduce((m, c) => m + c.items.length, 0),
    0,
  );
  console.log(`Wrote ${dest}`);
  console.log(`${out.restaurants.length} restaurants, ${totalItems} items`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

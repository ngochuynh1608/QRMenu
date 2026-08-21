const GOOGLE_LANG: Record<string, string> = {
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW",
  "pt-br": "pt",
  he: "iw",
};

export function toGoogleLang(code: string) {
  const normalized = code.trim().toLowerCase();
  return GOOGLE_LANG[normalized] || normalized.split("-")[0] || normalized;
}

function decodeHtml(text: string) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results: R[] = [];
  let index = 0;
  async function next(): Promise<void> {
    const current = index++;
    if (current >= items.length) return;
    results[current] = await worker(items[current], current);
    await next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
  return results;
}

function apiKey() {
  return process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || "";
}

async function translateOfficial(texts: string[], from: string, to: string) {
  const key = apiKey();
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, source: from, target: to, format: "text" }),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    data?: { translations?: { translatedText?: string }[] };
  };
  if (!res.ok || !data.data?.translations) {
    throw new Error(data.error?.message || `Google Dịch lỗi (${res.status})`);
  }
  return data.data.translations.map((item) => decodeHtml(item.translatedText || ""));
}

async function translateGtx(text: string, from: string, to: string) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", from);
  url.searchParams.set("tl", to);
  url.searchParams.set("dt", "t");
  url.searchParams.set("ie", "UTF-8");
  url.searchParams.set("oe", "UTF-8");
  url.searchParams.set("q", text);

  let lastError = new Error("Google Dịch thất bại.");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (res.status === 429 || res.status >= 500) {
      lastError = new Error(`Google Dịch lỗi (${res.status})`);
      await sleep(400 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`Google Dịch lỗi (${res.status})`);
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error("Google Dịch trả về dữ liệu không hợp lệ.");
    }
    return decodeHtml((data[0] as [string][]).map((part) => part[0] || "").join(""));
  }
  throw lastError;
}

export async function translateTexts(texts: string[], from: string, to: string) {
  const source = toGoogleLang(from);
  const target = toGoogleLang(to);
  if (!texts.length) return [];
  if (source === target) return [...texts];

  const unique: string[] = [];
  const index = new Map<string, number>();
  for (const text of texts) {
    const value = text.trim();
    if (!value || index.has(value)) continue;
    index.set(value, unique.length);
    unique.push(value);
  }

  const translated = new Array<string>(unique.length);
  if (apiKey()) {
    const chunkSize = 50;
    for (let i = 0; i < unique.length; i += chunkSize) {
      const chunk = unique.slice(i, i + chunkSize);
      const out = await translateOfficial(chunk, source, target);
      out.forEach((item, offset) => {
        translated[i + offset] = item;
      });
    }
  } else {
    await mapPool(unique, 4, async (text, i) => {
      translated[i] = await translateGtx(text, source, target);
      return translated[i];
    });
  }

  return texts.map((text) => {
    const value = text.trim();
    if (!value) return text;
    const slot = index.get(value);
    return slot === undefined ? text : translated[slot] || text;
  });
}

export interface ParsedWarning {
  source_url: string;
  product_name: string;
  manufacturer: string | null;
  lot_numbers: string[] | null;
  grund: string;
  risk_description: string | null;
  affected_states: string[] | null;
  published_at: string | null;
  updated_at: string | null;
}

export function parseWarningList(html: string): string[] {
  const detailLinks: string[] = [];
  const linkRegex = /href="([^"]*_Meldung\.html)"/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    if (!detailLinks.includes(url)) {
      detailLinks.push(url);
    }
  }
  return detailLinks;
}

function getBadge(html: string): string | null {
  const regex = /<span[^>]*class="[^"]*lmw-badge[^"]*"[^>]*>([\s\S]*?)<\/span>/i;
  const m = html.match(regex);
  return m ? decodeHtml(m[1].replace(/<[^>]+>/g, "").trim()) : null;
}

function getFieldByTerm(html: string, term: string): string | null {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<dt[^>]*>${escapedTerm}[\\s\\S]*?</dt>[\\s\\S]*?<p>([\\s\\S]*?)</p>`,
    "i"
  );
  const m = html.match(regex);
  return m ? decodeHtml(m[1].replace(/<[^>]+>/g, "").trim()) : null;
}

function getTimeByTerm(html: string, term: string): string | null {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sectionRegex = new RegExp(
    `<dt[^>]*>${escapedTerm}[\\s\\S]*?</dt>\\s*<dd[^>]*>([\\s\\S]*?)</dd>`,
    "i"
  );
  const section = html.match(sectionRegex);
  const haystack = section ? section[1] : html;

  const iso = haystack.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const german = haystack.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (german) return `${german[3]}-${german[2]}-${german[1]}`;

  const timeMatch = haystack.match(/datetime="([^"]+)"/);
  if (timeMatch) {
    const dt = timeMatch[1];
    const g2 = dt.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (g2) return `${g2[3]}-${g2[2]}-${g2[1]}`;
  }

  return null;
}

function getListByTerm(html: string, term: string): string[] | null {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<dt[^>]*>${escapedTerm}[\\s\\S]*?</dt>\\s*<dd[^>]*>\\s*<ul[^>]*>([\\s\\S]*?)</ul>`,
    "i"
  );
  const m = html.match(regex);
  if (!m) return null;
  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
  let li;
  while ((li = liRegex.exec(m[1])) !== null) {
    const text = decodeHtml(li[1].replace(/<[^>]+>/g, "").trim());
    if (text) items.push(text);
  }
  return items.length > 0 ? items : null;
}

function getLotNumbers(html: string): string[] | null {
  const lotText =
    getFieldByTerm(html, "Chargennummer / Los-Kennzeichnung") ||
    getFieldByTerm(html, "Chargennummer") ||
    getFieldByTerm(html, "Los-Kennzeichnung");
  if (lotText) {
    const lots = lotText
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s));
    if (lots.length > 0) return lots;
  }

  const lotList = getListByTerm(html, "Chargennummer");
  if (lotList) {
    const lots = lotList
      .flatMap((item) => item.match(/\d+/g) ?? [])
      .filter((n) => n.length >= 3);
    if (lots.length > 0) return Array.from(new Set(lots));
  }

  return null;
}

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&szlig;/g, "ß")
    .replace(/&uuml;/g, "ü")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö");
}

export function parseWarningDetail(
  html: string,
  sourceUrl: string
): ParsedWarning {
  const productName =
    getFieldByTerm(html, "Produktbezeichnung/ -beschreibung") ||
    getFieldByTerm(html, "Produktbezeichnung") ||
    "Unknown Product";

  const manufacturerRaw =
    getFieldByTerm(html, "Hersteller / Inverkehrbringer") ||
    getFieldByTerm(html, "Hersteller");
  const manufacturer = manufacturerRaw
    ? manufacturerRaw
        .replace(/^Hersteller:\s*/i, "")
        .split("\n")[0]
        .replace(/,\s*$/, "")
        .trim()
    : null;

  const grund = getBadge(html) || getFieldByTerm(html, "Grund der Meldung") || "Sonstige Gründe";

  const riskDescription =
    getFieldByTerm(html, "Mögliche Folgen") ||
    getFieldByTerm(html, "Weitere Informationen");

  const affectedStates = getListByTerm(html, "Betroffene Bundesländer");

  const publishedAt =
    getTimeByTerm(html, "Datum der Erstveröffentlichung") ||
    getFieldByTerm(html, "Datum der Erstveröffentlichung");
  const updatedAt =
    getTimeByTerm(html, "Letzte Aktualisierung") ||
    getFieldByTerm(html, "Letzte Aktualisierung");

  return {
    source_url: sourceUrl,
    product_name: productName,
    manufacturer,
    lot_numbers: getLotNumbers(html),
    grund,
    risk_description: riskDescription,
    affected_states: affectedStates,
    published_at: publishedAt,
    updated_at: updatedAt,
  };
}

export function parseGermanDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

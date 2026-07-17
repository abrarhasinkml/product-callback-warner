import { parseWarningList, parseWarningDetail, parseGermanDate } from "@/lib/ingest/parser";

const LIST_HTML = `
<html>
<body>
<a href="/___lebensmittelwarnung.de/Meldungen/2026/07_Juli/260702_03_NI_versch._Rohwuerste/260702_03_NI_versch._Rohwuerste_Meldung.html">Link 1</a>
<a href="/___lebensmittelwarnung.de/Meldungen/2026/07_Juli/260714_17_NI_Kaese/260714_17_NI_Kaese_Meldung.html">Link 2</a>
</body>
</html>
`;

const DETAIL_HTML = `
<html>
<body>
<dl>
  <div class="lmw-description-list__item">
    <dt class="lmw-description-list__term">Produktbezeichnung/ -beschreibung:</dt>
    <dd class="lmw-description-list__description"><p>verschiedene Rohwürste</p></dd>
  </div>
  <div class="lmw-description-list__item">
    <dt class="lmw-description-list__term">Hersteller / Inverkehrbringer:</dt>
    <dd class="lmw-description-list__description"><p>Hersteller:
Fleischwaren Wulff GmbH &amp; Co KG,
Hans-Böckler-Straße 25,
37079 Göttingen</p></dd>
  </div>
  <div class="lmw-description-list__item">
    <dt class="lmw-description-list__term">Grund der Meldung:</dt>
    <dd class="lmw-description-list__description"><p>Krankheitserreger</p></dd>
  </div>
  <div class="lmw-description-list__item">
    <dt class="lmw-description-list__term">Mögliche Folgen:</dt>
    <dd class="lmw-description-list__description"><p>Eine durch STEC/VTEC ausgelöste Erkrankung.</p></dd>
  </div>
  <div class="lmw-description-list__item">
    <dt class="lmw-description-list__term">Chargennummer / Los-Kennzeichnung:</dt>
    <dd class="lmw-description-list__description">
      <ul>
        <li>Charge 622501</li>
        <li>Charge 622502</li>
        <li>Charge 622503</li>
      </ul>
    </dd>
  </div>
  <div class="lmw-description-list__item">
    <dt class="lmw-description-list__term">Betroffene Bundesländer nach derzeitigem Stand:</dt>
    <dd class="lmw-description-list__description">
      <ul class="lmw-list lmw-list--badges">
        <li class="lmw-list__item">Bayern</li>
        <li class="lmw-list__item">Berlin</li>
      </ul>
    </dd>
  </div>
  <div class="lmw-description-list__item">
    <dt class="lmw-description-list__term">Datum der Erstveröffentlichung:</dt>
    <dd class="lmw-description-list__description">
      <time class="lmw-datetime" datetime="Thu Jul 02 2026">02.07.2026</time>
    </dd>
  </div>
  <div class="lmw-description-list__item">
    <dt class="lmw-description-list__term">Letzte Aktualisierung:</dt>
    <dd class="lmw-description-list__description">
      <time class="lmw-datetime" datetime="Thu Jul 15 2026">15.07.2026</time>
    </dd>
  </div>
</dl>
</body>
</html>
`;

describe("Warning Parser", () => {
  describe("parseWarningList", () => {
    it("should extract detail page URLs", () => {
      const urls = parseWarningList(LIST_HTML);
      expect(urls).toHaveLength(2);
      expect(urls[0]).toContain("_Meldung.html");
    });
  });

  describe("parseWarningDetail", () => {
    it("should parse product name", () => {
      const result = parseWarningDetail(DETAIL_HTML, "https://example.com/test");
      expect(result.product_name).toBe("verschiedene Rohwürste");
    });

    it("should parse manufacturer", () => {
      const result = parseWarningDetail(DETAIL_HTML, "https://example.com/test");
      expect(result.manufacturer).toBe("Fleischwaren Wulff GmbH & Co KG");
    });

    it("should parse grund", () => {
      const result = parseWarningDetail(DETAIL_HTML, "https://example.com/test");
      expect(result.grund).toBe("Krankheitserreger");
    });

    it("should parse lot numbers", () => {
      const result = parseWarningDetail(DETAIL_HTML, "https://example.com/test");
      expect(result.lot_numbers).toEqual(["622501", "622502", "622503"]);
    });

    it("should parse affected states", () => {
      const result = parseWarningDetail(DETAIL_HTML, "https://example.com/test");
      expect(result.affected_states).toEqual(["Bayern", "Berlin"]);
    });

    it("should parse dates", () => {
      const result = parseWarningDetail(DETAIL_HTML, "https://example.com/test");
      expect(result.published_at).toBe("2026-07-02");
      expect(result.updated_at).toBe("2026-07-15");
    });
  });

  describe("parseGermanDate", () => {
    it("should convert German date to ISO", () => {
      expect(parseGermanDate("02.07.2026")).toBe("2026-07-02");
    });

    it("should return null for invalid date", () => {
      expect(parseGermanDate("invalid")).toBeNull();
    });

    it("should return null for null input", () => {
      expect(parseGermanDate(null)).toBeNull();
    });
  });
});

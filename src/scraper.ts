import { chromium, Page } from "playwright";

const TEAM_PAGE_PATTERNS = [
  "/about",
  "/about-us",
  "/team",
  "/our-team",
  "/founders",
  "/leadership",
  "/people",
  "/company",
  "/who-we-are",
];

/**
 * Attempts to load a URL with fallback strategies (www prefix, http).
 */
async function tryLoadPage(page: Page, url: string): Promise<boolean> {
  const urlVariants = [url];
  const parsed = new URL(url);

  // Add www variant if not present
  if (!parsed.hostname.startsWith("www.")) {
    urlVariants.push(
      `${parsed.protocol}//www.${parsed.hostname}${parsed.pathname}`,
    );
  }
  // Try http if https fails
  if (parsed.protocol === "https:") {
    urlVariants.push(url.replace("https://", "http://"));
  }

  for (const variant of urlVariants) {
    try {
      console.log(`[Scraper] Trying: ${variant}`);
      await page.goto(variant, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      return true;
    } catch (e) {
      console.warn(`[Scraper] Failed to load ${variant}, trying next...`);
    }
  }
  return false;
}

/**
 * Extracts readable text from a page, stripping scripts/styles.
 */
async function extractText(page: Page): Promise<string> {
  return page.evaluate(() => {
    document
      .querySelectorAll("script, style, noscript, nav, footer, header")
      .forEach((el) => el.remove());
    return document.body.innerText || "";
  });
}

/**
 * Main scraper: loads homepage + key internal pages for founder discovery.
 */
export async function scrapeWebsite(
  url: string,
): Promise<{ text: string; links: string[] }> {
  console.log(`[Scraper] Initializing Playwright to scrape: ${url}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  // Speed Optimization: Block unneeded assets
  await page.route("**/*", (route) => {
    const resourceType = route.request().resourceType();
    if (["image", "font", "stylesheet", "media"].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  const allText: string[] = [];
  const links: string[] = [];

  try {
    // Phase 1: Load homepage with retry/fallback
    const loaded = await tryLoadPage(page, url);
    if (!loaded) {
      console.error(`[Scraper] Could not load any variant of ${url}`);
      return { text: "", links: [] };
    }

    await autoScroll(page);

    // Extract homepage text
    const homepageText = await extractText(page);
    allText.push(`--- Homepage ---\n${homepageText}`);

    // Collect internal links
    const rawLinks = await page.$$eval("a", (anchors) =>
      anchors.map((a) => a.href).filter((href) => href.startsWith("http")),
    );
    const hostname = new URL(url).hostname.replace("www.", "");
    const internalLinks = [
      ...new Set(rawLinks.filter((href) => href.includes(hostname))),
    ];
    links.push(...internalLinks);

    // Phase 2: Deep-scrape team/about pages
    const teamPages = internalLinks.filter((link) => {
      const path = new URL(link).pathname.toLowerCase();
      return TEAM_PAGE_PATTERNS.some((pattern) => path.includes(pattern));
    });

    // Also try common paths directly if not found in links
    const baseUrl = `${new URL(url).protocol}//${new URL(url).hostname}`;
    for (const pattern of TEAM_PAGE_PATTERNS) {
      const candidate = `${baseUrl}${pattern}`;
      if (
        !teamPages.includes(candidate) &&
        !teamPages.some((tp) => tp.includes(pattern))
      ) {
        teamPages.push(candidate);
      }
    }

    // Scrape up to 4 team/about pages
    const pagesToScrape = teamPages.slice(0, 4);
    for (const teamUrl of pagesToScrape) {
      try {
        console.log(`[Scraper] Deep-scraping: ${teamUrl}`);
        await page.goto(teamUrl, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        await autoScroll(page);
        const pageText = await extractText(page);
        if (pageText.trim().length > 50) {
          // Only add if meaningful content
          allText.push(`--- ${new URL(teamUrl).pathname} ---\n${pageText}`);
        }
      } catch {
        // Silently skip pages that fail to load
      }
    }

    const combinedText = allText.join("\n\n");
    console.log(
      `[Scraper] Extracted ${combinedText.length} chars from ${allText.length} page(s)`,
    );
    return { text: combinedText.substring(0, 20000), links };
  } catch (error) {
    console.error(`[Scraper] Critical error scraping ${url}:`, error);
    return { text: "", links: [] };
  } finally {
    await browser.close();
  }
}

/**
 * Helper to trigger lazy loading
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight || totalHeight > 3000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

import { Extractor } from "./extractor";
import { scrapeWebsite } from "./scraper";
import { searchInternet } from "./search";
import type { CompanyOutput } from "./types";

export interface FindFounderInput {
  url: string;
  openrouterKey: string;
  tavilyKey?: string;
  icp?: string;
  model?: string;
}

export async function runFounderPipeline(
  input: FindFounderInput,
): Promise<CompanyOutput> {
  const { url, openrouterKey, tavilyKey, icp, model } = input;
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace("www.", "");
  const extractor = new Extractor(domain, openrouterKey, model);

  // Phase 1: Scrape website text and relevant internal pages.
  const { text: scrapedText } = await scrapeWebsite(url);

  // Phase 2: Initial extraction from website content.
  let initialExtraction: CompanyOutput;
  try {
    initialExtraction = await extractor.extractFounders(
      domain,
      scrapedText.substring(0, 12000),
    );
  } catch {
    initialExtraction = { company: domain, website: url, founders: [] };
  }

  // Phase 3: Deep search with Tavily when available.
  const searchContext: string[] = [];
  const allSocialLinks: Record<string, string[]> = {};

  const founderNames = (initialExtraction.founders || [])
    .map((f) => f.name)
    .filter(
      (n): n is string =>
        typeof n === "string" && n.length > 0 && n !== "Unknown Founder",
    );

  if (founderNames.length > 0) {
    for (const name of founderNames) {
      const { results, socialLinks } = await searchInternet(
        `"${name}" "${domain}" founder linkedin twitter email`,
        tavilyKey,
      );
      searchContext.push(...results);
      for (const [platform, urls] of Object.entries(socialLinks)) {
        allSocialLinks[platform] = [
          ...(allSocialLinks[platform] || []),
          ...urls,
        ];
      }
    }
  } else {
    const { results, socialLinks } = await searchInternet(
      `founder of "${domain}" linkedin contact email`,
      tavilyKey,
    );
    searchContext.push(...results);
    for (const [platform, urls] of Object.entries(socialLinks)) {
      allSocialLinks[platform] = [...(allSocialLinks[platform] || []), ...urls];
    }
  }

  if (Object.keys(allSocialLinks).length > 0) {
    const socialSummary = Object.entries(allSocialLinks)
      .map(([platform, urls]) => `${platform}: ${urls.join(", ")}`)
      .join("\n");
    searchContext.push(
      `--- Verified Social Profiles Found ---\n${socialSummary}`,
    );
  }

  // Phase 4: Final extraction with full context.
  return extractor.extractFounders(domain, scrapedText, searchContext, icp);
}

import { tavily } from "@tavily/core";

/**
 * Known social media URL patterns for extraction
 */
const SOCIAL_PATTERNS: Record<string, RegExp> = {
  linkedin: /https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/gi,
  twitter: /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?/gi,
  github: /https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/gi,
  instagram: /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?/gi,
  youtube:
    /https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|@)[a-zA-Z0-9_-]+\/?/gi,
};

/**
 * Extracts social profile URLs from raw search result text.
 */
export function extractSocialLinks(text: string): Record<string, string[]> {
  const found: Record<string, string[]> = {};
  for (const [platform, regex] of Object.entries(SOCIAL_PATTERNS)) {
    const matches = text.match(regex);
    if (matches) {
      found[platform] = [...new Set(matches)];
    }
  }
  return found;
}

/**
 * Executes a deep internet search for social profiles and contacts.
 * Returns both raw text results and extracted social links.
 */
export async function searchInternet(
  query: string,
  tavilyApiKey?: string,
): Promise<{ results: string[]; socialLinks: Record<string, string[]> }> {
  console.log(`[Search] Querying: "${query}"`);

  const apiKey = tavilyApiKey || process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[Search] TAVILY_API_KEY not found. Skipping deep search.");
    return { results: [], socialLinks: {} };
  }

  try {
    const tvly = tavily({ apiKey });
    const response = await tvly.search(query, {
      searchDepth: "advanced",
      maxResults: 5,
    });

    const textResults = response.results.map(
      (r: any) => `${r.title}: ${r.url}\n${r.content}`,
    );

    // Extract social links from all result URLs and content
    const allText = response.results
      .map((r: any) => `${r.url} ${r.content}`)
      .join(" ");
    const socialLinks = extractSocialLinks(allText);

    if (Object.keys(socialLinks).length > 0) {
      console.log(
        `[Search] Found social profiles: ${Object.keys(socialLinks).join(", ")}`,
      );
    }

    return { results: textResults, socialLinks };
  } catch (error) {
    console.error(`[Search] Error executing query "${query}":`, error);
    return { results: [], socialLinks: {} };
  }
}

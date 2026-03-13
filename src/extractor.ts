import OpenAI from "openai";
import { CompanyOutput } from "./types";

export class Extractor {
  private openai: OpenAI;
  private domain: string;
  private model?: string;

  constructor(domain: string, openRouterApiKey: string, model?: string) {
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key is required.");
    }
    this.openai = new OpenAI({
      apiKey: openRouterApiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/founder-finder",
        "X-Title": "Founder Finder",
      },
    });
    this.domain = domain;
    this.model = model;
  }

  /**
   * Generates common email patterns for a founder.
   * (Token Efficiency: precomputed patterns avoid LLM guessing)
   */
  public generateEmailPatterns(name: string | null | undefined): string[] {
    if (!name || name === "Unknown Founder")
      return [`founder@${this.domain}`, `hello@${this.domain}`];
    const parts = name
      .toLowerCase()
      .split(" ")
      .filter((p) => p.length > 0);
    if (parts.length === 0) return [];

    const first = parts[0];
    const last = parts.length > 1 ? parts[parts.length - 1] : "";
    const f = first[0];
    const l = last ? last[0] : "";

    const patterns = [
      `${first}@${this.domain}`,
      `${first}.${last}@${this.domain}`,
      `${first}${last}@${this.domain}`,
      `${f}${last}@${this.domain}`,
      `${first}${l}@${this.domain}`,
      `founder@${this.domain}`,
      `hello@${this.domain}`,
    ];
    return last ? patterns : patterns.slice(0, 1).concat(patterns.slice(5));
  }

  /**
   * [Prompt Engineering Pattern: Chain-of-Thought + Structured Output + Error Recovery]
   * Uses progressive disclosure: system prompt sets the role, user prompt provides data,
   * and the schema enforces output structure.
   */
  public async extractFounders(
    companyName: string,
    scrapedText: string,
    searchContext: string[] = [],
    icp?: string,
  ): Promise<CompanyOutput> {
    console.log(
      `[Extractor] Generating Founder Contact Profile for: ${companyName}`,
    );

    // [Lead Research Assistant Skill]: Comprehensive research framework
    // [Prompt Engineering Patterns Skill]: Role-based system prompt + Chain-of-thought
    const systemPrompt = `You are an expert Lead Research Assistant, Named Entity Recognition (NER) specialist, and B2B cold email writer.

Your task: Analyze the provided company data and produce a complete founder outreach profile.

## Step-by-step reasoning (Chain-of-Thought)
Think through these steps internally before generating output:
1. IDENTIFY: Scan the text for names paired with titles like Founder, Co-Founder, CEO, CTO, Founding Partner.
2. VERIFY: Cross-reference names found in website text against search results for consistency.
3. EXTRACT CONTACTS: Pull exact email addresses, social profile URLs (LinkedIn, Twitter/X, GitHub), phone numbers, and personal websites explicitly mentioned.
4. SCORE CONFIDENCE: Rate 0.0-1.0 based on how many independent sources confirm this person as founder.

## Lead Research Areas (from Lead Research Assistant skill)
For each founder, research and extract:
- Professional background and decision-making authority
- Recent professional activity (posts, interviews, talks)
- Communication style inferred from their content
- Timing signals: recent funding, leadership changes, product launches, hiring surges

${
  icp
    ? `## Lead Scoring (from Sales Qualification skill)
ICP provided: "${icp}"
Score each founder's COMPANY 0-100 on fit:
- Company size & growth trajectory (25%)
- Industry fit with ICP (25%)
- Technology stack relevance (20%)
- Timing signals (20%)
- Contact accessibility (10%)
Provide a 1-sentence reasoning.`
    : ""
}

## Cold Email Draft (from Cold Email skill)
Write a personalized cold email for each founder following these STRICT rules:
- MAX 4 sentences. Every sentence must earn its place.
- Write like a peer, NOT a vendor. Use contractions. Read it aloud mentally.
- The personalization MUST connect to a problem or observation — not just flattery.
- Lead with THEIR world (use "you/your" more than "I/we").
- One low-friction ask: "Worth exploring?" / "Would this be useful?" — NOT "Can we schedule 30 mins?"
- Subject line: 2-4 words, lowercase, internal-looking (e.g., "founder growth", "quick thought")
- DO NOT use: "I hope this finds you well", "I came across your profile", "leverage", "synergy", "best-in-class"
${icp ? `- Pitch the value proposition implied by ICP: "${icp}"` : "- Write a genuine networking/intro email since no ICP was provided."}

## Output Format
Return ONLY a JSON object matching this exact schema:
{
  "company": string,
  "website": string,
  "founders": [
    {
      "name": string,
      "title": string,
      "emails": string[],  // Only verified emails found in the text
      "socials": {
        "linkedin"?: string,  // Full URL
        "twitter"?: string,   // Full URL
        "github"?: string,    // Full URL
        "instagram"?: string,
        "youtube"?: string
      },
      "personal_website"?: string,
      "phone"?: string,
      "confidence_score": number,  // 0.0 to 1.0
      "cold_email_draft": string,  // The email body
      "cold_email_subject": string, // 2-4 word subject line
      "lead_score"?: {
        "score": number,      // 0 to 100
        "reasoning": string   // 1-sentence
      }
    }
  ]
}

IMPORTANT: If you cannot identify any founders, return an empty founders array. Do NOT invent names.`;

    // [Token Efficiency Skill]: Trim input to essential data, avoid sending noise
    const trimmedText = scrapedText.substring(0, 15000);
    const trimmedContext = searchContext.slice(0, 8).join("\n\n");

    const userPrompt = `--- Company Domain ---
${companyName}

--- Scraped Website Content ---
${trimmedText}

--- Deep Internet Search Results ---
${trimmedContext}`;

    // [Prompt Engineering Patterns: Error Recovery with Fallback]
    let parsedData: CompanyOutput;
    try {
      const response = await this.openai.chat.completions.create({
        model:
          this.model ||
          process.env.OPENROUTER_MODEL ||
          "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Empty LLM response");
      parsedData = JSON.parse(content) as CompanyOutput;
    } catch (firstError) {
      console.warn(
        "[Extractor] First attempt failed, retrying with simpler prompt...",
      );
      // Fallback: simpler prompt for reliability
      try {
        const fallbackResponse = await this.openai.chat.completions.create({
          model:
            this.model ||
            process.env.OPENROUTER_MODEL ||
            "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content:
                'Extract founder names and titles from the text. Return JSON: {"company":"","website":"","founders":[{"name":"","title":"","emails":[],"socials":{},"confidence_score":0.5}]}',
            },
            {
              role: "user",
              content: `Company: ${companyName}\n\n${trimmedText.substring(0, 5000)}`,
            },
          ],
          response_format: { type: "json_object" },
        });
        const fallbackContent = fallbackResponse.choices[0].message.content;
        if (!fallbackContent) throw new Error("Fallback also failed");
        parsedData = JSON.parse(fallbackContent) as CompanyOutput;
      } catch (secondError) {
        console.error(
          "[Extractor] Both attempts failed. Returning empty profile.",
        );
        return {
          company: companyName,
          website: `https://${this.domain}`,
          founders: [],
        };
      }
    }

    // Post-processing: augment with generated email patterns
    parsedData.founders = (parsedData.founders || []).map((founder) => {
      const generated = this.generateEmailPatterns(founder.name);
      const existingEmails = founder.emails || [];
      const uniqueEmails = Array.from(
        new Set([...existingEmails, ...generated]),
      );
      return {
        ...founder,
        emails: uniqueEmails,
      };
    });

    return parsedData;
  }
}

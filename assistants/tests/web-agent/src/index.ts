// @ts-nocheck
/**
 * Web Agent Search Test Assistant
 * Returns mock search results via Next hook without calling LLM
 */

/**
 * Next hook - intercepts the response and returns mock search results
 * This allows testing agent-based search without actual LLM calls
 *
 * @param ctx - Agent context
 * @param payload - Contains messages, completion, tools, error
 * @returns NextHookResponse with custom data
 */
function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  const messages = payload.messages;

  // Get the search request from the last user message
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return {
      data: {
        error: "No user message found",
      },
    };
  }

  // Parse search parameters from message content
  let searchParams: any;
  try {
    searchParams =
      typeof lastMessage.content === "string"
        ? JSON.parse(lastMessage.content)
        : lastMessage.content;
  } catch (e) {
    // If not JSON, treat as plain query
    searchParams = { query: lastMessage.content };
  }

  const query = searchParams.query || "";
  const limit = searchParams.limit || 10;
  const sites = searchParams.sites || [];
  const timeRange = searchParams.time_range || "";

  // Generate mock search results
  const results = generateMockResults(query, limit, sites);

  // Return structured search results wrapped in NextHookResponse.data
  return {
    data: {
      type: "web",
      query: query,
      total: results.length,
      items: results,
      metadata: {
        provider: "agent:tests.web-agent",
        time_range: timeRange,
        sites: sites,
      },
    },
  };
}

/**
 * Generate mock search results based on query
 */
function generateMockResults(
  query: string,
  limit: number,
  sites: string[]
): any[] {
  const results: any[] = [];
  const actualLimit = Math.min(limit, 20);

  // Mock domains
  const domains =
    sites.length > 0
      ? sites
      : [
          "example.com",
          "docs.example.org",
          "blog.techsite.io",
          "news.daily.com",
          "wiki.reference.net",
        ];

  // Extract keywords from query
  const keywords = query.toLowerCase().split(/\s+/);

  for (let i = 0; i < actualLimit; i++) {
    const domain = domains[i % domains.length];
    const score = 1.0 - i * 0.05;

    results.push({
      title: generateTitle(keywords, i),
      content: generateSnippet(keywords, i),
      url: `https://${domain}/article/${slugify(query)}-${i + 1}`,
      score: Math.max(score, 0.1),
    });
  }

  return results;
}

/**
 * Generate a mock title based on keywords
 */
function generateTitle(keywords: string[], index: number): string {
  const prefixes = [
    "Guide to",
    "Understanding",
    "How to use",
    "Introduction to",
    "Best practices for",
    "Complete guide:",
    "Tutorial:",
    "Overview of",
  ];

  const prefix = prefixes[index % prefixes.length];
  const mainKeyword = keywords[0] || "topic";
  const secondaryKeyword = keywords[1] || "";

  return `${prefix} ${capitalize(mainKeyword)}${
    secondaryKeyword ? " " + capitalize(secondaryKeyword) : ""
  } - Part ${index + 1}`;
}

/**
 * Generate a mock snippet based on keywords
 */
function generateSnippet(keywords: string[], index: number): string {
  const templates = [
    "This comprehensive article covers everything you need to know about {keyword}. Learn the fundamentals and advanced concepts...",
    "Discover the latest developments in {keyword}. Our experts break down the key points and provide actionable insights...",
    "A detailed exploration of {keyword} and its applications. Find out how industry leaders are leveraging this technology...",
    "Get started with {keyword} today. This guide walks you through the essential steps and best practices...",
    "Understanding {keyword} is crucial for modern development. Here's what you need to know to stay ahead...",
  ];

  const template = templates[index % templates.length];
  const keyword = keywords.join(" ") || "this topic";

  return template.replace("{keyword}", keyword);
}

/**
 * Convert string to URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Capitalize first letter
 */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

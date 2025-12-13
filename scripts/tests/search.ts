/**
 * Search MCP Test Handlers
 * Mock search handlers for testing MCP-based search integration
 */

/**
 * WebSearch - Mock web search tool
 * Simulates web search results for testing MCP integration
 *
 * @param {Object} args - Search arguments
 * @param {string} args.query - Search query
 * @param {number} args.limit - Max results (default: 10)
 * @param {string[]} args.sites - Restrict to specific sites (optional)
 * @param {string} args.time_range - Time range: "hour", "day", "week", "month", "year" (optional)
 * @returns {Object} Search results
 */
function WebSearch(args: any): any {
  if (!args?.query) {
    throw new Error("query is required");
  }

  const query = args.query;
  const limit = args.limit || 10;
  const sites = args.sites || [];
  const timeRange = args.time_range || "";

  // Generate mock results based on query
  const results = generateMockResults(query, limit, sites, "web");

  return {
    type: "web",
    query: query,
    total: results.length,
    duration_ms: Math.floor(Math.random() * 500) + 100,
    items: results,
    metadata: {
      provider: "mcp:search.web_search",
      time_range: timeRange,
      sites: sites,
    },
  };
}

/**
 * NewsSearch - Mock news search tool
 * Simulates news search results for testing
 *
 * @param {Object} args - Search arguments
 * @param {string} args.query - Search query
 * @param {number} args.limit - Max results (default: 10)
 * @param {string} args.time_range - Time range (default: "week")
 * @returns {Object} News search results
 */
function NewsSearch(args: any): any {
  if (!args?.query) {
    throw new Error("query is required");
  }

  const query = args.query;
  const limit = args.limit || 10;
  const timeRange = args.time_range || "week";

  // Generate mock news results
  const results = generateMockResults(query, limit, [], "news");

  return {
    type: "news",
    query: query,
    total: results.length,
    duration_ms: Math.floor(Math.random() * 300) + 50,
    items: results,
    metadata: {
      provider: "mcp:search.news_search",
      time_range: timeRange,
    },
  };
}

/**
 * GetConfig - Get search configuration (Resource)
 * Returns the current mock search configuration
 *
 * @returns {Object} Search configuration
 */
function GetConfig(): any {
  return {
    provider: "mock",
    version: "1.0.0",
    supported_types: ["web", "news"],
    max_results: 100,
    default_limit: 10,
    time_ranges: ["hour", "day", "week", "month", "year"],
    features: {
      site_restriction: true,
      time_range: true,
      safe_search: false,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate mock search results
 */
function generateMockResults(
  query: string,
  limit: number,
  sites: string[],
  type: string
): any[] {
  const results: any[] = [];
  const actualLimit = Math.min(limit, 20);

  // Mock domains for web search
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

  // Mock titles based on query keywords
  const keywords = query.toLowerCase().split(/\s+/);

  for (let i = 0; i < actualLimit; i++) {
    const domain = domains[i % domains.length];
    const score = 1.0 - i * 0.05; // Decreasing score

    const result: any = {
      title: generateTitle(keywords, i, type),
      content: generateSnippet(keywords, i),
      url: `https://${domain}/article/${slugify(query)}-${i + 1}`,
      score: Math.max(score, 0.1),
    };

    // Add type-specific fields
    if (type === "news") {
      result.published_at = new Date(
        Date.now() - i * 3600000 * 24
      ).toISOString();
      result.source = domain.split(".")[0];
    }

    results.push(result);
  }

  return results;
}

/**
 * Generate a mock title based on keywords
 */
function generateTitle(
  keywords: string[],
  index: number,
  type: string
): string {
  const prefixes =
    type === "news"
      ? [
          "Breaking:",
          "Update:",
          "Report:",
          "Analysis:",
          "Review:",
          "Deep Dive:",
          "Exclusive:",
          "Latest:",
        ]
      : [
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

/**
 * Keyword Extraction Agent - Next Hook
 * Simulates keyword extraction without LLM calls
 * Returns mock keywords based on the input content
 */

/**
 * Next hook - processes keyword extraction request and returns mock keywords
 */
function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  // Get the last user message
  const lastMessage = payload.messages?.[payload.messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return null;
  }

  // Parse the request (content is JSON string)
  let request: {
    content?: string;
    max_keywords?: number;
    language?: string;
  } = {};

  try {
    if (typeof lastMessage.content === "string") {
      request = JSON.parse(lastMessage.content);
    }
  } catch (e) {
    // If not JSON, treat content as the text to extract keywords from
    request = { content: lastMessage.content as string };
  }

  const content = request.content || "";
  const maxKeywords = request.max_keywords || 10;

  // Simple mock keyword extraction
  // In real implementation, this would use LLM for semantic extraction
  const keywords = extractMockKeywords(content, maxKeywords);

  // Return keywords as data
  return {
    data: {
      keywords: keywords,
    },
  };
}

/**
 * Mock keyword extraction - simulates intelligent keyword extraction
 * For testing purposes, extracts words based on simple rules
 */
function extractMockKeywords(content: string, maxKeywords: number): string[] {
  if (!content) {
    return [];
  }

  // Common stop words to filter out
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
    "can",
    "need",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "its",
    "our",
    "their",
    "this",
    "that",
    "these",
    "those",
    "what",
    "which",
    "who",
    "whom",
    "whose",
    "where",
    "when",
    "why",
    "how",
    "all",
    "each",
    "every",
    "both",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "not",
    "only",
    "same",
    "so",
    "than",
    "too",
    "very",
    "just",
    "also",
    "now",
    "here",
    "there",
    "in",
    "on",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "to",
    "from",
    "up",
    "down",
    "out",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "as",
    "if",
    "because",
    "until",
    "while",
    "and",
    "or",
    "but",
  ]);

  // Tokenize and filter
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  // Count frequency
  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  // Sort by frequency and return top N
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sorted;
}


// @ts-nocheck
// Tests for web content fetching utilities
import {
  Fetch,
  ExtractURL,
  ExtractTitle,
  HtmlToText,
  DecodeHTMLEntities,
  CompressContent,
} from "./fetch";

// ==================== ExtractURL Tests ====================

function TestExtractURLWithHttps(t: testing.T, ctx: agent.Context) {
  const text = "Check out this link: https://example.com/page and more text";
  const result = ExtractURL(text);

  t.assert.NotNil(result, "Should extract URL");
  t.assert.Equal(
    result,
    "https://example.com/page",
    "Should extract correct URL"
  );
}

function TestExtractURLWithHttp(t: testing.T, ctx: agent.Context) {
  const text = "Visit http://example.org/test for more info";
  const result = ExtractURL(text);

  t.assert.NotNil(result, "Should extract URL");
  t.assert.Equal(
    result,
    "http://example.org/test",
    "Should extract correct URL"
  );
}

function TestExtractURLWithDomainOnly(t: testing.T, ctx: agent.Context) {
  const text = "example.com";
  const result = ExtractURL(text);

  t.assert.NotNil(result, "Should extract URL");
  t.assert.Equal(result, "https://example.com", "Should add https protocol");
}

function TestExtractURLWithNoURL(t: testing.T, ctx: agent.Context) {
  const text = "This is just plain text without any URLs";
  const result = ExtractURL(text);

  t.assert.Nil(result, "Should return null when no URL found");
}

function TestExtractURLWithEmptyString(t: testing.T, ctx: agent.Context) {
  const result = ExtractURL("");
  t.assert.Nil(result, "Should return null for empty string");
}

function TestExtractURLWithMultipleURLs(t: testing.T, ctx: agent.Context) {
  const text = "First https://first.com then https://second.com";
  const result = ExtractURL(text);

  t.assert.NotNil(result, "Should extract URL");
  t.assert.Equal(result, "https://first.com", "Should extract first URL");
}

// ==================== ExtractTitle Tests ====================

function TestExtractTitleWithStandardTag(t: testing.T, ctx: agent.Context) {
  const html =
    "<html><head><title>Test Page Title</title></head><body></body></html>";
  const result = ExtractTitle(html);

  t.assert.Equal(result, "Test Page Title", "Should extract title");
}

function TestExtractTitleWithEntities(t: testing.T, ctx: agent.Context) {
  const html = "<html><head><title>Test &amp; Demo</title></head></html>";
  const result = ExtractTitle(html);

  t.assert.Equal(result, "Test & Demo", "Should decode HTML entities");
}

function TestExtractTitleWithNoTitle(t: testing.T, ctx: agent.Context) {
  const html = "<html><head></head><body>Content</body></html>";
  const result = ExtractTitle(html);

  t.assert.Equal(result, "", "Should return empty string when no title");
}

// ==================== HtmlToText Tests ====================

function TestHtmlToTextRemovesScripts(t: testing.T, ctx: agent.Context) {
  const html = "<p>Before</p><script>alert('test');</script><p>After</p>";
  const result = HtmlToText(html);

  t.assert.Contains(result, "Before", "Should keep content before script");
  t.assert.Contains(result, "After", "Should keep content after script");
  t.assert.True(!result.includes("alert"), "Should remove script content");
}

function TestHtmlToTextRemovesStyles(t: testing.T, ctx: agent.Context) {
  const html = "<p>Content</p><style>.test { color: red; }</style>";
  const result = HtmlToText(html);

  t.assert.Contains(result, "Content", "Should keep content");
  t.assert.True(!result.includes("color"), "Should remove style content");
}

function TestHtmlToTextConvertsBlocks(t: testing.T, ctx: agent.Context) {
  const html = "<p>Para 1</p><p>Para 2</p>";
  const result = HtmlToText(html);

  t.assert.Contains(result, "Para 1", "Should contain first paragraph");
  t.assert.Contains(result, "Para 2", "Should contain second paragraph");
}

function TestHtmlToTextDecodesEntities(t: testing.T, ctx: agent.Context) {
  const html = "<p>Test &amp; Demo &lt;tag&gt;</p>";
  const result = HtmlToText(html);

  t.assert.Contains(result, "Test & Demo", "Should decode &amp;");
  t.assert.Contains(result, "<tag>", "Should decode &lt; and &gt;");
}

// ==================== DecodeHTMLEntities Tests ====================

function TestDecodeHTMLEntitiesCommon(t: testing.T, ctx: agent.Context) {
  const text = "&amp; &lt; &gt; &quot;";
  const result = DecodeHTMLEntities(text);

  t.assert.Contains(result, "&", "Should decode &amp;");
  t.assert.Contains(result, "<", "Should decode &lt;");
  t.assert.Contains(result, ">", "Should decode &gt;");
}

// ==================== CompressContent Tests ====================

function TestCompressContentShortText(t: testing.T, ctx: agent.Context) {
  const text = "Short text";
  const result = CompressContent(text, 100);

  t.assert.Equal(result, "Short text", "Should not modify short text");
}

function TestCompressContentLongText(t: testing.T, ctx: agent.Context) {
  const text =
    "This is a very long text that needs to be compressed to fit within the maximum length limit.";
  const result = CompressContent(text, 50);

  t.assert.True(result.length <= 50, "Should compress to max length");
  t.assert.Contains(result, "Truncated", "Should indicate truncation");
}

// ==================== Fetch Tests ====================

function TestFetchWithEmptyURL(t: testing.T, ctx: agent.Context) {
  const result = Fetch("");

  t.assert.False(result.success, "Should fail with empty URL");
  t.assert.Equal(result.error, "URL is required", "Should have error message");
}

function TestFetchWithRealURL(t: testing.T, ctx: agent.Context) {
  const result = Fetch("https://yaoapps.com");

  t.assert.True(result.success, "Should successfully fetch yaoapps.com");
  t.assert.True(result.content.length > 0, "Should have content");
  t.assert.Equal(result.url, "https://yaoapps.com", "Should have correct URL");
}

function TestFetchAddsProtocol(t: testing.T, ctx: agent.Context) {
  const result = Fetch("yaoapps.com");

  t.assert.Equal(
    result.url,
    "https://yaoapps.com",
    "Should add https protocol"
  );
}

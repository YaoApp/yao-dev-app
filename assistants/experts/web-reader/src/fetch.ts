// @ts-nocheck
// Web content fetching utilities

export function Fetch(url: string): {
  success: boolean;
  content: string;
  title: string;
  url: string;
  error?: string;
} {
  if (!url) {
    return {
      success: false,
      content: "",
      title: "",
      url: "",
      error: "URL is required",
    };
  }

  let normalizedUrl = url;
  if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
    normalizedUrl = "https://" + url;
  }

  try {
    const resp = http.Get(
      normalizedUrl,
      {},
      {
        "User-Agent": "Mozilla/5.0 (compatible; YaoAgent/1.0)",
        Accept: "text/html",
      }
    );

    if (resp.status !== 200) {
      return {
        success: false,
        content: "",
        title: "",
        url: normalizedUrl,
        error: "HTTP " + resp.status,
      };
    }

    const html = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
    const title = ExtractTitle(html);
    const cleanText = HtmlToText(html);

    return {
      success: true,
      content: cleanText,
      title: title,
      url: normalizedUrl,
    };
  } catch (e: any) {
    return {
      success: false,
      content: "",
      title: "",
      url: normalizedUrl,
      error: e.message || "Unknown error",
    };
  }
}

export function ExtractURL(text: string): string | null {
  if (!text) {
    return null;
  }

  // Simple URL extraction
  const httpsIdx = text.indexOf("https://");
  const httpIdx = text.indexOf("http://");
  
  let startIdx = -1;
  if (httpsIdx >= 0 && (httpIdx < 0 || httpsIdx < httpIdx)) {
    startIdx = httpsIdx;
  } else if (httpIdx >= 0) {
    startIdx = httpIdx;
  }
  
  if (startIdx >= 0) {
    let endIdx = startIdx;
    while (endIdx < text.length && text[endIdx] !== " " && text[endIdx] !== "\n" && text[endIdx] !== "\t") {
      endIdx++;
    }
    return text.substring(startIdx, endIdx);
  }

  // Check for domain pattern
  if (text.indexOf(".") > 0) {
    const parts = text.trim().split(" ");
    if (parts[0].indexOf(".") > 0) {
      return "https://" + parts[0];
    }
  }

  return null;
}

export function ExtractTitle(html: string): string {
  // Extract title tag content
  const titleStart = html.indexOf("<title");
  if (titleStart >= 0) {
    const titleEnd = html.indexOf("</title>", titleStart);
    if (titleEnd > titleStart) {
      const tagEnd = html.indexOf(">", titleStart);
      if (tagEnd > titleStart && tagEnd < titleEnd) {
        const title = html.substring(tagEnd + 1, titleEnd);
        return DecodeHTMLEntities(title.trim());
      }
    }
  }
  return "";
}

export function HtmlToText(html: string): string {
  let text = html;

  // Remove script tags
  let scriptStart = text.indexOf("<script");
  while (scriptStart >= 0) {
    const scriptEnd = text.indexOf("</script>", scriptStart);
    if (scriptEnd > scriptStart) {
      text = text.substring(0, scriptStart) + text.substring(scriptEnd + 9);
    } else {
      break;
    }
    scriptStart = text.indexOf("<script");
  }

  // Remove style tags
  let styleStart = text.indexOf("<style");
  while (styleStart >= 0) {
    const styleEnd = text.indexOf("</style>", styleStart);
    if (styleEnd > styleStart) {
      text = text.substring(0, styleStart) + text.substring(styleEnd + 8);
    } else {
      break;
    }
    styleStart = text.indexOf("<style");
  }

  // Remove all HTML tags
  let tagStart = text.indexOf("<");
  while (tagStart >= 0) {
    const tagEnd = text.indexOf(">", tagStart);
    if (tagEnd > tagStart) {
      const tagName = text.substring(tagStart + 1, tagEnd).split(" ")[0].toLowerCase();
      const replacement = (tagName === "p" || tagName === "/p" || tagName === "br" || tagName === "div" || tagName === "/div") ? "\n" : " ";
      text = text.substring(0, tagStart) + replacement + text.substring(tagEnd + 1);
    } else {
      break;
    }
    tagStart = text.indexOf("<");
  }

  text = DecodeHTMLEntities(text);

  // Clean whitespace
  const lines = text.split("\n");
  const cleanLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 0) {
      cleanLines.push(line);
    }
  }
  text = cleanLines.join("\n\n");

  return text;
}

export function DecodeHTMLEntities(text: string): string {
  let result = text;

  // Use simple string replacement
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&apos;": "'",
    "&#39;": "'",
    "&nbsp;": " ",
  };

  for (const entity in entities) {
    while (result.indexOf(entity) >= 0) {
      result = result.replace(entity, entities[entity]);
    }
  }

  return result;
}

export function CompressContent(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Simple truncation
  return text.substring(0, maxLength - 20) + "\n\n[Truncated...]";
}

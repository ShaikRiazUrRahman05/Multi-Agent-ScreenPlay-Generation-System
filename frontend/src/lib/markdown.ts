// Minimal Markdown → HTML converter for headings, bold, italics, lists, hr, paragraphs.
// Safe by default: escapes HTML first, then injects simple tags.

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineFormat(text: string): string {
  // Bold first: **text** → <strong>
  let out = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text* (not **)
  out = out.replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, "$1<em>$2</em>");
  return out;
}

export function markdownToHtml(markdown: string): string {
  const text = escapeHtml(markdown).replace(/\r\n/g, "\n");
  const lines = text.split(/\n/);
  const html: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      closeLists();
      html.push("<div class=\"mb-3\"></div>");
      continue;
    }

    // Horizontal rule ---
    if (/^\s*-{3,}\s*$/.test(line)) {
      closeLists();
      html.push("<hr class=\"my-4 border-border/60\"/>");
      continue;
    }

    // Headings # ... ######
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeLists();
      const level = h[1].length;
      const content = inlineFormat(h[2]);
      html.push(`<h${level} class=\"mt-4 mb-2 font-bold\">${content}</h${level}>`);
      continue;
    }

    // Ordered list item
    const ol = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ol) {
      if (!inOl) {
        closeLists();
        html.push('<ol class="list-decimal pl-6 space-y-1">');
        inOl = true;
      }
      html.push(`<li>${inlineFormat(ol[2])}</li>`);
      continue;
    }

    // Unordered list item
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (!inUl) {
        closeLists();
        html.push('<ul class="list-disc pl-6 space-y-1">');
        inUl = true;
      }
      html.push(`<li>${inlineFormat(ul[1])}</li>`);
      continue;
    }

    // Default paragraph
    closeLists();
    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeLists();
  return html.join("\n");
}



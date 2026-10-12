// Very small line-diff helper to compare two scene texts and mark additions/deletions.
// Returns HTML with <ins> and <del> elements styled by consumer.

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function diffLines(oldText: string, newText: string): string {
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);
  const max = Math.max(oldLines.length, newLines.length);
  const out: string[] = [];

  for (let i = 0; i < max; i++) {
    const a = oldLines[i] ?? "";
    const b = newLines[i] ?? "";
    if (a === b) {
      out.push(`<div>${escapeHtml(a)}</div>`);
    } else {
      if (a) out.push(`<div><del>${escapeHtml(a)}</del></div>`);
      if (b) out.push(`<div><ins>${escapeHtml(b)}</ins></div>`);
    }
  }
  return out.join("\n");
}



/**
 * Data Tools MCP - utility script
 * Provides data formatting utilities (CSV, JSON).
 */

function FormatCSV(rows: string[][]): string {
  return rows.map((r) => r.join(",")).join("\n");
}

function FormatJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

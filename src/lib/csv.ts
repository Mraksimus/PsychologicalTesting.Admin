function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header.map(escapeCell).join(",")]
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","))
  }
  return lines.join("\n")
}

export function downloadCsv(filename: string, header: string[], rows: unknown[][]) {
  const csv = toCsv(header, rows)
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

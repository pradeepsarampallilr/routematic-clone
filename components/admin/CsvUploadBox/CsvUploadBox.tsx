"use client";

import { useState, type ChangeEvent } from "react";
import styles from "./CsvUploadBox.module.css";

interface ParsedCsv {
  fileName: string;
  headers: string[];
  rows: string[][];
}

const PREVIEW_ROW_LIMIT = 10;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

export default function CsvUploadBox() {
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        setParsed(null);
        setError("This file doesn't look like a CSV — no rows found.");
        return;
      }
      const [headers, ...dataRows] = rows;
      setParsed({ fileName: file.name, headers, rows: dataRows });
    } catch {
      setParsed(null);
      setError("Couldn't read that file. Please try again.");
    }
  }

  return (
    <div className={styles.box}>
      <label className={styles.dropzone} htmlFor="csv-input">
        <span className={styles.dropzoneTitle}>Click to choose a CSV file</span>
        <span className={styles.dropzoneHint}>
          Roster upload preview — not persisted in this demo.
        </span>
        <input
          id="csv-input"
          type="file"
          accept=".csv,text/csv"
          className={styles.input}
          onChange={handleFileChange}
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      {parsed && (
        <div className={styles.previewWrap}>
          <p className={styles.fileName}>
            {parsed.fileName} — {parsed.rows.length} row
            {parsed.rows.length === 1 ? "" : "s"}
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {parsed.headers.map((header, index) => (
                    <th key={`${header}-${index}`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, PREVIEW_ROW_LIMIT).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.rows.length > PREVIEW_ROW_LIMIT && (
            <p className={styles.truncatedNote}>
              Showing first {PREVIEW_ROW_LIMIT} of {parsed.rows.length} rows.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

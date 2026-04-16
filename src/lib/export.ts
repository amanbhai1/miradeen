/**
 * Client-side export utilities for downloading data as CSV or JSON files.
 */

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value instanceof Date ? (value as Date).toISOString() : value;
    }
  }
  return result;
}

function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function dataToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const flatData = data.map(item => flattenObject(item));
  const headers = Array.from(new Set(flatData.flatMap(item => Object.keys(item))));
  const rows = flatData.map(row =>
    headers.map(h => escapeCSVValue(row[h])).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const BOM = '\uFEFF'; // UTF-8 BOM for proper Excel encoding of CSV
  const blob = new Blob([mimeType === 'text/csv' ? BOM + content : content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Download data as a CSV file.
 * Automatically flattens nested objects and handles special characters.
 */
export function downloadCSV(data: Record<string, unknown>[], filename?: string): void {
  const csv = dataToCSV(data);
  const name = filename || `miradeen-export-${getDateString()}.csv`;
  triggerDownload(csv, name, 'text/csv');
}

/**
 * Download data as a pretty-printed JSON file.
 */
export function downloadJSON(data: unknown, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const name = filename || `miradeen-export-${getDateString()}.json`;
  triggerDownload(json, name, 'application/json');
}

export type ExportDataType = 'products' | 'orders' | 'users' | 'messages';
export type ExportFormatType = 'csv' | 'json';

/**
 * Fetch data from the admin export API and trigger a download.
 * Returns true on success, false on failure.
 */
export async function exportData(
  token: string,
  dataType: ExportDataType | 'all',
  format: ExportFormatType,
): Promise<boolean> {
  try {
    const params = new URLSearchParams({ type: dataType, format });
    const res = await fetch(`/api/admin/export?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Export failed with status ${res.status}`);
    }

    const content = await res.text();
    const ext = format === 'csv' ? 'csv' : 'json';
    const filename = `miradeen-${dataType}-${getDateString()}.${ext}`;

    triggerDownload(content, filename, format === 'csv' ? 'text/csv' : 'application/json');
    return true;
  } catch {
    return false;
  }
}

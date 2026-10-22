/** Escapes CSV text fields and prevents spreadsheet formula injection. */
const CSV_FORMULA_PREFIX_REGEXP = /^(?:[\t\r\n]|\s*[=+\-@])/;

function escapeCsvField(value: string): string {
    const safeValue = CSV_FORMULA_PREFIX_REGEXP.test(value) ? `'${value}` : value;
    return /[",\r\n]/.test(safeValue) ? `"${safeValue.replaceAll('"', '""')}"` : safeValue;
}

export default escapeCsvField;

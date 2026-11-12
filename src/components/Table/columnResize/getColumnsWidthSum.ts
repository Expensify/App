/** Sums a row's column widths, counting a column without a width as 0. */
function getColumnsWidthSum(columns: Array<{key: string}>, columnWidths: Record<string, number>): number {
    return columns.reduce((total, column) => total + (columnWidths[column.key] ?? 0), 0);
}

export default getColumnsWidthSum;

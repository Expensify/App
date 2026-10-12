/** User-dragged widths by column key. Absent columns are sized from content, so only touched columns get stored. */
type ColumnWidthOverrides = Record<string, number>;

/** Dragged table column widths, keyed by `columnResizingID`. */
type TableColumnWidths = Record<string, ColumnWidthOverrides>;

export default TableColumnWidths;
export type {ColumnWidthOverrides};

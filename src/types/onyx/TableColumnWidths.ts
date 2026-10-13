/** User-dragged widths by column key. Absent columns are sized from content, so only touched columns get stored. */
type ColumnWidthOverrides = Record<string, number>;

/**
 * Every column's width when the last drag ended, with what the layout was sized for. A fresh layout shares the room
 * between the unset columns differently than a drag leaves it, so while these inputs still hold, the table repaints
 * these widths instead of reflowing.
 */
type ColumnLayout = {
    /** Table width the columns were painted at. */
    tableWidth: number;

    /** Width each content-sized column's content and header needed. */
    fitColumnWidths: Record<string, number>;

    /** Painted width by column key. */
    columnWidths: Record<string, number>;
};

/** One table's stored widths. */
type StoredTableColumnWidths = {
    columnWidthOverrides?: ColumnWidthOverrides;
    columnLayout?: ColumnLayout;
};

/** Dragged table column widths, keyed by `columnResizingID`. */
type TableColumnWidths = Record<string, StoredTableColumnWidths>;

export default TableColumnWidths;
export type {ColumnLayout, ColumnWidthOverrides, StoredTableColumnWidths};

/** One table's layout, saved when a drag ends. Painted as saved, and only columns the user never dragged absorb room changes. */
type StoredTableColumnWidths = {
    /** Table width minus selection column, gaps, margin and padding, when saved. */
    availableColumnsWidth: number;

    /** Painted width of every column rendered when saved. */
    columnWidths: Record<string, number>;

    /** Columns the user dragged. The rest absorb room changes. */
    resizedColumnKeys: string[];
};

/** Saved table layouts, keyed by `columnResizingID`. */
type TableColumnWidths = Record<string, StoredTableColumnWidths>;

export default TableColumnWidths;
export type {StoredTableColumnWidths};

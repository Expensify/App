import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

import type React from 'react';

type UseColumnResizeParams = {
    /** Key the column widths persist under. `undefined` disables resizing on native, in narrow layouts and for tables that didn't opt in. */
    columnResizingID: string | undefined;

    /** Keys of the columns whose right edge the user can drag. */
    resizableColumnKeys: string[];

    /** The dragged column's width and its absorbers' widths, painted mid-drag. */
    getResizedColumnWidths: (columnKey: string, width: number) => Record<string, number>;

    /** Each column's resolved width, which a drag starts from. A new object means React rendered new widths. */
    resolvedColumnWidths: Record<string, number>;

    /** The narrowest width a drag may take a column to, for columns tighter than the default drag bound. */
    dragMinWidths?: Record<string, number>;

    /** Layout to save when dragging `columnKey` ends, from the painted widths. `undefined` when no column is resizable. */
    getStoredTableColumnWidths?: (columnWidths: Record<string, number>, columnKey: string) => StoredTableColumnWidths;

    /** Layout to save once resetting `columnKey` hands it back to content sizing, or `null` when no dragged column is left. */
    getResetTableColumnWidths?: (columnWidths: Record<string, number>, columnKey: string) => StoredTableColumnWidths | null;

    /** Width a click on the column's edge fits it to. `undefined` when it can't be fitted. */
    getFitColumnWidth?: (columnKey: string) => number | undefined;

    /** Width a double-click on the column's edge hands it back at. `undefined` when there's nothing to reset. */
    getResetColumnWidth?: (columnKey: string) => number | undefined;

    /** Gap between columns, which handles span. */
    columnGap: number;
};

type ColumnResizeHandleDOMProps = React.ComponentPropsWithRef<'div'>;

type ColumnResizeController = {
    /** Element holding the width custom properties. The header and rows inherit them, so one write repaints all. */
    setScopeElement: (element: HTMLElement | null) => void;

    /** Position and handlers for a column's handle, or `undefined` when its edge doesn't drag. */
    getHandleProps: (columnKey: string) => ColumnResizeHandleDOMProps | undefined;
};

export type {ColumnResizeController, ColumnResizeHandleDOMProps, UseColumnResizeParams};

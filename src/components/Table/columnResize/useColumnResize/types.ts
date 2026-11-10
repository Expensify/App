import type {ColumnWidthTarget} from '@components/Table/columnResize/getResizableColumnLayout';

import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

import type React from 'react';

type UseColumnResizeParams = {
    /** Key the column widths persist under. `undefined` disables resizing on native, in narrow layouts and for tables that didn't opt in. */
    columnResizingID: string | undefined;

    /** Keys of the columns whose right edge the user can drag. Omitted, with the rest of the layout, until the table has one. */
    resizableColumnKeys?: string[];

    /** The dragged column's width and its absorbers' widths, painted mid-drag. */
    getResizedColumnWidths?: (columnKey: string, width: number) => Record<string, number>;

    /** Each column's resolved width, which a drag starts from. A new object means React rendered new widths. */
    resolvedColumnWidths?: Record<string, number>;

    /** The narrowest width a drag may take a column to, for columns tighter than the default drag bound. */
    dragMinWidths?: Record<string, number>;

    /**
     * Layout to save from the painted widths, with `columnKey` marked resized or handed back to content sizing.
     * `null` when no resized column is left, `undefined` when no column is resizable.
     */
    getStoredTableColumnWidths?: (columnWidths: Record<string, number>, columnKey: string, isResized: boolean) => StoredTableColumnWidths | null;

    /** Width `target` sizes the column to, `undefined` when there's nothing to size it to. */
    getTargetColumnWidth?: (columnKey: string, target: ColumnWidthTarget) => number | undefined;

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

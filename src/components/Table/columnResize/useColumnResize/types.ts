import type React from 'react';

type UseColumnResizeParams = {
    /** Key the column widths persist under. `undefined` disables resizing on native, in narrow layouts and for tables that didn't opt in. */
    columnResizingID: string | undefined;

    /** Keys of the columns whose right edge the user can drag. */
    resizableColumnKeys: string[];

    /** The dragged column's width and the widths of the unset columns to its right that absorb it, which a drag paints. */
    getResizedColumnWidths: (columnKey: string, width: number) => Record<string, number>;

    /** Each column's resolved width, which a drag starts from. A new object means React rendered new widths. */
    resolvedColumnWidths: Record<string, number>;

    /** The narrowest width a drag may take a column to, for columns tighter than the default drag bound. */
    dragMinWidths?: Record<string, number>;

    /** Keeps every column at the width a drag ended at until the layout reflows. */
    pinColumnWidths?: (columnWidths: Record<string, number>) => void;

    /** Gap between columns, so handles can be centred in it. */
    columnGap: number;
};

type ColumnResizeHandleDOMProps = React.HTMLAttributes<HTMLDivElement>;

type ColumnResizeController = {
    /** Element holding the width custom properties. The header and rows inherit them, so one write repaints all. */
    setScopeElement: (element: HTMLElement | null) => void;

    /** Position and handlers for a column's handle, or `undefined` when its edge doesn't drag. */
    getHandleProps: (columnKey: string) => ColumnResizeHandleDOMProps | undefined;
};

export type {ColumnResizeController, ColumnResizeHandleDOMProps, UseColumnResizeParams};

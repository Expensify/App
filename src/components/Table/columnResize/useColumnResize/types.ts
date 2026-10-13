import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type React from 'react';

type UseColumnResizeParams = {
    /** Key the column widths persist under. `undefined` disables resizing on native, in narrow layouts and for tables that didn't opt in. */
    columnResizingID: string | undefined;

    /** Keys of the columns whose right edge the user can drag. */
    resizableColumnKeys: string[];

    /** Each column's resolved width, which a drag starts from. A new object means React rendered new widths. */
    resolvedColumnWidths: Record<string, number>;

    /** The narrowest width a drag may take a column to, for columns tighter than the default drag bound. */
    dragMinWidths?: Record<string, number>;

    /** Width that fits each column's content, which a click on its edge sizes it to. */
    fitColumnWidths?: Record<string, number>;

    /** Widths the user already gave this table's columns. */
    columnWidthOverrides?: ColumnWidthOverrides;

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

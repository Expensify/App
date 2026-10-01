import type {ColumnWidthOverrides, ResizableColumn} from '@components/Table/columnResize/types';

import type React from 'react';

type UseColumnResizeParams = {
    /** Key the column widths persist under. `undefined` disables resizing on native, in narrow layouts and for tables that didn't opt in. */
    columnResizingID: string | undefined;

    /** The columns whose right edge the user can drag, in the order they are rendered. */
    columns: ResizableColumn[];

    /** Each column's resolved width, which a drag starts from. */
    resolvedColumnWidths: Record<string, number>;

    /** Widths the user already dragged this table's columns to. */
    columnWidthOverrides: ColumnWidthOverrides | undefined;

    /** Gap between columns, so handles can be centred in it. */
    columnGap: number;
};

type ColumnResizeHandleDOMProps = React.HTMLAttributes<HTMLDivElement>;

type ColumnResizeController = {
    /** Element holding the width custom properties. The header and rows inherit them, so one write repaints all. */
    setScopeElement: (element: HTMLElement | null) => void;

    /** The columns whose right edge the user can drag, in the order they are rendered. */
    columns: ResizableColumn[];

    /** Position and handlers for a column's handle. */
    getHandleProps: (column: ResizableColumn) => ColumnResizeHandleDOMProps;
};

export type {ColumnResizeController, ColumnResizeHandleDOMProps, UseColumnResizeParams};

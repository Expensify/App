import type {ColumnWidthOverrides, ResizableColumn} from '@components/Table/columnResize/types';

import type React from 'react';

type UseColumnResizeParams = {
    /** Key the column widths persist under. `undefined` disables resizing (native, narrow layouts, tables not opted in). */
    columnResizingID: string | undefined;

    /** The columns whose right edge the user can drag, in the order they are rendered. */
    columns: ResizableColumn[];

    /** What each column resolved to, which is the width a drag on its edge starts from. */
    resolvedColumnWidths: Record<string, number>;

    /** Widths the user already dragged this table's columns to. */
    columnWidthOverrides: ColumnWidthOverrides | undefined;

    /** Space between two columns, so a handle can be centered in it rather than on one column's edge. */
    columnGap: number;
};

/** The DOM props one resize handle renders with. Everything the interaction needs lives in here. */
type ColumnResizeHandleDOMProps = React.HTMLAttributes<HTMLDivElement>;

type ColumnResizeController = {
    /** Element holding the width custom properties; the header and rows inherit them, so one write repaints all. */
    setScopeElement: (element: HTMLElement | null) => void;

    /** The columns whose right edge the user can drag, in the order they are rendered. */
    columns: ResizableColumn[];

    /** Everything a column's handle renders with: its position within the column's own header cell, and its handlers. */
    getHandleProps: (column: ResizableColumn) => ColumnResizeHandleDOMProps;
};

export type {ColumnResizeController, ColumnResizeHandleDOMProps, UseColumnResizeParams};

import type ChildrenProps from '@src/types/utils/ChildrenProps';

/** A later column that absorbs another column's resize. */
type ColumnAbsorber = {
    columnKey: string;

    /** Narrowest it may be squeezed to, usually its content width so absorbing never truncates what it shows. */
    minWidth: number;
};

/** A column whose right edge the user can drag. */
type ResizableColumn = {
    columnKey: string;

    /** Later columns that absorb this one's resize, in render order. Empty means resizing it overflows the table and scrolls. */
    absorbers: ColumnAbsorber[];
};

type ColumnResizeHandleProps = {
    /** The column this handle resizes. Its edge is the right edge of the cell the handle renders in. */
    columnKey: string;
};

type ColumnResizeScopeProps = ChildrenProps & {
    /** Receives the element the columns' width custom properties are written on. Omitted when the table isn't resizable. */
    onScopeElement?: (element: HTMLElement | null) => void;
};

export type {ColumnAbsorber, ColumnResizeHandleProps, ColumnResizeScopeProps, ResizableColumn};

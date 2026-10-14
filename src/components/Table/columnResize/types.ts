import type ChildrenProps from '@src/types/utils/ChildrenProps';

type ColumnResizeHandleProps = {
    /** The column this handle resizes. Its edge is the right edge of the cell the handle renders in. */
    columnKey: string;
};

type ColumnResizeScopeProps = ChildrenProps & {
    /** Receives the element the columns' width custom properties are written on. Omitted when the table isn't resizable. */
    onScopeElement?: (element: HTMLElement | null) => void;
};

export type {ColumnResizeHandleProps, ColumnResizeScopeProps};

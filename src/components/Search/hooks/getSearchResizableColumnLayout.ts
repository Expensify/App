/** Lays the Search table's columns out for resizing, from a saved layout when there is one and the fresh widths otherwise. */
import getFrozenColumnWidths from '@components/Table/columnResize/getFrozenColumnWidths';
import type {ResizableColumnLayout, RowChromeWidths} from '@components/Table/columnResize/getResizableColumnLayout';
import getResizableColumnLayout, {getAvailableColumnsWidth} from '@components/Table/columnResize/getResizableColumnLayout';
import type {ResizableColumn} from '@components/Table/columnResize/resolveDraggedColumnWidths';
import {isColumnResizable} from '@components/Table/columnResize/resolveDraggedColumnWidths';

import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

/** What the Search table needs to paint resizable columns and hand to `useColumnResize`. */
type SearchResizableColumnLayout = Pick<
    ResizableColumnLayout,
    'scrollWidth' | 'resizableColumnKeys' | 'getResizedColumnWidths' | 'resolvedColumnWidths' | 'dragMinWidths' | 'getTargetColumnWidth'
> & {
    /** Layout to save after `columnKey` is dragged or reset. `null` when no resized column is left. */
    getStoredTableColumnWidths: (columnWidths: Record<string, number>, columnKey: string, isResized: boolean) => StoredTableColumnWidths | null;
};

type GetSearchResizableColumnLayoutParams = {
    /** Every column, in render order. Only headed, content-sized columns resize. */
    columns: ResizableColumn[];

    /** Widths a fresh load paints, which a reset also returns a column to. */
    defaultColumnWidths: Record<string, number>;

    /** `undefined` until the first drag. After it, content no longer sizes the columns. */
    storedTableColumnWidths: StoredTableColumnWidths | undefined;

    /** Includes the rows' own margin and padding. */
    tableWidth: number;

    rowChromeWidths: RowChromeWidths;
};

/** `undefined` when no column resizes, so the table keeps its plain dynamic sizing with no draggable edges. */
function getSearchResizableColumnLayout({
    columns,
    defaultColumnWidths,
    storedTableColumnWidths,
    tableWidth,
    rowChromeWidths,
}: GetSearchResizableColumnLayoutParams): SearchResizableColumnLayout | undefined {
    if (!columns.some(isColumnResizable)) {
        return undefined;
    }

    const availableColumnsWidth = getAvailableColumnsWidth(tableWidth, rowChromeWidths);

    // After the first drag, only room changes move the columns, so new rows never shift them.
    const resolvedColumnWidths = storedTableColumnWidths ? getFrozenColumnWidths({columns, storedTableColumnWidths, availableColumnsWidth}) : defaultColumnWidths;
    const resizedColumnKeys = storedTableColumnWidths?.resizedColumnKeys ?? [];

    return {
        ...getResizableColumnLayout({columns, resolvedColumnWidths, resizedColumnKeys, tableWidth, rowChromeWidths, defaultColumnWidths}),
        getStoredTableColumnWidths: (columnWidths, columnKey, isResized) => {
            const nextResizedColumnKeys = isResized ? [...new Set([...resizedColumnKeys, columnKey])] : resizedColumnKeys.filter((resizedColumnKey) => resizedColumnKey !== columnKey);

            return nextResizedColumnKeys.length > 0 ? {availableColumnsWidth, columnWidths, resizedColumnKeys: nextResizedColumnKeys} : null;
        },
    };
}

export default getSearchResizableColumnLayout;
export type {SearchResizableColumnLayout};

/** Lays resizable columns out from the saved layout when there is one, and from the fresh widths otherwise. */
import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

import type {ResizableColumnLayout, RowChromeWidths} from './getResizableColumnLayout';
import type {ResizableColumn} from './resolveDraggedColumnWidths';

import getFrozenColumnWidths from './getFrozenColumnWidths';
import getResizableColumnLayout, {getAvailableColumnsWidth} from './getResizableColumnLayout';

type PersistedColumnLayout = ResizableColumnLayout & {
    /** Layout to save after `columnKey` is dragged or reset. `null` when no resized column is left. */
    getStoredTableColumnWidths: (columnWidths: Record<string, number>, columnKey: string, isResized: boolean) => StoredTableColumnWidths | null;
};

type GetPersistedColumnLayoutParams = {
    /** Every column, in render order. */
    columns: ResizableColumn[];

    /** Widths content sizing gives the columns, used until the first drag and as what a reset returns a column to. */
    freshColumnWidths: Record<string, number>;

    /** `undefined` until the first drag. After it, content no longer sizes the columns. */
    storedTableColumnWidths: StoredTableColumnWidths | undefined;

    /** Measured width of the area the table renders into. */
    tableWidth: number;

    rowChromeWidths: RowChromeWidths;
};

function getPersistedColumnLayout({columns, freshColumnWidths, storedTableColumnWidths, tableWidth, rowChromeWidths}: GetPersistedColumnLayoutParams): PersistedColumnLayout {
    const availableColumnsWidth = getAvailableColumnsWidth(tableWidth, rowChromeWidths);

    // After the first drag, only room changes move the columns, so new content never shifts them.
    const resolvedColumnWidths = storedTableColumnWidths ? getFrozenColumnWidths({columns, storedTableColumnWidths, availableColumnsWidth}) : freshColumnWidths;
    const resizedColumnKeys = storedTableColumnWidths?.resizedColumnKeys ?? [];

    return {
        ...getResizableColumnLayout({columns, resolvedColumnWidths, resizedColumnKeys, tableWidth, rowChromeWidths, freshColumnWidths}),
        getStoredTableColumnWidths: (columnWidths, columnKey, isResized) => {
            const nextResizedColumnKeys = isResized ? [...new Set([...resizedColumnKeys, columnKey])] : resizedColumnKeys.filter((resizedColumnKey) => resizedColumnKey !== columnKey);

            return nextResizedColumnKeys.length > 0 ? {availableColumnsWidth, columnWidths, resizedColumnKeys: nextResizedColumnKeys} : null;
        },
    };
}

export default getPersistedColumnLayout;
export type {PersistedColumnLayout};

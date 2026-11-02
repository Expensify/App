import getPersistedColumnLayout from '@components/Table/columnResize/getPersistedColumnLayout';
import type {RowChromeWidths} from '@components/Table/columnResize/getResizableColumnLayout';
import type {ResizableColumn} from '@components/Table/columnResize/resolveDraggedColumnWidths';
import {getFixedColumn} from '@components/Table/columnResize/resolveDraggedColumnWidths';

import CONST from '@src/CONST';

// No checkbox, gaps, margin or padding, so the columns share the whole table width.
const NO_ROW_CHROME: RowChromeWidths = {selectionColumnWidth: 0, totalGapWidth: 0, rowMarginWidth: 0, rowPaddingWidth: 0};

/** A headed, content-sized column, so it resizes. */
function freeTextColumn(key: string, contentWidth = 0, minWidth = 0): ResizableColumn {
    return {key, label: key, declaredWidth: undefined, contentWidth, minWidth, maxWidth: Number.POSITIVE_INFINITY};
}

describe('getPersistedColumnLayout', () => {
    it('resizes only the free-text columns and gives the last one the leftover, keeping fixed and hugged columns at their width', () => {
        // Given a date column, two free-text columns and a status badge, whose fresh widths leave 30px of the row unused
        const columns = [getFixedColumn('date', 62), freeTextColumn('merchant'), freeTextColumn('description'), getFixedColumn('status', 70)];

        // When the layout is built with nothing saved
        const layout = getPersistedColumnLayout({
            columns,
            freshColumnWidths: {date: 62, merchant: 200, description: 150, status: 70},
            storedTableColumnWidths: undefined,
            tableWidth: 512,
            rowChromeWidths: NO_ROW_CHROME,
        });

        // Then only the free-text edges drag, and the leftover goes to the last of them rather than to the badge
        expect(layout.resizableColumnKeys).toEqual(['merchant', 'description']);
        expect(layout.resolvedColumnWidths).toEqual({date: 62, merchant: 200, description: 180, status: 70});
    });

    it('keeps a resized column at its width when the table narrows, with the other free-text columns absorbing the change', () => {
        // Given a save where merchant was dragged to 300px in a table whose columns had 600px
        const columns = [getFixedColumn('date', 62), freeTextColumn('merchant', 100, 60), freeTextColumn('description', 100, 60), freeTextColumn('category', 100, 60)];
        const storedTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {date: 62, merchant: 300, description: 119, category: 119}, resizedColumnKeys: ['merchant']};

        // When the table loses 100px
        const layout = getPersistedColumnLayout({
            columns,
            freshColumnWidths: {date: 62, merchant: 179, description: 179, category: 180},
            storedTableColumnWidths,
            tableWidth: 500,
            rowChromeWidths: NO_ROW_CHROME,
        });

        // Then merchant keeps the width the user gave it and the untouched columns split the lost room
        expect(layout.resolvedColumnWidths).toEqual({date: 62, merchant: 300, description: 69, category: 69});
    });

    it('starts a column added since the save at its content width and hands a hidden column’s width to the others', () => {
        // Given a save with merchant dragged to 200px and a 150px category column, which the user has since hidden and
        // replaced with a tag column
        const columns = [freeTextColumn('merchant', 100, 60), freeTextColumn('description', 100, 60), freeTextColumn('tag', 90, 60)];
        const storedTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {merchant: 200, description: 250, category: 150}, resizedColumnKeys: ['merchant']};

        // When the layout is built with the columns given the same 600px
        const layout = getPersistedColumnLayout({
            columns,
            freshColumnWidths: {merchant: 200, description: 200, tag: 200},
            storedTableColumnWidths,
            tableWidth: 600,
            rowChromeWidths: NO_ROW_CHROME,
        });

        // Then the tag column starts at its 90px content, merchant stays at 200px, and description takes the 60px the
        // hidden category column freed beyond what tag needs, so the row still fills the table
        expect(layout.resolvedColumnWidths).toEqual({merchant: 200, description: 310, tag: 90});
    });

    it('fits a column to its whole content and resets it to the width a fresh load gives it', () => {
        // Given a saved layout with merchant dragged to 120px, whose content needs 260px and whose fresh width is 210px
        const columns = [freeTextColumn('merchant', 260, 60), freeTextColumn('description', 100, 60)];
        const storedTableColumnWidths = {availableColumnsWidth: 500, columnWidths: {merchant: 120, description: 380}, resizedColumnKeys: ['merchant']};

        // When the layout is built
        const layout = getPersistedColumnLayout({
            columns,
            freshColumnWidths: {merchant: 210, description: 290},
            storedTableColumnWidths,
            tableWidth: 500,
            rowChromeWidths: NO_ROW_CHROME,
        });

        // Then a click fits it to its content and a second click puts it back where a reload would
        expect(layout.getTargetColumnWidth('merchant', CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.FIT)).toBe(260);
        expect(layout.getTargetColumnWidth('merchant', CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.RESET)).toBe(210);
    });

    it('clears the save once the last resized column is reset, and keeps every other resized column on a reset', () => {
        // Given merchant and description both resized
        const columns = [freeTextColumn('merchant', 100, 60), freeTextColumn('description', 100, 60)];
        const storedTableColumnWidths = {availableColumnsWidth: 500, columnWidths: {merchant: 200, description: 300}, resizedColumnKeys: ['merchant', 'description']};
        const layout = getPersistedColumnLayout({
            columns,
            freshColumnWidths: {merchant: 250, description: 250},
            storedTableColumnWidths,
            tableWidth: 500,
            rowChromeWidths: NO_ROW_CHROME,
        });

        // When merchant is reset
        const afterReset = layout.getStoredTableColumnWidths({merchant: 250, description: 250}, 'merchant', false);

        // Then description stays resized and the save is measured against the room the columns had
        expect(afterReset).toEqual({availableColumnsWidth: 500, columnWidths: {merchant: 250, description: 250}, resizedColumnKeys: ['description']});

        // When the only resized column left is reset instead
        const onlyResizedLayout = getPersistedColumnLayout({
            columns,
            freshColumnWidths: {merchant: 250, description: 250},
            storedTableColumnWidths: {...storedTableColumnWidths, resizedColumnKeys: ['merchant']},
            tableWidth: 500,
            rowChromeWidths: NO_ROW_CHROME,
        });

        // Then nothing is left to save, so the table goes back to content sizing
        expect(onlyResizedLayout.getStoredTableColumnWidths({merchant: 250, description: 250}, 'merchant', false)).toBeNull();
    });
});

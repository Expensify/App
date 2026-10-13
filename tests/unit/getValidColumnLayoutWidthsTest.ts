import getValidColumnLayoutWidths from '@components/Table/columnResize/getValidColumnLayoutWidths';

import type {ColumnLayout} from '@src/types/onyx/TableColumnWidths';

/** The layout a drag of Tax code to 460px left on a 1268px table, with Name and Tax rate unset to its left. */
const storedLayout: ColumnLayout = {
    tableWidth: 1268,
    fitColumnWidths: {name: 80, taxRate: 67, taxCode: 182},
    columnWidths: {name: 356, taxRate: 360, taxCode: 460, enabled: 58, actions: 20},
};

/** What the table measures after a reload: Tax code is user-sized now, so it's no longer content-sized. */
const reloadedFitWidths = {name: 80, taxRate: 67};
const reloadedStoredWidths = new Map([['taxCode', 460]]);

describe('getValidColumnLayoutWidths', () => {
    it('repaints the stored layout when the table reloads unchanged', () => {
        // Given the layout a drag stored, and a reload at the same width with the same content

        // When the layout is checked
        const columnWidths = getValidColumnLayoutWidths(storedLayout, 1268, reloadedFitWidths, reloadedStoredWidths);

        // Then the widths the drag ended at are repainted, rather than reflowing the unset columns to the left of the dragged one
        expect(columnWidths).toEqual(storedLayout.columnWidths);
    });

    it('reflows once the table is a different width', () => {
        // Given the stored layout

        // When the table reloads in a narrower window
        const columnWidths = getValidColumnLayoutWidths(storedLayout, 1100, reloadedFitWidths, reloadedStoredWidths);

        // Then the columns are laid out from scratch, since the stored widths no longer fill the row
        expect(columnWidths).toBeUndefined();
    });

    it('reflows once a column holds wider content', () => {
        // Given the stored layout

        // When a longer tax rate makes its column need more room
        const columnWidths = getValidColumnLayoutWidths(storedLayout, 1268, {name: 80, taxRate: 90}, reloadedStoredWidths);

        // Then the columns are laid out from scratch, so the new content isn't squeezed into the old widths
        expect(columnWidths).toBeUndefined();
    });

    it('reflows once a column it laid out is hidden', () => {
        // Given the stored layout

        // When the Tax rate column is no longer rendered
        const columnWidths = getValidColumnLayoutWidths(storedLayout, 1268, {name: 80}, reloadedStoredWidths);

        // Then the columns are laid out from scratch, since the remaining widths were shared with the hidden column
        expect(columnWidths).toBeUndefined();
    });

    it('reflows once a stored width differs from the layout', () => {
        // Given the stored layout

        // When Tax code is stored at a width the layout wasn't painted with
        const columnWidths = getValidColumnLayoutWidths(storedLayout, 1268, reloadedFitWidths, new Map([['taxCode', 500]]));

        // Then the columns are laid out from scratch around the new width
        expect(columnWidths).toBeUndefined();
    });
});

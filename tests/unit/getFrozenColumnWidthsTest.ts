import getFrozenColumnWidths from '@components/Table/columnResize/getFrozenColumnWidths';
import type {ResizableColumn} from '@components/Table/columnResize/resolveDraggedColumnWidths';

import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

/** A content-sized column that can be squeezed to 100px, which is where absorbing stops. */
function column(key: string, {contentWidth = 0, maxWidth = Number.POSITIVE_INFINITY}: {contentWidth?: number; maxWidth?: number} = {}): ResizableColumn {
    return {key, label: key, declaredWidth: undefined, contentWidth, minWidth: 100, maxWidth};
}

function fixedColumn(key: string, width: number): ResizableColumn {
    return {key, label: key, declaredWidth: width, contentWidth: 0, minWidth: 0, maxWidth: Number.POSITIVE_INFINITY};
}

const ABCDE = ['a', 'b', 'c', 'd', 'e'];

describe('getFrozenColumnWidths', () => {
    it('repaints the saved widths exactly at the width they were saved at', () => {
        // Given a layout saved at 600px after the user dragged the first column
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 250, b: 175, c: 175}, resizedColumnKeys: ['a']};

        // When the table reloads at the same width, with content that would now size the columns differently
        const widths = getFrozenColumnWidths({
            columns: [column('a', {contentWidth: 50}), column('b', {contentWidth: 500}), column('c', {contentWidth: 30})],
            storedTableColumnWidths: stored,
            availableColumnsWidth: 600,
        });

        // Then nothing moves, since content never resizes a frozen table and long values truncate instead
        expect(widths).toEqual({a: 250, b: 175, c: 175});
    });

    it('keeps the overflow a drag left when the table reloads, without squeezing the columns before the dragged one', () => {
        // Given D was dragged until E hit its minimum and the 600px table overflowed by 200px
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 100, b: 150, c: 150, d: 300, e: 100}, resizedColumnKeys: ['d']};

        // When the table reloads at the same width
        const widths = getFrozenColumnWidths({
            columns: ABCDE.map((key) => column(key)),
            storedTableColumnWidths: stored,
            availableColumnsWidth: 600,
        });

        // Then B and C keep their widths, since the overflow is part of the saved layout
        expect(widths).toEqual({a: 100, b: 150, c: 150, d: 300, e: 100});
    });

    it('keeps a short row short when the table reloads', () => {
        // Given a drag left the columns 100px short of a 600px table, the growable column filling the rest
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 150, b: 200, c: 150}, resizedColumnKeys: ['a']};

        // When the table reloads at the same width
        const widths = getFrozenColumnWidths({
            columns: ['a', 'b', 'c'].map((key) => column(key)),
            storedTableColumnWidths: stored,
            availableColumnsWidth: 600,
        });

        // Then the auto-sized columns don't grow into the gap, so the row paints as it did when saved
        expect(widths).toEqual({a: 150, b: 200, c: 150});
    });

    it('takes back the overflow a drag left before growing the columns when the table widens', () => {
        // Given a saved layout that overflows a 600px table by 200px
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 100, b: 150, c: 150, d: 300, e: 100}, resizedColumnKeys: ['d']};

        // When the table widens by 260px
        const widths = getFrozenColumnWidths({
            columns: ABCDE.map((key) => column(key)),
            storedTableColumnWidths: stored,
            availableColumnsWidth: 860,
        });

        // Then the first 200px remove the overflow, like a drag would, and the auto-sized columns split the other 60px
        expect(widths).toEqual({a: 115, b: 165, c: 165, d: 300, e: 115});
    });

    it('fills the short row a drag left before shrinking the columns when the table narrows', () => {
        // Given a saved layout 100px short of a 600px table
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 150, b: 200, c: 150}, resizedColumnKeys: ['a']};

        // When the table narrows by 140px
        const widths = getFrozenColumnWidths({
            columns: ['a', 'b', 'c'].map((key) => column(key)),
            storedTableColumnWidths: stored,
            availableColumnsWidth: 460,
        });

        // Then the empty 100px go first, and the auto-sized columns give the remaining 40px
        expect(widths).toEqual({a: 150, b: 180, c: 130});
    });

    it('splits extra room evenly among the columns the user never dragged', () => {
        // Given a layout where the user dragged the second column
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 200, b: 200, c: 200}, resizedColumnKeys: ['b']};

        // When the window widens by 100px
        const widths = getFrozenColumnWidths({
            columns: ['a', 'b', 'c'].map((key) => column(key)),
            storedTableColumnWidths: stored,
            availableColumnsWidth: 700,
        });

        // Then the two auto-sized columns take 50px each and the dragged one keeps the width the user chose
        expect(widths).toEqual({a: 250, b: 200, c: 250});
    });

    it('shrinks the auto-sized columns down to their minimum and overflows the rest when the table narrows', () => {
        // Given a layout where the user dragged the first column, and the others can be squeezed by 50px each
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 300, b: 150, c: 150}, resizedColumnKeys: ['a']};

        // When the window narrows by 200px
        const widths = getFrozenColumnWidths({
            columns: ['a', 'b', 'c'].map((key) => column(key)),
            storedTableColumnWidths: stored,
            availableColumnsWidth: 400,
        });

        // Then they stop at their minimum and the 100px they can't give scrolls, while the dragged column never moves
        expect(widths).toEqual({a: 300, b: 100, c: 100});
    });

    it('never moves a resized column, even when no other column can absorb', () => {
        // Given every column was dragged by the user
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 200, b: 200, c: 200}, resizedColumnKeys: ['a', 'b', 'c']};

        // When the window widens
        const widths = getFrozenColumnWidths({
            columns: ['a', 'b', 'c'].map((key) => column(key)),
            storedTableColumnWidths: stored,
            availableColumnsWidth: 900,
        });

        // Then the widths the user chose hold, leaving the room for the growable column to fill
        expect(widths).toEqual({a: 200, b: 200, c: 200});
    });

    it('starts a column that appears with the data at its content width and makes room for it from the auto-sized columns', () => {
        // Given a taxes layout saved with three columns, the first dragged by the user, while no tax had a custom code
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 200, b: 200, c: 200}, resizedColumnKeys: ['a']};

        // When a tax gets a custom code, so the Tax code column appears, and its content needs 120px
        const widths = getFrozenColumnWidths({
            columns: [column('a'), column('b'), column('c'), column('taxCode', {contentWidth: 120})],
            storedTableColumnWidths: stored,
            availableColumnsWidth: 600,
        });

        // Then it shows its content in full, since it has no saved width yet, and the two auto-sized columns give 60px each
        expect(widths).toEqual({a: 200, b: 140, c: 140, taxCode: 120});
    });

    it('caps a column that appears with the data at its maximum width and leaves the room change to the saved columns', () => {
        // Given a layout saved with two columns, and a free-text column capped at 150px so its long values truncate
        // instead of taking the whole row, which only the cap prevents since the column has no saved width yet
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 300, b: 300}, resizedColumnKeys: ['a']};

        // When the capped column, whose content needs 400px, appears with the data while the table widens by 100px
        const widths = getFrozenColumnWidths({
            columns: [column('a'), column('b'), column('c', {contentWidth: 400, maxWidth: 150})],
            storedTableColumnWidths: stored,
            availableColumnsWidth: 700,
        });

        // Then it starts at its cap, and only B, the auto-sized column in the save, gives the 50px the row is over by.
        // Splitting it with the new column would put that one at 125px, below where its cap starts it.
        expect(widths).toEqual({a: 300, b: 250, c: 150});
    });

    it('splits the width of a column that disappears with the data among the auto-sized columns', () => {
        // Given a taxes layout saved with four columns, the last being the Tax code column, and the first dragged by the user
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 150, b: 150, c: 150, taxCode: 150}, resizedColumnKeys: ['a']};

        // When the last tax with a custom code is deleted, so the Tax code column disappears
        const widths = getFrozenColumnWidths({
            columns: ['a', 'b', 'c'].map((key) => column(key)),
            storedTableColumnWidths: stored,
            availableColumnsWidth: 600,
        });

        // Then the 150px it freed goes to the auto-sized columns, so the row still fills the table
        expect(widths).toEqual({a: 150, b: 225, c: 225});
    });

    it('grows auto-sized columns no further than their maximum width', () => {
        // Given an auto-sized column capped 20px above its saved width
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 200, b: 200, c: 200}, resizedColumnKeys: ['a']};

        // When the window widens by 100px
        const widths = getFrozenColumnWidths({
            columns: [column('a'), column('b', {maxWidth: 220}), column('c')],
            storedTableColumnWidths: stored,
            availableColumnsWidth: 700,
        });

        // Then the capped column stops at its cap and the other auto-sized column takes the rest
        expect(widths).toEqual({a: 200, b: 220, c: 280});
    });

    it('keeps declared widths as declared and never uses them to absorb', () => {
        // Given a layout saved while the fixed status column declared 100px, which now declares 80px
        const stored: StoredTableColumnWidths = {availableColumnsWidth: 600, columnWidths: {a: 260, status: 100, b: 240}, resizedColumnKeys: ['a']};

        // When the window widens by 40px
        const widths = getFrozenColumnWidths({
            columns: [column('a'), fixedColumn('status', 80), column('b')],
            storedTableColumnWidths: stored,
            availableColumnsWidth: 640,
        });

        // Then the status column paints its declared 80px, not the saved 100px, and the 20px it gives back is room like
        // the 40px the window gained, so only the auto-sized content column grows, by 60px, since a declared width holds fixed-size content
        expect(widths).toEqual({a: 260, status: 80, b: 300});
    });
});

import {getColumnWidthValue, getGrowableColumnTrack} from '@components/Table/columnResize/columnWidthExpressions';
import getResizableColumnLayout from '@components/Table/columnResize/getResizableColumnLayout';
import type {TableColumn} from '@components/Table/types';

import CONST from '@src/CONST';

const {MIN_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/** No selection, gaps, margin or padding, so the row is exactly the column sum. */
const rowChromeWidths = {selectionColumnWidth: 0, totalGapWidth: 0, rowMarginWidth: 0, rowPaddingWidth: 0};

function column(key: string, label = key): TableColumn {
    return {key, label, sortable: false};
}

describe('getResizableColumnLayout', () => {
    it('keeps the last column from shrinking while the row fills the table exactly', () => {
        // Given three 200px columns filling a 600px table
        const columns = [column('name'), column('email'), column('role')];

        // When the layout is built
        const {dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 200, email: 200, role: 200},
            columnWidthOverrides: undefined,
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then the last column can't shrink, since that would pull the row in from the table's right edge
        expect(dragMinWidths).toEqual({role: 200});
    });

    it('lets the last column shrink only by the width that overflows the table', () => {
        // Given columns widened 50px past a 600px table
        const columns = [column('name'), column('email'), column('role')];

        // When the layout is built
        const {dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 200, email: 200, role: 250},
            columnWidthOverrides: undefined,
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then the last column can give back the overflow and no more, so the row ends exactly at the table's edge
        expect(dragMinWidths).toEqual({role: 200});
    });

    it('falls back to the default drag bound once the overflow is larger than the column', () => {
        // Given columns far wider than the table
        const columns = [column('name'), column('email'), column('role')];

        // When the layout is built
        const {dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 800, email: 800, role: 200},
            columnWidthOverrides: undefined,
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then the last column shrinks as far as any other, so its edge stays reachable
        expect(dragMinWidths).toEqual({role: MIN_WIDTH});
    });

    it('keeps the last headed column from shrinking when headless columns trail it', () => {
        // Given a trailing headless arrow column, with the row filling a 600px table exactly
        const columns = [column('name'), column('role'), column('arrow', '')];

        // When the layout is built
        const {dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 280, role: 280, arrow: 40},
            columnWidthOverrides: undefined,
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then the last headed column can't shrink, since the freed room would stretch the fixed-size arrow column
        expect(dragMinWidths).toEqual({role: 280});
    });

    it('grows the last headed column into leftover room, not the trailing headless column', () => {
        // Given columns 160px narrower than a 600px table, with a trailing headless arrow column
        const columns = [column('name'), column('role'), column('arrow', '')];

        // When the layout is built
        const {gridTemplateColumns, resolvedColumnWidths, dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 200, role: 200, arrow: 40},
            columnWidthOverrides: undefined,
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then only the last headed column's track grows, so the arrow keeps its size
        expect(gridTemplateColumns).toEqual([getColumnWidthValue('name', 200), getGrowableColumnTrack(getColumnWidthValue('role', 200)), getColumnWidthValue('arrow', 40)]);

        // And a drag on it starts from the 360px it's painted at, and can't shrink it, so the arrow never stretches
        expect(resolvedColumnWidths.role).toBe(360);
        expect(dragMinWidths).toEqual({role: 360});
    });
});

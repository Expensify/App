import {SCROLL_EXTENT_FLOOR_VARIABLE} from '@components/Table/columnResize/columnWidthExpressions';
import getFrozenColumnWidths from '@components/Table/columnResize/getFrozenColumnWidths';
import getResizableColumnLayout, {getAvailableColumnsWidth} from '@components/Table/columnResize/getResizableColumnLayout';
import type {ResizableColumn} from '@components/Table/columnResize/resolveDraggedColumnWidths';

import CONST from '@src/CONST';

const {MIN_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/** No selection, gaps, margin or padding, so the row is exactly the column sum. */
const rowChromeWidths = {selectionColumnWidth: 0, totalGapWidth: 0, rowMarginWidth: 0, rowPaddingWidth: 0};

function column(key: string, {label = key, minWidth = 0, contentWidth = 0}: {label?: string; minWidth?: number; contentWidth?: number} = {}): ResizableColumn {
    return {key, label, declaredWidth: undefined, contentWidth, minWidth, maxWidth: Number.POSITIVE_INFINITY};
}

describe('getResizableColumnLayout', () => {
    it('keeps the scroll extent at least as wide as the floor a drag sets', () => {
        // Given a table scrolled right, where shrinking a column mid-drag would shrink the extent under the scroll position
        const columns = [column('name'), column('role')];

        // When the layout is built
        const {scrollWidth} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 400, role: 400},
            resizedColumnKeys: [],
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then the extent is floored by the drag's variable too, so the filter bar pinned inside the scroller stays put
        expect(scrollWidth).toContain(`var(${SCROLL_EXTENT_FLOOR_VARIABLE}, 0px)`);
    });

    it('keeps the last column from shrinking while the row fills the table exactly', () => {
        // Given three 200px columns filling a 600px table
        const columns = [column('name'), column('email'), column('role')];

        // When the layout is built
        const {dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 200, email: 200, role: 200},
            resizedColumnKeys: [],
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
            resizedColumnKeys: [],
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
            resizedColumnKeys: [],
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then the last column shrinks as far as any other, so its edge stays reachable
        expect(dragMinWidths).toEqual({role: MIN_WIDTH});
    });

    it('grows the last headed column into leftover room, not the trailing headless column', () => {
        // Given columns 160px narrower than a 600px table, with a trailing headless arrow column
        const columns = [column('name'), column('role'), column('arrow', {label: ''})];

        // When the layout is built
        const {gridTemplateColumns, resolvedColumnWidths, dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 200, role: 200, arrow: 40},
            resizedColumnKeys: [],
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then only the last headed column's track grows, so the arrow keeps its size
        expect(gridTemplateColumns.map((track) => track.includes('1fr'))).toEqual([false, true, false]);

        // And a drag on it starts from the 360px it's painted at, and can't shrink it, so the arrow never stretches
        expect(resolvedColumnWidths.role).toBe(360);
        expect(dragMinWidths).toEqual({role: 360});
    });

    it('takes a drag out of the leftover the last headed column paints', () => {
        // Given a 600px table whose last headed column is painted 100px wider than it needs
        const columns = [column('name', {minWidth: 200}), column('email', {minWidth: 160}), column('role', {minWidth: 100}), column('arrow', {label: ''})];
        const params = {
            columns,
            resolvedColumnWidths: {name: 200, email: 160, role: 100, arrow: 40},
            resizedColumnKeys: [],
            tableWidth: 600,
            rowChromeWidths,
        };

        // When the first column is dragged 60px wider
        const {getResizedColumnWidths} = getResizableColumnLayout(params);

        // Then the last headed column gives up its leftover, since the column between is already at its minimum
        expect(getResizedColumnWidths('name', 260)).toEqual({name: 260, email: 160, role: 140});
    });

    it('takes a drag out of the leftover a fixed-width last column fills, and repaints the same widths after the save', () => {
        // Given a 760px table whose last headed column has a declared 72px width, leaving 88px of leftover room
        const columns = [column('name', {minWidth: 100}), column('taxRate', {minWidth: 100}), column('taxCode', {minWidth: 100}), {...column('enabled'), declaredWidth: 72}];
        const {resolvedColumnWidths, getResizedColumnWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 300, taxRate: 150, taxCode: 150, enabled: 72},
            resizedColumnKeys: [],
            tableWidth: 760,
            rowChromeWidths,
        });

        // When the third column is dragged 50px wider and the painted widths are saved
        const draggedWidths = getResizedColumnWidths('taxCode', 200);
        const savedColumnWidths = {...resolvedColumnWidths, ...draggedWidths};
        const frozenWidths = getFrozenColumnWidths({
            columns,
            storedTableColumnWidths: {availableColumnsWidth: 760, columnWidths: savedColumnWidths, resizedColumnKeys: ['taxCode']},
            availableColumnsWidth: 760,
        });

        // Then the fixed column keeps its declared width so the drag eats the leftover its track fills instead of overflowing,
        // and the saved layout repaints without the columns before the dragged one jumping wider
        expect(savedColumnWidths).toEqual({name: 300, taxRate: 150, taxCode: 200, enabled: 72});
        expect(frozenWidths).toEqual(savedColumnWidths);
    });

    it('squeezes a column after the dragged one to the minimum the layout uses, not its content, before the row overflows', () => {
        // Given a 600px table whose free-text column shows 200px of content but the layout may squeeze it to 120px
        const columns = [column('name', {minWidth: 120}), column('taxCode', {minWidth: 120, contentWidth: 200})];

        // When the first column is dragged 100px wider
        const {getResizedColumnWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 400, taxCode: 200},
            resizedColumnKeys: [],
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then the free-text column truncates to 120px before the row overflows, matching what a reload lays out
        expect(getResizedColumnWidths('name', 500)).toEqual({name: 500, taxCode: 120});
    });

    it('gives an edge only to headed columns sized from their content', () => {
        // Given a table mixing content-sized, fixed and headless columns
        const columns = [column('name'), {...column('status'), declaredWidth: 80}, column('email'), column('arrow', {label: ''})];

        // When the layout is built
        const {resizableColumnKeys} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 200, status: 80, email: 200, arrow: 40},
            resizedColumnKeys: [],
            tableWidth: 520,
            rowChromeWidths,
        });

        // Then only the content-sized ones get an edge, since fixed and headless columns hold fixed-size content
        expect(resizableColumnKeys).toEqual(['name', 'email']);
    });

    it('keeps a last column already narrower than the drag bound where it is', () => {
        // Given a last column painted at 40px, narrower than the drag bound, in a row that fills a 600px table exactly
        const columns = [column('name'), column('role')];

        // When the layout is built
        const {dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 560, role: 40},
            resizedColumnKeys: [],
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then a drag can't take it below its 40px, so pressing its edge doesn't make it jump out to the drag bound
        expect(dragMinWidths).toEqual({role: 40});
    });

    it('leaves the columns the table width minus every piece of row chrome, floored to whole px', () => {
        // Given a 640.6px table with a 20px selection column, 36px of gaps, 40px of margin and 24px of padding
        const chromeWidths = {selectionColumnWidth: 20, totalGapWidth: 36, rowMarginWidth: 40, rowPaddingWidth: 24};

        // When the width left for the columns is measured
        const availableColumnsWidth = getAvailableColumnsWidth(640.6, chromeWidths);

        // Then it is 520px, so a saved layout compares against whole-px tracks that never overflow the table by a fraction
        expect(availableColumnsWidth).toBe(520);
    });

    it('fills the same column width a save records, once row chrome is taken out', () => {
        // Given two 200px columns in a 640.6px table with a 20px selection column, 36px of gaps, 40px of margin and 24px of padding
        const columns = [column('name'), column('role')];

        // When the layout is built
        const {resolvedColumnWidths, dragMinWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 200, role: 200},
            resizedColumnKeys: [],
            tableWidth: 640.6,
            rowChromeWidths: {selectionColumnWidth: 20, totalGapWidth: 36, rowMarginWidth: 40, rowPaddingWidth: 24},
        });

        // Then the last column grows into the 520px a save measures and no further, so a reload at the same width repaints
        // the row as it was dragged and the last column still can't shrink away from the table's edge
        expect(resolvedColumnWidths).toEqual({name: 200, role: 320});
        expect(dragMinWidths).toEqual({role: 320});
    });
});

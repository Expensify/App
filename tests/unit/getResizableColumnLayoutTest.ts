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
            pinnedColumnWidths: undefined,
            fitColumnWidths: {},
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
            pinnedColumnWidths: undefined,
            fitColumnWidths: {},
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
            pinnedColumnWidths: undefined,
            fitColumnWidths: {},
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
            pinnedColumnWidths: undefined,
            fitColumnWidths: {},
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
            pinnedColumnWidths: undefined,
            fitColumnWidths: {},
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then only the last headed column's track grows, so the arrow keeps its size
        expect(gridTemplateColumns.map((track) => track.includes('1fr'))).toEqual([false, true, false]);

        // And a drag on it starts from the 360px it's painted at, and can't shrink it, so the arrow never stretches
        expect(resolvedColumnWidths.role).toBe(360);
        expect(dragMinWidths).toEqual({role: 360});
    });

    it('drags the last headed column from the leftover room it paints', () => {
        // Given a 600px table whose last headed column is painted 100px wider than it needs
        const columns = [column('name'), column('email'), column('role'), column('arrow', '')];
        const params = {
            columns,
            resolvedColumnWidths: {name: 200, email: 160, role: 100, arrow: 40},
            columnWidthOverrides: undefined,
            pinnedColumnWidths: undefined,
            tableWidth: 600,
            rowChromeWidths,
        };

        // When the first column is dragged 60px wider
        const {getResizedColumnWidths} = getResizableColumnLayout({...params, fitColumnWidths: {name: 200, email: 160, role: 100}});

        // Then the last headed column gives up its leftover, since the content-fitted column between has nothing to give
        expect(getResizedColumnWidths('name', 260)).toEqual({name: 260, email: 160, role: 140});
    });

    it('paints the widths a drag ended at instead of reflowing the unset columns', () => {
        // Given a layout whose unset columns would reflow once a dragged width is stored
        const columns = [column('name'), column('email'), column('role')];

        // When the drag's painted widths are pinned alongside the stored width
        const {resolvedColumnWidths} = getResizableColumnLayout({
            columns,
            resolvedColumnWidths: {name: 260, email: 170, role: 170},
            columnWidthOverrides: {name: 260},
            pinnedColumnWidths: {name: 260, email: 140, role: 200},
            fitColumnWidths: {},
            tableWidth: 600,
            rowChromeWidths,
        });

        // Then the pinned widths win, so releasing the drag moves nothing
        expect(resolvedColumnWidths).toEqual({name: 260, email: 140, role: 200});
    });

    it('keeps a column the user sized earlier out of a later drag, so the row fits while other columns still have room', () => {
        // Given four 150px columns filling a 600px table, each able to shrink to 100px
        const columns = [column('a'), column('b'), column('c'), column('d')];
        const fitColumnWidths = {a: 100, b: 100, c: 100, d: 100};
        const params = {columns, resolvedColumnWidths: {a: 150, b: 150, c: 150, d: 150}, fitColumnWidths, tableWidth: 600, rowChromeWidths};

        // When the third column is dragged to 180px, and the drag is stored with the layout it left painted
        const firstDragWidths = getResizableColumnLayout({...params, columnWidthOverrides: undefined, pinnedColumnWidths: undefined}).getResizedColumnWidths('c', 180);
        const pinnedColumnWidths = {...params.resolvedColumnWidths, ...firstDragWidths};
        const columnWidthOverrides = {c: 180};

        // And the first column is then dragged to 210px
        const secondDragWidths = getResizableColumnLayout({...params, columnWidthOverrides, pinnedColumnWidths}).getResizedColumnWidths('a', 210);

        // Then the user-sized column keeps its width and the unset ones give way, the last down to its fit width, so the
        // row still fits instead of overflowing while the second column has room to give
        expect(pinnedColumnWidths).toEqual({a: 150, b: 150, c: 180, d: 120});
        expect({...pinnedColumnWidths, ...secondDragWidths}).toEqual({a: 210, b: 110, c: 180, d: 100});

        // And a reload repaints those widths, so releasing the drag moves nothing
        const {resolvedColumnWidths} = getResizableColumnLayout({
            ...params,
            columnWidthOverrides: {...columnWidthOverrides, a: 210},
            pinnedColumnWidths: {...pinnedColumnWidths, ...secondDragWidths},
        });
        expect(resolvedColumnWidths).toEqual({a: 210, b: 110, c: 180, d: 100});
    });
});

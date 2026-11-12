import type {ResizableColumn} from '@components/Table/columnResize/resolveDraggedColumnWidths';
import resolveDraggedColumnWidths from '@components/Table/columnResize/resolveDraggedColumnWidths';

import CONST from '@src/CONST';

const {MIN_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/** A headed column sized from its content, which absorbs other columns' resizes down to its minimum width. */
function contentColumn(key: string, minWidth = 0, maxWidth = Number.POSITIVE_INFINITY): ResizableColumn {
    return {key, label: key, declaredWidth: undefined, contentWidth: 0, minWidth, maxWidth};
}

describe('resolveDraggedColumnWidths', () => {
    it('takes a widened column out of the content-sized columns after it, equally', () => {
        // Given a 600px row with a fixed status column and a headless arrow among the columns after the first
        const columns = [contentColumn('name'), {...contentColumn('status'), declaredWidth: 80}, contentColumn('email'), contentColumn('role'), {...contentColumn('arrow'), label: ''}];
        const startWidths = {name: 200, status: 80, email: 130, role: 150, arrow: 40};

        // When the first column is dragged 60px wider
        const columnWidths = resolveDraggedColumnWidths({columns, startWidths, resizedColumnKeys: [], availableColumnsWidth: 600, columnKey: 'name', width: 260});

        // Then only the content-sized columns give way, 30px each, so the row still fits and fixed-size content keeps its size
        expect(columnWidths).toEqual({name: 260, email: 100, role: 120});
    });

    it('leaves a column the user dragged before alone and splits the resize between the auto-sized ones', () => {
        // Given four columns that can each shrink to 100px, where the user dragged the third to 180px
        const columns = ['a', 'b', 'c', 'd'].map((key) => contentColumn(key, 100));
        const startWidths = {a: 150, b: 150, c: 180, d: 120};

        // When the first column is dragged 60px wider
        const columnWidths = resolveDraggedColumnWidths({columns, startWidths, resizedColumnKeys: ['c'], availableColumnsWidth: 600, columnKey: 'a', width: 210});

        // Then the auto-sized columns give all of it, the last down to its minimum width, so the row fits without scrolling
        expect(columnWidths).toEqual({a: 210, b: 110, d: 100});
    });

    it('never moves the columns before the dragged one', () => {
        // Given four columns in a row that fits
        const columns = ['a', 'b', 'c', 'd'].map((key) => contentColumn(key));
        const startWidths = {a: 260, b: 180, c: 180, d: 180};

        // When the third column is dragged 20px wider
        const columnWidths = resolveDraggedColumnWidths({columns, startWidths, resizedColumnKeys: [], availableColumnsWidth: 800, columnKey: 'c', width: 200});

        // Then only the column after it gives way, so the dragged edge stays under the pointer
        expect(columnWidths).toEqual({c: 200, d: 160});
    });

    it("moves an absorber's share to the rest once it reaches its minimum width, and overflows what's left", () => {
        // Given a 600px row whose second column can give 10px and whose third can give 40px
        const columns = [contentColumn('name'), contentColumn('email', 190), contentColumn('role', 160)];
        const startWidths = {name: 200, email: 200, role: 200};

        // When the first column is dragged 100px wider
        const columnWidths = resolveDraggedColumnWidths({columns, startWidths, resizedColumnKeys: [], availableColumnsWidth: 600, columnKey: 'name', width: 300});

        // Then both stop at their minimum width, and the 50px nobody can give scrolls
        expect(columnWidths).toEqual({name: 300, email: 190, role: 160});
    });

    it("moves an absorber's share to the rest once it reaches its maximum width", () => {
        // Given a 560px row whose second column is capped 20px above its width, so it truncates long values
        const columns = [contentColumn('member'), contentColumn('card', undefined, 180), contentColumn('account')];
        const startWidths = {member: 200, card: 160, account: 200};

        // When the first column is dragged 60px narrower
        const columnWidths = resolveDraggedColumnWidths({columns, startWidths, resizedColumnKeys: [], availableColumnsWidth: 560, columnKey: 'member', width: 140});

        // Then the capped column stops at its maximum and the uncapped one takes the rest, so the row still fits
        expect(columnWidths).toEqual({member: 140, card: 180, account: 240});
    });

    it('never squeezes an absorber below the drag bound, even when its content is narrower', () => {
        // Given a column after the first whose content needs less than the drag bound
        const columns = [contentColumn('name'), contentColumn('flag', 10)];

        // When the first column is dragged far wider
        const columnWidths = resolveDraggedColumnWidths({
            columns,
            startWidths: {name: 200, flag: 100},
            resizedColumnKeys: [],
            availableColumnsWidth: 300,
            columnKey: 'name',
            width: 400,
        });

        // Then it stops at the drag bound, so its own edge stays within reach
        expect(columnWidths.flag).toBe(MIN_WIDTH);
    });

    it('takes back overflow before growing the columns after a narrowed one', () => {
        // Given a row 40px wider than the table
        const columns = [contentColumn('name'), contentColumn('email')];

        // When the first column is dragged 60px narrower
        const columnWidths = resolveDraggedColumnWidths({
            columns,
            startWidths: {name: 340, email: 300},
            resizedColumnKeys: [],
            availableColumnsWidth: 600,
            columnKey: 'name',
            width: 280,
        });

        // Then the first 40px only shrink the scroll width, and the column after it takes the remaining 20px
        expect(columnWidths).toEqual({name: 280, email: 320});
    });
});

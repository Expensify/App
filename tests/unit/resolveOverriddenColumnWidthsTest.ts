import type {OverridableColumn} from '@components/Table/columnResize/resolveOverriddenColumnWidths';
import resolveOverriddenColumnWidths from '@components/Table/columnResize/resolveOverriddenColumnWidths';

import CONST from '@src/CONST';

const {MIN_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/** A headed column sized from its content, which absorbs other columns' resizes down to its fit width. */
function contentColumn(key: string, fitWidth?: number): OverridableColumn {
    return {key, label: key, hasDeclaredWidth: false, fitWidth};
}

describe('resolveOverriddenColumnWidths', () => {
    it('takes a widened column out of the content-sized columns after it, equally', () => {
        // Given a 600px row with a fixed status column and a headless arrow among the columns after the first
        const columns = [contentColumn('name'), {...contentColumn('status'), hasDeclaredWidth: true}, contentColumn('email'), contentColumn('role'), {...contentColumn('arrow'), label: ''}];
        const baseColumnWidths = {name: 200, status: 80, email: 130, role: 150, arrow: 40};

        // When the first column is stored 60px wider
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides: {name: 260}, availableColumnsWidth: 600});

        // Then only the content-sized columns give way, 30px each, so the row still fits and fixed-size content keeps its size
        expect(columnWidths).toEqual({name: 260, status: 80, email: 100, role: 120, arrow: 40});
    });

    it("moves an absorber's share to the rest once it reaches its fit width, and overflows what's left", () => {
        // Given a 600px row whose second column can give 10px and whose third can give 40px
        const columns = [contentColumn('name'), contentColumn('email', 190), contentColumn('role', 160)];
        const baseColumnWidths = {name: 200, email: 200, role: 200};

        // When the first column is stored 100px wider
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides: {name: 300}, availableColumnsWidth: 600});

        // Then both stop at their fit width, so content is never truncated, and the 50px nobody can give scrolls
        expect(columnWidths).toEqual({name: 300, email: 190, role: 160});
    });

    it('never squeezes an absorber below the drag bound, even when its content is narrower', () => {
        // Given a column after the first whose content needs less than the drag bound
        const columns = [contentColumn('name'), contentColumn('flag', 10)];

        // When the first column is stored far wider
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths: {name: 200, flag: 100}, columnWidthOverrides: {name: 400}, availableColumnsWidth: 300});

        // Then it stops at the drag bound, so its own edge stays within reach
        expect(columnWidths.flag).toBe(MIN_WIDTH);
    });

    it('leaves a user-sized column alone when an earlier one is resized', () => {
        // Given a row where the user sized the second column
        const columns = [contentColumn('name'), contentColumn('email'), contentColumn('role')];
        const baseColumnWidths = {name: 200, email: 200, role: 200};

        // When the first column is also stored 60px wider
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides: {name: 260, email: 200}, availableColumnsWidth: 600});

        // Then the third column absorbs it all, since a width the user set is never changed by another column's resize
        expect(columnWidths).toEqual({name: 260, email: 200, role: 140});
    });

    it('hands a narrowed column out to the columns after it when the row fits', () => {
        // Given a row that exactly fits its 600px
        const columns = [contentColumn('name'), contentColumn('email'), contentColumn('role')];
        const baseColumnWidths = {name: 200, email: 200, role: 200};

        // When the first column is stored 60px narrower
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides: {name: 140}, availableColumnsWidth: 600});

        // Then the columns after it grow into the room, so no empty space opens at the row's end
        expect(columnWidths).toEqual({name: 140, email: 230, role: 230});
    });

    it('takes a narrowed column out of the overflow first when the row overflows', () => {
        // Given a 1000px row in an 800px table, e.g. a narrow window
        const columns = [contentColumn('name'), contentColumn('email'), contentColumn('role')];
        const baseColumnWidths = {name: 400, email: 300, role: 300};

        // When the first column is stored 250px narrower
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides: {name: 150}, availableColumnsWidth: 800});

        // Then the first 200px shrink the scroll width, and only the 50px that would leave empty room go to the columns after it
        expect(columnWidths).toEqual({name: 150, email: 325, role: 325});
    });

    it("doesn't move anything when a column is stored at the width it's already painted at", () => {
        // Given a stored first column whose resize the third column could only partly absorb
        const columns = [contentColumn('name'), contentColumn('email', 100), contentColumn('role', 250)];
        const baseColumnWidths = {name: 200, email: 300, role: 300};
        const paintedWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides: {name: 300}, availableColumnsWidth: 800});

        // When the second column is stored at its painted width, which is what grabbing its edge without moving resolves to
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides: {name: 300, email: paintedWidths.email ?? 0}, availableColumnsWidth: 800});

        // Then every column stays put, even though the second column stops absorbing the first and the third is at its fit width
        expect(columnWidths).toEqual(paintedWidths);
    });

    it('rounds a stored width to whole px', () => {
        // Given a stored width with a fraction, in a row with room to spare
        const columns = [contentColumn('name')];

        // When it is applied
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths: {name: 200}, columnWidthOverrides: {name: 240.6}, availableColumnsWidth: 600});

        // Then the column gets whole px, so its grid track never lands on a sub-pixel
        expect(columnWidths).toEqual({name: 241});
    });

    it('ignores a width stored for a column that declared its own', () => {
        // Given a stored width for a column that has since declared a fixed width
        const columns = [{...contentColumn('status'), hasDeclaredWidth: true}];

        // When it is applied
        const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths: {status: 80}, columnWidthOverrides: {status: 300}, availableColumnsWidth: 80});

        // Then the declared width wins, since that column can no longer be dragged and the stored width is stale
        expect(columnWidths).toEqual({status: 80});
    });
});

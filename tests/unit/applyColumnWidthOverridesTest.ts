import type {ColumnWidthOverrideColumn} from '@components/Table/columnResize/applyColumnWidthOverrides';
import applyColumnWidthOverrides from '@components/Table/columnResize/applyColumnWidthOverrides';
import {getColumnWidthValue} from '@components/Table/columnResize/columnWidthExpressions';

/** A headed column sized from its content, which is the only kind whose edge drags. */
function contentColumn(key: string): ColumnWidthOverrideColumn {
    return {key, label: key, hasDeclaredWidth: false};
}

/** A headed column that declared a width of its own, e.g. a status or a switch. */
function fixedColumn(key: string): ColumnWidthOverrideColumn {
    return {key, label: key, hasDeclaredWidth: true};
}

/** A column with no heading, e.g. a trailing arrow. */
function headlessColumn(key: string): ColumnWidthOverrideColumn {
    return {key, label: '', hasDeclaredWidth: false};
}

describe('applyColumnWidthOverrides', () => {
    it('gives each column a value reading its custom property with the overridden width as fallback', () => {
        // Given three columns where the user widened the first by 60px
        const columns = [contentColumn('name'), contentColumn('email'), contentColumn('role')];
        const baseColumnWidths = {name: 200, email: 200, role: 200};

        // When the stored width is applied
        const {columnWidths, columnWidthValues} = applyColumnWidthOverrides({columns, baseColumnWidths, columnWidthOverrides: {name: 260}});

        // Then only that column changes, and each value falls back to its width so no column jumps once a drag starts
        expect(columnWidths).toEqual({name: 260, email: 200, role: 200});
        expect(columnWidthValues).toEqual([getColumnWidthValue('name', 260), getColumnWidthValue('email', 200), getColumnWidthValue('role', 200)]);
    });

    it('rounds a stored width to whole px', () => {
        // Given a stored width with a fraction
        const columns = [contentColumn('name')];

        // When it is applied
        const {columnWidths} = applyColumnWidthOverrides({columns, baseColumnWidths: {name: 200}, columnWidthOverrides: {name: 240.6}});

        // Then the column gets whole px, so its grid track never lands on a sub-pixel
        expect(columnWidths).toEqual({name: 241});
    });

    it('ignores a width stored for a column that declared its own', () => {
        // Given a stored width for a column that has since declared a fixed width
        const columns = [fixedColumn('status')];

        // When it is applied
        const {columnWidths} = applyColumnWidthOverrides({columns, baseColumnWidths: {status: 80}, columnWidthOverrides: {status: 300}});

        // Then the declared width wins, since that column can no longer be dragged and the stored width is stale
        expect(columnWidths).toEqual({status: 80});
    });

    it('gives an edge only to headed columns sized from their content', () => {
        // Given a table mixing content-sized, fixed and headless columns
        const columns = [contentColumn('name'), fixedColumn('status'), contentColumn('email'), headlessColumn('arrow')];
        const baseColumnWidths = {name: 200, status: 80, email: 200, arrow: 40};

        // When the resizable columns are worked out
        const {resizableColumnKeys} = applyColumnWidthOverrides({columns, baseColumnWidths, columnWidthOverrides: undefined});

        // Then only the content-sized ones get an edge, since fixed and headless columns hold fixed-size content
        expect(resizableColumnKeys).toEqual(['name', 'email']);
    });
});

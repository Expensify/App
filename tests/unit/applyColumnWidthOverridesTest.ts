import applyColumnWidthOverrides from '@components/Table/columnResize/applyColumnWidthOverrides';
import type {OverridableColumn} from '@components/Table/columnResize/resolveOverriddenColumnWidths';

/** A headed column sized from its content, which is the only kind whose edge drags. */
function contentColumn(key: string): OverridableColumn {
    return {key, label: key, hasDeclaredWidth: false, fitWidth: undefined};
}

/** A headed column that declared a width of its own, e.g. a status or a switch. */
function fixedColumn(key: string): OverridableColumn {
    return {key, label: key, hasDeclaredWidth: true, fitWidth: undefined};
}

/** A column with no heading, e.g. a trailing arrow. */
function headlessColumn(key: string): OverridableColumn {
    return {key, label: '', hasDeclaredWidth: false, fitWidth: undefined};
}

describe('applyColumnWidthOverrides', () => {
    it('paints a stored width before any drag', () => {
        // Given a column the user widened by 60px
        const columns = [contentColumn('name')];

        // When the stored width is applied
        const {columnWidthValues} = applyColumnWidthOverrides({columns, baseColumnWidths: {name: 200}, columnWidthOverrides: {name: 260}, availableColumnsWidth: 200});

        // Then its CSS value falls back to the stored width, so it paints at 260px with no drag running
        expect(columnWidthValues.at(0)).toContain('260px');
    });

    it('gives an edge only to headed columns sized from their content', () => {
        // Given a table mixing content-sized, fixed and headless columns
        const columns = [contentColumn('name'), fixedColumn('status'), contentColumn('email'), headlessColumn('arrow')];
        const baseColumnWidths = {name: 200, status: 80, email: 200, arrow: 40};

        // When the resizable columns are worked out
        const {resizableColumnKeys} = applyColumnWidthOverrides({columns, baseColumnWidths, columnWidthOverrides: undefined, availableColumnsWidth: 520});

        // Then only the content-sized ones get an edge, since fixed and headless columns hold fixed-size content
        expect(resizableColumnKeys).toEqual(['name', 'email']);
    });
});

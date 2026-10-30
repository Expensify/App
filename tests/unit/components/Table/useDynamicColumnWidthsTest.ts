import {renderHook} from '@testing-library/react-native';

import type {TableColumn, TableData} from '@components/Table/types';
import useDynamicColumnWidths from '@components/Table/useDynamicColumnWidths';

import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

// Text renders 10px per character, so a column's width follows its longest value.
jest.mock('@libs/measureTextWidth', () => ({
    __esModule: true,
    default: (text: string) => text.length * 10,
    canMeasureText: () => true,
}));

// Row chrome the hook subtracts, with round numbers so the width left for the columns is easy to work out.
jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({gap3: {gap: 12}, ph3: {paddingHorizontal: 12}, ml1: {marginLeft: 4}, editableCellHeader: {}}),
}));

jest.mock('@hooks/useLayoutSpacing', () => ({
    __esModule: true,
    default: () => ({values: {pageGutter: 20}}),
}));

type Tax = TableData & {name: string; description: string};

const COLUMNS: Array<TableColumn<'name' | 'description', Tax>> = [
    {key: 'name', label: 'Name', sortable: true, dynamicSizing: {getContentToMeasure: (tax) => [{text: tax.name}]}},
    {key: 'description', label: 'Description', sortable: true, dynamicSizing: {getContentToMeasure: (tax) => [{text: tax.description}]}},
];

const SHORT_DATA: Tax[] = [{keyForList: 'vat', name: 'VAT', description: 'Value added tax on goods and services sold in the region'}];

const LONG_DATA: Tax[] = [...SHORT_DATA, {keyForList: 'regional', name: 'Regional sales and use tax for the metropolitan transit district', description: 'Short'}];

/** 1000.5px wide with a 20px selection column, 24px of gaps, 40px of margin and 24px of padding, leaving 892px for the columns. */
const TABLE_WIDTH = 1000.5;
const AVAILABLE_COLUMNS_WIDTH = 892;

type HookProps = {
    data: Tax[];
    storedTableColumnWidths?: StoredTableColumnWidths;
    isEnabled?: boolean;
    isColumnResizingEnabled?: boolean;
    columns?: Array<TableColumn<'name' | 'description', Tax>>;
};

function renderDynamicColumnWidths(initialProps: HookProps) {
    return renderHook(
        ({data, storedTableColumnWidths, isEnabled = true, isColumnResizingEnabled = true, columns = COLUMNS}: HookProps) =>
            useDynamicColumnWidths({columns, data, tableWidth: TABLE_WIDTH, isEnabled, hasSelectionColumn: true, isColumnResizingEnabled, storedTableColumnWidths}),
        {initialProps},
    );
}

describe('useDynamicColumnWidths', () => {
    it('keeps a dragged table where it was saved when its content grows', () => {
        // Given a table whose layout was saved after the user dragged the name column
        const {result, rerender} = renderDynamicColumnWidths({data: SHORT_DATA});
        const savedWidths = result.current.resolvedColumnWidths;
        const stored = result.current.getStoredTableColumnWidths?.(savedWidths, 'name', true);

        // When a tax with a far longer name is added
        rerender({data: LONG_DATA, storedTableColumnWidths: stored ?? undefined});

        // Then every column paints at its saved width, since content never moves the columns of a frozen table
        expect(result.current.resolvedColumnWidths).toEqual(savedWidths);
    });

    it('sizes the columns from their content until the first drag', () => {
        // Given a table nobody has dragged, whose names are short
        const {result, rerender} = renderDynamicColumnWidths({data: SHORT_DATA});
        const shortNameWidth = result.current.resolvedColumnWidths.name ?? 0;

        // When a tax with a far longer name is added
        rerender({data: LONG_DATA});

        // Then the name column widens to fit it while the row still fills the width left for the columns
        expect(result.current.resolvedColumnWidths.name).toBeGreaterThan(shortNameWidth);
        expect((result.current.resolvedColumnWidths.name ?? 0) + (result.current.resolvedColumnWidths.description ?? 0)).toBe(AVAILABLE_COLUMNS_WIDTH);
    });

    it('saves the dragged column as resized along with the width the layout was sized for', () => {
        // Given a table nobody has dragged
        const {result, rerender} = renderDynamicColumnWidths({data: SHORT_DATA});
        const columnWidths = {name: 300, description: 592};

        // When the name column's drag ends
        const firstSave = result.current.getStoredTableColumnWidths?.(columnWidths, 'name', true);

        // Then the save records the painted widths, the name column as resized and the 892px the columns had, so a
        // reload can tell how much room changed since
        expect(firstSave).toEqual({availableColumnsWidth: AVAILABLE_COLUMNS_WIDTH, columnWidths, resizedColumnKeys: ['name']});

        // When the name column is dragged again, and then the description column
        rerender({data: SHORT_DATA, storedTableColumnWidths: firstSave ?? undefined});
        const secondSave = result.current.getStoredTableColumnWidths?.(columnWidths, 'name', true);
        const thirdSave = result.current.getStoredTableColumnWidths?.(columnWidths, 'description', true);

        // Then a column already resized is listed once, and a newly dragged one joins it, since a save replaces the record
        expect(secondSave?.resizedColumnKeys).toEqual(['name']);
        expect(thirdSave?.resizedColumnKeys).toEqual(['name', 'description']);
    });

    it('saves nothing when dynamic sizing is off', () => {
        // Given a table that hasn't opted into dynamic sizing, which narrow layouts also turn off
        // When the hook runs
        const {result} = renderDynamicColumnWidths({data: SHORT_DATA, isEnabled: false});

        // Then there is no edge to drag and no layout to save, so the table keeps its static tracks
        expect(result.current.resizableColumnKeys).toEqual([]);
        expect(result.current.getStoredTableColumnWidths).toBeUndefined();
    });

    it('saves nothing when no column is sized from its content', () => {
        // Given a table whose every column declares a fixed width
        const fixedColumns: Array<TableColumn<'name' | 'description', Tax>> = COLUMNS.map((column) => ({...column, width: 200, dynamicSizing: undefined}));

        // When the hook runs
        const {result} = renderDynamicColumnWidths({data: SHORT_DATA, columns: fixedColumns});

        // Then there is no edge to drag and no layout to save, since fixed widths hold fixed-size content
        expect(result.current.resizableColumnKeys).toEqual([]);
        expect(result.current.getStoredTableColumnWidths).toBeUndefined();
    });

    it('saves nothing when resizing is off', () => {
        // Given a content-sized table that hasn't opted into resizing
        // When the hook runs
        const {result} = renderDynamicColumnWidths({data: SHORT_DATA, isColumnResizingEnabled: false});

        // Then there is no edge to drag and no layout to save, so content keeps sizing the columns
        expect(result.current.resizableColumnKeys).toEqual([]);
        expect(result.current.getStoredTableColumnWidths).toBeUndefined();
    });

    it('keeps the layout when a reset column leaves other resized columns, and drops it with the last one', () => {
        // Given a table whose name and description columns were both dragged
        const columnWidths = {name: 300, description: 592};
        const {result, rerender} = renderDynamicColumnWidths({
            data: SHORT_DATA,
            storedTableColumnWidths: {availableColumnsWidth: AVAILABLE_COLUMNS_WIDTH, columnWidths, resizedColumnKeys: ['name', 'description']},
        });

        // When the name column is reset
        const resetSave = result.current.getStoredTableColumnWidths?.(columnWidths, 'name', false);

        // Then the layout is saved with only the description column resized, so the name column absorbs room changes again
        expect(resetSave).toEqual({availableColumnsWidth: AVAILABLE_COLUMNS_WIDTH, columnWidths, resizedColumnKeys: ['description']});

        // When the description column, the last resized one, is reset too
        rerender({data: SHORT_DATA, storedTableColumnWidths: resetSave ?? undefined});

        // Then there is no layout left to save, so the table goes back to sizing every column from its content
        expect(result.current.getStoredTableColumnWidths?.(columnWidths, 'description', false)).toBeNull();
    });
});

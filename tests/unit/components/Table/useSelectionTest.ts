import {renderHook} from '@testing-library/react-native';

import useSelection from '@components/Table/middlewares/selection';
import type {UseSelectionProps} from '@components/Table/middlewares/selection';
import type {TableData} from '@components/Table/types';

type TestItem = TableData & {
    name: string;
};

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({shouldUseNarrowLayout: false, isSmallScreenWidth: false})),
}));

function createItems(): TestItem[] {
    return [
        {keyForList: '1', name: 'One'},
        {keyForList: '2', name: 'Two'},
        {keyForList: '3', name: 'Three'},
        {keyForList: '4', name: 'Four', disabled: true},
        {keyForList: '5', name: 'Five', isSelectionDisabled: true},
    ];
}

const SELECTABLE_KEYS = ['1', '2', '3'];

// The table keeps its filters in state, so their identity only changes when a filter does. A new object per render would look like a filter change.
const NO_FILTERS = {};

type RenderSelectionProps = {
    data: TestItem[];
    selectedKeys: string[];
    activeSearchString?: string;
    shouldPreserveSelectionOnSearchAndFilter?: boolean;
};

function renderSelection(initialProps: RenderSelectionProps, onRowSelectionChange = jest.fn()) {
    const hook = renderHook(
        ({data, selectedKeys, activeSearchString = '', shouldPreserveSelectionOnSearchAndFilter = true}: RenderSelectionProps) => {
            const props: UseSelectionProps<TestItem> = {
                data,
                originalSelectableCount: data.length,
                selectedKeys,
                currentFilters: NO_FILTERS,
                activeSearchString,
                onRowSelectionChange,
                isSelectionModeEnabled: false,
                setSelectionModeEnabled: jest.fn(),
                // Preserving by default keeps the table from clearing the selection when it mounts, which would hide what
                // most of these tests look at.
                shouldPreserveSelectionOnSearchAndFilter,
            };
            return useSelection<TestItem>(props);
        },
        {initialProps},
    );

    return {...hook, onRowSelectionChange};
}

function getSelectedKeys(rows: Array<{keyForList: string; selected?: boolean}>) {
    return rows.filter((row) => row.selected).map((row) => row.keyForList);
}

describe('useSelection middleware', () => {
    describe('selected flag on the rows', () => {
        it('marks the rows whose keys are selected', () => {
            // Given a table with two of its rows selected
            const {result} = renderSelection({data: createItems(), selectedKeys: ['1', '3']});

            // When the data goes through the selection middleware
            const rows = result.current.middleware(createItems());

            // Then only those two rows are flagged as selected
            expect(getSelectedKeys(rows)).toEqual(['1', '3']);
        });

        it('replaces only the rows whose selection changed when the data stays the same', () => {
            // Given a table whose rows were already built for a selection of one row. Cloning every row on each change made
            // selecting slow for tables with a very large number of rows.
            const data = createItems();
            const {result, rerender} = renderSelection({data, selectedKeys: ['1']});
            const firstRows = result.current.middleware(data);

            // When a second row is selected and the data array is the same one
            rerender({data, selectedKeys: ['1', '2']});
            const nextRows = result.current.middleware(data);

            // Then the newly selected row is a new object, while every other row keeps the object it already had
            expect(getSelectedKeys(nextRows)).toEqual(['1', '2']);
            expect(nextRows[1]).not.toBe(firstRows[1]);
            expect(nextRows[0]).toBe(firstRows[0]);
            expect(nextRows[2]).toBe(firstRows[2]);
            expect(nextRows[3]).toBe(firstRows[3]);
            expect(nextRows[4]).toBe(firstRows[4]);
        });

        it('clears the flag of only the row that was deselected after everything was selected', () => {
            // Given every selectable row selected
            const data = createItems();
            const {result, rerender} = renderSelection({data, selectedKeys: SELECTABLE_KEYS});
            const allSelectedRows = result.current.middleware(data);

            // When one of them is deselected
            rerender({data, selectedKeys: ['1', '3']});
            const rows = result.current.middleware(data);

            // Then that row is no longer flagged and the rows that kept their state are untouched
            expect(getSelectedKeys(rows)).toEqual(['1', '3']);
            expect(rows[1]).not.toBe(allSelectedRows[1]);
            expect(rows[0]).toBe(allSelectedRows[0]);
            expect(rows[2]).toBe(allSelectedRows[2]);
        });

        it('clears every flag when the selection is emptied', () => {
            // Given a table with a selection
            const data = createItems();
            const {result, rerender} = renderSelection({data, selectedKeys: SELECTABLE_KEYS});
            result.current.middleware(data);

            // When the selection is cleared
            rerender({data, selectedKeys: []});

            // Then no row is flagged as selected
            expect(getSelectedKeys(result.current.middleware(data))).toEqual([]);
        });

        it('ignores selected keys that are not in the data', () => {
            // Given a selection that holds a key from rows that are no longer shown, as happens after the table is filtered
            const data = createItems();
            const {result, rerender} = renderSelection({data, selectedKeys: []});
            result.current.middleware(data);

            // When that key is added to the selection of the same data
            rerender({data, selectedKeys: ['missing', '2']});

            // Then only the row that exists is flagged and nothing breaks for the other key
            expect(getSelectedKeys(result.current.middleware(data))).toEqual(['2']);
        });

        it('builds the rows again when the data is a new array', () => {
            // Given rows built for one data array
            const {result, rerender} = renderSelection({data: createItems(), selectedKeys: ['1']});
            const firstRows = result.current.middleware(createItems());

            // When the table gets a new array, which is how changed data reaches it
            const nextData = createItems();
            rerender({data: nextData, selectedKeys: ['1']});
            const nextRows = result.current.middleware(nextData);

            // Then the earlier row objects aren't reused, since they were built from the previous items
            expect(nextRows[0]).not.toBe(firstRows[0]);
            expect(getSelectedKeys(nextRows)).toEqual(['1']);
        });

        it('flags every row that shares a key after the selection changes', () => {
            // Given two rows that share a key, which a selection change can't tell apart by key
            const data: TestItem[] = [
                {keyForList: 'same', name: 'First'},
                {keyForList: 'same', name: 'Second'},
                {keyForList: 'other', name: 'Other'},
            ];
            const {result, rerender} = renderSelection({data, selectedKeys: []});
            result.current.middleware(data);

            // When that key is selected for the same data
            rerender({data, selectedKeys: ['same']});

            // Then both rows are flagged, as they would be when every row is built from scratch
            expect(getSelectedKeys(result.current.middleware(data))).toEqual(['same', 'same']);
        });
    });

    describe('handleSelectAll', () => {
        it('selects every row that can be selected when nothing is selected', () => {
            // Given a table with no selection and rows that can't be selected
            const {result, onRowSelectionChange} = renderSelection({data: createItems(), selectedKeys: []});

            // When select all is pressed
            result.current.methods.handleSelectAll();

            // Then the disabled rows and the rows with selection turned off are left out
            expect(onRowSelectionChange).toHaveBeenCalledWith(SELECTABLE_KEYS);
        });

        it('clears the selection when only some rows are selected', () => {
            // Given a partial selection
            const {result, onRowSelectionChange} = renderSelection({data: createItems(), selectedKeys: ['1']});

            // When select all is pressed
            result.current.methods.handleSelectAll();

            // Then the selection is emptied rather than extended
            expect(onRowSelectionChange).toHaveBeenCalledWith([]);
        });

        it('clears the selection when every selectable row is selected', () => {
            // Given everything selected
            const {result, onRowSelectionChange} = renderSelection({data: createItems(), selectedKeys: SELECTABLE_KEYS});

            // When select all is pressed
            result.current.methods.handleSelectAll();

            // Then the selection is emptied
            expect(onRowSelectionChange).toHaveBeenCalledWith([]);
        });
    });

    describe('handleSingleRowSelection', () => {
        it('adds a row that is not selected yet', () => {
            // Given a selection of one row
            const {result, onRowSelectionChange} = renderSelection({data: createItems(), selectedKeys: ['1']});

            // When another row is toggled
            result.current.methods.handleSingleRowSelection('2');

            // Then it is added after the existing ones
            expect(onRowSelectionChange).toHaveBeenCalledWith(['1', '2']);
        });

        it('removes a row that is already selected and keeps the others in order', () => {
            // Given three selected rows
            const {result, onRowSelectionChange} = renderSelection({data: createItems(), selectedKeys: SELECTABLE_KEYS});

            // When the middle one is toggled
            result.current.methods.handleSingleRowSelection('2');

            // Then only that row is removed
            expect(onRowSelectionChange).toHaveBeenCalledWith(['1', '3']);
        });

        it('ignores a row that is disabled', () => {
            // Given a table that has a disabled row
            const {result, onRowSelectionChange} = renderSelection({data: createItems(), selectedKeys: []});

            // When the disabled row is toggled
            result.current.methods.handleSingleRowSelection('4');

            // Then the selection doesn't change
            expect(onRowSelectionChange).not.toHaveBeenCalled();
        });
    });

    describe('clearing the selection when the search changes', () => {
        it('does not report a selection change when no row is selected', () => {
            // Given a table with nothing selected that clears its selection on search. The owner keeps the selected keys in
            // state, so a new empty array on every key would re-render the owner and redraw every row for nothing.
            const data = createItems();
            const {rerender, onRowSelectionChange} = renderSelection({data, selectedKeys: [], shouldPreserveSelectionOnSearchAndFilter: false});

            // When the user types in the search box
            rerender({data, selectedKeys: [], activeSearchString: 'o', shouldPreserveSelectionOnSearchAndFilter: false});
            rerender({data, selectedKeys: [], activeSearchString: 'on', shouldPreserveSelectionOnSearchAndFilter: false});

            // Then the owner is never told about a selection change, because the selection was already empty
            expect(onRowSelectionChange).not.toHaveBeenCalled();
        });

        it('keeps a row that was just selected while the search stays the same', () => {
            // Given a table with nothing selected that clears its selection on search
            const data = createItems();
            const {rerender, onRowSelectionChange} = renderSelection({data, selectedKeys: [], shouldPreserveSelectionOnSearchAndFilter: false});
            onRowSelectionChange.mockClear();

            // When the owner selects a row and the search text does not change
            rerender({data, selectedKeys: ['1'], shouldPreserveSelectionOnSearchAndFilter: false});

            // Then the selection is left alone, because only a search or filter change should clear it. Checking for an
            // empty selection must not make a selection change look like one
            expect(onRowSelectionChange).not.toHaveBeenCalled();
        });

        it('still clears the selection when rows are selected', () => {
            // Given a table with two rows selected that clears its selection on search, which is the case the empty check
            // must not swallow
            const data = createItems();
            const selectedKeys = ['1', '2'];
            const {rerender, onRowSelectionChange} = renderSelection({data, selectedKeys, shouldPreserveSelectionOnSearchAndFilter: false});
            onRowSelectionChange.mockClear();

            // When the user types in the search box
            rerender({data, selectedKeys, activeSearchString: 'o', shouldPreserveSelectionOnSearchAndFilter: false});

            // Then the selection is cleared, because the selected rows may no longer be in the results
            expect(onRowSelectionChange).toHaveBeenCalledWith([]);
        });
    });
});

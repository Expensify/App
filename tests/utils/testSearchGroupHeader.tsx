import type {render} from '@testing-library/react-native';
import {screen, userEvent} from '@testing-library/react-native';

import type CardListItemHeader from '@components/Search/SearchList/ListItem/CardListItemHeader';
import type {TransactionGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';

import CONST from '@src/CONST';

import waitForBatchedUpdatesWithAct from './waitForBatchedUpdatesWithAct';

type SearchGroupHeaderProps = Pick<Parameters<typeof CardListItemHeader>[0], 'canSelectMultiple' | 'isSelectAllChecked' | 'isIndeterminate' | 'isDisabled' | 'columns'>;

type SearchGroupHeaderCases<T extends TransactionGroupListItemType> = {
    createItem: () => T;
    createColumnItem?: () => T;
    renderHeader: (item: T, props: Partial<SearchGroupHeaderProps>, onCheckboxPress?: (item: T) => void) => ReturnType<typeof render>;
    identifyingColumn: SearchColumnType;
    identifyingText: string;
    cellText: RegExp;
};

/** Exercises real Search headers while keeping each concrete row and its callback type together. */
function testSearchGroupHeader<T extends TransactionGroupListItemType>({
    createItem,
    createColumnItem = createItem,
    renderHeader,
    identifyingColumn,
    identifyingText,
    cellText,
}: SearchGroupHeaderCases<T>) {
    it.each([
        {isSelectAllChecked: false, isIndeterminate: false, checked: false},
        {isSelectAllChecked: true, isIndeterminate: false, checked: true},
        {isSelectAllChecked: false, isIndeterminate: true, checked: 'mixed'},
    ] as const)('emits the original row once with checkbox state $checked', async ({isSelectAllChecked, isIndeterminate, checked}) => {
        // Given selection state belongs to the parent, so the header must preserve it.
        const item = createItem();
        const selectItem = jest.fn<void, [T]>();
        renderHeader(item, {isSelectAllChecked, isIndeterminate}, selectItem);
        await waitForBatchedUpdatesWithAct();
        // When the real checkbox is pressed, its event reaches the header callback.
        const checkbox = screen.getByRole('checkbox');
        if (checked === 'mixed') {
            expect(checkbox).toBePartiallyChecked();
        } else if (checked) {
            expect(checkbox).toBeChecked();
        } else {
            expect(checkbox).not.toBeChecked();
            expect(checkbox).not.toBePartiallyChecked();
        }
        await userEvent.setup().press(checkbox);
        // Then consumers receive the original row, including all its group data.
        expect(selectItem).toHaveBeenCalledTimes(1);
        const selectedItem = selectItem.mock.calls.at(0)?.[0];
        expect(selectedItem).toBeDefined();
        expect(selectedItem).toBe(item);
    });

    it.each([false, undefined])('omits selection when canSelectMultiple is %s', async (canSelectMultiple) => {
        // Given some search modes do not allow selection.
        const item = createItem();
        // When the header renders in such a mode.
        renderHeader(item, {canSelectMultiple});
        await waitForBatchedUpdatesWithAct();
        // Then no checkbox offers an unavailable action.
        expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it.each(['header', 'row'] as const)('blocks selection disabled by the %s', async (disabledBy) => {
        // Given either the group or its parent can disable selection.
        const item = {...createItem(), isDisabledCheckbox: disabledBy === 'row'};
        const selectItem = jest.fn<void, [T]>();
        renderHeader(item, {isDisabled: disabledBy === 'header'}, selectItem);
        await waitForBatchedUpdatesWithAct();
        // When a host press is attempted, userEvent respects the disabled control instead of calling composite handlers.
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeDisabled();
        await userEvent.setup().press(checkbox);
        // Then a disabled group cannot be selected.
        expect(selectItem).not.toHaveBeenCalled();
    });

    it('allows a checkbox without a callback', async () => {
        // Given the selection callback is optional.
        const item = createItem();
        // When selection is pressed before a consumer attaches a callback.
        renderHeader(item, {});
        await waitForBatchedUpdatesWithAct();
        await userEvent.setup().press(screen.getByRole('checkbox'));
        // Then the header remains mounted without throwing.
        expect(screen.getByRole('checkbox')).toBeOnTheScreen();
    });

    it('keeps supported column order and duplicates while omitting unsupported columns', async () => {
        // Given the column fixture has seven expenses totaling $123.45, and MERCHANT has no group-header cell.
        const item = createColumnItem();
        // When callers place the total before the identifying column and repeat the total.
        renderHeader(item, {
            columns: [
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
                identifyingColumn,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
            ],
        });
        await waitForBatchedUpdatesWithAct();
        // Then only supported cells render, in caller order, including the repeated cell.
        const cells = screen.getAllByText(cellText);
        expect(cells).toHaveLength(4);
        expect(cells.at(0)).toBe(screen.getAllByText('$123.45').at(0));
        expect(cells.at(1)).toBe(screen.getByText(identifyingText));
        expect(cells.at(2)).toBe(screen.getByText('7'));
        expect(cells.at(3)).toBe(screen.getAllByText('$123.45').at(1));
        expect(screen.queryByText('Merchant')).toBeNull();
    });

    it.each([undefined, []])('renders no wide cells for columns %s', async (columns) => {
        // Given wide headers take the identifying, seven-expense, and $123.45 cells solely from the column list.
        const item = createColumnItem();
        // When no columns are requested.
        renderHeader(item, {columns});
        await waitForBatchedUpdatesWithAct();
        // Then neither identifying nor total cells are inserted as fallbacks.
        expect(screen.queryByText(identifyingText)).toBeNull();
        expect(screen.queryByText('$123.45')).toBeNull();
        expect(screen.queryByText('7')).toBeNull();
    });
}

export default testSearchGroupHeader;

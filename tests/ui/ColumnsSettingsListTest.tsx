import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ColumnsSettingsList from '@components/ColumnsSettingsList';
import type {ColumnItem, ColumnsSettingsListItemProps} from '@components/ColumnsSettingsListItem';
import type NativeColumnsSettingsListItem from '@components/ColumnsSettingsListItem.native';
import type NativeDraggableList from '@components/DraggableList/index.native';
import type DraggableListProps from '@components/DraggableList/types';
import type {SearchCustomColumnIds} from '@components/Search/types';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';
import type {DraggableFlatListProps} from 'react-native-draggable-flatlist';

import React from 'react';
import {View as MockView} from 'react-native';

// Exercise the native drag boundary, where starting a drag is the row's responsibility.
jest.mock('@components/DraggableList', () => jest.requireActual<{default: typeof NativeDraggableList}>('@components/DraggableList/index.native'));
jest.mock('@components/ColumnsSettingsListItem', () => {
    const {default: NativeItem} = jest.requireActual<{
        default: typeof NativeColumnsSettingsListItem;
    }>('@components/ColumnsSettingsListItem.native');
    const {default: WebItem} = jest.requireActual<{
        default: typeof NativeColumnsSettingsListItem;
    }>('@components/ColumnsSettingsListItem.tsx');
    const platform = jest.requireMock<typeof getPlatform>('@libs/getPlatform');
    const {default: constants} = jest.requireActual<{default: typeof CONST}>('@src/CONST');
    return (props: ColumnsSettingsListItemProps) => (platform() === constants.PLATFORM.WEB ? <WebItem {...props} /> : <NativeItem {...props} />);
});
jest.mock('@components/ScrollView', () => ({children}: PropsWithChildren) => <MockView testID="column-outer-scroll">{children}</MockView>);
jest.mock('@libs/getPlatform', () => jest.fn(() => 'ios'));
jest.mock('@hooks/useListKeyboardNav', () => () => ({
    focusedIndex: -1,
    setFocusedIndex: jest.fn(),
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    localeCompare: (a: string, b: string) => a.localeCompare(b),
}));
jest.mock('@components/ScreenWrapper', () => ({children}: PropsWithChildren) => <MockView>{children}</MockView>);
jest.mock('@components/HeaderWithBackButton', () => ({children}: PropsWithChildren) => <MockView>{children}</MockView>);

const mockDrag = jest.fn<void, [SearchCustomColumnIds]>();
type NativeListProps = DraggableListProps<ColumnItem> & Pick<DraggableFlatListProps<ColumnItem>, 'dragItemOverflow'>;
const mockNativeList = jest.fn(({data, renderItem, ListFooterComponent}: NativeListProps) => (
    <MockView>
        {data.map((item, index) => (
            <React.Fragment key={item.value}>
                {renderItem({
                    item,
                    getIndex: () => index,
                    drag: () => mockDrag(item.value),
                    isActive: false,
                })}
            </React.Fragment>
        ))}
        {ListFooterComponent}
    </MockView>
));

jest.mock('react-native-draggable-flatlist', () => ({
    __esModule: true,
    default: (props: NativeListProps) => mockNativeList(props),
}));

const {TOTAL_AMOUNT, MERCHANT, DATE, CATEGORY} = CONST.SEARCH.TABLE_COLUMNS;

function renderFields() {
    const onSave = jest.fn();
    render(
        <ColumnsSettingsList
            titleKey="search.customizeFields"
            allColumns={[TOTAL_AMOUNT, MERCHANT, DATE, CATEGORY]}
            defaultSelectedColumns={[TOTAL_AMOUNT, MERCHANT, DATE]}
            currentColumns={[TOTAL_AMOUNT, MERCHANT, DATE]}
            requiredColumns={new Set([TOTAL_AMOUNT])}
            onSave={onSave}
        />,
    );
    return onSave;
}

describe('customizing expense fields on native', () => {
    beforeEach(() => {
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        mockDrag.mockClear();
        mockNativeList.mockClear();
    });

    it('starts a drag on long press for selected fields, including the required amount, without toggling them', () => {
        // Given the expense field picker with an amount that cannot be deselected and an unchecked category.
        const onSave = renderFields();

        // When the user holds each selected row and then an unchecked row.
        for (const column of [TOTAL_AMOUNT, MERCHANT, DATE, CATEGORY]) {
            fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${column}`), 'longPress');
        }
        fireEvent.press(screen.getByText('common.save'));

        // Then native dragging starts only for the selected fields, and a long press does not change their selection.
        expect(mockDrag.mock.calls.map(([column]) => column)).toEqual([TOTAL_AMOUNT, MERCHANT, DATE]);
        expect(onSave).toHaveBeenCalledWith([TOTAL_AMOUNT, MERCHANT, DATE]);
        expect(screen.queryByTestId('column-outer-scroll')).not.toBeOnTheScreen();
    });

    it('starts dragging immediately from the handle without toggling the field or nesting scroll containers', () => {
        // Given the native expense picker, where an outer scroll gesture must not capture the drag.
        const onSave = renderFields();
        const stopPropagation = jest.fn();

        // When the handle is touched and released without waiting for a row long press.
        for (const column of [TOTAL_AMOUNT, MERCHANT, CATEGORY]) {
            const handle = screen.getByTestId(`column-drag-handle-${column}`);
            fireEvent(handle, 'pressIn', {stopPropagation});
            fireEvent.press(handle, {stopPropagation});
        }
        fireEvent.press(screen.getByText('common.save'));

        // Then only enabled handles activate the drag, selection is unchanged, and the list owns its scroll.
        expect(mockDrag.mock.calls.map(([column]) => column)).toEqual([TOTAL_AMOUNT, MERCHANT]);
        expect(onSave).toHaveBeenCalledWith([TOTAL_AMOUNT, MERCHANT, DATE]);
        expect(screen.queryByTestId('column-outer-scroll')).not.toBeOnTheScreen();
    });

    it('leaves pointer and keyboard dragging to the web sortable wrapper', () => {
        // Given the desktop field picker, whose sortable wrapper already handles pointer and keyboard gestures.
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);

        // When the fields render with their usual non-pressable drag icons.
        renderFields();

        // Then no native touch handle intercepts the web drag gesture.
        expect(screen.queryByTestId(`column-drag-handle-${MERCHANT}`)).not.toBeOnTheScreen();
        expect(mockDrag).not.toHaveBeenCalled();
    });

    it('allows hovering over unchecked fields and returns the dropped field to the end of the selected group', () => {
        // Given selected fields followed by an unchecked category, as in the reported drag regression.
        const onSave = renderFields();
        const list = mockNativeList.mock.calls.at(-1)?.at(0);
        if (!list) {
            throw new Error('Expected native expense fields');
        }
        expect(list.data.map((item) => item.value)).toEqual([TOTAL_AMOUNT, MERCHANT, DATE]);
        expect(list.dragItemOverflow).toBe(true);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${CATEGORY}`)).toBeOnTheScreen();

        // When a selected field is dropped at the last available native position.
        const reordered = [list.data.at(1), list.data.at(2), list.data.at(0)].filter((item): item is ColumnItem => !!item);
        act(() => list.onDragEnd?.({data: reordered}));
        fireEvent.press(screen.getByText('common.save'));

        // Then the native drop order already matches the selected section, with no selected row stranded below it.
        expect(
            mockNativeList.mock.calls
                .at(-1)
                ?.at(0)
                ?.data.map((item) => item.value),
        ).toEqual([MERCHANT, DATE, TOTAL_AMOUNT]);
        expect(onSave).toHaveBeenCalledWith([MERCHANT, DATE, TOTAL_AMOUNT]);
        const rows = screen.getAllByTestId(new RegExp(`^${CONST.BASE_LIST_ITEM_TEST_ID}`));
        for (const [index, column] of [MERCHANT, DATE, TOTAL_AMOUNT, CATEGORY].entries()) {
            expect(rows.at(index)).toBe(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${column}`));
        }
    });

    it('moves a newly selected field into the draggable area and returns a deselected field to the fixed area', () => {
        // Given an unselected field that cannot be reordered until it is selected.
        renderFields();

        // When the user changes which fields should be available for reordering.
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${CATEGORY}`));
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${MERCHANT}`));

        // Then selected fields remain together and the deselected field follows them.
        expect(
            mockNativeList.mock.calls
                .at(-1)
                ?.at(0)
                ?.data.map((item) => item.value),
        ).toEqual([TOTAL_AMOUNT, DATE, CATEGORY]);
        const rows = screen.getAllByTestId(new RegExp(`^${CONST.BASE_LIST_ITEM_TEST_ID}`));
        for (const [index, column] of [TOTAL_AMOUNT, DATE, CATEGORY, MERCHANT].entries()) {
            expect(rows.at(index)).toHaveProp('testID', `${CONST.BASE_LIST_ITEM_TEST_ID}${column}`);
        }
    });

    it('saves the reordered fields and keeps the required amount selected', () => {
        // Given the native picker after a user starts reordering its selected fields.
        const onSave = renderFields();
        const list = mockNativeList.mock.calls.at(-1)?.at(0);
        if (!list) {
            throw new Error('Expected native expense fields');
        }
        const reordered = [list.data.at(2), list.data.at(0), list.data.at(1), list.data.at(3)].filter((item): item is ColumnItem => !!item);

        // When the drag finishes with date above amount and the required amount row is tapped before saving.
        act(() => list.onDragEnd?.({data: reordered}));
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${TOTAL_AMOUNT}`));
        fireEvent.press(screen.getByText('common.save'));

        // Then the chosen order reaches the shared preferences and the required field cannot be turned off.
        expect(onSave).toHaveBeenCalledWith([DATE, TOTAL_AMOUNT, MERCHANT]);
    });

    it('reorders selected fields through screen reader actions', () => {
        // Given a screen reader user who cannot use touch dragging to choose the field order.
        const onSave = renderFields();

        // When they move optional and required fields through the available accessibility actions.
        fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${MERCHANT}`), 'accessibilityAction', {nativeEvent: {actionName: 'moveDown'}});
        fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${TOTAL_AMOUNT}`), 'accessibilityAction', {nativeEvent: {actionName: 'moveDown'}});
        fireEvent.press(screen.getByText('common.save'));

        // Then the new order is saved without changing which fields are selected.
        expect(onSave).toHaveBeenCalledWith([DATE, TOTAL_AMOUNT, MERCHANT]);
        const rows = screen.getAllByTestId(new RegExp(`^${CONST.BASE_LIST_ITEM_TEST_ID}`));
        for (const [index, column] of [DATE, TOTAL_AMOUNT, MERCHANT, CATEGORY].entries()) {
            expect(rows.at(index)).toHaveProp('testID', `${CONST.BASE_LIST_ITEM_TEST_ID}${column}`);
        }
        expect(mockDrag).not.toHaveBeenCalled();
    });

    it('limits screen reader moves to valid positions among selected fields', () => {
        // Given selected fields followed by an unselected field that must stay outside the reorder area.
        const onSave = renderFields();
        const firstRow = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${TOTAL_AMOUNT}`);
        const middleRow = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${MERCHANT}`);
        const lastRow = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${DATE}`);
        const unselectedRow = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${CATEGORY}`);

        // When the reader encounters the available moves at each boundary.
        expect(firstRow.props.accessibilityActions).toEqual([{name: 'moveDown', label: 'common.moveDown'}]);
        expect(middleRow.props.accessibilityActions).toEqual([
            {name: 'moveUp', label: 'common.moveUp'},
            {name: 'moveDown', label: 'common.moveDown'},
        ]);
        expect(lastRow.props.accessibilityActions).toEqual([{name: 'moveUp', label: 'common.moveUp'}]);
        expect(unselectedRow.props.accessibilityActions).toEqual([]);
        fireEvent(firstRow, 'accessibilityAction', {
            nativeEvent: {actionName: 'moveUp'},
        });
        fireEvent(lastRow, 'accessibilityAction', {
            nativeEvent: {actionName: 'moveDown'},
        });
        fireEvent(unselectedRow, 'accessibilityAction', {
            nativeEvent: {actionName: 'moveUp'},
        });
        fireEvent.press(screen.getByText('common.save'));

        // Then unavailable moves cannot place a selected field outside its section or select another field.
        expect(onSave).toHaveBeenCalledWith([TOTAL_AMOUNT, MERCHANT, DATE]);
    });
});

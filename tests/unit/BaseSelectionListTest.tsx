import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import type Navigation from '@libs/Navigation/Navigation';
import type * as NavigationFocusReturnModule from '@libs/NavigationFocusReturn';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import * as NativeNavigation from '@react-navigation/native';
import React, {Activity, useState} from 'react';

// Captures scrollToIndex calls so tests can assert on scroll behaviour
const mockScrollToIndex = jest.fn();
const mockScrollToOffset = jest.fn();
const mockGetAbsoluteLastScrollOffset = jest.fn<number, []>(() => 0);

// Mock FlashList
jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');

    const FlashList = ReactLocal.forwardRef<
        {scrollToIndex: (params: {index: number}) => void; scrollToOffset: (params: {offset: number; animated: boolean}) => void; getAbsoluteLastScrollOffset: () => number},
        Omit<React.ComponentProps<typeof RN.ScrollView>, 'children'> & {
            data?: unknown[];
            renderItem?: (info: {item: unknown; index: number; target: string}) => React.ReactNode;
            keyExtractor?: (item: unknown, index: number) => string;
            ListHeaderComponent?: React.ReactNode;
            ListFooterComponent?: React.ReactNode;
            getItemType?: unknown;
            extraData?: unknown;
            initialScrollIndex?: number;
            onEndReached?: unknown;
            onEndReachedThreshold?: unknown;
            ListFooterComponentStyle?: unknown;
        }
    >(
        (
            {
                data,
                renderItem,
                keyExtractor,
                ListHeaderComponent,
                ListFooterComponent,
                getItemType: _getItemType,
                extraData: _extraData,
                initialScrollIndex: _initialScrollIndex,
                onEndReached: _onEndReached,
                onEndReachedThreshold: _onEndReachedThreshold,
                ListFooterComponentStyle: _ListFooterComponentStyle,
                ...scrollViewProps
            },
            ref,
        ) => {
            ReactLocal.useImperativeHandle(ref, () => ({
                scrollToIndex: mockScrollToIndex,
                scrollToOffset: mockScrollToOffset,
                getAbsoluteLastScrollOffset: mockGetAbsoluteLastScrollOffset,
            }));

            return ReactLocal.createElement(
                RN.ScrollView,
                scrollViewProps,
                ListHeaderComponent ?? null,
                ...(data ?? []).map((item, index) =>
                    ReactLocal.createElement(ReactLocal.Fragment, {key: keyExtractor?.(item, index) ?? String(index)}, renderItem?.({item, index, target: 'Cell'})),
                ),
                ListFooterComponent ?? null,
            );
        },
    );

    return {FlashList};
});

type BaseSelectionListTestProps<TItem extends ListItem> = {
    data: TItem[];
    canSelectMultiple?: boolean;
    searchText?: string;
    setSearchText?: (searchText: string) => void;
    isDisabled?: boolean;
};

const mockItems = Array.from({length: 10}, (_, index) => ({
    text: `Item ${index}`,
    keyForList: `${index}`,
    isSelected: index === 1,
}));

const largeMockItems = Array.from({length: 100}, (_, index) => ({
    text: `Item ${index}`,
    keyForList: `${index}`,
    isSelected: index === 1,
}));

const largeMockItemsWithSelectedFromSecondPage = Array.from({length: 100}, (_, index) => ({
    text: `Item ${index}`,
    keyForList: `${index}`,
    isSelected: index === 70,
}));

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());

const mockIsFocusRestoreInProgress = jest.fn<boolean, []>(() => false);
jest.mock('@libs/NavigationFocusReturn', () => ({
    ...jest.requireActual<typeof NavigationFocusReturnModule>('@libs/NavigationFocusReturn'),
    isFocusRestoreInProgress: () => mockIsFocusRestoreInProgress(),
}));

describe('BaseSelectionList', () => {
    const onSelectRowMock = jest.fn();

    beforeEach(() => {
        onSelectRowMock.mockClear();
        mockScrollToIndex.mockClear();
        mockScrollToOffset.mockClear();
        mockGetAbsoluteLastScrollOffset.mockReturnValue(0);
        mockIsFocusRestoreInProgress.mockReturnValue(false);
    });

    function SelectionListRenderer<TItem extends ListItem>(props: BaseSelectionListTestProps<TItem>) {
        const {data, canSelectMultiple, setSearchText, searchText, isDisabled} = props;
        const focusedKey = data.find((item) => item.isSelected)?.keyForList;
        return (
            <OnyxListItemProvider>
                <BaseSelectionList
                    data={data}
                    textInputOptions={{
                        label: 'common.search',
                        onChangeText: setSearchText,
                        value: searchText,
                    }}
                    ListItem={SingleSelectListItem}
                    onSelectRow={onSelectRowMock}
                    shouldSingleExecuteRowSelect
                    shouldShowTextInput={!!setSearchText}
                    canSelectMultiple={canSelectMultiple}
                    initiallyFocusedItemKey={focusedKey}
                    isDisabled={isDisabled}
                />
            </OnyxListItemProvider>
        );
    }

    function ActivitySelectionListRenderer({mode}: {mode: 'visible' | 'hidden'}) {
        return (
            <Activity mode={mode}>
                <SelectionListRenderer data={mockItems} />
            </Activity>
        );
    }

    it('scrolls back to the offset it reports when it is revealed from a hidden Activity', async () => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
        // The offset is read as the list is revealed and reported as zero afterwards, so a read taken a frame later
        // would restore the top the list was reset to rather than where it was.
        mockGetAbsoluteLastScrollOffset.mockReturnValueOnce(1200).mockReturnValue(0);

        const {rerender} = render(<ActivitySelectionListRenderer mode="visible" />);

        // A list that was just mounted starts where it starts, so nothing scrolls it. The frame has to pass first,
        // otherwise this holds whether or not the mount is skipped. Nothing here sets state, so no act is needed.
        jest.advanceTimersByTime(32);
        expect(mockScrollToOffset).not.toHaveBeenCalled();

        // Hiding the list unmounts its effects and drops its layout, and revealing it runs them again.
        rerender(<ActivitySelectionListRenderer mode="hidden" />);
        rerender(<ActivitySelectionListRenderer mode="visible" />);

        await waitFor(() => {
            expect(mockScrollToOffset).toHaveBeenCalledWith({offset: 1200, animated: false});
        });
    });

    it('should not trigger item press if screen is not focused', () => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(false);
        render(<SelectionListRenderer data={mockItems} />);
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledTimes(0);
    });

    it('should handle item press correctly', () => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
        render(<SelectionListRenderer data={mockItems} />);

        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                ...mockItems.at(1),
            }),
        );
    });

    it('should update selected item on rerender', () => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
        const updatedMockItems = mockItems.map((item) => ({
            ...item,
            isSelected: item.keyForList === '2',
        }));
        const {rerender} = render(<SelectionListRenderer data={mockItems} />);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`)).toBeSelected();
        rerender(<SelectionListRenderer data={updatedMockItems} />);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}2`)).toBeSelected();
    });

    it('should render all items', () => {
        render(
            <SelectionListRenderer
                data={largeMockItems}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();
    });

    it('should render all items when they fit within initial render limit', () => {
        render(
            <SelectionListRenderer
                data={mockItems}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}9`)).toBeTruthy();
    });

    it('does not lose items when only selection changes', () => {
        const {rerender} = render(
            <SelectionListRenderer
                data={largeMockItems}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();

        rerender(
            <SelectionListRenderer
                data={largeMockItems.map((item, index) => ({...item, isSelected: index === 3}))}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}3`)).toBeSelected();
    });

    it('should still render items when text input changes', () => {
        const {rerender} = render(
            <SelectionListRenderer
                data={largeMockItems}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();

        rerender(
            <SelectionListRenderer
                data={largeMockItems.map((item, index) => ({...item, isSelected: index === 3}))}
                canSelectMultiple={false}
                searchText="Item"
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}3`)).toBeTruthy();
    });

    it('should search for an item then scroll back to preselected item when search is cleared', () => {
        function SearchableListWrapper() {
            const [searchText, setSearchText] = useState('');

            const filteredItems = searchText
                ? largeMockItemsWithSelectedFromSecondPage.filter((item) => item.text.toLowerCase().includes(searchText.toLowerCase()))
                : largeMockItemsWithSelectedFromSecondPage;

            return (
                <SelectionListRenderer
                    data={filteredItems}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    canSelectMultiple={false}
                />
            );
        }

        render(<SearchableListWrapper />);

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeSelected();

        fireEvent.changeText(screen.getByTestId('selection-list-text-input'), 'Item 0');

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeFalsy();
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`)).toBeFalsy();

        fireEvent.changeText(screen.getByTestId('selection-list-text-input'), '');

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeSelected();
    });

    it('should render the selection-list testID', () => {
        render(
            <SelectionListRenderer
                data={mockItems}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId('selection-list')).toBeTruthy();
    });

    it('should mark all items as not selected when none are selected', () => {
        const noSelectionItems = mockItems.map((item) => ({...item, isSelected: false}));

        render(
            <SelectionListRenderer
                data={noSelectionItems}
                canSelectMultiple={false}
            />,
        );

        for (const item of noSelectionItems) {
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${item.keyForList}`)).not.toBeSelected();
        }
    });

    it('should render empty list without crashing when data is empty', () => {
        render(
            <SelectionListRenderer
                data={[]}
                canSelectMultiple={false}
            />,
        );

        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeNull();
    });

    it('suppresses the scroll on a focus-return restore', () => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
        mockIsFocusRestoreInProgress.mockReturnValue(true);
        render(<SelectionListRenderer data={mockItems} />);
        mockScrollToIndex.mockClear();

        const row = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}5`);
        fireEvent(row, 'focus', {nativeEvent: {sourceCapabilities: null}});

        expect(mockScrollToIndex).not.toHaveBeenCalled();
    });

    it('does not auto-scroll on genuine keyboard Tab focus (programmatic focus is non-scrolling)', () => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
        mockIsFocusRestoreInProgress.mockReturnValue(false);
        render(<SelectionListRenderer data={mockItems} />);
        mockScrollToIndex.mockClear();

        const row = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}5`);
        fireEvent(row, 'focus', {nativeEvent: {sourceCapabilities: null}});

        expect(mockScrollToIndex).not.toHaveBeenCalled();
    });

    it('does not auto-scroll on genuine pointer focus (jump-on-click prevented)', () => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
        mockIsFocusRestoreInProgress.mockReturnValue(false);
        render(<SelectionListRenderer data={mockItems} />);
        mockScrollToIndex.mockClear();

        const row = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}5`);
        fireEvent(row, 'focus', {nativeEvent: {sourceCapabilities: {firesTouchEvents: false}}});

        expect(mockScrollToIndex).not.toHaveBeenCalled();
    });

    it('restore-mode suppression does not leak into the next focus event', () => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
        mockIsFocusRestoreInProgress.mockReturnValue(true);
        render(<SelectionListRenderer data={mockItems} />);

        fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}5`), 'focus', {nativeEvent: {sourceCapabilities: null}});

        mockScrollToIndex.mockClear();
        mockIsFocusRestoreInProgress.mockReturnValue(false);

        fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}7`), 'focus', {nativeEvent: {sourceCapabilities: {firesTouchEvents: false}}});

        expect(mockScrollToIndex).not.toHaveBeenCalled();
    });
});

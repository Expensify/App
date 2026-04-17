import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React, {useState} from 'react';
import type ReactNative from 'react-native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import type Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

// Captures scrollToIndex calls so tests can assert on scroll behaviour
const mockScrollToIndex = jest.fn();

// Mock FlashList
jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');

    const FlashList = ReactLocal.forwardRef<
        {scrollToIndex: (params: {index: number}) => void},
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
            ReactLocal.useImperativeHandle(ref, () => ({scrollToIndex: mockScrollToIndex}));

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

describe('BaseSelectionList', () => {
    const onSelectRowMock = jest.fn();

    beforeEach(() => {
        onSelectRowMock.mockClear();
        mockScrollToIndex.mockClear();
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

    it('should not trigger item press if screen is not focused', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(false);
        render(<SelectionListRenderer data={mockItems} />);
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledTimes(0);
    });

    it('should handle item press correctly', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
        render(<SelectionListRenderer data={mockItems} />);

        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                ...mockItems.at(1),
            }),
        );
    });

    it('should update selected item on rerender', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
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
});

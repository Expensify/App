import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React, {useState} from 'react';
import type ReactNative from 'react-native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import BaseSelectionListWithSections from '@components/SelectionList/SelectionListWithSections/BaseSelectionListWithSections';
import type {ListItem, SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';
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

type BaseSelectionListSections<TItem extends ListItem> = {
    sections: SelectionListWithSectionsProps<TItem>['sections'];
    canSelectMultiple?: boolean;
    searchText?: string;
    setSearchText?: (searchText: string) => void;
};

const mockSections = Array.from({length: 10}, (_, index) => ({
    text: `Item ${index}`,
    keyForList: `${index}`,
    isSelected: index === 1,
}));

const largeMockSections = Array.from({length: 100}, (_, index) => ({
    text: `Item ${index}`,
    keyForList: `${index}`,
    isSelected: index === 1,
}));

const largeMockSectionsWithSelectedItemFromSecondPage = Array.from({length: 100}, (_, index) => ({
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
        useNavigation: jest.fn(() => ({
            isFocused: jest.fn(() => true),
        })),
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
        mockScrollToIndex.mockClear();
    });

    function BaseListItemRenderer<TItem extends ListItem>(props: BaseSelectionListSections<TItem>) {
        const {sections, canSelectMultiple, setSearchText, searchText} = props;
        const focusedKey = sections.at(0)?.data.find((item) => item.isSelected)?.keyForList;
        return (
            <OnyxListItemProvider>
                <BaseSelectionListWithSections
                    sections={sections}
                    textInputOptions={{
                        label: 'common.search',
                        onChangeText: setSearchText,
                        value: searchText,
                    }}
                    ListItem={canSelectMultiple ? MultiSelectListItem : SingleSelectListItem}
                    onSelectRow={onSelectRowMock}
                    shouldSingleExecuteRowSelect
                    shouldShowTextInput={!!setSearchText}
                    canSelectMultiple={canSelectMultiple}
                    initiallyFocusedItemKey={focusedKey}
                />
            </OnyxListItemProvider>
        );
    }

    it('should not trigger item press if screen is not focused', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(false);
        render(<BaseListItemRenderer sections={[{data: mockSections, sectionIndex: 0}]} />);
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledTimes(0);
    });

    it('should handle item press correctly', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
        render(<BaseListItemRenderer sections={[{data: mockSections, sectionIndex: 0}]} />);

        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                ...mockSections.at(1),
            }),
        );
    });

    it('should update focused item when sections are updated from BE', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
        const updatedMockSections = mockSections.map((section) => ({
            ...section,
            isSelected: section.keyForList === '2',
        }));
        const {rerender} = render(<BaseListItemRenderer sections={[{data: mockSections, sectionIndex: 0}]} />);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`)).toBeSelected();
        rerender(<BaseListItemRenderer sections={[{data: updatedMockSections, sectionIndex: 0}]} />);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}2`)).toBeSelected();
    });

    it('should scroll to top when selecting a multi option list', () => {
        render(
            <BaseListItemRenderer
                sections={[
                    {data: [], sectionIndex: 0},
                    {data: mockSections, sectionIndex: 1},
                ]}
                canSelectMultiple
            />,
        );
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`));
        expect(mockScrollToIndex).toHaveBeenCalledWith(expect.objectContaining({index: 0}));
    });

    it('should render all items', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections, sectionIndex: 0}]}
                canSelectMultiple={false}
            />,
        );

        // FlashList renders all items (virtualization is handled internally)
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();
    });

    it('should render all items when they fit within initial render limit', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: mockSections, sectionIndex: 0}]}
                canSelectMultiple={false}
            />,
        );

        // Should render all 10 items since they fit within the initialNumToRender limit
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}9`)).toBeTruthy();
    });

    it('should render items from all sections', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections, sectionIndex: 0}]}
                canSelectMultiple={false}
            />,
        );

        // All items should be rendered with FlashList
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}49`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();
    });

    it('should search for first item then scroll back to preselected item when search is cleared', () => {
        function SearchableListWrapper() {
            const [searchText, setSearchText] = useState('');

            // Filter sections based on search text
            const filteredSections = searchText
                ? largeMockSectionsWithSelectedItemFromSecondPage.filter((item) => item.text.toLowerCase().includes(searchText.toLowerCase()))
                : largeMockSectionsWithSelectedItemFromSecondPage;

            return (
                <BaseListItemRenderer
                    sections={[{data: filteredSections, sectionIndex: 0}]}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    canSelectMultiple={false}
                />
            );
        }

        render(<SearchableListWrapper />);

        // Initially should show item 70 as selected and visible
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeSelected();

        // Search for "Item 0"
        fireEvent.changeText(screen.getByTestId('selection-list-text-input'), 'Item 0');

        // Should show only the first item (Item 0) in search results
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeFalsy();
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`)).toBeFalsy();

        // Clear the search text
        fireEvent.changeText(screen.getByTestId('selection-list-text-input'), '');

        // Should show the preselected item 70
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeSelected();
    });

    it('does not lose items when only selectedOptions changes', () => {
        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections, sectionIndex: 0}]}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();

        // Rerender with only selection change
        rerender(
            <BaseListItemRenderer
                sections={[{data: largeMockSections.map((item, index) => ({...item, isSelected: index === 3})), sectionIndex: 0}]}
                canSelectMultiple={false}
            />,
        );

        // All items should still be rendered
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();
        // Item 3 should now be selected
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}3`)).toBeSelected();
    });

    it('should still render items when text input changes', () => {
        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections, sectionIndex: 0}]}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();

        // Rerender with search text - items should still be visible
        rerender(
            <BaseListItemRenderer
                sections={[{data: largeMockSections.map((item, index) => ({...item, isSelected: index === 3})), sectionIndex: 0}]}
                canSelectMultiple={false}
                searchText="Item"
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}3`)).toBeTruthy();
    });

    it('should render items from multiple sections', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
        const sectionA = Array.from({length: 5}, (_, index) => ({
            text: `Section A Item ${index}`,
            keyForList: `a-${index}`,
            isSelected: false,
        }));
        const sectionB = Array.from({length: 5}, (_, index) => ({
            text: `Section B Item ${index}`,
            keyForList: `b-${index}`,
            isSelected: false,
        }));

        render(
            <BaseListItemRenderer
                sections={[
                    {data: sectionA, title: 'Section A', sectionIndex: 0},
                    {data: sectionB, title: 'Section B', sectionIndex: 1},
                ]}
            />,
        );

        // Items from both sections should be rendered
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}a-0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}a-4`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}b-0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}b-4`)).toBeTruthy();
    });

    it('should handle item press from second section correctly', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
        const sectionA = [{text: 'A0', keyForList: 'a-0', isSelected: false}];
        const sectionB = [{text: 'B0', keyForList: 'b-0', isSelected: false}];

        render(
            <BaseListItemRenderer
                sections={[
                    {data: sectionA, title: 'Section A', sectionIndex: 0},
                    {data: sectionB, title: 'Section B', sectionIndex: 1},
                ]}
            />,
        );

        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}b-0`));
        expect(onSelectRowMock).toHaveBeenCalledWith(expect.objectContaining({keyForList: 'b-0', text: 'B0'}));
    });

    it('should render empty list without crashing when all sections are empty', () => {
        render(
            <BaseListItemRenderer
                sections={[
                    {data: [], sectionIndex: 0},
                    {data: [], sectionIndex: 1},
                ]}
            />,
        );

        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeNull();
    });
});

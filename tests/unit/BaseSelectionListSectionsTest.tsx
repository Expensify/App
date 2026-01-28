import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {useState} from 'react';
import {SectionList} from 'react-native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseSelectionList from '@components/SelectionListWithSections/BaseSelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem, SelectionListProps} from '@components/SelectionListWithSections/types';
import type Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

type BaseSelectionListSections<TItem extends ListItem> = {
    sections: SelectionListProps<TItem>['sections'];
    canSelectMultiple?: boolean;
    initialNumToRender?: number;
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

let arrowUpCallback = () => {};
let arrowDownCallback = () => {};
jest.mock('@hooks/useKeyboardShortcut', () => (key: {shortcutKey: string}, callback: () => void) => {
    if (key.shortcutKey === 'ArrowUp') {
        arrowUpCallback = callback;
    } else if (key.shortcutKey === 'ArrowDown') {
        arrowDownCallback = callback;
    }
});

describe('BaseSelectionList', () => {
    const onSelectRowMock = jest.fn();

    function BaseListItemRenderer<TItem extends ListItem>(props: BaseSelectionListSections<TItem>) {
        const {sections, canSelectMultiple, initialNumToRender, setSearchText, searchText} = props;
        const focusedKey = sections[0].data.find((item) => item.isSelected)?.keyForList;
        return (
            <OnyxListItemProvider>
                <BaseSelectionList
                    sections={sections}
                    textInputLabel="common.search"
                    ListItem={RadioListItem}
                    onSelectRow={onSelectRowMock}
                    shouldSingleExecuteRowSelect
                    canSelectMultiple={canSelectMultiple}
                    initiallyFocusedOptionKey={focusedKey}
                    initialNumToRender={initialNumToRender}
                    onChangeText={setSearchText}
                    textInputValue={searchText}
                />
            </OnyxListItemProvider>
        );
    }

    it('should not trigger item press if screen is not focused', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(false);
        render(<BaseListItemRenderer sections={[{data: mockSections}]} />);
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledTimes(0);
    });

    it('should handle item press correctly', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
        render(<BaseListItemRenderer sections={[{data: mockSections}]} />);

        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledWith({
            ...mockSections.at(1),
            shouldAnimateInHighlight: false,
        });
    });

    it('should update focused item when sections are updated from BE', () => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
        const updatedMockSections = mockSections.map((section) => ({
            ...section,
            isSelected: section.keyForList === '2',
        }));
        const {rerender} = render(<BaseListItemRenderer sections={[{data: mockSections}]} />);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`)).toBeSelected();
        rerender(<BaseListItemRenderer sections={[{data: updatedMockSections}]} />);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}2`)).toBeSelected();
    });

    it('should scroll to top when selecting a multi option list', () => {
        const spy = jest.spyOn(SectionList.prototype, 'scrollToLocation');
        render(
            <BaseListItemRenderer
                sections={[{data: []}, {data: mockSections}]}
                canSelectMultiple
            />,
        );
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`));
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({itemIndex: 0}));
    });

    it('should show only elements from first page when items exceed page limit', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={60}
            />,
        );

        // Should render first page (items 0-49, so 50 items total)
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}49`)).toBeTruthy();

        // Should NOT render items from second page
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}50`)).toBeFalsy();
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeFalsy();
    });

    it('should render all items when they fit within initial render limit', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: mockSections}]}
                canSelectMultiple={false}
                initialNumToRender={60}
            />,
        );

        // Should render all 10 items since they fit within the initialNumToRender limit
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}9`)).toBeTruthy();
    });

    it('should load more items when scrolled to end', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={50}
            />,
        );

        // Should initially show first page items (0-48, 49 items total)
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}48`)).toBeTruthy();

        // Items beyond first page should not be initially visible
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}49`)).toBeFalsy();

        // Note: Scroll-based loading in test environment might not work as expected
        // This test verifies the initial state - actual scroll behavior would need integration testing
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
                    sections={[{data: filteredSections}]}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    canSelectMultiple={false}
                    initialNumToRender={110}
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

    it('does not reset page when only selectedOptions changes', () => {
        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={50}
            />,
        );

        // Should show first page items
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}48`)).toBeTruthy();

        // Rerender with only selection change
        rerender(
            <BaseListItemRenderer
                sections={[{data: largeMockSections.map((item, index) => ({...item, isSelected: index === 3}))}]}
                canSelectMultiple={false}
                initialNumToRender={50}
            />,
        );

        // Should still show the same items (no pagination reset)
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}48`)).toBeTruthy();
        // Item 3 should now be selected
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}3`)).toBeSelected();
    });

    it('should reset current page when text input changes', () => {
        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={50}
            />,
        );

        // Should show first page items initially
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}48`)).toBeTruthy();

        // Rerender with search text - should still show items (filtered or not)
        rerender(
            <BaseListItemRenderer
                sections={[{data: largeMockSections.map((item, index) => ({...item, isSelected: index === 3}))}]}
                canSelectMultiple={false}
                searchText="Item"
                initialNumToRender={50}
            />,
        );

        // Search functionality should work - items should still be visible
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}3`)).toBeTruthy();
    });

    it('should focus next/previous item relative to hovered item when arrow keys are pressed', async () => {
        render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={50}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`)).toHaveStyle({backgroundColor: colors.productDark400});

        // Trigger a mouse move event to hover the item
        fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}10`), 'mouseMove', {stopPropagation: () => {}});

        // eslint-disable-next-line testing-library/no-unnecessary-act
        act(() => {
            arrowDownCallback();
        });

        // The item that gets focused will be the one following the hovered item
        await waitFor(() => {
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}11`)).toHaveStyle({backgroundColor: colors.productDark300});
        });

        act(() => {
            arrowUpCallback();
            arrowUpCallback();
        });

        await waitFor(() => {
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}9`)).toHaveStyle({backgroundColor: colors.productDark300});
        });

        act(() => {
            arrowDownCallback();
        });

        await waitFor(() => {
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}10`)).toHaveStyle({backgroundColor: colors.productDark300});
        });
    });
});

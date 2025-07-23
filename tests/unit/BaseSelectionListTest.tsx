import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {useState} from 'react';
import {SectionList} from 'react-native';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem, SelectionListProps} from '@components/SelectionList/types';
import type Navigation from '@libs/Navigation/Navigation';
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
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

describe('BaseSelectionList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const onSelectRowMock = jest.fn();

    function BaseListItemRenderer<TItem extends ListItem>(props: BaseSelectionListSections<TItem>) {
        const {sections, canSelectMultiple, initialNumToRender, setSearchText, searchText} = props;
        const focusedKey = sections[0].data.find((item) => item.isSelected)?.keyForList;
        return (
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

    it('should show only elements from first page and Show More button when items exceed page limit', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={60}
            />,
        );

        // Should render exactly first page (50 items)
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}49`)).toBeTruthy();

        // Should NOT render items from second page
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}50`)).toBeFalsy();
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeFalsy();

        expect(screen.getByText('common.showMore')).toBeTruthy();
        expect(screen.getByText('50')).toBeTruthy();
        expect(screen.getByText('100')).toBeTruthy();
    });

    it('should hide Show More button when items fit on one page', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: mockSections}]}
                canSelectMultiple={false}
                initialNumToRender={60}
            />,
        );

        expect(screen.queryByText('common.showMore')).toBeFalsy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}9`)).toBeTruthy();
    });

    it('should load more items when Show More button is clicked', () => {
        render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={110}
            />,
        );

        // Click Show More button
        fireEvent.press(screen.getByText('common.showMore'));

        // Should now show items from second page
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}50`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();

        // Should not show, Show more button as we rendered whole list
        expect(screen.queryByText('common.showMore')).toBeFalsy();
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

        // Should scroll back to and show the preselected item 70
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}70`)).toBeSelected();
    });

    it('does not reset page when only selectedOptions changes', () => {
        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={110}
            />,
        );

        // Click Show More button
        fireEvent.press(screen.getByText('common.showMore'));

        rerender(
            <BaseListItemRenderer
                sections={[{data: largeMockSections.map((item, index) => ({...item, isSelected: index === 3}))}]}
                canSelectMultiple={false}
                initialNumToRender={110}
            />,
        );

        // Should now show items from second page
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}50`)).toBeTruthy();
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();

        // Should not show, Show more button as we rendered whole list
        expect(screen.queryByText('common.showMore')).toBeFalsy();
    });

    it('should reset current page when text input changes', () => {
        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: largeMockSections}]}
                canSelectMultiple={false}
                initialNumToRender={110}
            />,
        );

        // Click Show More button
        fireEvent.press(screen.getByText('common.showMore'));
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeTruthy();

        // Rerender with changed `searchText` to trigger `setCurrentPage(1)`
        rerender(
            <BaseListItemRenderer
                sections={[{data: largeMockSections.map((item, index) => ({...item, isSelected: index === 3}))}]}
                canSelectMultiple={false}
                initialNumToRender={110}
                searchText="Item"
            />,
        );

        // Should now show items from second page
        expect(screen.queryByText(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeFalsy();

        // Should show, Show more button as current page is reset
        expect(screen.getByText('common.showMore')).toBeOnTheScreen();
    });
});

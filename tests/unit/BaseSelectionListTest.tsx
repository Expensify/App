import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {SectionList} from 'react-native';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem, SelectionListProps} from '@components/SelectionList/types';
import type Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

type BaseSelectionListSections<TItem extends ListItem> = {
    sections: SelectionListProps<TItem>['sections'];
    canSelectMultiple?: boolean;
};

const mockSections = Array.from({length: 10}, (_, index) => ({
    text: `Item ${index}`,
    keyForList: `${index}`,
    isSelected: index === 1,
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

describe('BaseSelectionList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const onSelectRowMock = jest.fn();

    function BaseListItemRenderer<TItem extends ListItem>(props: BaseSelectionListSections<TItem>) {
        const {sections, canSelectMultiple} = props;
        const focusedKey = sections[0].data.find((item) => item.isSelected)?.keyForList;
        return (
            <BaseSelectionList
                sections={sections}
                ListItem={RadioListItem}
                onSelectRow={onSelectRowMock}
                shouldSingleExecuteRowSelect
                canSelectMultiple={canSelectMultiple}
                initiallyFocusedOptionKey={focusedKey}
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

        // Should not show, Show more button as we rendered whole list and search text was not changed
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

        // Should not show the items from second page
        expect(screen.queryByText(`${CONST.BASE_LIST_ITEM_TEST_ID}99`)).toBeFalsy();

        // Should show, Show more button as current page is reset
        expect(screen.getByText('common.showMore')).toBeOnTheScreen();
    });
});

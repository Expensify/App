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
    textInputValue?: string;
    shouldUpdateFocusedIndex?: boolean;
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

    const onCurrentPageChange = jest.fn();
    const onFocusReset = jest.fn();
    const onSelectRowMock = jest.fn();

    function BaseListItemRenderer<TItem extends ListItem>(props: BaseSelectionListSections<TItem>) {
        const {sections, canSelectMultiple, textInputValue = '', shouldUpdateFocusedIndex} = props;
        const focusedKey = sections[0].data.find((item) => item.isSelected)?.keyForList;
        return (
            <BaseSelectionList
                sections={sections}
                ListItem={RadioListItem}
                onSelectRow={onSelectRowMock}
                shouldSingleExecuteRowSelect
                canSelectMultiple={canSelectMultiple}
                initiallyFocusedOptionKey={focusedKey}
                onCurrentPageChange={onCurrentPageChange}
                onFocusReset={onFocusReset}
                textInputValue={textInputValue}
                shouldUpdateFocusedIndex={shouldUpdateFocusedIndex}
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
        const {rerender} = render(<BaseListItemRenderer sections={[{data: mockSections}]} />);
        expect(onCurrentPageChange).not.toHaveBeenCalled();
        expect(onFocusReset).not.toHaveBeenCalled();

        // simulate selection-only change
        const updated = mockSections.map((item, i) => ({
            ...item,
            isSelected: i === 2,
        }));

        rerender(<BaseListItemRenderer sections={[{data: updated}]} />);
        expect(onFocusReset).not.toHaveBeenCalled();
        expect(onCurrentPageChange).not.toHaveBeenCalled();

        rerender(
            <BaseListItemRenderer
                sections={[{data: updated}]}
                textInputValue="Test"
            />,
        );
        expect(onFocusReset).toHaveBeenCalled();
        expect(onCurrentPageChange).toHaveBeenCalledTimes(1);
    });

    it('should reset current page and call onCurrentPageChange when text input changes', () => {
        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: mockSections}]}
                textInputValue="abc"
            />,
        );

        rerender(
            <BaseListItemRenderer
                sections={[{data: mockSections}]}
                textInputValue="abcd"
            />,
        );
        expect(onCurrentPageChange).toHaveBeenCalledTimes(1);
    });

    it('should reset focus when text input becomes empty after having a value', () => {
        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: mockSections}]}
                textInputValue="abc"
            />,
        );

        rerender(
            <BaseListItemRenderer
                sections={[{data: mockSections}]}
                textInputValue=""
            />,
        );
        expect(onFocusReset).toHaveBeenCalled();
    });

    it('should reset focus when selected options change but all options remain same', () => {
        const initialSections = mockSections.map((item, i) => ({
            ...item,
            isSelected: i === 1,
        }));
        const updatedSections = mockSections.map((item, i) => ({
            ...item,
            isSelected: i === 2 || i === 3,
        }));

        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: initialSections}]}
                textInputValue=""
            />,
        );

        rerender(
            <BaseListItemRenderer
                sections={[{data: updatedSections}]}
                textInputValue=""
            />,
        );
        expect(onFocusReset).toHaveBeenCalled();
    });

    it('should not reset focus when shouldUpdateFocusedIndex is true', () => {
        const initialSections = mockSections.map((item, i) => ({
            ...item,
            isSelected: i === 1,
        }));
        const updatedSections = mockSections.map((item, i) => ({
            ...item,
            isSelected: i === 2 || i === 3,
        }));

        const {rerender} = render(
            <BaseListItemRenderer
                sections={[{data: initialSections}]}
                textInputValue=""
                shouldUpdateFocusedIndex
            />,
        );
        onFocusReset.mockClear();

        rerender(
            <BaseListItemRenderer
                sections={[{data: updatedSections}]}
                textInputValue=""
                shouldUpdateFocusedIndex
            />,
        );
        expect(onFocusReset).not.toHaveBeenCalled();
    });
});

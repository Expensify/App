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

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
    };
});

describe('BaseSelectionList', () => {
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
});

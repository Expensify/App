import {fireEvent, render, screen} from '@testing-library/react-native';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import type Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

type BaseSelectionListSections<TItem extends ListItem> = {
    sections: TItem[];
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
    const onSelectRowMock = jest.fn();

    function BaseListItemRenderer<TItem extends ListItem>(props: BaseSelectionListSections<TItem>) {
        const {sections} = props;
        const focusedKey = sections.find((item) => item.isSelected)?.keyForList;
        return (
            <BaseSelectionList
                sections={[{data: sections}]}
                ListItem={RadioListItem}
                onSelectRow={onSelectRowMock}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={focusedKey}
            />
        );
    }

    it('should handle item press correctly', () => {
        render(<BaseListItemRenderer sections={mockSections} />);
        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`));
        expect(onSelectRowMock).toHaveBeenCalledWith({
            ...mockSections.at(1),
            shouldAnimateInHighlight: false,
        });
    });

    it('should update focused item when sections are updated from BE', () => {
        const updatedMockSections = mockSections.map((section) => ({
            ...section,
            isSelected: section.keyForList === '2',
        }));
        const {rerender} = render(<BaseListItemRenderer sections={mockSections} />);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`)).toBeSelected();
        rerender(<BaseListItemRenderer sections={updatedMockSections} />);
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}2`)).toBeSelected();
    });
});

import {fireEvent, render, screen} from '@testing-library/react-native';

import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';

import useHover from '@hooks/useHover';

import CONST from '@src/CONST';

jest.mock('@hooks/useHover', () => jest.fn());

const mockedUseHover = useHover as jest.MockedFunction<typeof useHover>;

describe('BaseListItem', () => {
    it('hover should work correctly', () => {
        const mouseEnterMock = jest.fn();
        const mouseLeaveMock = jest.fn();
        mockedUseHover.mockReturnValue({
            hovered: false,
            deviceHasHoverSupport: true,
            bind: {
                onMouseEnter: mouseEnterMock,
                onMouseLeave: mouseLeaveMock,
            },
        });
        render(
            <BaseListItem
                item={{keyForList: '1'}}
                keyForList="1"
                onSelectRow={() => {}}
                showTooltip={false}
                isFocused={false}
            />,
        );
        const testID = `${CONST.BASE_LIST_ITEM_TEST_ID}1`;
        fireEvent(screen.getByTestId(testID), 'mouseEnter');
        expect(mouseEnterMock).toHaveBeenCalled();
        fireEvent(screen.getByTestId(testID), 'mouseLeave', {stopPropagation: jest.fn()});
        expect(mouseLeaveMock).toHaveBeenCalled();
    });

    it('should use the accessibilityLabel prop as the row name when provided', () => {
        mockedUseHover.mockReturnValue({hovered: false, deviceHasHoverSupport: true, bind: {onMouseEnter: jest.fn(), onMouseLeave: jest.fn()}});
        render(
            <BaseListItem
                item={{keyForList: '1', text: 'Item text'}}
                keyForList="1"
                accessibilityLabel="Custom row name"
                onSelectRow={() => {}}
                showTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByLabelText('Custom row name')).toBeTruthy();
        expect(screen.queryByLabelText('Item text')).toBeNull();
    });

    it('should fall back to the item-derived label when accessibilityLabel is omitted', () => {
        mockedUseHover.mockReturnValue({hovered: false, deviceHasHoverSupport: true, bind: {onMouseEnter: jest.fn(), onMouseLeave: jest.fn()}});
        render(
            <BaseListItem
                item={{keyForList: '1', text: 'Item text'}}
                keyForList="1"
                onSelectRow={() => {}}
                showTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByLabelText('Item text')).toBeTruthy();
    });

    it('should keep the button role for a navigational row when shouldUseOptionRole is false', () => {
        mockedUseHover.mockReturnValue({hovered: false, deviceHasHoverSupport: true, bind: {onMouseEnter: jest.fn(), onMouseLeave: jest.fn()}});
        render(
            <BaseListItem
                item={{keyForList: '1', text: 'Item text'}}
                keyForList="1"
                shouldUseOptionRole={false}
                onSelectRow={() => {}}
                showTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByRole(CONST.ROLE.BUTTON)).toBeTruthy();
    });

    it('should resolve a single-select row to the option role by default', () => {
        mockedUseHover.mockReturnValue({hovered: false, deviceHasHoverSupport: true, bind: {onMouseEnter: jest.fn(), onMouseLeave: jest.fn()}});
        render(
            <BaseListItem
                item={{keyForList: '1', text: 'Item text'}}
                keyForList="1"
                onSelectRow={() => {}}
                showTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();
    });

    it('should be presentational (not a button) when accessible is false, so nested controls stay reachable', () => {
        mockedUseHover.mockReturnValue({hovered: false, deviceHasHoverSupport: true, bind: {onMouseEnter: jest.fn(), onMouseLeave: jest.fn()}});
        render(
            <BaseListItem
                item={{keyForList: '1', text: 'Item text'}}
                keyForList="1"
                accessible={false}
                onSelectRow={() => {}}
                showTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();
    });

    it('should drive the row selected state from the isSelected prop when selection is not on the item', () => {
        mockedUseHover.mockReturnValue({hovered: false, deviceHasHoverSupport: true, bind: {onMouseEnter: jest.fn(), onMouseLeave: jest.fn()}});
        render(
            <BaseListItem
                item={{keyForList: '1', text: 'Item text'}}
                keyForList="1"
                isSelected
                onSelectRow={() => {}}
                showTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`).props.accessibilityState).toEqual(expect.objectContaining({selected: true}));
    });

    it('should fall back to item.isSelected for the row selected state when the isSelected prop is omitted', () => {
        mockedUseHover.mockReturnValue({hovered: false, deviceHasHoverSupport: true, bind: {onMouseEnter: jest.fn(), onMouseLeave: jest.fn()}});
        render(
            <BaseListItem
                item={{keyForList: '1', text: 'Item text', isSelected: true}}
                keyForList="1"
                onSelectRow={() => {}}
                showTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`).props.accessibilityState).toEqual(expect.objectContaining({selected: true}));
    });
});

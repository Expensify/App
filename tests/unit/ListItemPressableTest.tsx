import {fireEvent, render, screen} from '@testing-library/react-native';

import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useHover from '@hooks/useHover';

import CONST from '@src/CONST';

jest.mock('@hooks/useHover', () => jest.fn());

const mockedUseHover = jest.mocked(useHover);

describe('ListItemPressable', () => {
    beforeEach(() => {
        mockedUseHover.mockReturnValue({hovered: false, deviceHasHoverSupport: true, bind: {onMouseEnter: jest.fn(), onMouseLeave: jest.fn()}});
    });

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
            <ListItemComposed
                item={{keyForList: '1'}}
                onSelectRow={() => {}}
                shouldShowTooltip={false}
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
        render(
            <ListItemComposed
                item={{keyForList: '1', text: 'Item text'}}
                accessibilityLabel="Custom row name"
                onSelectRow={() => {}}
                shouldShowTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByLabelText('Custom row name')).toBeTruthy();
        expect(screen.queryByLabelText('Item text')).toBeNull();
    });

    it('should fall back to the item-derived label when accessibilityLabel is omitted', () => {
        render(
            <ListItemComposed
                item={{keyForList: '1', text: 'Item text'}}
                onSelectRow={() => {}}
                shouldShowTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByLabelText('Item text')).toBeTruthy();
    });

    it('should keep the button role for a navigational row when shouldUseOptionRole is false', () => {
        render(
            <ListItemComposed
                item={{keyForList: '1', text: 'Item text'}}
                shouldUseOptionRole={false}
                onSelectRow={() => {}}
                shouldShowTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByRole(CONST.ROLE.BUTTON)).toBeTruthy();
    });

    it('should resolve a single-select row to the option role by default', () => {
        render(
            <ListItemComposed
                item={{keyForList: '1', text: 'Item text'}}
                onSelectRow={() => {}}
                shouldShowTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();
    });

    it('should be presentational (not a button) when accessible is false, so nested controls stay reachable', () => {
        render(
            <ListItemComposed
                item={{keyForList: '1', text: 'Item text'}}
                accessible={false}
                onSelectRow={() => {}}
                shouldShowTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();
    });

    it.each([
        ['the isSelected prop', {keyForList: '1', text: 'Item text'}, true],
        ['item.isSelected', {keyForList: '1', text: 'Item text', isSelected: true}, undefined],
    ])('should drive the row selected state from %s', (_source, item, isSelected) => {
        render(
            <ListItemComposed
                item={item}
                isSelected={isSelected}
                onSelectRow={() => {}}
                shouldShowTooltip={false}
                isFocused={false}
            />,
        );
        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}1`).props.accessibilityState).toEqual(expect.objectContaining({selected: true}));
    });
});

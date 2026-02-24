import {fireEvent, render, screen} from '@testing-library/react-native';
import BaseListItem from '@components/SelectionListWithSections/BaseListItem';
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
            bind: {
                onMouseEnter: mouseEnterMock,
                onMouseLeave: mouseLeaveMock,
            },
        });
        render(
            <BaseListItem
                item={{keyForList: '1'}}
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
});

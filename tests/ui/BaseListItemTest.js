"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var BaseListItem_1 = require("@components/SelectionList/BaseListItem");
var useHover_1 = require("@hooks/useHover");
var CONST_1 = require("@src/CONST");
jest.mock('@hooks/useHover', function () { return jest.fn(); });
var mockedUseHover = useHover_1.default;
describe('BaseListItem', function () {
    it('hover should work correctly', function () {
        var mouseEnterMock = jest.fn();
        var mouseLeaveMock = jest.fn();
        mockedUseHover.mockReturnValue({
            hovered: false,
            bind: {
                onMouseEnter: mouseEnterMock,
                onMouseLeave: mouseLeaveMock,
            },
        });
        (0, react_native_1.render)(<BaseListItem_1.default item={{ keyForList: '1' }} onSelectRow={function () { }} showTooltip={false} isFocused={false}/>);
        var testID = "".concat(CONST_1.default.BASE_LIST_ITEM_TEST_ID, "1");
        (0, react_native_1.fireEvent)(react_native_1.screen.getByTestId(testID), 'mouseEnter');
        expect(mouseEnterMock).toBeCalled();
        (0, react_native_1.fireEvent)(react_native_1.screen.getByTestId(testID), 'mouseLeave', { stopPropagation: jest.fn() });
        expect(mouseLeaveMock).toBeCalled();
    });
});

"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var NativeNavigation = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var react_native_2 = require("react-native");
var BaseSelectionList_1 = require("@components/SelectionList/BaseSelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var CONST_1 = require("@src/CONST");
var mockSections = Array.from({ length: 10 }, function (_, index) { return ({
    text: "Item ".concat(index),
    keyForList: "".concat(index),
    isSelected: index === 1,
}); });
jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useIsFocused: jest.fn(), useFocusEffect: jest.fn() });
});
describe('BaseSelectionList', function () {
    var onSelectRowMock = jest.fn();
    function BaseListItemRenderer(props) {
        var _a;
        var sections = props.sections, canSelectMultiple = props.canSelectMultiple;
        var focusedKey = (_a = sections[0].data.find(function (item) { return item.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList;
        return (<BaseSelectionList_1.default sections={sections} ListItem={RadioListItem_1.default} onSelectRow={onSelectRowMock} shouldSingleExecuteRowSelect canSelectMultiple={canSelectMultiple} initiallyFocusedOptionKey={focusedKey}/>);
    }
    it('should not trigger item press if screen is not focused', function () {
        NativeNavigation.useIsFocused.mockReturnValue(false);
        (0, react_native_1.render)(<BaseListItemRenderer sections={[{ data: mockSections }]}/>);
        react_native_1.fireEvent.press(react_native_1.screen.getByTestId("".concat(CONST_1.default.BASE_LIST_ITEM_TEST_ID, "1")));
        expect(onSelectRowMock).toHaveBeenCalledTimes(0);
    });
    it('should handle item press correctly', function () {
        NativeNavigation.useIsFocused.mockReturnValue(true);
        (0, react_native_1.render)(<BaseListItemRenderer sections={[{ data: mockSections }]}/>);
        react_native_1.fireEvent.press(react_native_1.screen.getByTestId("".concat(CONST_1.default.BASE_LIST_ITEM_TEST_ID, "1")));
        expect(onSelectRowMock).toHaveBeenCalledWith(__assign(__assign({}, mockSections.at(1)), { shouldAnimateInHighlight: false }));
    });
    it('should update focused item when sections are updated from BE', function () {
        NativeNavigation.useIsFocused.mockReturnValue(true);
        var updatedMockSections = mockSections.map(function (section) { return (__assign(__assign({}, section), { isSelected: section.keyForList === '2' })); });
        var rerender = (0, react_native_1.render)(<BaseListItemRenderer sections={[{ data: mockSections }]}/>).rerender;
        expect(react_native_1.screen.getByTestId("".concat(CONST_1.default.BASE_LIST_ITEM_TEST_ID, "1"))).toBeSelected();
        rerender(<BaseListItemRenderer sections={[{ data: updatedMockSections }]}/>);
        expect(react_native_1.screen.getByTestId("".concat(CONST_1.default.BASE_LIST_ITEM_TEST_ID, "2"))).toBeSelected();
    });
    it('should scroll to top when selecting a multi option list', function () {
        var spy = jest.spyOn(react_native_2.SectionList.prototype, 'scrollToLocation');
        (0, react_native_1.render)(<BaseListItemRenderer sections={[{ data: [] }, { data: mockSections }]} canSelectMultiple/>);
        react_native_1.fireEvent.press(react_native_1.screen.getByTestId("".concat(CONST_1.default.BASE_LIST_ITEM_TEST_ID, "0")));
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ itemIndex: 0 }));
    });
});

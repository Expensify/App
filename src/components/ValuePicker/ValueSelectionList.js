"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
function ValueSelectionList(_a) {
    var _b = _a.items, items = _b === void 0 ? [] : _b, selectedItem = _a.selectedItem, onItemSelected = _a.onItemSelected, _c = _a.shouldShowTooltips, shouldShowTooltips = _c === void 0 ? true : _c;
    var sections = (0, react_1.useMemo)(function () { return [{ data: items.map(function (item) { var _a, _b; return ({ value: item.value, alternateText: item.description, text: (_a = item.label) !== null && _a !== void 0 ? _a : '', isSelected: item === selectedItem, keyForList: (_b = item.value) !== null && _b !== void 0 ? _b : '' }); }) }]; }, [items, selectedItem]);
    return (<SelectionList_1.default sections={sections} onSelectRow={function (item) { return onItemSelected === null || onItemSelected === void 0 ? void 0 : onItemSelected(item); }} initiallyFocusedOptionKey={selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.value} shouldStopPropagation shouldShowTooltips={shouldShowTooltips} shouldUpdateFocusedIndex ListItem={RadioListItem_1.default} addBottomSafeAreaPadding/>);
}
ValueSelectionList.displayName = 'ValueSelectionList';
exports.default = ValueSelectionList;

"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SelectionList_1 = require("@components/SelectionList");
var MultiSelectListItem_1 = require("@components/SelectionList/MultiSelectListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var ROUTES_1 = require("@src/ROUTES");
var SearchFilterPageFooterButtons_1 = require("./SearchFilterPageFooterButtons");
function SearchMultipleSelectionPicker(_a) {
    var items = _a.items, initiallySelectedItems = _a.initiallySelectedItems, pickerTitle = _a.pickerTitle, onSaveSelection = _a.onSaveSelection, _b = _a.shouldShowTextInput, shouldShowTextInput = _b === void 0 ? true : _b;
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, useDebouncedState_1.default)(''), searchTerm = _c[0], debouncedSearchTerm = _c[1], setSearchTerm = _c[2];
    var _d = (0, react_1.useState)(initiallySelectedItems !== null && initiallySelectedItems !== void 0 ? initiallySelectedItems : []), selectedItems = _d[0], setSelectedItems = _d[1];
    (0, react_1.useEffect)(function () {
        setSelectedItems(initiallySelectedItems !== null && initiallySelectedItems !== void 0 ? initiallySelectedItems : []);
    }, [initiallySelectedItems]);
    var _e = (0, react_1.useMemo)(function () {
        var selectedItemsSection = selectedItems
            .filter(function (item) { return item === null || item === void 0 ? void 0 : item.name.toLowerCase().includes(debouncedSearchTerm === null || debouncedSearchTerm === void 0 ? void 0 : debouncedSearchTerm.toLowerCase()); })
            .sort(function (a, b) { return (0, SearchQueryUtils_1.sortOptionsWithEmptyValue)(a.value, b.value); })
            .map(function (item) { return ({
            text: item.name,
            keyForList: item.name,
            isSelected: true,
            value: item.value,
        }); });
        var remainingItemsSection = items
            .filter(function (item) { var _a; return selectedItems.some(function (selectedItem) { return selectedItem.value === item.value; }) === false && ((_a = item === null || item === void 0 ? void 0 : item.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(debouncedSearchTerm === null || debouncedSearchTerm === void 0 ? void 0 : debouncedSearchTerm.toLowerCase())); })
            .sort(function (a, b) { return (0, SearchQueryUtils_1.sortOptionsWithEmptyValue)(a.value, b.value); })
            .map(function (item) { return ({
            text: item.name,
            keyForList: item.name,
            isSelected: false,
            value: item.value,
        }); });
        var isEmpty = !selectedItemsSection.length && !remainingItemsSection.length;
        return {
            sections: isEmpty
                ? []
                : [
                    {
                        title: undefined,
                        data: selectedItemsSection,
                        shouldShow: selectedItemsSection.length > 0,
                    },
                    {
                        title: pickerTitle,
                        data: remainingItemsSection,
                        shouldShow: remainingItemsSection.length > 0,
                    },
                ],
            noResultsFound: isEmpty,
        };
    }, [selectedItems, items, pickerTitle, debouncedSearchTerm]), sections = _e.sections, noResultsFound = _e.noResultsFound;
    var onSelectItem = (0, react_1.useCallback)(function (item) {
        if (!item.text || !item.keyForList || !item.value) {
            return;
        }
        if (item.isSelected) {
            setSelectedItems(selectedItems === null || selectedItems === void 0 ? void 0 : selectedItems.filter(function (selectedItem) { return selectedItem.name !== item.keyForList; }));
        }
        else {
            setSelectedItems(__spreadArray(__spreadArray([], (selectedItems !== null && selectedItems !== void 0 ? selectedItems : []), true), [{ name: item.text, value: item.value }], false));
        }
    }, [selectedItems]);
    var resetChanges = (0, react_1.useCallback)(function () {
        setSelectedItems([]);
    }, []);
    var applyChanges = (0, react_1.useCallback)(function () {
        onSaveSelection(selectedItems.map(function (item) { return item.value; }).flat());
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    }, [onSaveSelection, selectedItems]);
    var footerContent = (0, react_1.useMemo)(function () { return (<SearchFilterPageFooterButtons_1.default applyChanges={applyChanges} resetChanges={resetChanges}/>); }, [resetChanges, applyChanges]);
    return (<SelectionList_1.default sections={sections} textInputValue={searchTerm} onChangeText={setSearchTerm} textInputLabel={shouldShowTextInput ? translate('common.search') : undefined} onSelectRow={onSelectItem} headerMessage={noResultsFound ? translate('common.noResultsFound') : undefined} footerContent={footerContent} shouldStopPropagation showLoadingPlaceholder={!noResultsFound} shouldShowTooltips canSelectMultiple ListItem={MultiSelectListItem_1.default}/>);
}
SearchMultipleSelectionPicker.displayName = 'SearchMultipleSelectionPicker';
exports.default = SearchMultipleSelectionPicker;

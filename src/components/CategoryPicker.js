"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var CategoryOptionListUtils_1 = require("@libs/CategoryOptionListUtils");
var CategoryUtils_1 = require("@libs/CategoryUtils");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var SelectionList_1 = require("./SelectionList");
var RadioListItem_1 = require("./SelectionList/RadioListItem");
function CategoryPicker(_a) {
    var selectedCategory = _a.selectedCategory, policyID = _a.policyID, onSubmit = _a.onSubmit, _b = _a.addBottomSafeAreaPadding, addBottomSafeAreaPadding = _b === void 0 ? false : _b, contentContainerStyle = _a.contentContainerStyle;
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID), { canBeMissing: true })[0];
    var policyCategoriesDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES_DRAFT).concat(policyID), { canBeMissing: true })[0];
    var policyRecentlyUsedCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES).concat(policyID), { canBeMissing: true })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, useDebouncedState_1.default)(''), searchValue = _c[0], debouncedSearchValue = _c[1], setSearchValue = _c[2];
    var offlineMessage = isOffline ? "".concat(translate('common.youAppearToBeOffline'), " ").concat(translate('search.resultsAreLimited')) : '';
    var selectedOptions = (0, react_1.useMemo)(function () {
        if (!selectedCategory) {
            return [];
        }
        return [
            {
                name: selectedCategory,
                isSelected: true,
                enabled: true,
            },
        ];
    }, [selectedCategory]);
    var _d = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d;
        var categories = (_a = policyCategories !== null && policyCategories !== void 0 ? policyCategories : policyCategoriesDraft) !== null && _a !== void 0 ? _a : {};
        var validPolicyRecentlyUsedCategories = (_b = policyRecentlyUsedCategories === null || policyRecentlyUsedCategories === void 0 ? void 0 : policyRecentlyUsedCategories.filter) === null || _b === void 0 ? void 0 : _b.call(policyRecentlyUsedCategories, function (p) { return !(0, EmptyObject_1.isEmptyObject)(p); });
        var categoryOptions = (0, CategoryOptionListUtils_1.getCategoryListSections)({
            searchValue: debouncedSearchValue,
            selectedOptions: selectedOptions,
            categories: categories,
            recentlyUsedCategories: validPolicyRecentlyUsedCategories,
        });
        var categoryData = (_d = (_c = categoryOptions === null || categoryOptions === void 0 ? void 0 : categoryOptions.at(0)) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : [];
        var header = (0, OptionsListUtils_1.getHeaderMessageForNonUserList)(categoryData.length > 0, debouncedSearchValue);
        var categoriesCount = (0, CategoryUtils_1.getEnabledCategoriesCount)(categories);
        var isCategoriesCountBelowThreshold = categoriesCount < CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
        var showInput = !isCategoriesCountBelowThreshold;
        return [categoryOptions, header, showInput];
    }, [policyRecentlyUsedCategories, debouncedSearchValue, selectedOptions, policyCategories, policyCategoriesDraft]), sections = _d[0], headerMessage = _d[1], shouldShowTextInput = _d[2];
    var selectedOptionKey = (0, react_1.useMemo)(function () { var _a, _b, _c; return (_c = ((_b = (_a = sections === null || sections === void 0 ? void 0 : sections.at(0)) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : []).filter(function (category) { return category.searchText === selectedCategory; }).at(0)) === null || _c === void 0 ? void 0 : _c.keyForList; }, [sections, selectedCategory]);
    return (<SelectionList_1.default sections={sections} headerMessage={headerMessage} textInputValue={searchValue} textInputLabel={shouldShowTextInput ? translate('common.search') : undefined} textInputHint={offlineMessage} onChangeText={setSearchValue} onSelectRow={onSubmit} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={selectedOptionKey !== null && selectedOptionKey !== void 0 ? selectedOptionKey : undefined} isRowMultilineSupported addBottomSafeAreaPadding={addBottomSafeAreaPadding} contentContainerStyle={contentContainerStyle}/>);
}
CategoryPicker.displayName = 'CategoryPicker';
exports.default = CategoryPicker;

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
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var TagsOptionsListUtils_1 = require("@libs/TagsOptionsListUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function TagPicker(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var selectedTag = _a.selectedTag, transactionTag = _a.transactionTag, hasDependentTags = _a.hasDependentTags, tagListName = _a.tagListName, policyID = _a.policyID, tagListIndex = _a.tagListIndex, _j = _a.shouldShowDisabledAndSelectedOption, shouldShowDisabledAndSelectedOption = _j === void 0 ? false : _j, _k = _a.shouldOrderListByTagName, shouldOrderListByTagName = _k === void 0 ? false : _k, onSubmit = _a.onSubmit;
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: true })[0];
    var policyRecentlyUsedTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_TAGS).concat(policyID), { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _l = (0, react_1.useState)(''), searchValue = _l[0], setSearchValue = _l[1];
    var policyRecentlyUsedTagsList = (0, react_1.useMemo)(function () { var _a; return (_a = policyRecentlyUsedTags === null || policyRecentlyUsedTags === void 0 ? void 0 : policyRecentlyUsedTags[tagListName]) !== null && _a !== void 0 ? _a : []; }, [policyRecentlyUsedTags, tagListName]);
    var policyTagList = (0, PolicyUtils_1.getTagList)(policyTags, tagListIndex);
    var policyTagsCount = (0, PolicyUtils_1.getCountOfEnabledTagsOfList)(policyTagList.tags);
    var isTagsCountBelowThreshold = policyTagsCount < CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
    var shouldShowTextInput = !isTagsCountBelowThreshold;
    var selectedOptions = (0, react_1.useMemo)(function () {
        if (!selectedTag) {
            return [];
        }
        return [
            {
                name: selectedTag,
                enabled: true,
                accountID: undefined,
            },
        ];
    }, [selectedTag]);
    var enabledTags = (0, react_1.useMemo)(function () {
        if (!shouldShowDisabledAndSelectedOption && !hasDependentTags) {
            return policyTagList.tags;
        }
        if (!shouldShowDisabledAndSelectedOption && hasDependentTags) {
            // Truncate transactionTag to the current level (e.g., "California:North")
            var parentTag_1 = transactionTag === null || transactionTag === void 0 ? void 0 : transactionTag.split(':').slice(0, tagListIndex).join(':');
            return Object.values(policyTagList.tags).filter(function (policyTag) {
                var _a;
                var filterRegex = (_a = policyTag.rules) === null || _a === void 0 ? void 0 : _a.parentTagsFilter;
                if (!filterRegex) {
                    return policyTagList.tags;
                }
                var regex = new RegExp(filterRegex);
                return regex.test(parentTag_1 !== null && parentTag_1 !== void 0 ? parentTag_1 : '');
            });
        }
        var selectedNames = selectedOptions.map(function (s) { return s.name; });
        return __spreadArray(__spreadArray([], selectedOptions, true), Object.values(policyTagList.tags).filter(function (policyTag) { return policyTag.enabled && !selectedNames.includes(policyTag.name); }), true);
    }, [shouldShowDisabledAndSelectedOption, hasDependentTags, selectedOptions, policyTagList.tags, transactionTag, tagListIndex]);
    var sections = (0, react_1.useMemo)(function () {
        var tagSections = (0, TagsOptionsListUtils_1.getTagListSections)({
            searchValue: searchValue,
            selectedOptions: selectedOptions,
            tags: enabledTags,
            recentlyUsedTags: policyRecentlyUsedTagsList,
        });
        return shouldOrderListByTagName
            ? tagSections.map(function (option) { return (__assign(__assign({}, option), { data: option.data.sort(function (a, b) { var _a, _b, _c; return (_c = (_a = a.text) === null || _a === void 0 ? void 0 : _a.localeCompare((_b = b.text) !== null && _b !== void 0 ? _b : '')) !== null && _c !== void 0 ? _c : 0; }) })); })
            : tagSections;
    }, [searchValue, selectedOptions, enabledTags, policyRecentlyUsedTagsList, shouldOrderListByTagName]);
    var headerMessage = (0, OptionsListUtils_1.getHeaderMessageForNonUserList)(((_d = (_c = (_b = sections === null || sections === void 0 ? void 0 : sections.at(0)) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0, searchValue);
    var selectedOptionKey = (_h = (_g = (_f = (_e = sections.at(0)) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.filter(function (policyTag) { return policyTag.searchText === selectedTag; })) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.keyForList;
    return (<SelectionList_1.default ListItem={RadioListItem_1.default} sectionTitleStyles={styles.mt5} listItemTitleStyles={styles.breakAll} sections={sections} textInputValue={searchValue} headerMessage={headerMessage} textInputLabel={shouldShowTextInput ? translate('common.search') : undefined} isRowMultilineSupported initiallyFocusedOptionKey={selectedOptionKey} onChangeText={setSearchValue} onSelectRow={onSubmit}/>);
}
TagPicker.displayName = 'TagPicker';
exports.default = TagPicker;

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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.getCategoryListSections = getCategoryListSections;
exports.getCategoryOptionTree = getCategoryOptionTree;
exports.sortCategories = sortCategories;
// eslint-disable-next-line you-dont-need-lodash-underscore/get
var get_1 = require("lodash/get");
var set_1 = require("lodash/set");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var times_1 = require("@src/utils/times");
var LocaleCompare_1 = require("./LocaleCompare");
var Localize_1 = require("./Localize");
var tokenizedSearch_1 = require("./tokenizedSearch");
/**
 * Builds the options for the category tree hierarchy via indents
 *
 * @param options - an initial object array
 * @param options[].enabled - a flag to enable/disable option in a list
 * @param options[].name - a name of an option
 * @param [isOneLine] - a flag to determine if text should be one line
 */
function getCategoryOptionTree(options, isOneLine, selectedOptions) {
    if (isOneLine === void 0) { isOneLine = false; }
    if (selectedOptions === void 0) { selectedOptions = []; }
    var optionCollection = new Map();
    Object.values(options).forEach(function (option) {
        if (isOneLine) {
            if (optionCollection.has(option.name)) {
                return;
            }
            optionCollection.set(option.name, {
                text: option.name,
                keyForList: option.name,
                searchText: option.name,
                tooltipText: option.name,
                isDisabled: !option.enabled || option.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                isSelected: !!option.isSelected,
                pendingAction: option.pendingAction,
            });
            return;
        }
        option.name.split(CONST_1.default.PARENT_CHILD_SEPARATOR).forEach(function (optionName, index, array) {
            var indents = (0, times_1.default)(index, function () { return CONST_1.default.INDENTS; }).join('');
            var isChild = array.length - 1 === index;
            var searchText = array.slice(0, index + 1).join(CONST_1.default.PARENT_CHILD_SEPARATOR);
            var selectedParentOption = !isChild && Object.values(selectedOptions).find(function (op) { return op.name === searchText; });
            var isParentOptionDisabled = !selectedParentOption || !selectedParentOption.enabled || selectedParentOption.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            if (optionCollection.has(searchText)) {
                return;
            }
            optionCollection.set(searchText, {
                text: "".concat(indents).concat(optionName),
                keyForList: searchText,
                searchText: searchText,
                tooltipText: optionName,
                isDisabled: isChild ? !option.enabled || option.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE : isParentOptionDisabled,
                isSelected: isChild ? !!option.isSelected : !!selectedParentOption,
                pendingAction: option.pendingAction,
            });
        });
    });
    return Array.from(optionCollection.values());
}
/**
 * Builds the section list for categories
 */
function getCategoryListSections(_a) {
    var categories = _a.categories, searchValue = _a.searchValue, _b = _a.selectedOptions, selectedOptions = _b === void 0 ? [] : _b, _c = _a.recentlyUsedCategories, recentlyUsedCategories = _c === void 0 ? [] : _c, _d = _a.maxRecentReportsToShow, maxRecentReportsToShow = _d === void 0 ? CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW : _d;
    var sortedCategories = sortCategories(categories);
    var enabledCategories = Object.values(sortedCategories).filter(function (category) { return category.enabled; });
    var enabledCategoriesNames = enabledCategories.map(function (category) { return category.name; });
    var selectedOptionsWithDisabledState = [];
    var categorySections = [];
    var numberOfEnabledCategories = enabledCategories.length;
    selectedOptions.forEach(function (option) {
        if (enabledCategoriesNames.includes(option.name)) {
            var categoryObj = enabledCategories.find(function (category) { return category.name === option.name; });
            selectedOptionsWithDisabledState.push(__assign(__assign({}, (categoryObj !== null && categoryObj !== void 0 ? categoryObj : option)), { isSelected: true, enabled: true }));
            return;
        }
        selectedOptionsWithDisabledState.push(__assign(__assign({}, option), { isSelected: true, enabled: false }));
    });
    if (numberOfEnabledCategories === 0 && selectedOptions.length > 0) {
        var data_1 = getCategoryOptionTree(selectedOptionsWithDisabledState, true);
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data: data_1,
            indexOffset: data_1.length,
        });
        return categorySections;
    }
    if (searchValue) {
        var categoriesForSearch = __spreadArray(__spreadArray([], selectedOptionsWithDisabledState, true), enabledCategories, true);
        var searchCategories = (0, tokenizedSearch_1.default)(categoriesForSearch, searchValue, function (category) { return [category.name]; }).map(function (category) { return (__assign(__assign({}, category), { isSelected: selectedOptions.some(function (selectedOption) { return selectedOption.name === category.name; }) })); });
        var data_2 = getCategoryOptionTree(searchCategories, true);
        categorySections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data: data_2,
            indexOffset: data_2.length,
        });
        return categorySections;
    }
    if (selectedOptions.length > 0) {
        var data_3 = getCategoryOptionTree(selectedOptionsWithDisabledState, true);
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data: data_3,
            indexOffset: data_3.length,
        });
    }
    var selectedOptionNames = selectedOptions.map(function (selectedOption) { return selectedOption.name; });
    var filteredCategories = enabledCategories.filter(function (category) { return !selectedOptionNames.includes(category.name); });
    if (numberOfEnabledCategories < CONST_1.default.STANDARD_LIST_ITEM_LIMIT) {
        var data_4 = getCategoryOptionTree(filteredCategories, false, selectedOptionsWithDisabledState);
        categorySections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data: data_4,
            indexOffset: data_4.length,
        });
        return categorySections;
    }
    var filteredRecentlyUsedCategories = recentlyUsedCategories
        .filter(function (categoryName) { var _a, _b; return !selectedOptionNames.includes(categoryName) && ((_a = categories[categoryName]) === null || _a === void 0 ? void 0 : _a.enabled) && ((_b = categories[categoryName]) === null || _b === void 0 ? void 0 : _b.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; })
        .map(function (categoryName) {
        var _a;
        return ({
            name: categoryName,
            enabled: (_a = categories[categoryName].enabled) !== null && _a !== void 0 ? _a : false,
        });
    });
    if (filteredRecentlyUsedCategories.length > 0) {
        var cutRecentlyUsedCategories = filteredRecentlyUsedCategories.slice(0, maxRecentReportsToShow);
        var data_5 = getCategoryOptionTree(cutRecentlyUsedCategories, true);
        categorySections.push({
            // "Recent" section
            title: (0, Localize_1.translateLocal)('common.recent'),
            shouldShow: true,
            data: data_5,
            indexOffset: data_5.length,
        });
    }
    var data = getCategoryOptionTree(filteredCategories, false, selectedOptionsWithDisabledState);
    categorySections.push({
        // "All" section when items amount more than the threshold
        title: (0, Localize_1.translateLocal)('common.all'),
        shouldShow: true,
        data: data,
        indexOffset: data.length,
    });
    return categorySections;
}
/**
 * Sorts categories using a simple object.
 * It builds an hierarchy (based on an object), where each category has a name and other keys as subcategories.
 * Via the hierarchy we avoid duplicating and sort categories one by one. Subcategories are being sorted alphabetically.
 */
function sortCategories(categories) {
    // Sorts categories alphabetically by name.
    var sortedCategories = Object.values(categories).sort(function (a, b) { return (0, LocaleCompare_1.default)(a.name, b.name); });
    // An object that respects nesting of categories. Also, can contain only uniq categories.
    var hierarchy = {};
    /**
     * Iterates over all categories to set each category in a proper place in hierarchy
     * It gets a path based on a category name e.g. "Parent: Child: Subcategory" -> "Parent.Child.Subcategory".
     * {
     *   Parent: {
     *     name: "Parent",
     *     Child: {
     *       name: "Child"
     *       Subcategory: {
     *         name: "Subcategory"
     *       }
     *     }
     *   }
     * }
     */
    sortedCategories.forEach(function (category) {
        var path = category.name.split(CONST_1.default.PARENT_CHILD_SEPARATOR);
        var existedValue = (0, get_1.default)(hierarchy, path, {});
        (0, set_1.default)(hierarchy, path, __assign(__assign({}, existedValue), { name: category.name, pendingAction: category.pendingAction }));
    });
    /**
     * A recursive function to convert hierarchy into an array of category objects.
     * The category object contains base 2 properties: "name" and "enabled".
     * It iterates each key one by one. When a category has subcategories, goes deeper into them. Also, sorts subcategories alphabetically.
     */
    var flatHierarchy = function (initialHierarchy) {
        return Object.values(initialHierarchy).reduce(function (acc, category) {
            var _a, _b;
            var name = category.name, pendingAction = category.pendingAction, subcategories = __rest(category, ["name", "pendingAction"]);
            if (name) {
                var categoryObject = {
                    name: name,
                    pendingAction: pendingAction,
                    enabled: (_b = (_a = categories[name]) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false,
                };
                acc.push(categoryObject);
            }
            if (!(0, EmptyObject_1.isEmptyObject)(subcategories)) {
                var nestedCategories = flatHierarchy(subcategories);
                acc.push.apply(acc, nestedCategories.sort(function (a, b) { return a.name.localeCompare(b.name); }));
            }
            return acc;
        }, []);
    };
    return flatHierarchy(hierarchy);
}

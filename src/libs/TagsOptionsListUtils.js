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
exports.getTagsOptions = getTagsOptions;
exports.getTagListSections = getTagListSections;
exports.hasEnabledTags = hasEnabledTags;
exports.sortTags = sortTags;
var CONST_1 = require("@src/CONST");
var LocaleCompare_1 = require("./LocaleCompare");
var Localize_1 = require("./Localize");
var OptionsListUtils_1 = require("./OptionsListUtils");
var PolicyUtils_1 = require("./PolicyUtils");
var tokenizedSearch_1 = require("./tokenizedSearch");
/**
 * Transforms the provided tags into option objects.
 *
 * @param tags - an initial tag array
 */
function getTagsOptions(tags, selectedOptions) {
    return tags.map(function (tag) {
        // This is to remove unnecessary escaping backslash in tag name sent from backend.
        var cleanedName = (0, PolicyUtils_1.getCleanedTagName)(tag.name);
        return {
            text: cleanedName,
            keyForList: tag.name,
            searchText: tag.name,
            tooltipText: cleanedName,
            isDisabled: !tag.enabled || tag.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            isSelected: selectedOptions === null || selectedOptions === void 0 ? void 0 : selectedOptions.some(function (selectedTag) { return selectedTag.name === tag.name; }),
            pendingAction: tag.pendingAction,
        };
    });
}
/**
 * Build the section list for tags
 */
function getTagListSections(_a) {
    var tags = _a.tags, _b = _a.recentlyUsedTags, recentlyUsedTags = _b === void 0 ? [] : _b, _c = _a.selectedOptions, selectedOptions = _c === void 0 ? [] : _c, _d = _a.searchValue, searchValue = _d === void 0 ? '' : _d, _e = _a.maxRecentReportsToShow, maxRecentReportsToShow = _e === void 0 ? CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW : _e;
    var tagSections = [];
    var sortedTags = sortTags(tags);
    var selectedOptionNames = selectedOptions.map(function (selectedOption) { return selectedOption.name; });
    var enabledTags = sortedTags.filter(function (tag) { return tag.enabled; });
    var enabledTagsNames = enabledTags.map(function (tag) { return tag.name; });
    var enabledTagsWithoutSelectedOptions = enabledTags.filter(function (tag) { return !selectedOptionNames.includes(tag.name); });
    var selectedTagsWithDisabledState = [];
    var numberOfTags = enabledTags.length;
    selectedOptions.forEach(function (tag) {
        if (enabledTagsNames.includes(tag.name)) {
            selectedTagsWithDisabledState.push(__assign(__assign({}, tag), { enabled: true }));
            return;
        }
        selectedTagsWithDisabledState.push(__assign(__assign({}, tag), { enabled: false }));
    });
    // If all tags are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTags === 0 && selectedOptions.length > 0) {
        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data: getTagsOptions(selectedTagsWithDisabledState, selectedOptions),
        });
        return tagSections;
    }
    if (searchValue) {
        var tagsForSearch = __spreadArray(__spreadArray([], (0, tokenizedSearch_1.default)(selectedTagsWithDisabledState, searchValue, function (tag) { return [(0, PolicyUtils_1.getCleanedTagName)(tag.name)]; }), true), (0, tokenizedSearch_1.default)(enabledTagsWithoutSelectedOptions, searchValue, function (tag) { return [(0, PolicyUtils_1.getCleanedTagName)(tag.name)]; }), true);
        tagSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data: getTagsOptions(tagsForSearch, selectedOptions),
        });
        return tagSections;
    }
    if (numberOfTags < CONST_1.default.STANDARD_LIST_ITEM_LIMIT) {
        tagSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data: getTagsOptions(__spreadArray(__spreadArray([], selectedTagsWithDisabledState, true), enabledTagsWithoutSelectedOptions, true), selectedOptions),
        });
        return tagSections;
    }
    var filteredRecentlyUsedTags = recentlyUsedTags
        .filter(function (recentlyUsedTag) {
        var tagObject = sortedTags.find(function (tag) { return tag.name === recentlyUsedTag; });
        return !!(tagObject === null || tagObject === void 0 ? void 0 : tagObject.enabled) && !selectedOptionNames.includes(recentlyUsedTag) && (tagObject === null || tagObject === void 0 ? void 0 : tagObject.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    })
        .map(function (tag) { return ({ name: tag, enabled: true }); });
    if (selectedOptions.length) {
        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            data: getTagsOptions(selectedTagsWithDisabledState, selectedOptions),
        });
    }
    if (filteredRecentlyUsedTags.length > 0) {
        var cutRecentlyUsedTags = filteredRecentlyUsedTags.slice(0, maxRecentReportsToShow);
        tagSections.push({
            // "Recent" section
            title: (0, Localize_1.translateLocal)('common.recent'),
            shouldShow: true,
            data: getTagsOptions(cutRecentlyUsedTags, selectedOptions),
        });
    }
    tagSections.push({
        // "All" section when items amount more than the threshold
        title: (0, Localize_1.translateLocal)('common.all'),
        shouldShow: true,
        data: getTagsOptions(enabledTagsWithoutSelectedOptions, selectedOptions),
    });
    return tagSections;
}
/**
 * Verifies that there is at least one enabled tag
 */
function hasEnabledTags(policyTagList) {
    var policyTagValueList = policyTagList
        .filter(function (tag) { return tag && tag.tags; })
        .map(function (_a) {
        var tags = _a.tags;
        return Object.values(tags);
    })
        .flat();
    return (0, OptionsListUtils_1.hasEnabledOptions)(policyTagValueList);
}
/**
 * Sorts tags alphabetically by name.
 */
function sortTags(tags) {
    return Object.values(tags !== null && tags !== void 0 ? tags : {}).sort(function (a, b) { return (0, LocaleCompare_1.default)(a.name, b.name); });
}

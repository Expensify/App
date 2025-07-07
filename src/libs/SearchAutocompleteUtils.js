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
exports.getAutocompleteCategories = getAutocompleteCategories;
exports.getAutocompleteQueryWithComma = getAutocompleteQueryWithComma;
exports.getAutocompleteRecentCategories = getAutocompleteRecentCategories;
exports.getAutocompleteRecentTags = getAutocompleteRecentTags;
exports.getAutocompleteTags = getAutocompleteTags;
exports.getAutocompleteTaxList = getAutocompleteTaxList;
exports.getQueryWithoutAutocompletedPart = getQueryWithoutAutocompletedPart;
exports.parseForAutocomplete = parseForAutocomplete;
exports.parseForLiveMarkdown = parseForLiveMarkdown;
var CONST_1 = require("@src/CONST");
var PolicyUtils_1 = require("./PolicyUtils");
var autocompleteParser_1 = require("./SearchParser/autocompleteParser");
/**
 * Parses given query using the autocomplete parser.
 * This is a smaller and simpler version of search parser used for autocomplete displaying logic.
 */
function parseForAutocomplete(text) {
    try {
        var parsedAutocomplete = (0, autocompleteParser_1.parse)(text);
        return parsedAutocomplete;
    }
    catch (e) {
        console.error("Error when parsing autocomplete query\"", e);
    }
}
/**
 * Returns data for computing the `Tag` filter autocomplete list.
 */
function getAutocompleteTags(allPoliciesTagsLists) {
    var uniqueTagNames = new Set();
    var tagListsUnpacked = Object.values(allPoliciesTagsLists !== null && allPoliciesTagsLists !== void 0 ? allPoliciesTagsLists : {}).filter(function (item) { return !!item; });
    tagListsUnpacked
        .map(PolicyUtils_1.getTagNamesFromTagsLists)
        .flat()
        .forEach(function (tag) { return uniqueTagNames.add(tag); });
    return Array.from(uniqueTagNames);
}
/**
 * Returns data for computing the recent tags autocomplete list.
 */
function getAutocompleteRecentTags(allRecentTags) {
    var uniqueTagNames = new Set();
    Object.values(allRecentTags !== null && allRecentTags !== void 0 ? allRecentTags : {})
        .map(function (recentTag) { return Object.values(recentTag !== null && recentTag !== void 0 ? recentTag : {}); })
        .flat(2)
        .forEach(function (tag) { return uniqueTagNames.add(tag); });
    return Array.from(uniqueTagNames);
}
/**
 * Returns data for computing the `Category` filter autocomplete list.
 */
function getAutocompleteCategories(allPolicyCategories) {
    var uniqueCategoryNames = new Set();
    Object.values(allPolicyCategories !== null && allPolicyCategories !== void 0 ? allPolicyCategories : {}).map(function (policyCategories) { return Object.values(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}).forEach(function (category) { return uniqueCategoryNames.add(category.name); }); });
    return Array.from(uniqueCategoryNames);
}
/**
 * Returns data for computing the recent categories autocomplete list.
 */
function getAutocompleteRecentCategories(allRecentCategories) {
    var uniqueCategoryNames = new Set();
    Object.values(allRecentCategories !== null && allRecentCategories !== void 0 ? allRecentCategories : {}).map(function (policyCategories) { return Object.values(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}).forEach(function (category) { return uniqueCategoryNames.add(category); }); });
    return Array.from(uniqueCategoryNames);
}
/**
 * Returns data for computing the `Tax` filter autocomplete list
 *
 * Please note: taxes are stored in a quite convoluted and non-obvious way, and there can be multiple taxes with the same id
 * because tax ids are generated based on a tax name, so they look like this: `id_My_Tax` and are not numeric.
 * That is why this function may seem a bit complex.
 */
function getAutocompleteTaxList(taxRates) {
    return Object.keys(taxRates).map(function (taxName) { return ({
        taxRateName: taxName,
        taxRateIds: taxRates[taxName].map(function (id) { var _a; return (_a = taxRates[id]) !== null && _a !== void 0 ? _a : id; }).flat(),
    }); });
}
/**
 * Given a query string, this function parses it with the autocomplete parser
 * and returns only the part of the string before autocomplete.
 *
 * Ex: "test from:john@doe" -> "test from:"
 */
function getQueryWithoutAutocompletedPart(searchQuery) {
    var parsedQuery = parseForAutocomplete(searchQuery);
    if (!(parsedQuery === null || parsedQuery === void 0 ? void 0 : parsedQuery.autocomplete)) {
        return searchQuery;
    }
    var sliceEnd = parsedQuery.autocomplete.start;
    return searchQuery.slice(0, sliceEnd);
}
/**
 * Returns updated search query string with special case of comma after autocomplete handled.
 * If prev query value had autocomplete, and the last thing user typed is a comma
 * then we allow to continue autocompleting the next value by omitting the whitespace
 */
function getAutocompleteQueryWithComma(prevQuery, newQuery) {
    var prevParsedQuery = parseForAutocomplete(prevQuery);
    if ((prevParsedQuery === null || prevParsedQuery === void 0 ? void 0 : prevParsedQuery.autocomplete) && newQuery.endsWith(',')) {
        return "".concat(newQuery.slice(0, newQuery.length - 1).trim(), ",");
    }
    return newQuery;
}
/**
 * @private
 */
function filterOutRangesWithCorrectValue(range, substitutionMap, userLogins, currencyList, categoryList, tagList) {
    'worklet';
    var typeList = Object.values(CONST_1.default.SEARCH.DATA_TYPES);
    var expenseTypeList = Object.values(CONST_1.default.SEARCH.TRANSACTION_TYPE);
    var statusList = Object.values(__assign(__assign(__assign(__assign(__assign({}, CONST_1.default.SEARCH.STATUS.EXPENSE), CONST_1.default.SEARCH.STATUS.INVOICE), CONST_1.default.SEARCH.STATUS.CHAT), CONST_1.default.SEARCH.STATUS.TRIP), CONST_1.default.SEARCH.STATUS.TASK));
    var groupByList = Object.values(CONST_1.default.SEARCH.GROUP_BY);
    var booleanList = Object.values(CONST_1.default.SEARCH.BOOLEAN);
    var actionList = Object.values(CONST_1.default.SEARCH.ACTION_FILTERS);
    switch (range.key) {
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.IN:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.FEED:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID:
            return substitutionMap["".concat(range.key, ":").concat(range.value)] !== undefined;
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TO:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.FROM:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.PAYER:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER:
            return substitutionMap["".concat(range.key, ":").concat(range.value)] !== undefined || userLogins.get().includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY:
            return currencyList.get().includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.TYPE:
            return typeList.includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE:
            return expenseTypeList.includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.STATUS:
            return statusList.includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.ACTION:
            return actionList.includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY:
            return categoryList.get().includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TAG:
            return tagList.get().includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY:
            return groupByList.includes(range.value);
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE:
        case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
            return booleanList.includes(range.value);
        default:
            return false;
    }
}
/**
 * Parses input string using the autocomplete parser and returns array of markdown ranges that can be used by RNMarkdownTextInput.
 * It is a simpler version of search parser that can be run on UI thread.
 */
function parseForLiveMarkdown(input, currentUserName, map, userLogins, currencyList, categoryList, tagList) {
    'worklet';
    var parsedAutocomplete = (0, autocompleteParser_1.parse)(input);
    var ranges = parsedAutocomplete.ranges;
    return ranges
        .filter(function (range) { return filterOutRangesWithCorrectValue(range, map, userLogins, currencyList, categoryList, tagList); })
        .map(function (range) {
        var isCurrentUserMention = userLogins.get().includes(range.value) || range.value === currentUserName;
        var type = isCurrentUserMention ? 'mention-here' : 'mention-user';
        return { start: range.start, type: type, length: range.length };
    });
}

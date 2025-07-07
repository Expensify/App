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
var deburr_1 = require("lodash/deburr");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Timing_1 = require("@libs/actions/Timing");
var FastSearch_1 = require("@libs/FastSearch");
var Log_1 = require("@libs/Log");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Performance_1 = require("@libs/Performance");
var StringUtils_1 = require("@libs/StringUtils");
var CONST_1 = require("@src/CONST");
var emptyResult = {
    personalDetails: [],
    recentReports: [],
    userToInvite: null,
    currentUserOption: undefined,
};
var personalDetailToSearchString = function (option) {
    var _a, _b, _c, _d;
    var displayName = (_c = (_b = (_a = option.participantsList) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : '';
    return (0, deburr_1.default)([(_d = option.login) !== null && _d !== void 0 ? _d : '', option.login !== displayName ? displayName : ''].join());
};
var recentReportToSearchString = function (option) {
    var _a, _b, _c, _d, _e, _f;
    var searchStringForTree = [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.login) !== null && _b !== void 0 ? _b : ''];
    if (option.isThread) {
        searchStringForTree.push((_c = option.alternateText) !== null && _c !== void 0 ? _c : '');
    }
    else if (option.isChatRoom) {
        searchStringForTree.push((_d = option.subtitle) !== null && _d !== void 0 ? _d : '');
    }
    else if (option.isPolicyExpenseChat) {
        searchStringForTree.push.apply(searchStringForTree, [(_e = option.subtitle) !== null && _e !== void 0 ? _e : '', (_f = option.policyName) !== null && _f !== void 0 ? _f : '']);
    }
    return (0, deburr_1.default)(searchStringForTree.join());
};
var getPersonalDetailUniqueId = function (option) {
    return option.login ? "personalDetail-".concat(option.login) : undefined;
};
var getRecentReportUniqueId = function (option) {
    return option.reportID ? "recentReport-".concat(option.reportID) : undefined;
};
/**
 * Hook for making options from OptionsListUtils searchable with FastSearch.
 * Builds a suffix tree and returns a function to search in it.
 *
 * @example
 * ```
 * const options = OptionsListUtils.getSearchOptions(...);
 * const filterOptions = useFastSearchFromOptions(options);
 */
function useFastSearchFromOptions(options, _a) {
    var _b = _a === void 0 ? { includeUserToInvite: false } : _a, includeUserToInvite = _b.includeUserToInvite;
    var _c = (0, react_1.useState)(null), fastSearch = _c[0], setFastSearch = _c[1];
    var _d = (0, react_1.useState)(false), isInitialized = _d[0], setIsInitialized = _d[1];
    var prevOptionsRef = (0, react_1.useRef)(null);
    var prevFastSearchRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var newFastSearch;
        var prevOptions = prevOptionsRef.current;
        if (prevOptions && shallowCompareOptions(prevOptions, options)) {
            return;
        }
        var actionId = "fast_search_tree_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
        react_native_1.InteractionManager.runAfterInteractions(function () {
            var startTime = Date.now();
            Performance_1.default.markStart(CONST_1.default.TIMING.FAST_SEARCH_TREE_CREATION);
            Log_1.default.info('[CMD_K_DEBUG] FastSearch tree creation started', false, {
                actionId: actionId,
                personalDetailsCount: options.personalDetails.length,
                recentReportsCount: options.recentReports.length,
                hasExistingTree: !!prevFastSearchRef.current,
                timestamp: startTime,
            });
            try {
                prevOptionsRef.current = options;
                // Dispose existing tree if present
                if (prevFastSearchRef.current) {
                    var disposeStartTime = Date.now();
                    prevFastSearchRef.current.dispose();
                    Log_1.default.info('[CMD_K_DEBUG] FastSearch tree disposed', false, {
                        actionId: actionId,
                        disposeTime: Date.now() - disposeStartTime,
                        timestamp: Date.now(),
                    });
                }
                newFastSearch = FastSearch_1.default.createFastSearch([
                    {
                        data: options.personalDetails,
                        toSearchableString: personalDetailToSearchString,
                        uniqueId: getPersonalDetailUniqueId,
                    },
                    {
                        data: options.recentReports,
                        toSearchableString: recentReportToSearchString,
                        uniqueId: getRecentReportUniqueId,
                    },
                ], { shouldStoreSearchableStrings: true });
                setFastSearch(newFastSearch);
                prevFastSearchRef.current = newFastSearch;
                setIsInitialized(true);
                var endTime = Date.now();
                Performance_1.default.markEnd(CONST_1.default.TIMING.FAST_SEARCH_TREE_CREATION);
                Log_1.default.info('[CMD_K_DEBUG] FastSearch tree creation completed', false, {
                    actionId: actionId,
                    duration: endTime - startTime,
                    totalItems: options.personalDetails.length + options.recentReports.length,
                    isInitialized: true,
                    timestamp: endTime,
                });
            }
            catch (error) {
                var endTime = Date.now();
                Performance_1.default.markEnd(CONST_1.default.TIMING.FAST_SEARCH_TREE_CREATION);
                Log_1.default.alert('[CMD_K_FREEZE] FastSearch tree creation failed', {
                    actionId: actionId,
                    error: String(error),
                    duration: endTime - startTime,
                    personalDetailsCount: options.personalDetails.length,
                    recentReportsCount: options.recentReports.length,
                    timestamp: endTime,
                });
                throw error;
            }
        });
        return function () {
            try {
                if (newFastSearch) {
                    Log_1.default.info('[CMD_K_DEBUG] FastSearch tree cleanup', false, {
                        actionId: actionId,
                        timestamp: Date.now(),
                    });
                    newFastSearch.dispose();
                }
            }
            catch (error) {
                Log_1.default.alert('[CMD_K_FREEZE] FastSearch tree cleanup failed', {
                    actionId: actionId,
                    error: String(error),
                    timestamp: Date.now(),
                });
            }
        };
    }, [options]);
    (0, react_1.useEffect)(function () { return function () { var _a; return (_a = prevFastSearchRef.current) === null || _a === void 0 ? void 0 : _a.dispose(); }; }, []);
    var findInSearchTree = (0, react_1.useCallback)(function (searchInput) {
        if (!fastSearch) {
            return emptyResult;
        }
        var deburredInput = (0, deburr_1.default)(searchInput);
        var searchWords = deburredInput.split(/\s+/);
        var searchWordsSorted = StringUtils_1.default.sortStringArrayByLength(searchWords);
        var longestSearchWord = searchWordsSorted.at(searchWordsSorted.length - 1); // longest word is the last element
        if (!longestSearchWord) {
            return emptyResult;
        }
        // The user might have separated words with spaces to do a search such as: "jo d" -> "john doe"
        // With the suffix search tree you can only search for one word at a time. Its most efficient to search for the longest word,
        // (as this will limit the results the most) and then afterwards run a quick filter on the results to see if the other words are present.
        var _a = fastSearch.search(longestSearchWord), personalDetails = _a[0], recentReports = _a[1];
        if (searchWords.length > 1) {
            personalDetails = personalDetails.filter(function (pd) {
                var id = getPersonalDetailUniqueId(pd);
                var searchableString = id ? fastSearch.searchableStringsMap.get(id) : (0, deburr_1.default)(pd.text);
                return (0, OptionsListUtils_1.isSearchStringMatch)(deburredInput, searchableString);
            });
            recentReports = recentReports.filter(function (rr) {
                var id = getRecentReportUniqueId(rr);
                var searchableString = id ? fastSearch.searchableStringsMap.get(id) : (0, deburr_1.default)(rr.text);
                return (0, OptionsListUtils_1.isSearchStringMatch)(deburredInput, searchableString);
            });
        }
        if (includeUserToInvite && 'currentUserOption' in options) {
            var userToInvite = (0, OptionsListUtils_1.filterUserToInvite)(__assign(__assign({}, options), { personalDetails: personalDetails, recentReports: recentReports }), searchInput);
            return {
                personalDetails: personalDetails,
                recentReports: recentReports,
                userToInvite: userToInvite,
                currentUserOption: options.currentUserOption,
            };
        }
        return {
            personalDetails: personalDetails,
            recentReports: recentReports,
            userToInvite: null,
            currentUserOption: undefined,
        };
    }, [includeUserToInvite, options, fastSearch]);
    return { search: findInSearchTree, isInitialized: isInitialized };
}
/**
 * Compares two ReportAndPersonalDetailOptions objects shallowly.
 * @returns true if the options are shallowly equal, false otherwise.
 */
function shallowCompareOptions(prev, next) {
    var _a, _b, _c, _d;
    if (!prev || !next) {
        return false;
    }
    // Compare lengths first
    if (prev.personalDetails.length !== next.personalDetails.length || prev.recentReports.length !== next.recentReports.length) {
        return false;
    }
    Timing_1.default.start(CONST_1.default.TIMING.SEARCH_OPTIONS_COMPARISON);
    Performance_1.default.markStart(CONST_1.default.TIMING.SEARCH_OPTIONS_COMPARISON);
    for (var i = 0; i < prev.personalDetails.length; i++) {
        if (((_a = prev.personalDetails.at(i)) === null || _a === void 0 ? void 0 : _a.keyForList) !== ((_b = next.personalDetails.at(i)) === null || _b === void 0 ? void 0 : _b.keyForList)) {
            Timing_1.default.end(CONST_1.default.TIMING.SEARCH_OPTIONS_COMPARISON);
            Performance_1.default.markEnd(CONST_1.default.TIMING.SEARCH_OPTIONS_COMPARISON);
            return false;
        }
    }
    for (var i = 0; i < prev.recentReports.length; i++) {
        if (((_c = prev.recentReports.at(i)) === null || _c === void 0 ? void 0 : _c.keyForList) !== ((_d = next.recentReports.at(i)) === null || _d === void 0 ? void 0 : _d.keyForList)) {
            Timing_1.default.end(CONST_1.default.TIMING.SEARCH_OPTIONS_COMPARISON);
            Performance_1.default.markEnd(CONST_1.default.TIMING.SEARCH_OPTIONS_COMPARISON);
            return false;
        }
    }
    Timing_1.default.end(CONST_1.default.TIMING.SEARCH_OPTIONS_COMPARISON);
    Performance_1.default.markEnd(CONST_1.default.TIMING.SEARCH_OPTIONS_COMPARISON);
    return true;
}
exports.default = useFastSearchFromOptions;

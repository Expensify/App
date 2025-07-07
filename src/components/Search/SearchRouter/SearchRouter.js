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
var native_1 = require("@react-navigation/native");
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var SearchAutocompleteList_1 = require("@components/Search/SearchAutocompleteList");
var SearchInputSelectionWrapper_1 = require("@components/Search/SearchInputSelectionWrapper");
var SearchQueryListItem_1 = require("@components/SelectionList/Search/SearchQueryListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var InputUtils_1 = require("@libs/InputUtils");
var Log_1 = require("@libs/Log");
var backHistory_1 = require("@libs/Navigation/helpers/backHistory");
var SearchAutocompleteUtils_1 = require("@libs/SearchAutocompleteUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var StringUtils_1 = require("@libs/StringUtils");
var Navigation_1 = require("@navigation/Navigation");
var variables_1 = require("@styles/variables");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var getQueryWithSubstitutions_1 = require("./getQueryWithSubstitutions");
var getUpdatedSubstitutionsMap_1 = require("./getUpdatedSubstitutionsMap");
function getContextualSearchAutocompleteKey(item) {
    if (item.roomType === CONST_1.default.SEARCH.DATA_TYPES.INVOICE) {
        return "".concat(CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TO, ":").concat(item.searchQuery);
    }
    if (item.roomType === CONST_1.default.SEARCH.DATA_TYPES.CHAT) {
        return "".concat(CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.IN, ":").concat(item.searchQuery);
    }
}
function getContextualSearchQuery(item) {
    var _a, _b;
    var baseQuery = "".concat(CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE, ":").concat(item.roomType);
    var additionalQuery = '';
    switch (item.roomType) {
        case CONST_1.default.SEARCH.DATA_TYPES.EXPENSE:
        case CONST_1.default.SEARCH.DATA_TYPES.INVOICE:
            additionalQuery += " ".concat(CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID, ":").concat(item.policyID);
            if (item.roomType === CONST_1.default.SEARCH.DATA_TYPES.INVOICE && item.autocompleteID) {
                additionalQuery += " ".concat(CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TO, ":").concat((0, SearchQueryUtils_1.sanitizeSearchValue)((_a = item.searchQuery) !== null && _a !== void 0 ? _a : ''));
            }
            break;
        case CONST_1.default.SEARCH.DATA_TYPES.CHAT:
        default:
            additionalQuery = " ".concat(CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IN, ":").concat((0, SearchQueryUtils_1.sanitizeSearchValue)((_b = item.searchQuery) !== null && _b !== void 0 ? _b : ''));
            break;
    }
    return baseQuery + additionalQuery;
}
function SearchRouter(_a, ref) {
    var onRouterClose = _a.onRouterClose, shouldHideInputCaret = _a.shouldHideInputCaret, isSearchRouterDisplayed = _a.isSearchRouterDisplayed;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.RECENT_SEARCHES, { canBeMissing: true }), recentSearchesMetadata = _b[1];
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false, canBeMissing: true })[0];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var listRef = (0, react_1.useRef)(null);
    // The actual input text that the user sees
    var _c = (0, useDebouncedState_1.default)('', 500), textInputValue = _c[0], setTextInputValue = _c[2];
    // The input text that was last used for autocomplete; needed for the SearchAutocompleteList when browsing list via arrow keys
    var _d = (0, react_1.useState)(textInputValue), autocompleteQueryValue = _d[0], setAutocompleteQueryValue = _d[1];
    var _e = (0, react_1.useState)({ start: textInputValue.length, end: textInputValue.length }), selection = _e[0], setSelection = _e[1];
    var _f = (0, react_1.useState)({}), autocompleteSubstitutions = _f[0], setAutocompleteSubstitutions = _f[1];
    var textInputRef = (0, react_1.useRef)(null);
    var contextualReportID = (0, native_1.useNavigationState)(function (state) {
        var focusedRoute = (0, native_1.findFocusedRoute)(state);
        if ((focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name) === SCREENS_1.default.REPORT) {
            // We're guaranteed that the type of params is of SCREENS.REPORT
            return focusedRoute.params.reportID;
        }
    });
    var getAdditionalSections = (0, react_1.useCallback)(function (_a) {
        var _b, _c, _d, _e, _f;
        var recentReports = _a.recentReports;
        if (!contextualReportID) {
            return undefined;
        }
        // We will only show the contextual search suggestion if the user has not typed anything
        if (textInputValue) {
            return undefined;
        }
        if (!isSearchRouterDisplayed) {
            return undefined;
        }
        var reportForContextualSearch = recentReports.find(function (option) { return option.reportID === contextualReportID; });
        if (!reportForContextualSearch) {
            return undefined;
        }
        var reportQueryValue = (_c = (_b = reportForContextualSearch.text) !== null && _b !== void 0 ? _b : reportForContextualSearch.alternateText) !== null && _c !== void 0 ? _c : reportForContextualSearch.reportID;
        var roomType = CONST_1.default.SEARCH.DATA_TYPES.CHAT;
        var autocompleteID = reportForContextualSearch.reportID;
        if (reportForContextualSearch.isInvoiceRoom) {
            roomType = CONST_1.default.SEARCH.DATA_TYPES.INVOICE;
            var report = reportForContextualSearch;
            if (report.item && ((_d = report.item) === null || _d === void 0 ? void 0 : _d.invoiceReceiver) && ((_e = report.item.invoiceReceiver) === null || _e === void 0 ? void 0 : _e.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
                autocompleteID = report.item.invoiceReceiver.accountID.toString();
            }
            else {
                autocompleteID = '';
            }
        }
        if (reportForContextualSearch.isPolicyExpenseChat) {
            roomType = CONST_1.default.SEARCH.DATA_TYPES.EXPENSE;
            if (reportForContextualSearch.policyID) {
                autocompleteID = reportForContextualSearch.policyID;
            }
            else {
                autocompleteID = '';
            }
        }
        return [
            {
                data: [
                    {
                        text: StringUtils_1.default.lineBreaksToSpaces("".concat(translate('search.searchIn'), " ").concat((_f = reportForContextualSearch.text) !== null && _f !== void 0 ? _f : reportForContextualSearch.alternateText)),
                        singleIcon: Expensicons.MagnifyingGlass,
                        searchQuery: reportQueryValue,
                        autocompleteID: autocompleteID,
                        itemStyle: styles.activeComponentBG,
                        keyForList: 'contextualSearch',
                        searchItemType: CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
                        roomType: roomType,
                        policyID: reportForContextualSearch.policyID,
                    },
                ],
            },
        ];
    }, [contextualReportID, styles.activeComponentBG, textInputValue, translate, isSearchRouterDisplayed]);
    var searchQueryItem = textInputValue
        ? {
            text: textInputValue,
            singleIcon: Expensicons.MagnifyingGlass,
            searchQuery: textInputValue,
            itemStyle: styles.activeComponentBG,
            keyForList: 'findItem',
            searchItemType: CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
        }
        : undefined;
    var shouldScrollRef = (0, react_1.useRef)(false);
    // Trigger scrollToRight when input value changes and shouldScroll is true
    (0, react_1.useEffect)(function () {
        if (!textInputRef.current || !shouldScrollRef.current) {
            return;
        }
        (0, InputUtils_1.scrollToRight)(textInputRef.current);
        shouldScrollRef.current = false;
    }, [textInputValue]);
    var onSearchQueryChange = (0, react_1.useCallback)(function (userQuery, autoScrollToRight) {
        var _a, _b;
        if (autoScrollToRight === void 0) { autoScrollToRight = false; }
        var actionId = "search_query_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
        var startTime = Date.now();
        Log_1.default.info('[CMD_K_DEBUG] Search query change started', false, {
            actionId: actionId,
            inputLength: userQuery.length,
            previousInputLength: textInputValue.length,
            autoScrollToRight: autoScrollToRight,
            timestamp: startTime,
        });
        try {
            if (autoScrollToRight) {
                shouldScrollRef.current = true;
            }
            var singleLineUserQuery = StringUtils_1.default.lineBreaksToSpaces(userQuery, true);
            var updatedUserQuery = (0, SearchAutocompleteUtils_1.getAutocompleteQueryWithComma)(textInputValue, singleLineUserQuery);
            setTextInputValue(updatedUserQuery);
            setAutocompleteQueryValue(updatedUserQuery);
            var updatedSubstitutionsMap = (0, getUpdatedSubstitutionsMap_1.getUpdatedSubstitutionsMap)(singleLineUserQuery, autocompleteSubstitutions);
            if (!(0, fast_equals_1.deepEqual)(autocompleteSubstitutions, updatedSubstitutionsMap)) {
                setAutocompleteSubstitutions(updatedSubstitutionsMap);
            }
            if (updatedUserQuery || textInputValue.length > 0) {
                (_a = listRef.current) === null || _a === void 0 ? void 0 : _a.updateAndScrollToFocusedIndex(0);
            }
            else {
                (_b = listRef.current) === null || _b === void 0 ? void 0 : _b.updateAndScrollToFocusedIndex(-1);
            }
            var endTime = Date.now();
            Log_1.default.info('[CMD_K_DEBUG] Search query change completed', false, {
                actionId: actionId,
                duration: endTime - startTime,
                finalInputLength: updatedUserQuery.length,
                substitutionsUpdated: !(0, fast_equals_1.deepEqual)(autocompleteSubstitutions, updatedSubstitutionsMap),
                timestamp: endTime,
            });
        }
        catch (error) {
            var endTime = Date.now();
            Log_1.default.alert('[CMD_K_FREEZE] Search query change failed', {
                actionId: actionId,
                error: String(error),
                duration: endTime - startTime,
                inputLength: userQuery.length,
                timestamp: endTime,
            });
            throw error;
        }
    }, [autocompleteSubstitutions, setTextInputValue, textInputValue]);
    var submitSearch = (0, react_1.useCallback)(function (queryString) {
        var queryWithSubstitutions = (0, getQueryWithSubstitutions_1.getQueryWithSubstitutions)(queryString, autocompleteSubstitutions);
        var updatedQuery = (0, SearchQueryUtils_1.getQueryWithUpdatedValues)(queryWithSubstitutions);
        if (!updatedQuery) {
            return;
        }
        (0, backHistory_1.default)(function () {
            onRouterClose();
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: updatedQuery }));
        });
        setTextInputValue('');
        setAutocompleteQueryValue('');
    }, [autocompleteSubstitutions, onRouterClose, setTextInputValue]);
    var setTextAndUpdateSelection = (0, react_1.useCallback)(function (text) {
        setTextInputValue(text);
        shouldScrollRef.current = true;
        setSelection({ start: text.length, end: text.length });
    }, [setSelection, setTextInputValue]);
    var onListItemPress = (0, react_1.useCallback)(function (item) {
        var _a, _b;
        var actionId = "list_item_press_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
        var startTime = Date.now();
        Log_1.default.info('[CMD_K_DEBUG] List item press started', false, {
            actionId: actionId,
            itemType: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? 'SearchQueryItem' : 'OptionData',
            searchItemType: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? item.searchItemType : undefined,
            hasSearchQuery: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? !!item.searchQuery : undefined,
            hasReportID: 'reportID' in item ? !!item.reportID : undefined,
            hasLogin: 'login' in item ? !!item.login : undefined,
            timestamp: startTime,
        });
        var setFocusAndScrollToRight = function () {
            try {
                react_native_1.InteractionManager.runAfterInteractions(function () {
                    if (!textInputRef.current) {
                        Log_1.default.info('[CMD_K_DEBUG] Focus skipped - no text input ref', false, {
                            actionId: actionId,
                            timestamp: Date.now(),
                        });
                        return;
                    }
                    textInputRef.current.focus();
                    (0, InputUtils_1.scrollToRight)(textInputRef.current);
                });
            }
            catch (error) {
                Log_1.default.alert('[CMD_K_FREEZE] Focus and scroll failed', {
                    actionId: actionId,
                    error: String(error),
                    timestamp: Date.now(),
                });
            }
        };
        try {
            if ((0, SearchQueryListItem_1.isSearchQueryItem)(item)) {
                if (!item.searchQuery) {
                    Log_1.default.info('[CMD_K_DEBUG] List item press skipped - no search query', false, {
                        actionId: actionId,
                        itemType: 'SearchQueryItem',
                        timestamp: Date.now(),
                    });
                    return;
                }
                if (item.searchItemType === CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION) {
                    var searchQuery = getContextualSearchQuery(item);
                    var newSearchQuery = "".concat(searchQuery, "\u00A0");
                    onSearchQueryChange(newSearchQuery, true);
                    setSelection({ start: newSearchQuery.length, end: newSearchQuery.length });
                    var autocompleteKey = getContextualSearchAutocompleteKey(item);
                    if (autocompleteKey && item.autocompleteID) {
                        var substitutions = __assign(__assign({}, autocompleteSubstitutions), (_a = {}, _a[autocompleteKey] = item.autocompleteID, _a));
                        setAutocompleteSubstitutions(substitutions);
                    }
                    setFocusAndScrollToRight();
                    var endTime = Date.now();
                    Log_1.default.info('[CMD_K_DEBUG] Contextual suggestion handled', false, {
                        actionId: actionId,
                        duration: endTime - startTime,
                        newQueryLength: newSearchQuery.length,
                        hasSubstitutions: !!(autocompleteKey && item.autocompleteID),
                        timestamp: endTime,
                    });
                }
                else if (item.searchItemType === CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    var trimmedUserSearchQuery = (0, SearchAutocompleteUtils_1.getQueryWithoutAutocompletedPart)(textInputValue);
                    var newSearchQuery = "".concat(trimmedUserSearchQuery).concat((0, SearchQueryUtils_1.sanitizeSearchValue)(item.searchQuery), "\u00A0");
                    onSearchQueryChange(newSearchQuery, true);
                    setSelection({ start: newSearchQuery.length, end: newSearchQuery.length });
                    if (item.mapKey && item.autocompleteID) {
                        var substitutions = __assign(__assign({}, autocompleteSubstitutions), (_b = {}, _b[item.mapKey] = item.autocompleteID, _b));
                        setAutocompleteSubstitutions(substitutions);
                    }
                    setFocusAndScrollToRight();
                    var endTime = Date.now();
                    Log_1.default.info('[CMD_K_DEBUG] Autocomplete suggestion handled', false, {
                        actionId: actionId,
                        duration: endTime - startTime,
                        trimmedQueryLength: trimmedUserSearchQuery.length,
                        newQueryLength: newSearchQuery.length,
                        hasMapKey: !!(item.mapKey && item.autocompleteID),
                        timestamp: endTime,
                    });
                }
                else {
                    submitSearch(item.searchQuery);
                    var endTime = Date.now();
                    Log_1.default.info('[CMD_K_DEBUG] Search submitted', false, {
                        actionId: actionId,
                        duration: endTime - startTime,
                        searchQuery: item.searchQuery,
                        timestamp: endTime,
                    });
                }
            }
            else {
                (0, backHistory_1.default)(function () {
                    if (item === null || item === void 0 ? void 0 : item.reportID) {
                        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(item.reportID));
                    }
                    else if ('login' in item) {
                        (0, Report_1.navigateToAndOpenReport)(item.login ? [item.login] : [], false);
                    }
                });
                onRouterClose();
                var endTime = Date.now();
                Log_1.default.info('[CMD_K_DEBUG] Navigation item handled', false, {
                    actionId: actionId,
                    duration: endTime - startTime,
                    reportID: item === null || item === void 0 ? void 0 : item.reportID,
                    hasLogin: 'login' in item ? !!item.login : false,
                    timestamp: endTime,
                });
            }
        }
        catch (error) {
            var endTime = Date.now();
            Log_1.default.alert('[CMD_K_FREEZE] List item press failed', {
                actionId: actionId,
                error: String(error),
                duration: endTime - startTime,
                itemType: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? 'SearchQueryItem' : 'OptionData',
                searchItemType: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? item.searchItemType : undefined,
                timestamp: endTime,
            });
            throw error;
        }
    }, [autocompleteSubstitutions, onRouterClose, onSearchQueryChange, submitSearch, textInputValue]);
    var updateAutocompleteSubstitutions = (0, react_1.useCallback)(function (item) {
        var _a;
        if (!item.autocompleteID || !item.mapKey) {
            return;
        }
        var substitutions = __assign(__assign({}, autocompleteSubstitutions), (_a = {}, _a[item.mapKey] = item.autocompleteID, _a));
        setAutocompleteSubstitutions(substitutions);
    }, [autocompleteSubstitutions]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE, function () {
        onRouterClose();
    });
    var modalWidth = shouldUseNarrowLayout ? styles.w100 : { width: variables_1.default.searchRouterPopoverWidth };
    var isRecentSearchesDataLoaded = !(0, isLoadingOnyxValue_1.default)(recentSearchesMetadata);
    return (<react_native_1.View style={[styles.flex1, modalWidth, styles.h100, !shouldUseNarrowLayout && styles.mh85vh]} testID={SearchRouter.displayName} ref={ref} onStartShouldSetResponder={function () { return true; }} onResponderRelease={react_native_1.Keyboard.dismiss}>
            {shouldUseNarrowLayout && (<HeaderWithBackButton_1.default title={translate('common.search')} onBackButtonPress={function () { return onRouterClose(); }} shouldDisplayHelpButton={false}/>)}
            {isRecentSearchesDataLoaded && (<>
                    <SearchInputSelectionWrapper_1.default value={textInputValue} isFullWidth={shouldUseNarrowLayout} onSearchQueryChange={onSearchQueryChange} onSubmit={function () {
                var _a;
                var focusedOption = (_a = listRef.current) === null || _a === void 0 ? void 0 : _a.getFocusedOption();
                if (!focusedOption) {
                    submitSearch(textInputValue);
                    return;
                }
                onListItemPress(focusedOption);
            }} caretHidden={shouldHideInputCaret} autocompleteListRef={listRef} shouldShowOfflineMessage wrapperStyle={__assign(__assign({}, styles.border), styles.alignItemsCenter)} outerWrapperStyle={[shouldUseNarrowLayout ? styles.mv3 : styles.mv2, shouldUseNarrowLayout ? styles.mh5 : styles.mh2]} wrapperFocusedStyle={styles.borderColorFocus} isSearchingForReports={isSearchingForReports} selection={selection} substitutionMap={autocompleteSubstitutions} ref={textInputRef}/>
                    <SearchAutocompleteList_1.default autocompleteQueryValue={autocompleteQueryValue || textInputValue} handleSearch={Report_1.searchInServer} searchQueryItem={searchQueryItem} getAdditionalSections={getAdditionalSections} onListItemPress={onListItemPress} setTextQuery={setTextAndUpdateSelection} updateAutocompleteSubstitutions={updateAutocompleteSubstitutions} onHighlightFirstItem={function () { var _a; return (_a = listRef.current) === null || _a === void 0 ? void 0 : _a.updateAndScrollToFocusedIndex(1); }} ref={listRef} textInputRef={textInputRef}/>
                </>)}
        </react_native_1.View>);
}
SearchRouter.displayName = 'SearchRouter';
exports.default = (0, react_1.forwardRef)(SearchRouter);

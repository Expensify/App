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
var native_1 = require("@react-navigation/native");
var fast_equals_1 = require("fast-equals");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Expensicons = require("@components/Icon/Expensicons");
var OnyxProvider_1 = require("@components/OnyxProvider");
var SearchAutocompleteList_1 = require("@components/Search/SearchAutocompleteList");
var SearchInputSelectionWrapper_1 = require("@components/Search/SearchInputSelectionWrapper");
var buildSubstitutionsMap_1 = require("@components/Search/SearchRouter/buildSubstitutionsMap");
var getQueryWithSubstitutions_1 = require("@components/Search/SearchRouter/getQueryWithSubstitutions");
var getUpdatedSubstitutionsMap_1 = require("@components/Search/SearchRouter/getUpdatedSubstitutionsMap");
var SearchRouterContext_1 = require("@components/Search/SearchRouter/SearchRouterContext");
var SearchQueryListItem_1 = require("@components/SelectionList/Search/SearchQueryListItem");
var HelpButton_1 = require("@components/SidePanel/HelpComponents/HelpButton");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var Search_1 = require("@libs/actions/Search");
var CardFeedUtils_1 = require("@libs/CardFeedUtils");
var CardUtils_1 = require("@libs/CardUtils");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SearchAutocompleteUtils_1 = require("@libs/SearchAutocompleteUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var StringUtils_1 = require("@libs/StringUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var keyboard_1 = require("@src/utils/keyboard");
var SearchTypeMenuPopover_1 = require("./SearchTypeMenuPopover");
// When counting absolute positioning, we need to account for borders
var BORDER_WIDTH = 1;
function SearchPageHeaderInput(_a) {
    var queryJSON = _a.queryJSON, searchRouterListVisible = _a.searchRouterListVisible, hideSearchRouterList = _a.hideSearchRouterList, onSearchRouterFocus = _a.onSearchRouterFocus, handleSearch = _a.handleSearch;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(true), showPopupButton = _b[0], setShowPopupButton = _b[1];
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var displayNarrowHeader = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true })[0];
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0];
    var taxRates = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getAllTaxRates)(); }, []);
    var userCardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var workspaceCardFeeds = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, { canBeMissing: true })[0];
    var allCards = (0, react_1.useMemo)(function () { return (0, CardUtils_1.mergeCardListWithWorkspaceFeeds)(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : CONST_1.default.EMPTY_OBJECT, userCardList); }, [userCardList, workspaceCardFeeds]);
    var cardFeedNamesWithType = (0, react_1.useMemo)(function () {
        return (0, CardFeedUtils_1.getCardFeedNamesWithType)({ workspaceCardFeeds: workspaceCardFeeds, translate: translate });
    }, [translate, workspaceCardFeeds]);
    var originalInputQuery = queryJSON.inputQuery;
    var isDefaultQuery = (0, SearchQueryUtils_1.isDefaultExpensesQuery)(queryJSON);
    var _c = (0, react_1.useState)(false), shouldUseAnimation = _c[0], setShouldUseAnimation = _c[1];
    var queryText = (0, SearchQueryUtils_1.buildUserReadableQueryString)(queryJSON, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, policies);
    // The actual input text that the user sees
    var _d = (0, react_1.useState)(isDefaultQuery ? '' : queryText), textInputValue = _d[0], setTextInputValue = _d[1];
    // The input text that was last used for autocomplete; needed for the SearchAutocompleteList when browsing list via arrow keys
    var _e = (0, react_1.useState)(isDefaultQuery ? '' : queryText), autocompleteQueryValue = _e[0], setAutocompleteQueryValue = _e[1];
    var _f = (0, react_1.useState)({ start: textInputValue.length, end: textInputValue.length }), selection = _f[0], setSelection = _f[1];
    var _g = (0, react_1.useState)({}), autocompleteSubstitutions = _g[0], setAutocompleteSubstitutions = _g[1];
    var _h = (0, react_1.useState)(false), isAutocompleteListVisible = _h[0], setIsAutocompleteListVisible = _h[1];
    var listRef = (0, react_1.useRef)(null);
    var textInputRef = (0, react_1.useRef)(null);
    var hasMountedRef = (0, react_1.useRef)(false);
    var isFocused = (0, native_1.useIsFocused)();
    var registerSearchPageInput = (0, SearchRouterContext_1.useSearchRouterContext)().registerSearchPageInput;
    (0, react_1.useEffect)(function () {
        hasMountedRef.current = true;
    }, []);
    // useEffect for blurring TextInput when we cancel SearchRouter interaction on narrow layout
    (0, react_1.useEffect)(function () {
        if (!displayNarrowHeader || !!searchRouterListVisible || !textInputRef.current || !textInputRef.current.isFocused()) {
            return;
        }
        textInputRef.current.blur();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchRouterListVisible]);
    (0, react_1.useEffect)(function () {
        if (displayNarrowHeader || !isFocused || !textInputRef.current) {
            return;
        }
        registerSearchPageInput(textInputRef.current);
    }, [isFocused, registerSearchPageInput, displayNarrowHeader]);
    (0, react_1.useEffect)(function () {
        setTextInputValue(isDefaultQuery ? '' : queryText);
        setAutocompleteQueryValue(isDefaultQuery ? '' : queryText);
    }, [isDefaultQuery, queryText]);
    (0, react_1.useEffect)(function () {
        var substitutionsMap = (0, buildSubstitutionsMap_1.buildSubstitutionsMap)(originalInputQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, policies);
        setAutocompleteSubstitutions(substitutionsMap);
    }, [cardFeedNamesWithType, allCards, originalInputQuery, personalDetails, reports, taxRates, policies]);
    (0, react_1.useEffect)(function () {
        if (searchRouterListVisible) {
            return;
        }
        setShowPopupButton(true);
        setShouldUseAnimation(true);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchRouterListVisible]);
    var onFocus = (0, react_1.useCallback)(function () {
        var _a;
        onSearchRouterFocus === null || onSearchRouterFocus === void 0 ? void 0 : onSearchRouterFocus();
        (_a = listRef.current) === null || _a === void 0 ? void 0 : _a.updateAndScrollToFocusedIndex(0);
        setShowPopupButton(false);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var handleSearchAction = (0, react_1.useCallback)(function (value) {
        // Skip calling handleSearch on the initial mount
        if (!hasMountedRef.current) {
            return;
        }
        handleSearch(value);
    }, [handleSearch]);
    var onSearchQueryChange = (0, react_1.useCallback)(function (userQuery) {
        var _a, _b;
        var actionId = "page_search_query_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
        var startTime = Date.now();
        Log_1.default.info('[CMD_K_DEBUG] Page search query change started', false, {
            actionId: actionId,
            inputLength: userQuery.length,
            previousInputLength: textInputValue.length,
            timestamp: startTime,
        });
        try {
            var singleLineUserQuery = StringUtils_1.default.lineBreaksToSpaces(userQuery, true);
            var updatedUserQuery = (0, SearchAutocompleteUtils_1.getAutocompleteQueryWithComma)(textInputValue, singleLineUserQuery);
            setTextInputValue(updatedUserQuery);
            setAutocompleteQueryValue(updatedUserQuery);
            var updatedSubstitutionsMap = (0, getUpdatedSubstitutionsMap_1.getUpdatedSubstitutionsMap)(singleLineUserQuery, autocompleteSubstitutions);
            if (!(0, fast_equals_1.deepEqual)(autocompleteSubstitutions, updatedSubstitutionsMap) && !(0, isEmpty_1.default)(updatedSubstitutionsMap)) {
                setAutocompleteSubstitutions(updatedSubstitutionsMap);
            }
            if (updatedUserQuery) {
                (_a = listRef.current) === null || _a === void 0 ? void 0 : _a.updateAndScrollToFocusedIndex(0);
            }
            else {
                (_b = listRef.current) === null || _b === void 0 ? void 0 : _b.updateAndScrollToFocusedIndex(-1);
            }
            var endTime = Date.now();
            Log_1.default.info('[CMD_K_DEBUG] Page search query change completed', false, {
                actionId: actionId,
                duration: endTime - startTime,
                finalInputLength: updatedUserQuery.length,
                substitutionsUpdated: !(0, fast_equals_1.deepEqual)(autocompleteSubstitutions, updatedSubstitutionsMap) && !(0, isEmpty_1.default)(updatedSubstitutionsMap),
                timestamp: endTime,
            });
        }
        catch (error) {
            var endTime = Date.now();
            Log_1.default.alert('[CMD_K_FREEZE] Page search query change failed', {
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
        Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: updatedQuery }));
        hideSearchRouterList === null || hideSearchRouterList === void 0 ? void 0 : hideSearchRouterList();
        setIsAutocompleteListVisible(false);
        if (updatedQuery !== originalInputQuery) {
            (0, Search_1.clearAllFilters)();
            setTextInputValue('');
            setAutocompleteQueryValue('');
        }
    }, [autocompleteSubstitutions, hideSearchRouterList, originalInputQuery]);
    var onListItemPress = (0, react_1.useCallback)(function (item) {
        var _a;
        var actionId = "page_list_item_press_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
        var startTime = Date.now();
        Log_1.default.info('[CMD_K_DEBUG] Page list item press started', false, {
            actionId: actionId,
            itemType: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? 'SearchQueryItem' : 'OptionData',
            searchItemType: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? item.searchItemType : undefined,
            hasSearchQuery: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? !!item.searchQuery : undefined,
            hasReportID: 'reportID' in item ? !!item.reportID : undefined,
            hasLogin: 'login' in item ? !!item.login : undefined,
            timestamp: startTime,
        });
        try {
            if ((0, SearchQueryListItem_1.isSearchQueryItem)(item)) {
                if (!item.searchQuery) {
                    Log_1.default.info('[CMD_K_DEBUG] Page list item press skipped - no search query', false, {
                        actionId: actionId,
                        itemType: 'SearchQueryItem',
                        timestamp: Date.now(),
                    });
                    return;
                }
                if (item.searchItemType === CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    var trimmedUserSearchQuery = (0, SearchAutocompleteUtils_1.getQueryWithoutAutocompletedPart)(textInputValue);
                    var newSearchQuery = "".concat(trimmedUserSearchQuery).concat((0, SearchQueryUtils_1.sanitizeSearchValue)(item.searchQuery), "\u00A0");
                    onSearchQueryChange(newSearchQuery);
                    setSelection({ start: newSearchQuery.length, end: newSearchQuery.length });
                    if (item.mapKey && item.autocompleteID) {
                        var substitutions = __assign(__assign({}, autocompleteSubstitutions), (_a = {}, _a[item.mapKey] = item.autocompleteID, _a));
                        setAutocompleteSubstitutions(substitutions);
                    }
                    var endTime = Date.now();
                    Log_1.default.info('[CMD_K_DEBUG] Page autocomplete suggestion handled', false, {
                        actionId: actionId,
                        duration: endTime - startTime,
                        trimmedQueryLength: trimmedUserSearchQuery.length,
                        newQueryLength: newSearchQuery.length,
                        hasMapKey: !!(item.mapKey && item.autocompleteID),
                        timestamp: endTime,
                    });
                }
                else if (item.searchItemType === CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH) {
                    submitSearch(item.searchQuery);
                    var endTime = Date.now();
                    Log_1.default.info('[CMD_K_DEBUG] Page search submitted', false, {
                        actionId: actionId,
                        duration: endTime - startTime,
                        searchQuery: item.searchQuery,
                        timestamp: endTime,
                    });
                }
            }
            else if (item === null || item === void 0 ? void 0 : item.reportID) {
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(item === null || item === void 0 ? void 0 : item.reportID));
                var endTime = Date.now();
                Log_1.default.info('[CMD_K_DEBUG] Page report navigation handled', false, {
                    actionId: actionId,
                    duration: endTime - startTime,
                    reportID: item.reportID,
                    timestamp: endTime,
                });
            }
            else if ('login' in item) {
                (0, Report_1.navigateToAndOpenReport)(item.login ? [item.login] : [], false);
                var endTime = Date.now();
                Log_1.default.info('[CMD_K_DEBUG] Page user navigation handled', false, {
                    actionId: actionId,
                    duration: endTime - startTime,
                    hasLogin: !!item.login,
                    timestamp: endTime,
                });
            }
        }
        catch (error) {
            var endTime = Date.now();
            Log_1.default.alert('[CMD_K_FREEZE] Page list item press failed', {
                actionId: actionId,
                error: String(error),
                duration: endTime - startTime,
                itemType: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? 'SearchQueryItem' : 'OptionData',
                searchItemType: (0, SearchQueryListItem_1.isSearchQueryItem)(item) ? item.searchItemType : undefined,
                timestamp: endTime,
            });
            throw error;
        }
    }, [autocompleteSubstitutions, onSearchQueryChange, submitSearch, textInputValue]);
    var updateAutocompleteSubstitutions = (0, react_1.useCallback)(function (item) {
        var _a;
        if (!item.autocompleteID || !item.mapKey) {
            return;
        }
        var substitutions = __assign(__assign({}, autocompleteSubstitutions), (_a = {}, _a[item.mapKey] = item.autocompleteID, _a));
        setAutocompleteSubstitutions(substitutions);
    }, [autocompleteSubstitutions]);
    var setTextAndUpdateSelection = (0, react_1.useCallback)(function (text) {
        setTextInputValue(text);
        setSelection({ start: text.length, end: text.length });
    }, [setSelection, setTextInputValue]);
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
    if (displayNarrowHeader) {
        return (<react_native_1.View dataSet={{ dragArea: false }} style={[styles.flex1]}>
                <react_native_1.View style={[styles.appBG, styles.flex1]}>
                    <react_native_1.View style={[styles.flexRow, styles.mh5, styles.mb3, styles.alignItemsCenter, styles.justifyContentCenter, { height: variables_1.default.searchTopBarHeight }]}>
                        <react_native_reanimated_1.default.View style={[styles.flex1, styles.zIndex10]}>
                            <SearchInputSelectionWrapper_1.default value={textInputValue} substitutionMap={autocompleteSubstitutions} selection={selection} onSearchQueryChange={onSearchQueryChange} isFullWidth onSubmit={function () {
                keyboard_1.default.dismiss().then(function () { return submitSearch(textInputValue); });
            }} autoFocus={false} onFocus={onFocus} wrapperStyle={__assign(__assign({}, styles.searchAutocompleteInputResults), styles.br2)} wrapperFocusedStyle={styles.searchAutocompleteInputResultsFocused} autocompleteListRef={listRef} ref={textInputRef}/>
                        </react_native_reanimated_1.default.View>
                        {showPopupButton && (<react_native_reanimated_1.default.View entering={shouldUseAnimation ? react_native_reanimated_1.FadeInRight : undefined} exiting={isFocused && searchRouterListVisible ? react_native_reanimated_1.FadeOutRight : undefined} style={[styles.pl3]}>
                                <SearchTypeMenuPopover_1.default queryJSON={queryJSON}/>
                            </react_native_reanimated_1.default.View>)}
                    </react_native_1.View>
                    {!!searchRouterListVisible && (<react_native_1.View style={[styles.flex1]}>
                            <SearchAutocompleteList_1.default autocompleteQueryValue={autocompleteQueryValue} handleSearch={handleSearchAction} searchQueryItem={searchQueryItem} onListItemPress={onListItemPress} setTextQuery={setTextAndUpdateSelection} updateAutocompleteSubstitutions={updateAutocompleteSubstitutions} ref={listRef}/>
                        </react_native_1.View>)}
                </react_native_1.View>
            </react_native_1.View>);
    }
    var hideAutocompleteList = function () { return setIsAutocompleteListVisible(false); };
    var showAutocompleteList = function () {
        var _a;
        (_a = listRef.current) === null || _a === void 0 ? void 0 : _a.updateAndScrollToFocusedIndex(0);
        setIsAutocompleteListVisible(true);
    };
    // we need `- BORDER_WIDTH` to achieve the effect that the input will not "jump"
    var leftPopoverHorizontalPosition = 12 - BORDER_WIDTH;
    var rightPopoverHorizontalPosition = 4 - BORDER_WIDTH;
    var autocompleteInputStyle = isAutocompleteListVisible
        ? [
            styles.border,
            styles.borderRadiusComponentLarge,
            styles.pAbsolute,
            styles.pt2,
            { top: 8 - BORDER_WIDTH, left: leftPopoverHorizontalPosition, right: rightPopoverHorizontalPosition },
            { boxShadow: theme.shadow },
        ]
        : [styles.pt4];
    var inputWrapperActiveStyle = isAutocompleteListVisible ? styles.ph2 : null;
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.zIndex10, styles.mr3]}>
            <react_native_1.View dataSet={{ dragArea: false }} style={[styles.searchResultsHeaderBar, styles.flex1, isAutocompleteListVisible && styles.pr1, isAutocompleteListVisible && styles.pl3]}>
                <react_native_1.View style={__spreadArray([styles.appBG], autocompleteInputStyle, true)}>
                    <SearchInputSelectionWrapper_1.default value={textInputValue} onSearchQueryChange={onSearchQueryChange} isFullWidth onSubmit={function () {
            var _a;
            var focusedOption = (_a = listRef.current) === null || _a === void 0 ? void 0 : _a.getFocusedOption();
            if (focusedOption) {
                return;
            }
            submitSearch(textInputValue);
        }} autoFocus={false} onFocus={showAutocompleteList} onBlur={hideAutocompleteList} wrapperStyle={__assign(__assign({}, styles.searchAutocompleteInputResults), styles.br2)} wrapperFocusedStyle={styles.searchAutocompleteInputResultsFocused} outerWrapperStyle={[inputWrapperActiveStyle, styles.pb2]} autocompleteListRef={listRef} ref={textInputRef} selection={selection} substitutionMap={autocompleteSubstitutions}/>
                    <react_native_1.View style={[styles.mh65vh, !isAutocompleteListVisible && styles.dNone]}>
                        <SearchAutocompleteList_1.default autocompleteQueryValue={autocompleteQueryValue} handleSearch={handleSearchAction} searchQueryItem={searchQueryItem} onListItemPress={onListItemPress} setTextQuery={setTextAndUpdateSelection} updateAutocompleteSubstitutions={updateAutocompleteSubstitutions} ref={listRef} shouldSubscribeToArrowKeyEvents={isAutocompleteListVisible}/>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
            <HelpButton_1.default style={[styles.mt1Half]}/>
        </react_native_1.View>);
}
SearchPageHeaderInput.displayName = 'SearchPageHeaderInput';
exports.default = SearchPageHeaderInput;

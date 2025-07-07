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
exports.SearchRouterItem = SearchRouterItem;
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var SelectionList_1 = require("@components/SelectionList");
var SearchQueryListItem_1 = require("@components/SelectionList/Search/SearchQueryListItem");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useDebounce_1 = require("@hooks/useDebounce");
var useFastSearchFromOptions_1 = require("@hooks/useFastSearchFromOptions");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardFeedUtils_1 = require("@libs/CardFeedUtils");
var CardUtils_1 = require("@libs/CardUtils");
var Log_1 = require("@libs/Log");
var memoize_1 = require("@libs/memoize");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Performance_1 = require("@libs/Performance");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SearchAutocompleteUtils_1 = require("@libs/SearchAutocompleteUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var StringUtils_1 = require("@libs/StringUtils");
var Timing_1 = require("@userActions/Timing");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var getQueryWithSubstitutions_1 = require("./SearchRouter/getQueryWithSubstitutions");
var defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    categoryOptions: [],
};
var setPerformanceTimersEnd = function () {
    Timing_1.default.end(CONST_1.default.TIMING.OPEN_SEARCH);
    Performance_1.default.markEnd(CONST_1.default.TIMING.OPEN_SEARCH);
};
function isSearchQueryListItem(listItem) {
    return (0, SearchQueryListItem_1.isSearchQueryItem)(listItem.item);
}
function getAutocompleteDisplayText(filterKey, value) {
    return "".concat(filterKey, ":").concat(value);
}
function getItemHeight(item) {
    if ((0, SearchQueryListItem_1.isSearchQueryItem)(item)) {
        return 44;
    }
    return 64;
}
function SearchRouterItem(props) {
    var styles = (0, useThemeStyles_1.default)();
    if (isSearchQueryListItem(props)) {
        return (<SearchQueryListItem_1.default 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}/>);
    }
    return (<UserListItem_1.default pressableStyle={[styles.br2, styles.ph3]} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
function SearchAutocompleteList(_a, ref) {
    var _b, _c, _d, _e, _f;
    var autocompleteQueryValue = _a.autocompleteQueryValue, handleSearch = _a.handleSearch, searchQueryItem = _a.searchQueryItem, getAdditionalSections = _a.getAdditionalSections, onListItemPress = _a.onListItemPress, setTextQuery = _a.setTextQuery, updateAutocompleteSubstitutions = _a.updateAutocompleteSubstitutions, _g = _a.shouldSubscribeToArrowKeyEvents, shouldSubscribeToArrowKeyEvents = _g === void 0 ? true : _g, onHighlightFirstItem = _a.onHighlightFirstItem, textInputRef = _a.textInputRef;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: true })[0];
    var recentSearches = (0, useOnyx_1.default)(ONYXKEYS_1.default.RECENT_SEARCHES, { canBeMissing: true })[0];
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true })[0], reports = _h === void 0 ? {} : _h;
    var taxRates = (0, PolicyUtils_1.getAllTaxRates)();
    var _j = (0, OptionListContextProvider_1.useOptionsList)(), options = _j.options, areOptionsInitialized = _j.areOptionsInitialized;
    var searchOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return (0, OptionsListUtils_1.getSearchOptions)(options, betas !== null && betas !== void 0 ? betas : []);
    }, [areOptionsInitialized, betas, options]);
    var _k = (0, react_1.useState)(true), isInitialRender = _k[0], setIsInitialRender = _k[1];
    var typeAutocompleteList = Object.values(CONST_1.default.SEARCH.DATA_TYPES);
    var groupByAutocompleteList = Object.values(CONST_1.default.SEARCH.GROUP_BY);
    var statusAutocompleteList = (0, react_1.useMemo)(function () {
        var _a;
        var parsedQuery = (0, SearchAutocompleteUtils_1.parseForAutocomplete)(autocompleteQueryValue);
        var typeFilter = (_a = parsedQuery === null || parsedQuery === void 0 ? void 0 : parsedQuery.ranges) === null || _a === void 0 ? void 0 : _a.find(function (range) { return range.key === CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.TYPE; });
        var currentType = typeFilter === null || typeFilter === void 0 ? void 0 : typeFilter.value;
        switch (currentType) {
            case CONST_1.default.SEARCH.DATA_TYPES.EXPENSE:
                return Object.values(CONST_1.default.SEARCH.STATUS.EXPENSE);
            case CONST_1.default.SEARCH.DATA_TYPES.INVOICE:
                return Object.values(CONST_1.default.SEARCH.STATUS.INVOICE);
            case CONST_1.default.SEARCH.DATA_TYPES.CHAT:
                return Object.values(CONST_1.default.SEARCH.STATUS.CHAT);
            case CONST_1.default.SEARCH.DATA_TYPES.TRIP:
                return Object.values(CONST_1.default.SEARCH.STATUS.TRIP);
            case CONST_1.default.SEARCH.DATA_TYPES.TASK:
                return Object.values(CONST_1.default.SEARCH.STATUS.TASK);
            default:
                return Object.values(__assign(__assign(__assign(__assign(__assign({}, CONST_1.default.SEARCH.STATUS.EXPENSE), CONST_1.default.SEARCH.STATUS.INVOICE), CONST_1.default.SEARCH.STATUS.CHAT), CONST_1.default.SEARCH.STATUS.TRIP), CONST_1.default.SEARCH.STATUS.TASK));
        }
    }, [autocompleteQueryValue]);
    var expenseTypes = Object.values(CONST_1.default.SEARCH.TRANSACTION_TYPE);
    var booleanTypes = Object.values(CONST_1.default.SEARCH.BOOLEAN);
    var userCardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var workspaceCardFeeds = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, { canBeMissing: true })[0];
    var allCards = (0, react_1.useMemo)(function () { return (0, CardUtils_1.mergeCardListWithWorkspaceFeeds)(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : CONST_1.default.EMPTY_OBJECT, userCardList); }, [userCardList, workspaceCardFeeds]);
    var cardAutocompleteList = Object.values(allCards);
    var cardFeedNamesWithType = (0, react_1.useMemo)(function () {
        return (0, CardFeedUtils_1.getCardFeedNamesWithType)({ workspaceCardFeeds: workspaceCardFeeds, translate: translate });
    }, [translate, workspaceCardFeeds]);
    var feedAutoCompleteList = (0, react_1.useMemo)(function () { return Object.entries(cardFeedNamesWithType).map(function (_a) {
        var cardFeedKey = _a[0], cardFeedName = _a[1];
        return ({ cardFeedKey: cardFeedKey, cardFeedName: cardFeedName });
    }); }, [cardFeedNamesWithType]);
    var getParticipantsAutocompleteList = (0, react_1.useMemo)(function () {
        return (0, memoize_1.default)(function () {
            if (!areOptionsInitialized) {
                return [];
            }
            var currentUserRef = {
                current: undefined,
            };
            var filteredOptions = (0, OptionsListUtils_1.getValidPersonalDetailOptions)(options.personalDetails, {
                loginsToExclude: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
                shouldBoldTitleByDefault: false,
                currentUserRef: currentUserRef,
            });
            // This cast is needed as something is incorrect in types OptionsListUtils.getOptions around l1490 and includeRecentReports types
            var personalDetailsFromOptions = filteredOptions.map(function (option) { return option.item; });
            var autocompleteOptions = Object.values(personalDetailsFromOptions)
                .filter(function (details) { return !!(details === null || details === void 0 ? void 0 : details.login); })
                .map(function (details) {
                var _a, _b;
                return {
                    name: (_a = details.displayName) !== null && _a !== void 0 ? _a : expensify_common_1.Str.removeSMSDomain((_b = details.login) !== null && _b !== void 0 ? _b : ''),
                    accountID: details.accountID.toString(),
                };
            });
            return autocompleteOptions;
        });
    }, [areOptionsInitialized, options.personalDetails]);
    var taxAutocompleteList = (0, react_1.useMemo)(function () { return (0, SearchAutocompleteUtils_1.getAutocompleteTaxList)(taxRates); }, [taxRates]);
    var allPolicyCategories = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES, { canBeMissing: false })[0];
    var allRecentCategories = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES, { canBeMissing: true })[0];
    var categoryAutocompleteList = (0, react_1.useMemo)(function () {
        return (0, SearchAutocompleteUtils_1.getAutocompleteCategories)(allPolicyCategories);
    }, [allPolicyCategories]);
    var recentCategoriesAutocompleteList = (0, react_1.useMemo)(function () {
        return (0, SearchAutocompleteUtils_1.getAutocompleteRecentCategories)(allRecentCategories);
    }, [allRecentCategories]);
    var _l = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0], policies = _l === void 0 ? {} : _l;
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; }, canBeMissing: false })[0];
    var workspaceList = (0, react_1.useMemo)(function () {
        return Object.values(policies)
            .filter(function (singlePolicy) { return !!singlePolicy && (0, PolicyUtils_1.shouldShowPolicy)(singlePolicy, false, currentUserLogin) && !(singlePolicy === null || singlePolicy === void 0 ? void 0 : singlePolicy.isJoinRequestPending); })
            .map(function (singlePolicy) { var _a; return ({ id: singlePolicy === null || singlePolicy === void 0 ? void 0 : singlePolicy.id, name: (_a = singlePolicy === null || singlePolicy === void 0 ? void 0 : singlePolicy.name) !== null && _a !== void 0 ? _a : '' }); });
    }, [policies, currentUserLogin]);
    var currencyList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: false })[0];
    var currencyAutocompleteList = Object.keys(currencyList !== null && currencyList !== void 0 ? currencyList : {}).filter(function (currency) { var _a; return !((_a = currencyList === null || currencyList === void 0 ? void 0 : currencyList[currency]) === null || _a === void 0 ? void 0 : _a.retired); });
    var recentCurrencyAutocompleteList = (0, useOnyx_1.default)(ONYXKEYS_1.default.RECENTLY_USED_CURRENCIES, { canBeMissing: true })[0];
    var allPoliciesTags = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS, { canBeMissing: false })[0];
    var allRecentTags = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_TAGS, { canBeMissing: true })[0];
    var tagAutocompleteList = (0, react_1.useMemo)(function () {
        return (0, SearchAutocompleteUtils_1.getAutocompleteTags)(allPoliciesTags);
    }, [allPoliciesTags]);
    var recentTagsAutocompleteList = (0, SearchAutocompleteUtils_1.getAutocompleteRecentTags)(allRecentTags);
    var _m = (0, react_1.useMemo)(function () {
        var parsedQuery = (0, SearchAutocompleteUtils_1.parseForAutocomplete)(autocompleteQueryValue);
        var queryWithoutFilters = (0, SearchQueryUtils_1.getQueryWithoutFilters)(autocompleteQueryValue);
        return [parsedQuery, queryWithoutFilters];
    }, [autocompleteQueryValue]), autocompleteParsedQuery = _m[0], autocompleteQueryWithoutFilters = _m[1];
    var autocompleteSuggestions = (0, react_1.useMemo)(function () {
        var _a;
        var _b = autocompleteParsedQuery !== null && autocompleteParsedQuery !== void 0 ? autocompleteParsedQuery : {}, autocomplete = _b.autocomplete, _c = _b.ranges, ranges = _c === void 0 ? [] : _c;
        var autocompleteKey = autocomplete === null || autocomplete === void 0 ? void 0 : autocomplete.key;
        var autocompleteValue = (_a = autocomplete === null || autocomplete === void 0 ? void 0 : autocomplete.value) !== null && _a !== void 0 ? _a : '';
        var alreadyAutocompletedKeys = ranges
            .filter(function (range) {
            return autocompleteKey && range.key === autocompleteKey;
        })
            .map(function (range) { return range.value.toLowerCase(); });
        switch (autocompleteKey) {
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TAG: {
                var autocompleteList = autocompleteValue ? tagAutocompleteList : (recentTagsAutocompleteList !== null && recentTagsAutocompleteList !== void 0 ? recentTagsAutocompleteList : []);
                var filteredTags = autocompleteList
                    .filter(function (tag) { return (0, PolicyUtils_1.getCleanedTagName)(tag).toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes((0, PolicyUtils_1.getCleanedTagName)(tag).toLowerCase()); })
                    .sort()
                    .slice(0, 10);
                return filteredTags.map(function (tagName) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAG,
                    text: (0, PolicyUtils_1.getCleanedTagName)(tagName),
                    autocompleteID: tagName,
                    mapKey: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TAG,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY: {
                var autocompleteList = autocompleteValue ? categoryAutocompleteList : recentCategoriesAutocompleteList;
                var filteredCategories = autocompleteList
                    .filter(function (category) { var _a; return ((_a = category === null || category === void 0 ? void 0 : category.toLowerCase()) === null || _a === void 0 ? void 0 : _a.includes(autocompleteValue === null || autocompleteValue === void 0 ? void 0 : autocompleteValue.toLowerCase())) && !alreadyAutocompletedKeys.includes(category === null || category === void 0 ? void 0 : category.toLowerCase()); })
                    .sort()
                    .slice(0, 10);
                return filteredCategories.map(function (categoryName) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CATEGORY,
                    text: categoryName,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY: {
                var autocompleteList = autocompleteValue ? currencyAutocompleteList : (recentCurrencyAutocompleteList !== null && recentCurrencyAutocompleteList !== void 0 ? recentCurrencyAutocompleteList : []);
                var filteredCurrencies = autocompleteList
                    .filter(function (currency) { return currency.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(currency.toLowerCase()); })
                    .sort()
                    .slice(0, 10);
                return filteredCurrencies.map(function (currencyName) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CURRENCY,
                    text: currencyName,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE: {
                var filteredTaxRates = taxAutocompleteList
                    .filter(function (tax) { return tax.taxRateName.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(tax.taxRateName.toLowerCase()); })
                    .sort()
                    .slice(0, 10);
                return filteredTaxRates.map(function (tax) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAX_RATE,
                    text: tax.taxRateName,
                    autocompleteID: tax.taxRateIds.join(','),
                    mapKey: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE:
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TO:
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.FROM:
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.PAYER:
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER: {
                var filteredParticipants = getParticipantsAutocompleteList()
                    .filter(function (participant) { return participant.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(participant.name.toLowerCase()); })
                    .slice(0, 10);
                return filteredParticipants.map(function (participant) { return ({
                    filterKey: autocompleteKey,
                    text: participant.name,
                    autocompleteID: participant.accountID,
                    mapKey: autocompleteKey,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.IN: {
                var filterChats = function (chat) { var _a, _b; return ((_b = (_a = chat.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes(autocompleteValue.toLowerCase())) && !alreadyAutocompletedKeys.includes(chat.text.toLowerCase()); };
                var filteredChats = (0, OptionsListUtils_1.optionsOrderBy)(searchOptions.recentReports, 10, OptionsListUtils_1.recentReportComparator, filterChats);
                return filteredChats.map(function (chat) {
                    var _a;
                    return ({
                        filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IN,
                        text: (_a = chat.text) !== null && _a !== void 0 ? _a : '',
                        autocompleteID: chat.reportID,
                        mapKey: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.IN,
                    });
                });
            }
            case CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.TYPE: {
                var filteredTypes = typeAutocompleteList
                    .filter(function (type) { return type.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(type.toLowerCase()); })
                    .sort();
                return filteredTypes.map(function (type) { return ({ filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE, text: type }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY: {
                var filteredGroupBy = groupByAutocompleteList.filter(function (groupByValue) { return groupByValue.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(groupByValue.toLowerCase()); });
                return filteredGroupBy.map(function (groupByValue) { return ({ filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_BY, text: groupByValue }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
                var filteredStatuses = statusAutocompleteList
                    .filter(function (status) { return status.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(status); })
                    .sort()
                    .slice(0, 10);
                return filteredStatuses.map(function (status) { return ({ filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.STATUS, text: status }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE: {
                var filteredExpenseTypes = expenseTypes
                    .filter(function (expenseType) { return expenseType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(expenseType); })
                    .sort();
                return filteredExpenseTypes.map(function (expenseType) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.EXPENSE_TYPE,
                    text: expenseType,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.FEED: {
                var filteredFeeds = feedAutoCompleteList
                    .filter(function (feed) { return feed.cardFeedName.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(feed.cardFeedName.name.toLowerCase()); })
                    .sort()
                    .slice(0, 10);
                return filteredFeeds.map(function (feed) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.FEED,
                    text: feed.cardFeedName.name,
                    autocompleteID: feed.cardFeedName.type === 'domain' ? feed.cardFeedKey : (0, CardFeedUtils_1.getCardFeedKey)(workspaceCardFeeds, feed.cardFeedKey),
                    mapKey: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.FEED,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID: {
                var filteredCards = cardAutocompleteList
                    .filter(function (card) { return (0, CardUtils_1.isCard)(card) && !(0, CardUtils_1.isCardHiddenFromSearch)(card); })
                    .filter(function (card) {
                    var _a;
                    return (card.bank.toLowerCase().includes(autocompleteValue.toLowerCase()) || ((_a = card.lastFourPAN) === null || _a === void 0 ? void 0 : _a.includes(autocompleteValue))) &&
                        !alreadyAutocompletedKeys.includes((0, CardUtils_1.getCardDescription)(card.cardID).toLowerCase());
                })
                    .sort()
                    .slice(0, 10);
                return filteredCards.map(function (card) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CARD_ID,
                    text: (0, CardUtils_1.getCardDescription)(card.cardID, allCards),
                    autocompleteID: card.cardID.toString(),
                    mapKey: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE: {
                var filteredValues = booleanTypes.filter(function (value) { return value.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(value); }).sort();
                return filteredValues.map(function (value) { return ({
                    filterKey: autocompleteKey,
                    text: value,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID: {
                var filteredPolicies = workspaceList
                    .filter(function (workspace) { return workspace.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(workspace.name.toLowerCase()); })
                    .sort()
                    .slice(0, 10);
                return filteredPolicies.map(function (workspace) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID,
                    text: workspace.name,
                    autocompleteID: workspace.id,
                    mapKey: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
                }); });
            }
            case CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.ACTION: {
                return Object.values(CONST_1.default.SEARCH.ACTION_FILTERS).map(function (status) { return ({
                    filterKey: CONST_1.default.SEARCH.SEARCH_USER_FRIENDLY_KEYS.ACTION,
                    text: status,
                }); });
            }
            default: {
                return [];
            }
        }
    }, [
        autocompleteParsedQuery,
        tagAutocompleteList,
        recentTagsAutocompleteList,
        categoryAutocompleteList,
        recentCategoriesAutocompleteList,
        currencyAutocompleteList,
        recentCurrencyAutocompleteList,
        taxAutocompleteList,
        getParticipantsAutocompleteList,
        searchOptions.recentReports,
        typeAutocompleteList,
        groupByAutocompleteList,
        statusAutocompleteList,
        expenseTypes,
        feedAutoCompleteList,
        workspaceCardFeeds,
        cardAutocompleteList,
        allCards,
        booleanTypes,
        workspaceList,
    ]);
    var sortedRecentSearches = (0, react_1.useMemo)(function () {
        return Object.values(recentSearches !== null && recentSearches !== void 0 ? recentSearches : {}).sort(function (a, b) { return b.timestamp.localeCompare(a.timestamp); });
    }, [recentSearches]);
    var recentSearchesData = sortedRecentSearches === null || sortedRecentSearches === void 0 ? void 0 : sortedRecentSearches.slice(0, 5).map(function (_a) {
        var query = _a.query, timestamp = _a.timestamp;
        var searchQueryJSON = (0, SearchQueryUtils_1.buildSearchQueryJSON)(query);
        return {
            text: searchQueryJSON ? (0, SearchQueryUtils_1.buildUserReadableQueryString)(searchQueryJSON, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, policies) : query,
            singleIcon: Expensicons.History,
            searchQuery: query,
            keyForList: timestamp,
            searchItemType: CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
        };
    });
    /**
     * Builds a suffix tree and returns a function to search in it.
     */
    var _o = (0, useFastSearchFromOptions_1.default)(searchOptions, { includeUserToInvite: true }), filterOptions = _o.search, isFastSearchInitialized = _o.isInitialized;
    var recentReportsOptions = (0, react_1.useMemo)(function () {
        var actionId = "filter_options_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
        var startTime = Date.now();
        Timing_1.default.start(CONST_1.default.TIMING.SEARCH_FILTER_OPTIONS);
        Performance_1.default.markStart(CONST_1.default.TIMING.SEARCH_FILTER_OPTIONS);
        Log_1.default.info('[CMD_K_DEBUG] Filter options started', false, {
            actionId: actionId,
            queryLength: autocompleteQueryValue.length,
            queryTrimmed: autocompleteQueryValue.trim(),
            isFastSearchInitialized: isFastSearchInitialized,
            recentReportsCount: searchOptions.recentReports.length,
            timestamp: startTime,
        });
        try {
            if (autocompleteQueryValue.trim() === '' || !isFastSearchInitialized) {
                var orderedReportOptions = (0, OptionsListUtils_1.optionsOrderBy)(searchOptions.recentReports, 20, OptionsListUtils_1.recentReportComparator);
                var endTime_1 = Date.now();
                Timing_1.default.end(CONST_1.default.TIMING.SEARCH_FILTER_OPTIONS);
                Performance_1.default.markEnd(CONST_1.default.TIMING.SEARCH_FILTER_OPTIONS);
                Log_1.default.info('[CMD_K_DEBUG] Filter options completed (empty query path)', false, {
                    actionId: actionId,
                    duration: endTime_1 - startTime,
                    resultCount: orderedReportOptions.length,
                    timestamp: endTime_1,
                });
                return orderedReportOptions;
            }
            var filteredOptions = filterOptions(autocompleteQueryValue);
            var orderedOptions = (0, OptionsListUtils_1.combineOrderingOfReportsAndPersonalDetails)(filteredOptions, autocompleteQueryValue, {
                sortByReportTypeInSearch: true,
                preferChatRoomsOverThreads: true,
            });
            var reportOptions = __spreadArray(__spreadArray([], orderedOptions.recentReports, true), orderedOptions.personalDetails, true);
            if (filteredOptions.userToInvite) {
                reportOptions.push(filteredOptions.userToInvite);
            }
            var finalOptions = reportOptions.slice(0, 20);
            var endTime = Date.now();
            Timing_1.default.end(CONST_1.default.TIMING.SEARCH_FILTER_OPTIONS);
            Performance_1.default.markEnd(CONST_1.default.TIMING.SEARCH_FILTER_OPTIONS);
            Log_1.default.info('[CMD_K_DEBUG] Filter options completed (search path)', false, {
                actionId: actionId,
                duration: endTime - startTime,
                recentReportsFiltered: orderedOptions.recentReports.length,
                personalDetailsFiltered: orderedOptions.personalDetails.length,
                hasUserToInvite: !!filteredOptions.userToInvite,
                finalResultCount: finalOptions.length,
                timestamp: endTime,
            });
            return finalOptions;
        }
        catch (error) {
            var endTime = Date.now();
            Timing_1.default.end(CONST_1.default.TIMING.SEARCH_FILTER_OPTIONS);
            Performance_1.default.markEnd(CONST_1.default.TIMING.SEARCH_FILTER_OPTIONS);
            Log_1.default.alert('[CMD_K_FREEZE] Filter options failed', {
                actionId: actionId,
                error: String(error),
                duration: endTime - startTime,
                queryLength: autocompleteQueryValue.length,
                timestamp: endTime,
            });
            throw error;
        }
    }, [autocompleteQueryValue, filterOptions, searchOptions, isFastSearchInitialized]);
    var debounceHandleSearch = (0, useDebounce_1.default)((0, react_1.useCallback)(function () {
        var _a, _b;
        var actionId = "debounce_search_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
        var startTime = Date.now();
        Performance_1.default.markStart(CONST_1.default.TIMING.DEBOUNCE_HANDLE_SEARCH);
        Log_1.default.info('[CMD_K_DEBUG] Debounced search started', false, {
            actionId: actionId,
            queryLength: (_a = autocompleteQueryWithoutFilters === null || autocompleteQueryWithoutFilters === void 0 ? void 0 : autocompleteQueryWithoutFilters.length) !== null && _a !== void 0 ? _a : 0,
            hasHandleSearch: !!handleSearch,
            timestamp: startTime,
        });
        try {
            if (!handleSearch || !autocompleteQueryWithoutFilters) {
                Log_1.default.info('[CMD_K_DEBUG] Debounced search skipped - missing dependencies', false, {
                    actionId: actionId,
                    hasHandleSearch: !!handleSearch,
                    hasQuery: !!autocompleteQueryWithoutFilters,
                    timestamp: Date.now(),
                });
                return;
            }
            handleSearch(autocompleteQueryWithoutFilters);
            var endTime = Date.now();
            Performance_1.default.markEnd(CONST_1.default.TIMING.DEBOUNCE_HANDLE_SEARCH);
            Log_1.default.info('[CMD_K_DEBUG] Debounced search completed', false, {
                actionId: actionId,
                duration: endTime - startTime,
                queryLength: autocompleteQueryWithoutFilters.length,
                timestamp: endTime,
            });
        }
        catch (error) {
            var endTime = Date.now();
            Performance_1.default.markEnd(CONST_1.default.TIMING.DEBOUNCE_HANDLE_SEARCH);
            Log_1.default.alert('[CMD_K_FREEZE] Debounced search failed', {
                actionId: actionId,
                error: String(error),
                duration: endTime - startTime,
                queryLength: (_b = autocompleteQueryWithoutFilters === null || autocompleteQueryWithoutFilters === void 0 ? void 0 : autocompleteQueryWithoutFilters.length) !== null && _b !== void 0 ? _b : 0,
                timestamp: endTime,
            });
            throw error;
        }
    }, [handleSearch, autocompleteQueryWithoutFilters]), CONST_1.default.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
    (0, react_1.useEffect)(function () {
        debounceHandleSearch();
    }, [autocompleteQueryWithoutFilters, debounceHandleSearch]);
    /* Sections generation */
    var sections = [];
    if (searchQueryItem) {
        sections.push({ data: [searchQueryItem] });
    }
    var additionalSections = (0, react_1.useMemo)(function () {
        return getAdditionalSections === null || getAdditionalSections === void 0 ? void 0 : getAdditionalSections(searchOptions);
    }, [getAdditionalSections, searchOptions]);
    if (additionalSections) {
        sections.push.apply(sections, additionalSections);
    }
    if (!autocompleteQueryValue && recentSearchesData && recentSearchesData.length > 0) {
        sections.push({ title: translate('search.recentSearches'), data: recentSearchesData });
    }
    var styledRecentReports = recentReportsOptions.map(function (item) { return (__assign(__assign({}, item), { pressableStyle: styles.br2, text: StringUtils_1.default.lineBreaksToSpaces(item.text), wrapperStyle: [styles.pr3, styles.pl3] })); });
    sections.push({ title: autocompleteQueryValue.trim() === '' ? translate('search.recentChats') : undefined, data: styledRecentReports });
    if (autocompleteSuggestions.length > 0) {
        var autocompleteData = autocompleteSuggestions.map(function (_a) {
            var filterKey = _a.filterKey, text = _a.text, autocompleteID = _a.autocompleteID, mapKey = _a.mapKey;
            return {
                text: getAutocompleteDisplayText(filterKey, text),
                mapKey: mapKey ? (0, getQueryWithSubstitutions_1.getSubstitutionMapKey)(mapKey, text) : undefined,
                singleIcon: Expensicons.MagnifyingGlass,
                searchQuery: text,
                autocompleteID: autocompleteID,
                keyForList: autocompleteID !== null && autocompleteID !== void 0 ? autocompleteID : text, // in case we have a unique identifier then use it because text might not be unique
                searchItemType: CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION,
            };
        });
        sections.push({ title: translate('search.suggestions'), data: autocompleteData });
    }
    var onArrowFocus = (0, react_1.useCallback)(function (focusedItem) {
        if (!(0, SearchQueryListItem_1.isSearchQueryItem)(focusedItem) || !focusedItem.searchQuery || (focusedItem === null || focusedItem === void 0 ? void 0 : focusedItem.searchItemType) !== CONST_1.default.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION) {
            return;
        }
        var trimmedUserSearchQuery = (0, SearchAutocompleteUtils_1.getQueryWithoutAutocompletedPart)(autocompleteQueryValue);
        setTextQuery("".concat(trimmedUserSearchQuery).concat((0, SearchQueryUtils_1.sanitizeSearchValue)(focusedItem.searchQuery), "\u00A0"));
        updateAutocompleteSubstitutions(focusedItem);
    }, [autocompleteQueryValue, setTextQuery, updateAutocompleteSubstitutions]);
    var sectionItemText = (_e = (_d = (_c = (_b = sections === null || sections === void 0 ? void 0 : sections.at(1)) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.text) !== null && _e !== void 0 ? _e : '';
    var normalizedReferenceText = (0, react_1.useMemo)(function () { return sectionItemText.toLowerCase(); }, [sectionItemText]);
    (0, react_1.useEffect)(function () {
        var targetText = autocompleteQueryValue;
        if ((0, SearchQueryUtils_1.shouldHighlight)(normalizedReferenceText, targetText)) {
            onHighlightFirstItem === null || onHighlightFirstItem === void 0 ? void 0 : onHighlightFirstItem();
        }
    }, [autocompleteQueryValue, onHighlightFirstItem, normalizedReferenceText]);
    return (
    // On page refresh, when the list is rendered before options are initialized the auto-focusing on initiallyFocusedOptionKey
    // will fail because the list will be empty on first render so we only render after options are initialized.
    areOptionsInitialized && (<SelectionList_1.default showLoadingPlaceholder={!areOptionsInitialized} fixedNumItemsForLoader={4} loaderSpeed={CONST_1.default.TIMING.SKELETON_ANIMATION_SPEED} sections={sections} onSelectRow={onListItemPress} ListItem={SearchRouterItem} containerStyle={[styles.mh100]} sectionListStyle={[styles.ph2, styles.pb2, styles.overscrollBehaviorContain]} listItemWrapperStyle={[styles.pr0, styles.pl0]} getItemHeight={getItemHeight} onLayout={function () {
            var _a, _b;
            setPerformanceTimersEnd();
            setIsInitialRender(false);
            if (!!(textInputRef === null || textInputRef === void 0 ? void 0 : textInputRef.current) && ref && 'current' in ref) {
                (_b = (_a = ref.current) === null || _a === void 0 ? void 0 : _a.updateExternalTextInputFocus) === null || _b === void 0 ? void 0 : _b.call(_a, textInputRef.current.isFocused());
            }
        }} showScrollIndicator={!shouldUseNarrowLayout} sectionTitleStyles={styles.mhn2} shouldSingleExecuteRowSelect onArrowFocus={onArrowFocus} ref={ref} initiallyFocusedOptionKey={!shouldUseNarrowLayout ? (_f = styledRecentReports.at(0)) === null || _f === void 0 ? void 0 : _f.keyForList : undefined} shouldScrollToFocusedIndex={!isInitialRender} shouldSubscribeToArrowKeyEvents={shouldSubscribeToArrowKeyEvents} disableKeyboardShortcuts={!shouldSubscribeToArrowKeyEvents} addBottomSafeAreaPadding/>));
}
exports.default = (0, react_1.forwardRef)(SearchAutocompleteList);

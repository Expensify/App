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
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var Expensicons = require("@components/Icon/Expensicons");
var OnyxProvider_1 = require("@components/OnyxProvider");
var ScrollView_1 = require("@components/ScrollView");
var DateSelectPopup_1 = require("@components/Search/FilterDropdowns/DateSelectPopup");
var DropdownButton_1 = require("@components/Search/FilterDropdowns/DropdownButton");
var MultiSelectPopup_1 = require("@components/Search/FilterDropdowns/MultiSelectPopup");
var SingleSelectPopup_1 = require("@components/Search/FilterDropdowns/SingleSelectPopup");
var UserSelectPopup_1 = require("@components/Search/FilterDropdowns/UserSelectPopup");
var SearchContext_1 = require("@components/Search/SearchContext");
var SearchFiltersSkeleton_1 = require("@components/Skeletons/SearchFiltersSkeleton");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Modal_1 = require("@libs/actions/Modal");
var Search_1 = require("@libs/actions/Search");
var CardUtils_1 = require("@libs/CardUtils");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersBar(_a) {
    var queryJSON = _a.queryJSON, headerButtonsOptions = _a.headerButtonsOptions;
    var scrollRef = (0, react_1.useRef)(null);
    // type, groupBy and status values are not guaranteed to respect the ts type as they come from user input
    var hash = queryJSON.hash, unsafeType = queryJSON.type, unsafeGroupBy = queryJSON.groupBy, unsafeStatus = queryJSON.status;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isDevelopment = (0, useEnvironment_1.default)().isDevelopment;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _b = (0, SearchContext_1.useSearchContext)(), selectedTransactions = _b.selectedTransactions, setExportMode = _b.setExportMode, isExportMode = _b.isExportMode, shouldShowExportModeOption = _b.shouldShowExportModeOption, shouldShowFiltersBarLoading = _b.shouldShowFiltersBarLoading;
    var email = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true, selector: function (onyxSession) { return onyxSession === null || onyxSession === void 0 ? void 0 : onyxSession.email; } })[0];
    var userCardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: true })[0], currencyList = _c === void 0 ? {} : _c;
    var policyTagsLists = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS, { canBeMissing: true })[0];
    var policyCategories = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES, { canBeMissing: true })[0];
    var workspaceCardFeeds = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, { canBeMissing: true })[0];
    var selectionMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.MOBILE_SELECTION_MODE, { canBeMissing: true })[0];
    var searchResultsErrors = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash), { canBeMissing: true, selector: function (data) { return data === null || data === void 0 ? void 0 : data.errors; } })[0];
    var taxRates = (0, PolicyUtils_1.getAllTaxRates)();
    var allCards = (0, react_1.useMemo)(function () { return (0, CardUtils_1.mergeCardListWithWorkspaceFeeds)(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : CONST_1.default.EMPTY_OBJECT, userCardList); }, [userCardList, workspaceCardFeeds]);
    var selectedTransactionsKeys = (0, react_1.useMemo)(function () { return Object.keys(selectedTransactions !== null && selectedTransactions !== void 0 ? selectedTransactions : {}); }, [selectedTransactions]);
    var hasErrors = Object.keys(searchResultsErrors !== null && searchResultsErrors !== void 0 ? searchResultsErrors : {}).length > 0 && !isOffline;
    var shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || (!!selectionMode && selectionMode.isEnabled));
    var _d = (0, react_1.useMemo)(function () {
        var _a;
        var options = (0, SearchUIUtils_1.getTypeOptions)(allPolicies, email);
        var value = (_a = options.find(function (option) { return option.value === unsafeType; })) !== null && _a !== void 0 ? _a : null;
        return [options, value];
    }, [allPolicies, email, unsafeType]), typeOptions = _d[0], type = _d[1];
    var _e = (0, react_1.useMemo)(function () {
        var _a;
        var options = (0, SearchUIUtils_1.getGroupByOptions)();
        var value = (_a = options.find(function (option) { return option.value === unsafeGroupBy; })) !== null && _a !== void 0 ? _a : null;
        return [options, value];
    }, [unsafeGroupBy]), groupByOptions = _e[0], groupBy = _e[1];
    var _f = (0, react_1.useMemo)(function () {
        var _a;
        var options = type ? (0, SearchUIUtils_1.getStatusOptions)(type.value, groupBy === null || groupBy === void 0 ? void 0 : groupBy.value) : [];
        var value = [
            Array.isArray(unsafeStatus) ? options.filter(function (option) { return unsafeStatus.includes(option.value); }) : ((_a = options.find(function (option) { return option.value === unsafeStatus; })) !== null && _a !== void 0 ? _a : []),
        ].flat();
        return [options, value];
    }, [unsafeStatus, type, groupBy]), statusOptions = _f[0], status = _f[1];
    var filterFormValues = (0, react_1.useMemo)(function () {
        return (0, SearchQueryUtils_1.buildFilterFormValuesFromQuery)(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);
    }, [allCards, currencyList, personalDetails, policyCategories, policyTagsLists, queryJSON, reports, taxRates]);
    var updateFilterForm = (0, react_1.useCallback)(function (values) {
        var updatedFilterFormValues = __assign(__assign({}, filterFormValues), values);
        // If the type has changed, reset the status so we dont have an invalid status selected
        if (updatedFilterFormValues.type !== filterFormValues.type) {
            updatedFilterFormValues.status = CONST_1.default.SEARCH.STATUS.EXPENSE.ALL;
        }
        var filterString = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)(updatedFilterFormValues);
        var searchQueryJSON = (0, SearchQueryUtils_1.buildSearchQueryJSON)(filterString);
        var queryString = (0, SearchQueryUtils_1.buildSearchQueryString)(searchQueryJSON);
        (0, Modal_1.close)(function () {
            Navigation_1.default.setParams({ q: queryString });
        });
    }, [filterFormValues]);
    var openAdvancedFilters = (0, react_1.useCallback)(function () {
        (0, Search_1.updateAdvancedFilters)(filterFormValues);
        Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    }, [filterFormValues]);
    var typeComponent = (0, react_1.useCallback)(function (_a) {
        var closeOverlay = _a.closeOverlay;
        return (<SingleSelectPopup_1.default label={translate('common.type')} value={type} items={typeOptions} closeOverlay={closeOverlay} onChange={function (item) { var _a; return updateFilterForm({ type: (_a = item === null || item === void 0 ? void 0 : item.value) !== null && _a !== void 0 ? _a : CONST_1.default.SEARCH.DATA_TYPES.EXPENSE }); }}/>);
    }, [translate, typeOptions, type, updateFilterForm]);
    var groupByComponent = (0, react_1.useCallback)(function (_a) {
        var closeOverlay = _a.closeOverlay;
        return (<SingleSelectPopup_1.default label={translate('search.groupBy')} items={groupByOptions} value={groupBy} closeOverlay={closeOverlay} onChange={function (item) { return updateFilterForm({ groupBy: item === null || item === void 0 ? void 0 : item.value }); }}/>);
    }, [translate, groupByOptions, groupBy, updateFilterForm]);
    var statusComponent = (0, react_1.useCallback)(function (_a) {
        var closeOverlay = _a.closeOverlay;
        var onChange = function (selectedItems) {
            var newStatus = selectedItems.length ? selectedItems.map(function (i) { return i.value; }) : CONST_1.default.SEARCH.STATUS.EXPENSE.ALL;
            updateFilterForm({ status: newStatus });
        };
        return (<MultiSelectPopup_1.default label={translate('common.status')} items={statusOptions} value={status} closeOverlay={closeOverlay} onChange={onChange}/>);
    }, [statusOptions, status, translate, updateFilterForm]);
    var datePickerComponent = (0, react_1.useCallback)(function (_a) {
        var _b;
        var _c, _d, _e;
        var closeOverlay = _a.closeOverlay;
        var value = (_b = {},
            _b[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER] = (_c = filterFormValues.dateAfter) !== null && _c !== void 0 ? _c : null,
            _b[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE] = (_d = filterFormValues.dateBefore) !== null && _d !== void 0 ? _d : null,
            _b[CONST_1.default.SEARCH.DATE_MODIFIERS.ON] = (_e = filterFormValues.dateOn) !== null && _e !== void 0 ? _e : null,
            _b);
        var onChange = function (selectedDates) {
            var _a, _b, _c;
            var dateFormValues = {
                dateAfter: (_a = selectedDates[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER]) !== null && _a !== void 0 ? _a : undefined,
                dateBefore: (_b = selectedDates[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE]) !== null && _b !== void 0 ? _b : undefined,
                dateOn: (_c = selectedDates[CONST_1.default.SEARCH.DATE_MODIFIERS.ON]) !== null && _c !== void 0 ? _c : undefined,
            };
            updateFilterForm(dateFormValues);
        };
        return (<DateSelectPopup_1.default closeOverlay={closeOverlay} value={value} onChange={onChange}/>);
    }, [filterFormValues.dateAfter, filterFormValues.dateBefore, filterFormValues.dateOn, updateFilterForm]);
    var userPickerComponent = (0, react_1.useCallback)(function (_a) {
        var _b;
        var closeOverlay = _a.closeOverlay;
        var value = (_b = filterFormValues.from) !== null && _b !== void 0 ? _b : [];
        return (<UserSelectPopup_1.default value={value} closeOverlay={closeOverlay} onChange={function (selectedUsers) { return updateFilterForm({ from: selectedUsers }); }}/>);
    }, [filterFormValues.from, updateFilterForm]);
    /**
     * Builds the list of all filter chips to be displayed in the
     * filter bar
     */
    var filters = (0, react_1.useMemo)(function () {
        var _a, _b;
        var dateValue = [
            filterFormValues.dateAfter ? "".concat(translate('common.after'), " ").concat(DateUtils_1.default.formatToReadableString(filterFormValues.dateAfter)) : null,
            filterFormValues.dateBefore ? "".concat(translate('common.before'), " ").concat(DateUtils_1.default.formatToReadableString(filterFormValues.dateBefore)) : null,
            filterFormValues.dateOn ? "".concat(translate('common.on'), " ").concat(DateUtils_1.default.formatToReadableString(filterFormValues.dateOn)) : null,
        ].filter(Boolean);
        var fromValue = (_b = (_a = filterFormValues.from) === null || _a === void 0 ? void 0 : _a.map(function (accountID) { var _a, _b; return (_b = (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.displayName) !== null && _b !== void 0 ? _b : accountID; })) !== null && _b !== void 0 ? _b : [];
        var filterList = __spreadArray(__spreadArray([
            {
                label: translate('common.type'),
                PopoverComponent: typeComponent,
                value: type ? translate(type.translation) : null,
                keyForList: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
            }
        ], (isDevelopment
            ? [
                {
                    label: translate('search.groupBy'),
                    PopoverComponent: groupByComponent,
                    value: groupBy ? translate(groupBy.translation) : null,
                    keyForList: CONST_1.default.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY,
                },
            ]
            : []), true), [
            {
                label: translate('common.status'),
                PopoverComponent: statusComponent,
                value: status.map(function (option) { return translate(option.translation); }),
                keyForList: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
            },
            {
                label: translate('common.date'),
                PopoverComponent: datePickerComponent,
                value: dateValue,
                keyForList: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            },
            {
                label: translate('common.from'),
                PopoverComponent: userPickerComponent,
                value: fromValue,
                keyForList: CONST_1.default.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            },
        ], false).filter(function (filterItem) { var _a; return (0, SearchQueryUtils_1.isFilterSupported)(filterItem.keyForList, (_a = type === null || type === void 0 ? void 0 : type.value) !== null && _a !== void 0 ? _a : CONST_1.default.SEARCH.DATA_TYPES.EXPENSE); });
        return filterList;
    }, [
        type,
        groupBy,
        filterFormValues.dateAfter,
        filterFormValues.dateBefore,
        filterFormValues.dateOn,
        filterFormValues.from,
        translate,
        typeComponent,
        groupByComponent,
        statusComponent,
        datePickerComponent,
        userPickerComponent,
        status,
        personalDetails,
        isDevelopment,
    ]);
    if (hasErrors) {
        return null;
    }
    if (shouldShowFiltersBarLoading) {
        return <SearchFiltersSkeleton_1.default shouldAnimate/>;
    }
    var selectionButtonText = isExportMode ? translate('search.exportAll.allMatchingItemsSelected') : translate('workspace.common.selected', { count: selectedTransactionsKeys.length });
    return (<react_native_1.View style={[shouldShowSelectedDropdown && styles.ph5, styles.mb2, styles.searchFiltersBarContainer]}>
            {shouldShowSelectedDropdown ? (<react_native_1.View style={[styles.flexRow, styles.gap3]}>
                    <ButtonWithDropdownMenu_1.default onPress={function () { return null; }} shouldAlwaysShowDropdownMenu buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.SMALL} customText={selectionButtonText} options={headerButtonsOptions} isSplitButton={false} anchorAlignment={{
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }} popoverHorizontalOffsetType={CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT}/>
                    {!isExportMode && shouldShowExportModeOption && (<Button_1.default link small shouldUseDefaultHover={false} innerStyles={styles.p0} onPress={function () { return setExportMode(true); }} text={translate('search.exportAll.selectAllMatchingItems')}/>)}
                </react_native_1.View>) : (<ScrollView_1.default horizontal keyboardShouldPersistTaps="always" style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]} contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]} ref={scrollRef} showsHorizontalScrollIndicator={false}>
                    {filters.map(function (filter) { return (<DropdownButton_1.default key={filter.label} label={filter.label} value={filter.value} PopoverComponent={filter.PopoverComponent}/>); })}

                    <Button_1.default link small shouldUseDefaultHover={false} text={translate('search.filtersHeader')} iconFill={theme.link} iconHoverFill={theme.linkHover} icon={Expensicons.Filter} textStyles={[styles.textMicroBold]} onPress={openAdvancedFilters}/>
                </ScrollView_1.default>)}
        </react_native_1.View>);
}
SearchFiltersBar.displayName = 'SearchFiltersBar';
exports.default = SearchFiltersBar;

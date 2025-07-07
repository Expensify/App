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
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemList_1 = require("@components/MenuItemList");
var OnyxProvider_1 = require("@components/OnyxProvider");
var ProductTrainingContext_1 = require("@components/ProductTrainingContext");
var ScrollOffsetContextProvider_1 = require("@components/ScrollOffsetContextProvider");
var ScrollView_1 = require("@components/ScrollView");
var SearchContext_1 = require("@components/Search/SearchContext");
var Text_1 = require("@components/Text");
var useDeleteSavedSearch_1 = require("@hooks/useDeleteSavedSearch");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var CardFeedUtils_1 = require("@libs/CardFeedUtils");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var variables_1 = require("@styles/variables");
var Expensicons = require("@src/components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SavedSearchItemThreeDotMenu_1 = require("./SavedSearchItemThreeDotMenu");
function SearchTypeMenu(_a) {
    var queryJSON = _a.queryJSON;
    var hash = (queryJSON !== null && queryJSON !== void 0 ? queryJSON : {}).hash;
    var styles = (0, useThemeStyles_1.default)();
    var singleExecution = (0, useSingleExecution_1.default)().singleExecution;
    var translate = (0, useLocalize_1.default)().translate;
    var savedSearches = (0, useOnyx_1.default)(ONYXKEYS_1.default.SAVED_SEARCHES, { canBeMissing: true })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldShowSavedSearchesMenuItemTitle = Object.values(savedSearches !== null && savedSearches !== void 0 ? savedSearches : {}).filter(function (s) { return s.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline; }).length > 0;
    var isFocused = (0, native_1.useIsFocused)();
    var _b = (0, ProductTrainingContext_1.useProductTrainingContext)(CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH, shouldShowSavedSearchesMenuItemTitle && isFocused), shouldShowSavedSearchTooltip = _b.shouldShowProductTrainingTooltip, renderSavedSearchTooltip = _b.renderProductTrainingTooltip, hideSavedSearchTooltip = _b.hideProductTrainingTooltip;
    var _c = (0, ProductTrainingContext_1.useProductTrainingContext)(CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.EXPENSE_REPORTS_FILTER, true), shouldShowExpenseReportsTypeTooltip = _c.shouldShowProductTrainingTooltip, renderExpenseReportsTypeTooltip = _c.renderProductTrainingTooltip, hideExpenseReportsTypeTooltip = _c.hideProductTrainingTooltip;
    var _d = (0, useDeleteSavedSearch_1.default)(), showDeleteModal = _d.showDeleteModal, DeleteConfirmModal = _d.DeleteConfirmModal;
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var userCardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var workspaceCardFeeds = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, { canBeMissing: true })[0];
    var _e = (0, react_1.useMemo)(function () {
        var mergedCards = (0, CardUtils_1.mergeCardListWithWorkspaceFeeds)(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : CONST_1.default.EMPTY_OBJECT, userCardList);
        return [mergedCards, Object.keys(mergedCards).length > 0];
    }, [userCardList, workspaceCardFeeds]), allCards = _e[0], hasCardFeed = _e[1];
    var taxRates = (0, PolicyUtils_1.getAllTaxRates)();
    var clearSelectedTransactions = (0, SearchContext_1.useSearchContext)().clearSelectedTransactions;
    var initialSearchKeys = (0, react_1.useRef)([]);
    var cardFeedNamesWithType = (0, react_1.useMemo)(function () {
        return (0, CardFeedUtils_1.getCardFeedNamesWithType)({ workspaceCardFeeds: workspaceCardFeeds, translate: translate });
    }, [translate, workspaceCardFeeds]);
    var typeMenuSections = (0, react_1.useMemo)(function () {
        var sections = (0, SearchUIUtils_1.createTypeMenuSections)(session, hasCardFeed, allPolicies);
        // The first time we render all of the sections the user can see, we need to mark these as 'rendered', such that we dont animate them in
        // We only animate in items that a user gains access to later on
        if (!initialSearchKeys.current.length) {
            initialSearchKeys.current = sections.flatMap(function (section) { return section.menuItems.map(function (item) { return item.translationPath; }); });
        }
        return sections;
    }, [session, hasCardFeed, allPolicies]);
    var getOverflowMenu = (0, react_1.useCallback)(function (itemName, itemHash, itemQuery) { return (0, SearchUIUtils_1.getOverflowMenu)(itemName, itemHash, itemQuery, showDeleteModal); }, [showDeleteModal]);
    var createSavedSearchMenuItem = (0, react_1.useCallback)(function (item, key, index) {
        var _a;
        var title = item.name;
        if (title === item.query) {
            var jsonQuery = (_a = (0, SearchQueryUtils_1.buildSearchQueryJSON)(item.query)) !== null && _a !== void 0 ? _a : {};
            title = (0, SearchQueryUtils_1.buildUserReadableQueryString)(jsonQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies);
        }
        var isItemFocused = Number(key) === hash;
        var baseMenuItem = (0, SearchUIUtils_1.createBaseSavedSearchMenuItem)(item, key, index, title, isItemFocused);
        return __assign(__assign({}, baseMenuItem), { onPress: function () {
                var _a;
                (0, Search_1.clearAllFilters)();
                Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: (_a = item === null || item === void 0 ? void 0 : item.query) !== null && _a !== void 0 ? _a : '', name: item === null || item === void 0 ? void 0 : item.name }));
            }, rightComponent: (<SavedSearchItemThreeDotMenu_1.default menuItems={getOverflowMenu(title, Number(key), item.query)} isDisabledItem={item.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE} hideProductTrainingTooltip={index === 0 && shouldShowSavedSearchTooltip ? hideSavedSearchTooltip : undefined} shouldRenderTooltip={index === 0 && shouldShowSavedSearchTooltip} renderTooltipContent={renderSavedSearchTooltip}/>), style: [styles.alignItemsCenter], tooltipAnchorAlignment: {
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }, tooltipShiftHorizontal: variables_1.default.savedSearchShiftHorizontal, tooltipShiftVertical: variables_1.default.savedSearchShiftVertical, tooltipWrapperStyle: [styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper], renderTooltipContent: renderSavedSearchTooltip });
    }, [
        hash,
        getOverflowMenu,
        shouldShowSavedSearchTooltip,
        hideSavedSearchTooltip,
        renderSavedSearchTooltip,
        styles.alignItemsCenter,
        styles.mh4,
        styles.pv2,
        styles.productTrainingTooltipWrapper,
        personalDetails,
        reports,
        taxRates,
        allCards,
        cardFeedNamesWithType,
        allPolicies,
    ]);
    var route = (0, native_1.useRoute)();
    var scrollViewRef = (0, react_1.useRef)(null);
    var _f = (0, react_1.useContext)(ScrollOffsetContextProvider_1.ScrollOffsetContext), saveScrollOffset = _f.saveScrollOffset, getScrollOffset = _f.getScrollOffset;
    var onScroll = (0, react_1.useCallback)(function (e) {
        // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
    }, [route, saveScrollOffset]);
    (0, react_1.useLayoutEffect)(function () {
        var scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({ y: scrollOffset, animated: false });
    }, [getScrollOffset, route]);
    var _g = (0, react_1.useMemo)(function () {
        var savedSearchFocused = false;
        if (!savedSearches) {
            return {
                isSavedSearchActive: false,
                savedSearchesMenuItems: [],
            };
        }
        var menuItems = Object.entries(savedSearches).map(function (_a, index) {
            var key = _a[0], item = _a[1];
            var baseMenuItem = createSavedSearchMenuItem(item, key, index);
            savedSearchFocused || (savedSearchFocused = !!baseMenuItem.focused);
            return baseMenuItem;
        });
        return {
            savedSearchesMenuItems: menuItems,
            isSavedSearchActive: savedSearchFocused,
        };
    }, [createSavedSearchMenuItem, savedSearches]), savedSearchesMenuItems = _g.savedSearchesMenuItems, isSavedSearchActive = _g.isSavedSearchActive;
    var renderSavedSearchesSection = (0, react_1.useCallback)(function (menuItems) { return (<react_native_1.View style={[styles.pb4]}>
                <MenuItemList_1.default menuItems={menuItems} wrapperStyle={styles.sectionMenuItem} icon={Expensicons.Bookmark} iconWidth={variables_1.default.iconSizeNormal} iconHeight={variables_1.default.iconSizeNormal} shouldUseSingleExecution/>
            </react_native_1.View>); }, [styles]);
    var activeItemIndex = (0, react_1.useMemo)(function () {
        // If we have a suggested search, then none of the menu items are active
        if (isSavedSearchActive) {
            return -1;
        }
        var flattenedMenuItems = typeMenuSections.map(function (section) { return section.menuItems; }).flat();
        return flattenedMenuItems.findIndex(function (item) {
            var searchQueryJSON = (0, SearchQueryUtils_1.buildSearchQueryJSON)(item.getSearchQuery());
            return (searchQueryJSON === null || searchQueryJSON === void 0 ? void 0 : searchQueryJSON.hash) === hash;
        });
    }, [hash, isSavedSearchActive, typeMenuSections]);
    return (<ScrollView_1.default onScroll={onScroll} ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            <react_native_1.View style={[styles.pb4, styles.mh3, styles.gap4]}>
                {typeMenuSections.map(function (section, sectionIndex) { return (<react_native_1.View key={section.translationPath}>
                        <Text_1.default style={styles.sectionTitle}>{translate(section.translationPath)}</Text_1.default>

                        {section.menuItems.map(function (item, itemIndex) {
                var previousItemCount = typeMenuSections.slice(0, sectionIndex).reduce(function (acc, sec) { return acc + sec.menuItems.length; }, 0);
                var flattenedIndex = previousItemCount + itemIndex;
                var focused = activeItemIndex === flattenedIndex;
                var shouldShowTooltip = item.translationPath === 'common.reports' && !focused && shouldShowExpenseReportsTypeTooltip;
                var onPress = singleExecution(function () {
                    if (shouldShowTooltip) {
                        hideExpenseReportsTypeTooltip();
                    }
                    (0, Search_1.clearAllFilters)();
                    clearSelectedTransactions();
                    Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: item.getSearchQuery() }));
                });
                var isInitialItem = initialSearchKeys.current.includes(item.translationPath);
                return (<react_native_reanimated_1.default.View key={item.translationPath} entering={!isInitialItem ? react_native_reanimated_1.FadeIn : undefined}>
                                    <MenuItem_1.default disabled={false} interactive title={translate(item.translationPath)} icon={item.icon} iconWidth={variables_1.default.iconSizeNormal} iconHeight={variables_1.default.iconSizeNormal} wrapperStyle={styles.sectionMenuItem} focused={focused} onPress={onPress} shouldIconUseAutoWidthStyle shouldRenderTooltip={shouldShowTooltip} renderTooltipContent={renderExpenseReportsTypeTooltip} tooltipAnchorAlignment={{
                        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }} tooltipShiftHorizontal={variables_1.default.expenseReportsTypeTooltipShiftHorizontal} tooltipWrapperStyle={styles.productTrainingTooltipWrapper} onEducationTooltipPress={onPress}/>
                                </react_native_reanimated_1.default.View>);
            })}
                    </react_native_1.View>); })}
                {shouldShowSavedSearchesMenuItemTitle && (<react_native_1.View>
                        <Text_1.default style={styles.sectionTitle}>{translate('search.savedSearchesMenuItemTitle')}</Text_1.default>
                        {renderSavedSearchesSection(savedSearchesMenuItems)}
                        <DeleteConfirmModal />
                    </react_native_1.View>)}
            </react_native_1.View>
        </ScrollView_1.default>);
}
SearchTypeMenu.displayName = 'SearchTypeMenu';
exports.default = SearchTypeMenu;

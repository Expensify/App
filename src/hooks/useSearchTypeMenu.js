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
exports.default = useSearchTypeMenu;
var react_1 = require("react");
var react_native_1 = require("react-native");
var OnyxProvider_1 = require("@components/OnyxProvider");
var ThreeDotsMenu_1 = require("@components/ThreeDotsMenu");
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
var useDeleteSavedSearch_1 = require("./useDeleteSavedSearch");
var useLocalize_1 = require("./useLocalize");
var useOnyx_1 = require("./useOnyx");
var useSingleExecution_1 = require("./useSingleExecution");
var useTheme_1 = require("./useTheme");
var useThemeStyles_1 = require("./useThemeStyles");
var useWindowDimensions_1 = require("./useWindowDimensions");
function useSearchTypeMenu(queryJSON) {
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var singleExecution = (0, useSingleExecution_1.default)().singleExecution;
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var translate = (0, useLocalize_1.default)().translate;
    var hash = queryJSON.hash;
    var _a = (0, useDeleteSavedSearch_1.default)(), showDeleteModal = _a.showDeleteModal, DeleteConfirmModal = _a.DeleteConfirmModal;
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true })[0], reports = _b === void 0 ? {} : _b;
    var taxRates = (0, PolicyUtils_1.getAllTaxRates)();
    var userCardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var workspaceCardFeeds = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, { canBeMissing: true })[0];
    var savedSearches = (0, useOnyx_1.default)(ONYXKEYS_1.default.SAVED_SEARCHES, { canBeMissing: true })[0];
    var _c = (0, react_1.useState)(false), isPopoverVisible = _c[0], setIsPopoverVisible = _c[1];
    var _d = (0, react_1.useState)([]), processedMenuItems = _d[0], setProcessedMenuItems = _d[1];
    var _e = (0, react_1.useMemo)(function () {
        var mergedCards = (0, CardUtils_1.mergeCardListWithWorkspaceFeeds)(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : CONST_1.default.EMPTY_OBJECT, userCardList);
        return [mergedCards, Object.keys(mergedCards).length > 0];
    }, [userCardList, workspaceCardFeeds]), allCards = _e[0], hasCardFeed = _e[1];
    var cardFeedNamesWithType = (0, react_1.useMemo)(function () { return (0, CardFeedUtils_1.getCardFeedNamesWithType)({ workspaceCardFeeds: workspaceCardFeeds, translate: translate }); }, [workspaceCardFeeds, translate]);
    var typeMenuSections = (0, react_1.useMemo)(function () { return (0, SearchUIUtils_1.createTypeMenuSections)(session, hasCardFeed, allPolicies); }, [session, hasCardFeed, allPolicies]);
    // this is a performance fix, rendering popover menu takes a lot of time and we don't need this component initially, that's why we postpone rendering it until everything else is rendered
    var _f = (0, react_1.useState)(true), delayPopoverMenuFirstRender = _f[0], setDelayPopoverMenuFirstRender = _f[1];
    (0, react_1.useEffect)(function () {
        setTimeout(function () {
            setDelayPopoverMenuFirstRender(false);
        }, 100);
    }, []);
    var closeMenu = (0, react_1.useCallback)(function () {
        setIsPopoverVisible(false);
    }, []);
    var getOverflowMenu = (0, react_1.useCallback)(function (itemName, itemHash, itemQuery) { return (0, SearchUIUtils_1.getOverflowMenu)(itemName, itemHash, itemQuery, showDeleteModal, true, closeMenu); }, [showDeleteModal, closeMenu]);
    var _g = (0, react_1.useMemo)(function () {
        var savedSearchFocused = false;
        if (!savedSearches) {
            return {
                isSavedSearchActive: false,
                savedSearchesMenuItems: [],
            };
        }
        var menuItems = Object.entries(savedSearches).map(function (_a, index) {
            var _b, _c, _d, _e;
            var key = _a[0], item = _a[1];
            var savedSearchTitle = item.name;
            if (savedSearchTitle === item.query) {
                var jsonQuery = (_b = (0, SearchQueryUtils_1.buildSearchQueryJSON)(item.query)) !== null && _b !== void 0 ? _b : {};
                savedSearchTitle = (0, SearchQueryUtils_1.buildUserReadableQueryString)(jsonQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies);
            }
            var isItemFocused = Number(key) === hash;
            var baseMenuItem = (0, SearchUIUtils_1.createBaseSavedSearchMenuItem)(item, key, index, savedSearchTitle, isItemFocused);
            savedSearchFocused || (savedSearchFocused = isItemFocused);
            return __assign(__assign({}, baseMenuItem), { onSelected: function () {
                    var _a;
                    (0, Search_1.clearAllFilters)();
                    Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: (_a = item === null || item === void 0 ? void 0 : item.query) !== null && _a !== void 0 ? _a : '', name: item === null || item === void 0 ? void 0 : item.name }));
                }, rightComponent: (<ThreeDotsMenu_1.default menuItems={getOverflowMenu((_c = baseMenuItem.title) !== null && _c !== void 0 ? _c : '', Number((_d = baseMenuItem.hash) !== null && _d !== void 0 ? _d : ''), (_e = item.query) !== null && _e !== void 0 ? _e : '')} anchorPosition={{ horizontal: 0, vertical: 380 }} anchorAlignment={{
                        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }} disabled={item.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE}/>), styles: [styles.textSupporting], isSelected: false, shouldCallAfterModalHide: true, icon: Expensicons.Bookmark, iconWidth: variables_1.default.iconSizeNormal, iconHeight: variables_1.default.iconSizeNormal, shouldIconUseAutoWidthStyle: false });
        });
        return {
            savedSearchesMenuItems: menuItems,
            isSavedSearchActive: savedSearchFocused,
        };
    }, [savedSearches, hash, getOverflowMenu, styles.textSupporting, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies]), savedSearchesMenuItems = _g.savedSearchesMenuItems, isSavedSearchActive = _g.isSavedSearchActive;
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
    var popoverMenuItems = (0, react_1.useMemo)(function () {
        return typeMenuSections
            .map(function (section, sectionIndex) {
            var sectionItems = [
                {
                    shouldShowBasicTitle: true,
                    text: translate(section.translationPath),
                    style: [styles.textSupporting],
                    disabled: true,
                },
            ];
            section.menuItems.forEach(function (item, itemIndex) {
                var previousItemCount = typeMenuSections.slice(0, sectionIndex).reduce(function (acc, sec) { return acc + sec.menuItems.length; }, 0);
                var flattenedIndex = previousItemCount + itemIndex;
                var isSelected = flattenedIndex === activeItemIndex;
                sectionItems.push(__assign(__assign({ text: translate(item.translationPath), isSelected: isSelected, icon: item.icon }, (isSelected ? { iconFill: theme.iconSuccessFill } : {})), { iconRight: Expensicons.Checkmark, shouldShowRightIcon: isSelected, success: isSelected, containerStyle: isSelected ? [{ backgroundColor: theme.border }] : undefined, shouldCallAfterModalHide: true, onSelected: singleExecution(function () {
                        (0, Search_1.clearAllFilters)();
                        Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: item.getSearchQuery() }));
                    }) }));
            });
            return sectionItems;
        })
            .flat();
    }, [typeMenuSections, translate, styles.textSupporting, activeItemIndex, theme.iconSuccessFill, theme.icon, theme.border, singleExecution]);
    var processSavedSearches = (0, react_1.useCallback)(function () {
        if (!savedSearches) {
            setProcessedMenuItems(popoverMenuItems);
            return;
        }
        var items = [];
        items.push.apply(items, popoverMenuItems);
        if (savedSearchesMenuItems.length > 0) {
            items.push({
                shouldShowBasicTitle: true,
                text: translate('search.savedSearchesMenuItemTitle'),
                styles: [styles.textSupporting],
                disabled: true,
            });
            items.push.apply(items, savedSearchesMenuItems);
        }
        setProcessedMenuItems(items);
    }, [savedSearches, popoverMenuItems, savedSearchesMenuItems, translate, styles.textSupporting]);
    var openMenu = (0, react_1.useCallback)(function () {
        setIsPopoverVisible(true);
        // Defer heavy processing until after interactions
        react_native_1.InteractionManager.runAfterInteractions(function () {
            processSavedSearches();
        });
    }, [processSavedSearches]);
    return {
        isPopoverVisible: isPopoverVisible,
        delayPopoverMenuFirstRender: delayPopoverMenuFirstRender,
        openMenu: openMenu,
        closeMenu: closeMenu,
        allMenuItems: processedMenuItems,
        DeleteConfirmModal: DeleteConfirmModal,
        theme: theme,
        styles: styles,
        windowHeight: windowHeight,
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var NavigationTabBar_1 = require("@components/Navigation/NavigationTabBar");
var NAVIGATION_TABS_1 = require("@components/Navigation/NavigationTabBar/NAVIGATION_TABS");
var TopBar_1 = require("@components/Navigation/TopBar");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Search_1 = require("@components/Search");
var SearchContext_1 = require("@components/Search/SearchContext");
var SearchFiltersBar_1 = require("@components/Search/SearchPageHeader/SearchFiltersBar");
var SearchPageHeader_1 = require("@components/Search/SearchPageHeader/SearchPageHeader");
var useHandleBackButton_1 = require("@hooks/useHandleBackButton");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useScrollEventEmitter_1 = require("@hooks/useScrollEventEmitter");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var variables_1 = require("@styles/variables");
var Report_1 = require("@userActions/Report");
var Search_2 = require("@userActions/Search");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var TOO_CLOSE_TO_TOP_DISTANCE = 10;
var TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
var ANIMATION_DURATION_IN_MS = 300;
function SearchPageNarrow(_a) {
    var queryJSON = _a.queryJSON, headerButtonsOptions = _a.headerButtonsOptions, currentSearchResults = _a.currentSearchResults, lastNonEmptySearchResults = _a.lastNonEmptySearchResults;
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var selectionMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.MOBILE_SELECTION_MODE, { canBeMissing: true })[0];
    var clearSelectedTransactions = (0, SearchContext_1.useSearchContext)().clearSelectedTransactions;
    var _b = (0, react_1.useState)(false), searchRouterListVisible = _b[0], setSearchRouterListVisible = _b[1];
    var searchResults = (currentSearchResults === null || currentSearchResults === void 0 ? void 0 : currentSearchResults.data) ? currentSearchResults : lastNonEmptySearchResults;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    var triggerScrollEvent = (0, useScrollEventEmitter_1.default)();
    var handleBackButtonPress = (0, react_1.useCallback)(function () {
        if (!(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
            return false;
        }
        clearSelectedTransactions(undefined, true);
        return true;
    }, [selectionMode, clearSelectedTransactions]);
    (0, useHandleBackButton_1.default)(handleBackButtonPress);
    var scrollOffset = (0, react_native_reanimated_1.useSharedValue)(0);
    var topBarOffset = (0, react_native_reanimated_1.useSharedValue)(StyleUtils.searchHeaderDefaultOffset);
    var topBarAnimatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        top: topBarOffset.get(),
    }); });
    var scrollHandler = (0, react_native_reanimated_1.useAnimatedScrollHandler)({
        onScroll: function (event) {
            (0, react_native_reanimated_1.runOnJS)(triggerScrollEvent)();
            var contentOffset = event.contentOffset, layoutMeasurement = event.layoutMeasurement, contentSize = event.contentSize;
            if (windowHeight > contentSize.height) {
                return;
            }
            var currentOffset = contentOffset.y;
            var isScrollingDown = currentOffset > scrollOffset.get();
            var distanceScrolled = currentOffset - scrollOffset.get();
            if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                topBarOffset.set((0, react_native_reanimated_1.clamp)(topBarOffset.get() - distanceScrolled, variables_1.default.minimalTopBarOffset, StyleUtils.searchHeaderDefaultOffset));
            }
            else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                topBarOffset.set((0, react_native_reanimated_1.withTiming)(StyleUtils.searchHeaderDefaultOffset, { duration: ANIMATION_DURATION_IN_MS }));
            }
            scrollOffset.set(currentOffset);
        },
    });
    var handleOnBackButtonPress = function () { return Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: (0, SearchQueryUtils_1.buildCannedSearchQuery)() })); };
    var shouldDisplayCancelSearch = shouldUseNarrowLayout && ((!!queryJSON && !(0, SearchQueryUtils_1.isCannedSearchQuery)(queryJSON)) || searchRouterListVisible);
    var cancelSearchCallback = (0, react_1.useCallback)(function () {
        if (searchRouterListVisible) {
            setSearchRouterListVisible(false);
            return;
        }
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: (0, SearchQueryUtils_1.buildCannedSearchQuery)() }));
    }, [searchRouterListVisible]);
    var handleSearchAction = (0, react_1.useCallback)(function (value) {
        if (typeof value === 'string') {
            (0, Report_1.searchInServer)(value);
        }
        else {
            (0, Search_2.search)(value);
        }
    }, []);
    if (!queryJSON) {
        return (<ScreenWrapper_1.default testID={SearchPageNarrow.displayName} style={styles.pv0} offlineIndicatorStyle={styles.mtAuto} shouldShowOfflineIndicator={!!searchResults}>
                <FullPageNotFoundView_1.default shouldShow={!queryJSON} onBackButtonPress={handleOnBackButtonPress} shouldShowLink={false}/>
            </ScreenWrapper_1.default>);
    }
    var isDataLoaded = (0, SearchUIUtils_1.isSearchDataLoaded)(currentSearchResults, lastNonEmptySearchResults, queryJSON);
    var shouldShowLoadingState = !isOffline && !isDataLoaded;
    return (<ScreenWrapper_1.default testID={SearchPageNarrow.displayName} shouldEnableMaxHeight offlineIndicatorStyle={styles.mtAuto} bottomContent={<NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.SEARCH}/>} headerGapStyles={styles.searchHeaderGap} shouldShowOfflineIndicator={!!searchResults}>
            <react_native_1.View style={[styles.flex1, styles.overflowHidden]}>
                {!(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) ? (<react_native_1.View style={[StyleUtils.getSearchPageNarrowHeaderStyles(), searchRouterListVisible && styles.flex1, styles.mh100]}>
                        <react_native_1.View style={[styles.zIndex10, styles.appBG]}>
                            <TopBar_1.default shouldShowLoadingBar={shouldShowLoadingState} breadcrumbLabel={translate('common.reports')} shouldDisplaySearch={false} cancelSearch={shouldDisplayCancelSearch ? cancelSearchCallback : undefined}/>
                        </react_native_1.View>
                        <react_native_1.View style={[styles.flex1]}>
                            <react_native_reanimated_1.default.View style={[topBarAnimatedStyle, !searchRouterListVisible && styles.narrowSearchRouterInactiveStyle, styles.flex1, styles.bgTransparent]}>
                                <react_native_1.View style={[styles.flex1, styles.pt2, styles.appBG]}>
                                    <SearchPageHeader_1.default queryJSON={queryJSON} searchRouterListVisible={searchRouterListVisible} hideSearchRouterList={function () {
                setSearchRouterListVisible(false);
            }} onSearchRouterFocus={function () {
                topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                setSearchRouterListVisible(true);
            }} headerButtonsOptions={headerButtonsOptions} handleSearch={handleSearchAction}/>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.appBG]}>
                                    {!searchRouterListVisible && (<SearchFiltersBar_1.default queryJSON={queryJSON} headerButtonsOptions={headerButtonsOptions}/>)}
                                </react_native_1.View>
                            </react_native_reanimated_1.default.View>
                        </react_native_1.View>
                    </react_native_1.View>) : (<>
                        <HeaderWithBackButton_1.default title={translate('common.selectMultiple')} onBackButtonPress={function () {
                topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                clearSelectedTransactions();
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
            }}/>
                        <SearchPageHeader_1.default queryJSON={queryJSON} headerButtonsOptions={headerButtonsOptions} handleSearch={handleSearchAction}/>
                    </>)}
                {!searchRouterListVisible && (<react_native_1.View style={[styles.flex1]}>
                        <Search_1.default currentSearchResults={currentSearchResults} lastNonEmptySearchResults={lastNonEmptySearchResults} key={queryJSON.hash} queryJSON={queryJSON} onSearchListScroll={scrollHandler} contentContainerStyle={!(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) ? styles.searchListContentContainerStyles : undefined} handleSearch={handleSearchAction}/>
                    </react_native_1.View>)}
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SearchPageNarrow.displayName = 'SearchPageNarrow';
exports.default = SearchPageNarrow;

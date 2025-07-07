"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderGap_1 = require("@components/HeaderGap");
var SearchContext_1 = require("@components/Search/SearchContext");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var SearchTypeMenu_1 = require("@pages/Search/SearchTypeMenu");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var NavigationTabBar_1 = require("./NavigationTabBar");
var NAVIGATION_TABS_1 = require("./NavigationTabBar/NAVIGATION_TABS");
var TopBar_1 = require("./TopBar");
function SearchSidebar(_a) {
    var _b;
    var state = _a.state;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var route = state.routes.at(-1);
    var params = route === null || route === void 0 ? void 0 : route.params;
    var _c = (0, SearchContext_1.useSearchContext)(), lastSearchType = _c.lastSearchType, setLastSearchType = _c.setLastSearchType;
    var queryJSON = (0, react_1.useMemo)(function () {
        if (params === null || params === void 0 ? void 0 : params.q) {
            return (0, SearchQueryUtils_1.buildSearchQueryJSON)(params.q);
        }
        return undefined;
    }, [params === null || params === void 0 ? void 0 : params.q]);
    var currentSearchResultsKey = (_b = queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON.hash) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var currentSearchResults = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(currentSearchResultsKey), { canBeMissing: true })[0];
    var _d = (0, react_1.useState)(undefined), lastNonEmptySearchResults = _d[0], setLastNonEmptySearchResults = _d[1];
    (0, react_1.useEffect)(function () {
        var _a;
        if (!((_a = currentSearchResults === null || currentSearchResults === void 0 ? void 0 : currentSearchResults.search) === null || _a === void 0 ? void 0 : _a.type)) {
            return;
        }
        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            setLastNonEmptySearchResults(currentSearchResults);
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);
    var isDataLoaded = (0, SearchUIUtils_1.isSearchDataLoaded)(currentSearchResults, lastNonEmptySearchResults, queryJSON);
    var shouldShowLoadingState = (route === null || route === void 0 ? void 0 : route.name) === SCREENS_1.default.SEARCH.MONEY_REQUEST_REPORT ? false : !isOffline && !isDataLoaded;
    if (shouldUseNarrowLayout) {
        return null;
    }
    return (<react_native_1.View style={styles.searchSidebar}>
            <react_native_1.View style={styles.flex1}>
                <HeaderGap_1.default />
                <TopBar_1.default shouldShowLoadingBar={shouldShowLoadingState} breadcrumbLabel={translate('common.reports')} shouldDisplaySearch={false} shouldDisplayHelpButton={false}/>
                <SearchTypeMenu_1.default queryJSON={queryJSON}/>
            </react_native_1.View>
            <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.SEARCH}/>
        </react_native_1.View>);
}
SearchSidebar.displayName = 'SearchSidebar';
exports.default = SearchSidebar;

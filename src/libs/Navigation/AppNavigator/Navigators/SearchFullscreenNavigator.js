"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useSplitNavigatorScreenOptions_1 = require("@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions");
var animation_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/animation");
var SearchQueryUtils = require("@libs/SearchQueryUtils");
var createSearchFullscreenNavigator_1 = require("@navigation/AppNavigator/createSearchFullscreenNavigator");
var FreezeWrapper_1 = require("@navigation/AppNavigator/FreezeWrapper");
var SCREENS_1 = require("@src/SCREENS");
var loadSearchPage = function () { return require('@pages/Search/SearchPage').default; };
var loadSearchMoneyReportPage = function () { return require('@pages/Search/SearchMoneyRequestReportPage').default; };
var Stack = (0, createSearchFullscreenNavigator_1.default)();
function SearchFullscreenNavigator(_a) {
    var route = _a.route;
    // These options can be used here because the full screen navigator has the same structure as the split navigator in terms of the central screens, but it does not have a sidebar.
    var centralScreenOptions = (0, useSplitNavigatorScreenOptions_1.default)().centralScreen;
    return (<FreezeWrapper_1.default>
            <Stack.Navigator screenOptions={centralScreenOptions} defaultCentralScreen={SCREENS_1.default.SEARCH.ROOT} parentRoute={route}>
                <Stack.Screen name={SCREENS_1.default.SEARCH.ROOT} getComponent={loadSearchPage} initialParams={{ q: SearchQueryUtils.buildSearchQueryString() }} options={{ animation: animation_1.default.NONE }}/>
                <Stack.Screen name={SCREENS_1.default.SEARCH.MONEY_REQUEST_REPORT} getComponent={loadSearchMoneyReportPage}/>
            </Stack.Navigator>
        </FreezeWrapper_1.default>);
}
SearchFullscreenNavigator.displayName = 'SearchFullscreenNavigator';
exports.default = SearchFullscreenNavigator;

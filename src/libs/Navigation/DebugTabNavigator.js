"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var stack_1 = require("@react-navigation/stack");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var getBackground_1 = require("@components/TabSelector/getBackground");
var getOpacity_1 = require("@components/TabSelector/getOpacity");
var TabSelectorItem_1 = require("@components/TabSelector/TabSelectorItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function getIconAndTitle(route, translate) {
    switch (route) {
        case CONST_1.default.DEBUG.DETAILS:
            return { icon: Expensicons.Info, title: translate('debug.details') };
        case CONST_1.default.DEBUG.JSON:
            return { icon: Expensicons.Eye, title: translate('debug.JSON') };
        case CONST_1.default.DEBUG.REPORT_ACTIONS:
            return { icon: Expensicons.Document, title: translate('debug.reportActions') };
        case CONST_1.default.DEBUG.REPORT_ACTION_PREVIEW:
            return { icon: Expensicons.Document, title: translate('debug.reportActionPreview') };
        case CONST_1.default.DEBUG.TRANSACTION_VIOLATIONS:
            return { icon: Expensicons.Exclamation, title: translate('debug.violations') };
        default:
            throw new Error("Route ".concat(route, " has no icon nor title set."));
    }
}
var StackNavigator = (0, stack_1.createStackNavigator)();
function DebugTabNavigator(_a) {
    var _b;
    var id = _a.id, routes = _a.routes;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var navigation = (0, native_1.useNavigation)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, react_1.useState)((_b = routes.at(0)) === null || _b === void 0 ? void 0 : _b.name), currentTab = _c[0], setCurrentTab = _c[1];
    var defaultAffectedAnimatedTabs = (0, react_1.useMemo)(function () { return Array.from({ length: routes.length }, function (v, i) { return i; }); }, [routes.length]);
    var _d = (0, react_1.useState)(defaultAffectedAnimatedTabs), affectedAnimatedTabs = _d[0], setAffectedAnimatedTabs = _d[1];
    (0, react_1.useEffect)(function () {
        // It is required to wait transition end to reset affectedAnimatedTabs because tabs style is still animating during transition.
        setTimeout(function () {
            setAffectedAnimatedTabs(defaultAffectedAnimatedTabs);
        }, CONST_1.default.ANIMATED_TRANSITION);
    }, [defaultAffectedAnimatedTabs, currentTab]);
    return (<>
            <react_native_1.View style={styles.tabSelector}>
                {routes.map(function (route, index) {
            var isActive = route.name === currentTab;
            var activeOpacity = (0, getOpacity_1.default)({
                routesLength: routes.length,
                tabIndex: index,
                active: true,
                affectedTabs: affectedAnimatedTabs,
                position: undefined,
                isActive: isActive,
            });
            var inactiveOpacity = (0, getOpacity_1.default)({
                routesLength: routes.length,
                tabIndex: index,
                active: false,
                affectedTabs: affectedAnimatedTabs,
                position: undefined,
                isActive: isActive,
            });
            var backgroundColor = (0, getBackground_1.default)({
                routesLength: routes.length,
                tabIndex: index,
                affectedTabs: affectedAnimatedTabs,
                theme: theme,
                position: undefined,
                isActive: isActive,
            });
            var _a = getIconAndTitle(route.name, translate), icon = _a.icon, title = _a.title;
            var onPress = function () {
                navigation.navigate(route.name);
                setCurrentTab(route.name);
            };
            return (<TabSelectorItem_1.default key={route.name} icon={icon} title={title} onPress={onPress} activeOpacity={activeOpacity} inactiveOpacity={inactiveOpacity} backgroundColor={backgroundColor} isActive={isActive}/>);
        })}
            </react_native_1.View>
            <StackNavigator.Navigator id={id} screenOptions={{
            animation: 'none',
            headerShown: false,
        }} screenListeners={{
            state: function (e) {
                var _a;
                var event = e;
                var state = event.data.state;
                var routeNames = state.routeNames;
                var newSelectedTab = (_a = state.routes.at(state.routes.length - 1)) === null || _a === void 0 ? void 0 : _a.name;
                if (currentTab === newSelectedTab || (currentTab && !routeNames.includes(currentTab))) {
                    return;
                }
                setCurrentTab(newSelectedTab);
            },
        }}>
                {routes.map(function (route) { return (<StackNavigator.Screen key={route.name} name={route.name} component={route.component}/>); })}
            </StackNavigator.Navigator>
        </>);
}
exports.default = DebugTabNavigator;

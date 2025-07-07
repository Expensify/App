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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopTab = void 0;
exports.TabScreenWithFocusTrapWrapper = TabScreenWithFocusTrapWrapper;
var material_top_tabs_1 = require("@react-navigation/material-top-tabs");
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FocusTrapContainerElement_1 = require("@components/FocusTrap/FocusTrapContainerElement");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Tab_1 = require("@userActions/Tab");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var onTabSelectHandler_1 = require("./onTabSelectHandler");
var OnyxTabNavigatorConfig_1 = require("./OnyxTabNavigatorConfig");
var TopTab = (0, material_top_tabs_1.createMaterialTopTabNavigator)();
exports.TopTab = TopTab;
// The TabFocusTrapContext is to collect the focus trap container element of each tab screen.
// This provider is placed in the OnyxTabNavigator component and the consumer is in the TabScreenWithFocusTrapWrapper component.
var TabFocusTrapContext = react_1.default.createContext(function () { });
var getTabNames = function (children) {
    var result = [];
    react_1.default.Children.forEach(children, function (child) {
        if (!react_1.default.isValidElement(child)) {
            return;
        }
        var element = child;
        if (typeof element.props.name === 'string') {
            result.push(element.props.name);
        }
    });
    return result;
};
// This takes all the same props as MaterialTopTabsNavigator: https://reactnavigation.org/docs/material-top-tab-navigator/#props,
// except ID is now required, and it gets a `selectedTab` from Onyx
// It also takes 2 more optional callbacks to manage the focus trap container elements of the tab bar and the active tab
function OnyxTabNavigator(_a) {
    var id = _a.id, defaultSelectedTab = _a.defaultSelectedTab, TabBar = _a.tabBar, children = _a.children, onTabBarFocusTrapContainerElementChanged = _a.onTabBarFocusTrapContainerElementChanged, onActiveTabFocusTrapContainerElementChanged = _a.onActiveTabFocusTrapContainerElementChanged, _b = _a.onTabSelected, onTabSelected = _b === void 0 ? function () { } : _b, screenListeners = _a.screenListeners, _c = _a.shouldShowLabelWhenInactive, shouldShowLabelWhenInactive = _c === void 0 ? true : _c, _d = _a.disableSwipe, disableSwipe = _d === void 0 ? false : _d, shouldShowProductTrainingTooltip = _a.shouldShowProductTrainingTooltip, renderProductTrainingTooltip = _a.renderProductTrainingTooltip, _e = _a.lazyLoadEnabled, lazyLoadEnabled = _e === void 0 ? false : _e, onTabSelect = _a.onTabSelect, rest = __rest(_a, ["id", "defaultSelectedTab", "tabBar", "children", "onTabBarFocusTrapContainerElementChanged", "onActiveTabFocusTrapContainerElementChanged", "onTabSelected", "screenListeners", "shouldShowLabelWhenInactive", "disableSwipe", "shouldShowProductTrainingTooltip", "renderProductTrainingTooltip", "lazyLoadEnabled", "onTabSelect"]);
    var isFirstMount = (0, react_1.useRef)(true);
    // Mapping of tab name to focus trap container element
    var _f = (0, react_1.useState)({}), focusTrapContainerElementMapping = _f[0], setFocusTrapContainerElementMapping = _f[1];
    var _g = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SELECTED_TAB).concat(id), { canBeMissing: false }), selectedTab = _g[0], selectedTabResult = _g[1];
    var tabNames = (0, react_1.useMemo)(function () { return getTabNames(children); }, [children]);
    var validInitialTab = selectedTab && tabNames.includes(selectedTab) ? selectedTab : defaultSelectedTab;
    var LazyPlaceholder = (0, react_1.useCallback)(function () {
        return <FullscreenLoadingIndicator_1.default />;
    }, []);
    // This callback is used to register the focus trap container element of each available tab screen
    var setTabFocusTrapContainerElement = (0, react_1.useCallback)(function (tabName, containerElement) {
        setFocusTrapContainerElementMapping(function (prevMapping) {
            var resultMapping = __assign({}, prevMapping);
            if (containerElement) {
                resultMapping[tabName] = containerElement;
            }
            else {
                delete resultMapping[tabName];
            }
            return resultMapping;
        });
    }, []);
    /**
     * This is a TabBar wrapper component that includes the focus trap container element callback.
     * In `TabSelector.tsx` component, the callback prop to register focus trap container element is supported out of the box
     */
    var TabBarWithFocusTrapInclusion = (0, react_1.useCallback)(function (props) {
        return (<TabBar onFocusTrapContainerElementChanged={onTabBarFocusTrapContainerElementChanged} shouldShowLabelWhenInactive={shouldShowLabelWhenInactive} shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip} renderProductTrainingTooltip={renderProductTrainingTooltip} 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}/>);
    }, [TabBar, onTabBarFocusTrapContainerElementChanged, shouldShowLabelWhenInactive, shouldShowProductTrainingTooltip, renderProductTrainingTooltip]);
    // If the selected tab changes, we need to update the focus trap container element of the active tab
    (0, react_1.useEffect)(function () {
        onActiveTabFocusTrapContainerElementChanged === null || onActiveTabFocusTrapContainerElementChanged === void 0 ? void 0 : onActiveTabFocusTrapContainerElementChanged(selectedTab ? focusTrapContainerElementMapping[selectedTab] : null);
    }, [selectedTab, focusTrapContainerElementMapping, onActiveTabFocusTrapContainerElementChanged]);
    if ((0, isLoadingOnyxValue_1.default)(selectedTabResult)) {
        return null;
    }
    return (<TabFocusTrapContext.Provider value={setTabFocusTrapContainerElement}>
            <TopTab.Navigator 
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    {...rest} id={id} initialRouteName={validInitialTab} backBehavior="initialRoute" keyboardDismissMode="none" tabBar={TabBarWithFocusTrapInclusion} onTabSelect={onTabSelect} screenListeners={__assign({ state: function (e) {
                var event = e;
                var state = event.data.state;
                var index = state.index;
                var routeNames = state.routeNames;
                // For web-based platforms we need to focus the selected tab input once on first mount as well as
                // when the tab selection is changed via internal Pager onPageSelected (passed to the navigator)
                if (isFirstMount.current) {
                    (0, onTabSelectHandler_1.default)(index, onTabSelect);
                    isFirstMount.current = false;
                }
                var newSelectedTab = routeNames.at(index);
                if (selectedTab === newSelectedTab) {
                    return;
                }
                Tab_1.default.setSelectedTab(id, newSelectedTab);
                onTabSelected(newSelectedTab);
            } }, (screenListeners !== null && screenListeners !== void 0 ? screenListeners : {}))} screenOptions={__assign(__assign({}, OnyxTabNavigatorConfig_1.defaultScreenOptions), { swipeEnabled: !disableSwipe, lazy: lazyLoadEnabled, lazyPlaceholder: LazyPlaceholder })}>
                {children}
            </TopTab.Navigator>
        </TabFocusTrapContext.Provider>);
}
/**
 * We should use this wrapper for each tab screen. This will help register the focus trap container element of each tab screen.
 * In the OnyxTabNavigator component, depending on the selected tab, we will further register the correct container element of the current active tab to the parent focus trap.
 * This must be used if we want to include all tabbable elements of one tab screen in the parent focus trap if that tab screen is active.
 * Example usage (check the `IOURequestStartPage.tsx` and `NewChatSelectorPage.tsx` components for more info)
 * ```tsx
 * <OnyxTabNavigator>
 *   <Tab.Screen>
 *     {() => (
 *       <TabScreenWithFocusTrapWrapper>
 *          <Content />
 *        </TabScreenWithFocusTrapWrapper>
 *     )}
 *   </Tab.Screen>
 * </OnyxTabNavigator>
 * ```
 */
function TabScreenWithFocusTrapWrapper(_a) {
    var children = _a.children;
    var route = (0, native_1.useRoute)();
    var styles = (0, useThemeStyles_1.default)();
    var setTabContainerElement = (0, react_1.useContext)(TabFocusTrapContext);
    var handleContainerElementChanged = (0, react_1.useCallback)(function (element) {
        setTabContainerElement(route.name, element);
    }, [setTabContainerElement, route.name]);
    return (<FocusTrapContainerElement_1.default onContainerElementChanged={handleContainerElementChanged} style={[styles.w100, styles.h100]}>
            {children}
        </FocusTrapContainerElement_1.default>);
}
OnyxTabNavigator.displayName = 'OnyxTabNavigator';
exports.default = OnyxTabNavigator;

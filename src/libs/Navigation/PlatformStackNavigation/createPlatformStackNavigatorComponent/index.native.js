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
var native_1 = require("@react-navigation/native");
var native_stack_1 = require("@react-navigation/native-stack");
var react_1 = require("react");
var customHistory_1 = require("@libs/Navigation/AppNavigator/customHistory");
var convertToNativeNavigationOptions_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/convertToNativeNavigationOptions");
function createPlatformStackNavigatorComponent(displayName, options) {
    var _a, _b, _c;
    var createRouter = (0, customHistory_1.addCustomHistoryRouterExtension)((_a = options === null || options === void 0 ? void 0 : options.createRouter) !== null && _a !== void 0 ? _a : native_1.StackRouter);
    var defaultScreenOptions = options === null || options === void 0 ? void 0 : options.defaultScreenOptions;
    var useCustomState = (_b = options === null || options === void 0 ? void 0 : options.useCustomState) !== null && _b !== void 0 ? _b : (function () { return undefined; });
    var useCustomEffects = (_c = options === null || options === void 0 ? void 0 : options.useCustomEffects) !== null && _c !== void 0 ? _c : (function () { return undefined; });
    var ExtraContent = options === null || options === void 0 ? void 0 : options.ExtraContent;
    var NavigationContentWrapper = options === null || options === void 0 ? void 0 : options.NavigationContentWrapper;
    function PlatformNavigator(_a) {
        var id = _a.id, initialRouteName = _a.initialRouteName, screenOptions = _a.screenOptions, screenListeners = _a.screenListeners, children = _a.children, sidebarScreen = _a.sidebarScreen, defaultCentralScreen = _a.defaultCentralScreen, parentRoute = _a.parentRoute, props = __rest(_a, ["id", "initialRouteName", "screenOptions", "screenListeners", "children", "sidebarScreen", "defaultCentralScreen", "parentRoute"]);
        var _b = (0, native_1.useNavigationBuilder)(createRouter, {
            id: id,
            children: children,
            screenOptions: __assign(__assign({}, defaultScreenOptions), screenOptions),
            screenListeners: screenListeners,
            initialRouteName: initialRouteName,
            sidebarScreen: sidebarScreen,
            defaultCentralScreen: defaultCentralScreen,
            parentRoute: parentRoute,
        }, convertToNativeNavigationOptions_1.default), navigation = _b.navigation, originalState = _b.state, descriptors = _b.descriptors, describe = _b.describe, NavigationContent = _b.NavigationContent;
        var customCodeProps = (0, react_1.useMemo)(function () { return ({
            state: originalState,
            navigation: navigation,
            descriptors: descriptors,
            displayName: displayName,
            parentRoute: parentRoute,
        }); }, [originalState, navigation, descriptors, parentRoute]);
        var stateToRender = useCustomState(customCodeProps);
        var state = (0, react_1.useMemo)(function () { return stateToRender !== null && stateToRender !== void 0 ? stateToRender : originalState; }, [originalState, stateToRender]);
        var customCodePropsWithCustomState = (0, react_1.useMemo)(function () { return (__assign(__assign({}, customCodeProps), { state: state })); }, [customCodeProps, state]);
        // Executes custom effects defined in "useCustomEffects" navigator option.
        useCustomEffects(customCodePropsWithCustomState);
        var Content = (0, react_1.useMemo)(function () { return (<NavigationContent>
                    <native_stack_1.NativeStackView 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} state={state} descriptors={descriptors} navigation={navigation} describe={describe}/>
                    {!!ExtraContent && (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <ExtraContent {...customCodePropsWithCustomState}/>)}
                </NavigationContent>); }, [NavigationContent, customCodePropsWithCustomState, describe, descriptors, navigation, props, state]);
        // eslint-disable-next-line react/jsx-props-no-spreading
        return NavigationContentWrapper === undefined ? Content : <NavigationContentWrapper {...customCodePropsWithCustomState}>{Content}</NavigationContentWrapper>;
    }
    PlatformNavigator.displayName = displayName;
    return PlatformNavigator;
}
exports.default = createPlatformStackNavigatorComponent;

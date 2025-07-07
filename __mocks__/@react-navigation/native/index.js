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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePreventRemove = exports.useFocusEffect = exports.useRoute = exports.useScrollToTop = exports.useLinkTo = exports.useLinkProps = exports.useLinkBuilder = exports.ThemeProvider = exports.DefaultTheme = exports.DarkTheme = exports.ServerContainer = exports.NavigationContainer = exports.LinkingContext = exports.Link = exports.triggerTransitionEnd = exports.useLocale = exports.useNavigation = exports.useTheme = exports.useIsFocused = void 0;
var createAddListenerMock_1 = require("../../../tests/utils/createAddListenerMock");
var isJestEnv = process.env.NODE_ENV === 'test';
var realReactNavigation = isJestEnv ? jest.requireActual('@react-navigation/native') : require('@react-navigation/native');
var useIsFocused = isJestEnv ? realReactNavigation.useIsFocused : function () { return true; };
exports.useIsFocused = useIsFocused;
var useTheme = isJestEnv ? realReactNavigation.useTheme : function () { return ({}); };
exports.useTheme = useTheme;
var useLocale = isJestEnv ? realReactNavigation.useTheme : function () { return ({}); };
exports.useLocale = useLocale;
var _a = isJestEnv
    ? (0, createAddListenerMock_1.default)()
    : {
        triggerTransitionEnd: function () { },
        addListener: function () { },
    }, triggerTransitionEnd = _a.triggerTransitionEnd, addListener = _a.addListener;
exports.triggerTransitionEnd = triggerTransitionEnd;
var realOrMockedUseNavigation = isJestEnv ? realReactNavigation.useNavigation : {};
var useNavigation = function () { return (__assign(__assign({}, realOrMockedUseNavigation), { navigate: isJestEnv ? jest.fn() : function () { }, getState: function () { return ({
        routes: [],
    }); }, addListener: addListener })); };
exports.useNavigation = useNavigation;
__exportStar(require("@react-navigation/core"), exports);
var Link = isJestEnv ? realReactNavigation.Link : function () { return null; };
exports.Link = Link;
var LinkingContext = isJestEnv ? realReactNavigation.LinkingContext : function () { return null; };
exports.LinkingContext = LinkingContext;
var NavigationContainer = isJestEnv ? realReactNavigation.NavigationContainer : function () { return null; };
exports.NavigationContainer = NavigationContainer;
var ServerContainer = isJestEnv ? realReactNavigation.ServerContainer : function () { return null; };
exports.ServerContainer = ServerContainer;
var DarkTheme = isJestEnv ? realReactNavigation.DarkTheme : {};
exports.DarkTheme = DarkTheme;
var DefaultTheme = isJestEnv ? realReactNavigation.DefaultTheme : {};
exports.DefaultTheme = DefaultTheme;
var ThemeProvider = isJestEnv ? realReactNavigation.ThemeProvider : function () { return null; };
exports.ThemeProvider = ThemeProvider;
var useLinkBuilder = isJestEnv ? realReactNavigation.useLinkBuilder : function () { return null; };
exports.useLinkBuilder = useLinkBuilder;
var useLinkProps = isJestEnv ? realReactNavigation.useLinkProps : function () { return null; };
exports.useLinkProps = useLinkProps;
var useLinkTo = isJestEnv ? realReactNavigation.useLinkTo : function () { return null; };
exports.useLinkTo = useLinkTo;
var useScrollToTop = isJestEnv ? realReactNavigation.useScrollToTop : function () { return null; };
exports.useScrollToTop = useScrollToTop;
var useRoute = isJestEnv ? realReactNavigation.useRoute : function () { return ({ params: {} }); };
exports.useRoute = useRoute;
var useFocusEffect = isJestEnv ? realReactNavigation.useFocusEffect : function (callback) { return callback(); };
exports.useFocusEffect = useFocusEffect;
var usePreventRemove = isJestEnv ? jest.fn() : function () { };
exports.usePreventRemove = usePreventRemove;

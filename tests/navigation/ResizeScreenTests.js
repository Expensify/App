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
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var createSplitNavigator_1 = require("@libs/Navigation/AppNavigator/createSplitNavigator");
var useNavigationResetOnLayoutChange_1 = require("@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var InitialSettingsPage_1 = require("@pages/settings/InitialSettingsPage");
var ProfilePage_1 = require("@pages/settings/Profile/ProfilePage");
var CONST_1 = require("@src/CONST");
var SCREENS_1 = require("@src/SCREENS");
var Split = (0, createSplitNavigator_1.default)();
jest.mock('@hooks/useResponsiveLayout', function () { return jest.fn(); });
jest.mock('@libs/getIsNarrowLayout', function () { return jest.fn(); });
jest.mock('@pages/settings/InitialSettingsPage');
jest.mock('@pages/settings/Profile/ProfilePage');
// Mock Fullstory library dependency
jest.mock('@libs/Fullstory', function () { return ({
    default: {
        consentAndIdentify: jest.fn(),
    },
    parseFSAttributes: jest.fn(),
}); });
var INITIAL_STATE = {
    index: 0,
    routes: [
        {
            name: SCREENS_1.default.SETTINGS.ROOT,
        },
    ],
};
var mockedGetIsNarrowLayout = getIsNarrowLayout_1.default;
var mockedUseResponsiveLayout = useResponsiveLayout_1.default;
describe('Resize screen', function () {
    it('Should display the settings profile after resizing the screen with the settings page opened to the wide layout', function () {
        var _a, _b, _c, _d, _e;
        // Given the initialized navigation on the narrow layout with the settings screen
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue(__assign(__assign({}, CONST_1.default.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: true }));
        (0, react_native_1.render)(<native_1.NavigationContainer ref={navigationRef_1.default} initialState={INITIAL_STATE}>
                <Split.Navigator sidebarScreen={SCREENS_1.default.SETTINGS.ROOT} defaultCentralScreen={SCREENS_1.default.SETTINGS.PROFILE.ROOT} parentRoute={CONST_1.default.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}>
                    <Split.Screen name={SCREENS_1.default.SETTINGS.ROOT} component={InitialSettingsPage_1.default}/>
                    <Split.Screen name={SCREENS_1.default.SETTINGS.PROFILE.ROOT} component={ProfilePage_1.default}/>
                </Split.Navigator>
            </native_1.NavigationContainer>);
        var rerender = (0, react_native_1.renderHook)(function () {
            var _a;
            return (0, useNavigationResetOnLayoutChange_1.default)({
                navigation: navigationRef_1.default.current,
                displayName: 'SplitNavigator',
                descriptors: {},
                state: (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getState(),
            });
        }).rerender;
        var rootStateBeforeResize = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState();
        expect((_b = rootStateBeforeResize === null || rootStateBeforeResize === void 0 ? void 0 : rootStateBeforeResize.routes.at(0)) === null || _b === void 0 ? void 0 : _b.name).toBe(SCREENS_1.default.SETTINGS.ROOT);
        expect(rootStateBeforeResize === null || rootStateBeforeResize === void 0 ? void 0 : rootStateBeforeResize.routes.at(1)).toBeUndefined();
        expect(rootStateBeforeResize === null || rootStateBeforeResize === void 0 ? void 0 : rootStateBeforeResize.index).toBe(0);
        // When resizing the screen to the wide layout
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedUseResponsiveLayout.mockReturnValue(__assign(__assign({}, CONST_1.default.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: false }));
        rerender({});
        var rootStateAfterResize = (_c = navigationRef_1.default.current) === null || _c === void 0 ? void 0 : _c.getRootState();
        // Then the settings profile page should be displayed on the screen
        expect((_d = rootStateAfterResize === null || rootStateAfterResize === void 0 ? void 0 : rootStateAfterResize.routes.at(0)) === null || _d === void 0 ? void 0 : _d.name).toBe(SCREENS_1.default.SETTINGS.ROOT);
        expect((_e = rootStateAfterResize === null || rootStateAfterResize === void 0 ? void 0 : rootStateAfterResize.routes.at(1)) === null || _e === void 0 ? void 0 : _e.name).toBe(SCREENS_1.default.SETTINGS.PROFILE.ROOT);
        expect(rootStateAfterResize === null || rootStateAfterResize === void 0 ? void 0 : rootStateAfterResize.index).toBe(1);
    });
});

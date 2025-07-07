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
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var Navigation_1 = require("@libs/Navigation/Navigation");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var TestNavigationContainer_1 = require("../utils/TestNavigationContainer");
jest.mock('@hooks/useResponsiveLayout', function () { return jest.fn(); });
jest.mock('@libs/getIsNarrowLayout', function () { return jest.fn(); });
jest.mock('@pages/home/sidebar/NavigationTabBarAvatar');
jest.mock('@src/components/Navigation/TopLevelNavigationTabBar');
var mockedGetIsNarrowLayout = getIsNarrowLayout_1.default;
var mockedUseResponsiveLayout = useResponsiveLayout_1.default;
describe('Pop to sidebar after resize from wide to narrow layout', function () {
    beforeEach(function () {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue(__assign(__assign({}, CONST_1.default.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: true }));
    });
    describe('After opening several screens in the settings tab', function () {
        it('Should pop all visited screens and go back to the settings sidebar screen', function () {
            var _a, _b, _c, _d, _e, _f;
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 3,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SETTINGS.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.ABOUT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PREFERENCES.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PROFILE.ROOT,
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var settingsSplitBeforePopToSidebar = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(-1);
            expect((_b = settingsSplitBeforePopToSidebar === null || settingsSplitBeforePopToSidebar === void 0 ? void 0 : settingsSplitBeforePopToSidebar.state) === null || _b === void 0 ? void 0 : _b.index).toBe(3);
            // When we pop with LHN on top of stack
            (0, react_native_1.act)(function () {
                Navigation_1.default.popToSidebar();
            });
            // Then all screens should be popped of the stack and only settings root left
            var settingsSplitAfterPopToSidebar = (_c = navigationRef_1.default.current) === null || _c === void 0 ? void 0 : _c.getRootState().routes.at(-1);
            expect((_d = settingsSplitAfterPopToSidebar === null || settingsSplitAfterPopToSidebar === void 0 ? void 0 : settingsSplitAfterPopToSidebar.state) === null || _d === void 0 ? void 0 : _d.index).toBe(0);
            expect((_f = (_e = settingsSplitAfterPopToSidebar === null || settingsSplitAfterPopToSidebar === void 0 ? void 0 : settingsSplitAfterPopToSidebar.state) === null || _e === void 0 ? void 0 : _e.routes.at(-1)) === null || _f === void 0 ? void 0 : _f.name).toBe(SCREENS_1.default.SETTINGS.ROOT);
        });
    });
    describe('After navigating to the central screen in the settings tab from the chat', function () {
        it('Should replace the route with LHN', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR,
                            state: {
                                index: 2,
                                routes: [
                                    {
                                        name: SCREENS_1.default.HOME,
                                    },
                                    {
                                        name: SCREENS_1.default.REPORT,
                                        params: { reportID: '1' },
                                    },
                                    {
                                        name: SCREENS_1.default.REPORT,
                                        params: { reportID: '2' },
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var lastSplitBeforeNavigate = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(-1);
            expect(lastSplitBeforeNavigate === null || lastSplitBeforeNavigate === void 0 ? void 0 : lastSplitBeforeNavigate.name).toBe(NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR);
            (0, react_native_1.act)(function () {
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ABOUT);
            });
            var lastSplitAfterNavigate = (_b = navigationRef_1.default.current) === null || _b === void 0 ? void 0 : _b.getRootState().routes.at(-1);
            expect(lastSplitAfterNavigate === null || lastSplitAfterNavigate === void 0 ? void 0 : lastSplitAfterNavigate.name).toBe(NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR);
            expect((_c = lastSplitAfterNavigate === null || lastSplitAfterNavigate === void 0 ? void 0 : lastSplitAfterNavigate.state) === null || _c === void 0 ? void 0 : _c.index).toBe(0);
            expect((_e = (_d = lastSplitAfterNavigate === null || lastSplitAfterNavigate === void 0 ? void 0 : lastSplitAfterNavigate.state) === null || _d === void 0 ? void 0 : _d.routes.at(-1)) === null || _e === void 0 ? void 0 : _e.name).toBe(SCREENS_1.default.SETTINGS.ABOUT);
            // When we pop to sidebar without LHN on top of stack
            (0, react_native_1.act)(function () {
                Navigation_1.default.popToSidebar();
            });
            // Then the top screen should be replaced with LHN
            var lastSplitAfterPopToSidebar = (_f = navigationRef_1.default.current) === null || _f === void 0 ? void 0 : _f.getRootState().routes.at(-1);
            expect((_g = lastSplitAfterPopToSidebar === null || lastSplitAfterPopToSidebar === void 0 ? void 0 : lastSplitAfterPopToSidebar.state) === null || _g === void 0 ? void 0 : _g.index).toBe(0);
            expect((_j = (_h = lastSplitAfterPopToSidebar === null || lastSplitAfterPopToSidebar === void 0 ? void 0 : lastSplitAfterPopToSidebar.state) === null || _h === void 0 ? void 0 : _h.routes.at(-1)) === null || _j === void 0 ? void 0 : _j.name).toBe(SCREENS_1.default.SETTINGS.ROOT);
        });
    });
});

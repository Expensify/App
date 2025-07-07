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
// Mock Fullstory library dependency
jest.mock('@libs/Fullstory', function () { return ({
    default: {
        consentAndIdentify: jest.fn(),
    },
    parseFSAttributes: jest.fn(),
}); });
jest.mock('@pages/home/sidebar/NavigationTabBarAvatar');
jest.mock('@src/components/Navigation/TopLevelNavigationTabBar');
var mockedGetIsNarrowLayout = getIsNarrowLayout_1.default;
var mockedUseResponsiveLayout = useResponsiveLayout_1.default;
var mockedPolicyID = 'test-policy';
var mockedBackToRoute = '/test';
describe('Go back on the narrow layout', function () {
    beforeEach(function () {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue(__assign(__assign({}, CONST_1.default.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: true }));
    });
    describe('called without params', function () {
        it('Should pop the last page in the navigation state', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Given the initialized navigation on the narrow layout with the settings split navigator
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 1,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SETTINGS.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PROFILE.ROOT,
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var settingsSplitBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(0);
            expect((_b = settingsSplitBeforeGoBack === null || settingsSplitBeforeGoBack === void 0 ? void 0 : settingsSplitBeforeGoBack.state) === null || _b === void 0 ? void 0 : _b.index).toBe(1);
            expect((_d = (_c = settingsSplitBeforeGoBack === null || settingsSplitBeforeGoBack === void 0 ? void 0 : settingsSplitBeforeGoBack.state) === null || _c === void 0 ? void 0 : _c.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(SCREENS_1.default.SETTINGS.PROFILE.ROOT);
            // When go back without specifying fallbackRoute
            (0, react_native_1.act)(function () {
                Navigation_1.default.goBack();
            });
            // Then pop the last screen from the navigation state
            var settingsSplitAfterGoBack = (_e = navigationRef_1.default.current) === null || _e === void 0 ? void 0 : _e.getRootState().routes.at(0);
            expect((_f = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _f === void 0 ? void 0 : _f.index).toBe(0);
            expect((_h = (_g = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _g === void 0 ? void 0 : _g.routes.at(-1)) === null || _h === void 0 ? void 0 : _h.name).toBe(SCREENS_1.default.SETTINGS.ROOT);
        });
    });
    describe('called with fallbackRoute param', function () {
        it('Should go back to the page passed to goBack as a fallbackRoute', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Given the initialized navigation on the narrow layout with the settings split navigator
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 2,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SETTINGS.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PROFILE.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PREFERENCES.ROOT,
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var settingsSplitBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(0);
            expect((_b = settingsSplitBeforeGoBack === null || settingsSplitBeforeGoBack === void 0 ? void 0 : settingsSplitBeforeGoBack.state) === null || _b === void 0 ? void 0 : _b.index).toBe(2);
            expect((_d = (_c = settingsSplitBeforeGoBack === null || settingsSplitBeforeGoBack === void 0 ? void 0 : settingsSplitBeforeGoBack.state) === null || _c === void 0 ? void 0 : _c.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(SCREENS_1.default.SETTINGS.PREFERENCES.ROOT);
            // When go back to the fallbackRoute present in the navigation state
            (0, react_native_1.act)(function () {
                Navigation_1.default.goBack(ROUTES_1.default.SETTINGS);
            });
            // Then pop to the fallbackRoute
            var settingsSplitAfterGoBack = (_e = navigationRef_1.default.current) === null || _e === void 0 ? void 0 : _e.getRootState().routes.at(0);
            expect((_f = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _f === void 0 ? void 0 : _f.index).toBe(0);
            expect((_h = (_g = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _g === void 0 ? void 0 : _g.routes.at(-1)) === null || _h === void 0 ? void 0 : _h.name).toBe(SCREENS_1.default.SETTINGS.ROOT);
        });
        it('Should replace the current page with the page passed as a fallbackRoute', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Given the initialized navigation on the narrow layout with the settings split navigator
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 1,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SETTINGS.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PROFILE.ROOT,
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var settingsSplitBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(0);
            expect((_b = settingsSplitBeforeGoBack === null || settingsSplitBeforeGoBack === void 0 ? void 0 : settingsSplitBeforeGoBack.state) === null || _b === void 0 ? void 0 : _b.index).toBe(1);
            expect((_d = (_c = settingsSplitBeforeGoBack === null || settingsSplitBeforeGoBack === void 0 ? void 0 : settingsSplitBeforeGoBack.state) === null || _c === void 0 ? void 0 : _c.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(SCREENS_1.default.SETTINGS.PROFILE.ROOT);
            // When go back to the fallbackRoute that does not exist in the navigation state
            (0, react_native_1.act)(function () {
                Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_ABOUT);
            });
            // Then replace the current page with the page passed as a fallbackRoute
            var settingsSplitAfterGoBack = (_e = navigationRef_1.default.current) === null || _e === void 0 ? void 0 : _e.getRootState().routes.at(0);
            expect((_f = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _f === void 0 ? void 0 : _f.index).toBe(1);
            expect((_h = (_g = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _g === void 0 ? void 0 : _g.routes.at(-1)) === null || _h === void 0 ? void 0 : _h.name).toBe(SCREENS_1.default.SETTINGS.ABOUT);
        });
        it('Should go back to the page from the previous split navigator', function () {
            var _a, _b, _c, _d;
            // Given the initialized navigation on the narrow layout with reports and settings pages
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 1,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 2,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SETTINGS.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PROFILE.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PREFERENCES.ROOT,
                                    },
                                ],
                            },
                        },
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
            var rootStateBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState();
            expect(rootStateBeforeGoBack === null || rootStateBeforeGoBack === void 0 ? void 0 : rootStateBeforeGoBack.index).toBe(1);
            expect((_b = rootStateBeforeGoBack === null || rootStateBeforeGoBack === void 0 ? void 0 : rootStateBeforeGoBack.routes.at(-1)) === null || _b === void 0 ? void 0 : _b.name).toBe(NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR);
            // When go back to the page present in the previous split navigator
            (0, react_native_1.act)(function () {
                Navigation_1.default.goBack(ROUTES_1.default.SETTINGS);
            });
            // Then pop the current split navigator
            var rootStateAfterGoBack = (_c = navigationRef_1.default.current) === null || _c === void 0 ? void 0 : _c.getRootState();
            expect(rootStateAfterGoBack === null || rootStateAfterGoBack === void 0 ? void 0 : rootStateAfterGoBack.index).toBe(0);
            expect((_d = rootStateAfterGoBack === null || rootStateAfterGoBack === void 0 ? void 0 : rootStateAfterGoBack.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR);
        });
        it('Should replace the current route with a new split navigator when distance from the fallbackRoute is greater than one split navigator', function () {
            var _a, _b, _c, _d;
            // Given the initialized navigation on the narrow layout
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 2,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 2,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SETTINGS.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PROFILE.ROOT,
                                    },
                                    {
                                        name: SCREENS_1.default.SETTINGS.PREFERENCES.ROOT,
                                    },
                                ],
                            },
                        },
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
                        {
                            name: NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR,
                            state: {
                                index: 0,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SEARCH.ROOT,
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var rootStateBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState();
            expect(rootStateBeforeGoBack === null || rootStateBeforeGoBack === void 0 ? void 0 : rootStateBeforeGoBack.index).toBe(2);
            expect((_b = rootStateBeforeGoBack === null || rootStateBeforeGoBack === void 0 ? void 0 : rootStateBeforeGoBack.routes.at(-1)) === null || _b === void 0 ? void 0 : _b.name).toBe(NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR);
            // When go back to the page present in the split navigator that is more than 1 route away
            (0, react_native_1.act)(function () {
                Navigation_1.default.goBack(ROUTES_1.default.SETTINGS);
            });
            // Then replace the current route with a new split navigator including the target page to avoid losing routes from the navigation state
            var rootStateAfterGoBack = (_c = navigationRef_1.default.current) === null || _c === void 0 ? void 0 : _c.getRootState();
            expect(rootStateAfterGoBack === null || rootStateAfterGoBack === void 0 ? void 0 : rootStateAfterGoBack.index).toBe(2);
            expect((_d = rootStateAfterGoBack === null || rootStateAfterGoBack === void 0 ? void 0 : rootStateAfterGoBack.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR);
        });
    });
    describe('called with fallbackRoute param with route params comparison', function () {
        it('Should go back to the page with matching route params', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            // Given the initialized navigation on the narrow layout with the reports split navigator
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR,
                            state: {
                                index: 3,
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
                                    {
                                        name: SCREENS_1.default.REPORT,
                                        params: { reportID: '3' },
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var reportsSplitBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(0);
            expect((_b = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _b === void 0 ? void 0 : _b.index).toBe(3);
            expect((_d = (_c = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _c === void 0 ? void 0 : _c.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(SCREENS_1.default.REPORT);
            expect((_f = (_e = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _e === void 0 ? void 0 : _e.routes.at(-1)) === null || _f === void 0 ? void 0 : _f.params).toMatchObject({ reportID: '3' });
            // When go back to the same page with a different route param
            (0, react_native_1.act)(function () {
                Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID.getRoute('1'));
            });
            // Then pop to the page with matching params
            var reportsSplitAfterGoBack = (_g = navigationRef_1.default.current) === null || _g === void 0 ? void 0 : _g.getRootState().routes.at(0);
            expect((_h = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _h === void 0 ? void 0 : _h.index).toBe(1);
            expect((_k = (_j = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _j === void 0 ? void 0 : _j.routes.at(-1)) === null || _k === void 0 ? void 0 : _k.name).toBe(SCREENS_1.default.REPORT);
            expect((_m = (_l = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _l === void 0 ? void 0 : _l.routes.at(-1)) === null || _m === void 0 ? void 0 : _m.params).toMatchObject({ reportID: '1' });
        });
        it('Should replace the current page with the same one with different params', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            // Given the initialized navigation on the narrow layout with the reports split navigator
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
            var reportsSplitBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(0);
            expect((_b = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _b === void 0 ? void 0 : _b.index).toBe(2);
            expect((_d = (_c = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _c === void 0 ? void 0 : _c.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(SCREENS_1.default.REPORT);
            expect((_f = (_e = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _e === void 0 ? void 0 : _e.routes.at(-1)) === null || _f === void 0 ? void 0 : _f.params).toMatchObject({ reportID: '2' });
            // When go back to the same page with different route params that does not exist in the navigation state
            (0, react_native_1.act)(function () {
                Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID.getRoute('3'));
            });
            // Then replace the current page with the same one with different params
            var reportsSplitAfterGoBack = (_g = navigationRef_1.default.current) === null || _g === void 0 ? void 0 : _g.getRootState().routes.at(0);
            expect((_h = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _h === void 0 ? void 0 : _h.index).toBe(2);
            expect((_k = (_j = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _j === void 0 ? void 0 : _j.routes.at(-1)) === null || _k === void 0 ? void 0 : _k.name).toBe(SCREENS_1.default.REPORT);
            expect((_m = (_l = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _l === void 0 ? void 0 : _l.routes.at(-1)) === null || _m === void 0 ? void 0 : _m.params).toMatchObject({ reportID: '3' });
        });
        it('Should go back without comparing params', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            // Given the initialized navigation on the narrow layout with reports split navigator
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR,
                            state: {
                                index: 3,
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
                                    {
                                        name: SCREENS_1.default.REPORT,
                                        params: { reportID: '3' },
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var reportsSplitBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(0);
            expect((_b = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _b === void 0 ? void 0 : _b.index).toBe(3);
            expect((_d = (_c = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _c === void 0 ? void 0 : _c.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(SCREENS_1.default.REPORT);
            expect((_f = (_e = reportsSplitBeforeGoBack === null || reportsSplitBeforeGoBack === void 0 ? void 0 : reportsSplitBeforeGoBack.state) === null || _e === void 0 ? void 0 : _e.routes.at(-1)) === null || _f === void 0 ? void 0 : _f.params).toMatchObject({ reportID: '3' });
            // When go back to the same page with different route params without comparing params
            (0, react_native_1.act)(function () {
                Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID.getRoute('1'), { compareParams: false });
            });
            // Then do not go back to the page with matching route params, instead replace the current page
            var reportsSplitAfterGoBack = (_g = navigationRef_1.default.current) === null || _g === void 0 ? void 0 : _g.getRootState().routes.at(0);
            expect((_h = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _h === void 0 ? void 0 : _h.index).toBe(3);
            expect((_k = (_j = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _j === void 0 ? void 0 : _j.routes.at(-1)) === null || _k === void 0 ? void 0 : _k.name).toBe(SCREENS_1.default.REPORT);
            expect((_m = (_l = reportsSplitAfterGoBack === null || reportsSplitAfterGoBack === void 0 ? void 0 : reportsSplitAfterGoBack.state) === null || _l === void 0 ? void 0 : _l.routes.at(-1)) === null || _m === void 0 ? void 0 : _m.params).toMatchObject({ reportID: '1' });
        });
    });
});
describe('Go back on the wide layout', function () {
    beforeEach(function () {
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedUseResponsiveLayout.mockReturnValue(__assign(__assign({}, CONST_1.default.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: false, isSmallScreenWidth: false, isLargeScreenWidth: true }));
    });
    it('should preserved backTo params between central screen and side bar screen', function () {
        var _a, _b, _c;
        // Given the initialized navigation with workspaces split navigator
        (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                index: 0,
                routes: [
                    {
                        name: NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR,
                        state: {
                            index: 0,
                            routes: [
                                {
                                    name: SCREENS_1.default.WORKSPACE.PER_DIEM,
                                    params: { policyID: mockedPolicyID, backTo: mockedBackToRoute },
                                },
                            ],
                        },
                    },
                ],
            }}/>);
        // Then the backTo params should be preserved in the sidebar route
        var initialRootState = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState();
        var initialWorkspaceNavigator = initialRootState === null || initialRootState === void 0 ? void 0 : initialRootState.routes.at(0);
        var initialRoutes = (_c = (_b = initialWorkspaceNavigator === null || initialWorkspaceNavigator === void 0 ? void 0 : initialWorkspaceNavigator.state) === null || _b === void 0 ? void 0 : _b.routes) !== null && _c !== void 0 ? _c : [];
        var initialSidebarRoute = initialRoutes.find(function (route) { return route.name === SCREENS_1.default.WORKSPACE.INITIAL; });
        expect(initialSidebarRoute === null || initialSidebarRoute === void 0 ? void 0 : initialSidebarRoute.params).toMatchObject({
            policyID: mockedPolicyID,
            backTo: mockedBackToRoute,
        });
    });
});

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
describe('Navigate', function () {
    beforeEach(function () {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue(__assign(__assign({}, CONST_1.default.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: true }));
    });
    describe('on the narrow layout', function () {
        it('to the page within the same navigator', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Given the initialized navigation on the narrow layout with the settings split navigator
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 0,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SETTINGS.ROOT,
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var settingsSplitBeforeGoBack = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().routes.at(0);
            expect((_b = settingsSplitBeforeGoBack === null || settingsSplitBeforeGoBack === void 0 ? void 0 : settingsSplitBeforeGoBack.state) === null || _b === void 0 ? void 0 : _b.index).toBe(0);
            expect((_d = (_c = settingsSplitBeforeGoBack === null || settingsSplitBeforeGoBack === void 0 ? void 0 : settingsSplitBeforeGoBack.state) === null || _c === void 0 ? void 0 : _c.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name).toBe(SCREENS_1.default.SETTINGS.ROOT);
            // When navigate to the page from the same split navigator
            (0, react_native_1.act)(function () {
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_PROFILE.getRoute());
            });
            // Then push a new page to the current split navigator
            var settingsSplitAfterGoBack = (_e = navigationRef_1.default.current) === null || _e === void 0 ? void 0 : _e.getRootState().routes.at(0);
            expect((_f = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _f === void 0 ? void 0 : _f.index).toBe(1);
            expect((_h = (_g = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _g === void 0 ? void 0 : _g.routes.at(-1)) === null || _h === void 0 ? void 0 : _h.name).toBe(SCREENS_1.default.SETTINGS.PROFILE.ROOT);
        });
        it('to the page within the same navigator using replace action', function () {
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
            // When navigate to the page from the same split navigator using replace action
            (0, react_native_1.act)(function () {
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ABOUT, { forceReplace: true });
            });
            // Then replace the current page with the page passed to the navigate function
            var settingsSplitAfterGoBack = (_e = navigationRef_1.default.current) === null || _e === void 0 ? void 0 : _e.getRootState().routes.at(0);
            expect((_f = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _f === void 0 ? void 0 : _f.index).toBe(1);
            expect((_h = (_g = settingsSplitAfterGoBack === null || settingsSplitAfterGoBack === void 0 ? void 0 : settingsSplitAfterGoBack.state) === null || _g === void 0 ? void 0 : _g.routes.at(-1)) === null || _h === void 0 ? void 0 : _h.name).toBe(SCREENS_1.default.SETTINGS.ABOUT);
        });
        it('to the page from the different split navigator', function () {
            var _a, _b, _c, _d;
            // Given the initialized navigation on the narrow layout with the settings split navigator
            (0, react_native_1.render)(<TestNavigationContainer_1.default initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 0,
                                routes: [
                                    {
                                        name: SCREENS_1.default.SETTINGS.ROOT,
                                    },
                                ],
                            },
                        },
                    ],
                }}/>);
            var rootStateBeforeNavigate = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState();
            var lastSplitBeforeNavigate = rootStateBeforeNavigate === null || rootStateBeforeNavigate === void 0 ? void 0 : rootStateBeforeNavigate.routes.at(-1);
            expect(rootStateBeforeNavigate === null || rootStateBeforeNavigate === void 0 ? void 0 : rootStateBeforeNavigate.index).toBe(0);
            expect(lastSplitBeforeNavigate === null || lastSplitBeforeNavigate === void 0 ? void 0 : lastSplitBeforeNavigate.name).toBe(NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR);
            expect((_c = (_b = lastSplitBeforeNavigate === null || lastSplitBeforeNavigate === void 0 ? void 0 : lastSplitBeforeNavigate.state) === null || _b === void 0 ? void 0 : _b.routes.at(-1)) === null || _c === void 0 ? void 0 : _c.name).toBe(SCREENS_1.default.SETTINGS.ROOT);
            // When navigate to the page from the different split navigator
            (0, react_native_1.act)(function () {
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute('1'));
            });
            // Then push a new split navigator to the navigation state
            var rootStateAfterNavigate = (_d = navigationRef_1.default.current) === null || _d === void 0 ? void 0 : _d.getRootState();
            var lastSplitAfterNavigate = rootStateAfterNavigate === null || rootStateAfterNavigate === void 0 ? void 0 : rootStateAfterNavigate.routes.at(-1);
            expect(rootStateAfterNavigate === null || rootStateAfterNavigate === void 0 ? void 0 : rootStateAfterNavigate.index).toBe(1);
            expect(lastSplitAfterNavigate === null || lastSplitAfterNavigate === void 0 ? void 0 : lastSplitAfterNavigate.name).toBe(NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR);
        });
    });
});

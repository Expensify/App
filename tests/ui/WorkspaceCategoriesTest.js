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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var portal_1 = require("@gorhom/portal");
var native_1 = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var ComposeProviders_1 = require("@components/ComposeProviders");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var useCurrentReportID_1 = require("@hooks/useCurrentReportID");
var useResponsiveLayoutModule = require("@hooks/useResponsiveLayout");
var Localize_1 = require("@libs/Localize");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var WorkspaceCategoriesPage_1 = require("@pages/workspace/categories/WorkspaceCategoriesPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var LHNTestUtils = require("../utils/LHNTestUtils");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
jest.mock('@src/components/ConfirmedRoute.tsx');
TestHelper.setupGlobalFetchMock();
var Stack = (0, createPlatformStackNavigator_1.default)();
var renderPage = function (initialRouteName, initialParams) {
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useCurrentReportID_1.CurrentReportIDContextProvider]}>
            <portal_1.PortalProvider>
                <native_1.NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen name={SCREENS_1.default.WORKSPACE.CATEGORIES} component={WorkspaceCategoriesPage_1.default} initialParams={initialParams}/>
                    </Stack.Navigator>
                </native_1.NavigationContainer>
            </portal_1.PortalProvider>
        </ComposeProviders_1.default>);
};
describe('WorkspaceCategories', function () {
    var FIRST_CATEGORY = 'categoryOne';
    var SECOND_CATEGORY = 'categoryTwo';
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, CONST_1.default.LOCALES.EN)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
                        isSmallScreenWidth: false,
                        shouldUseNarrowLayout: false,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should delete categories through UI interactions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policy, categories, unmount, dropdownMenuButtonTestID, dropdownButton, deleteMenuItem, mockEvent, deleteConfirmButton;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _b.sent();
                    policy = __assign(__assign({}, LHNTestUtils.getFakePolicy()), { role: CONST_1.default.POLICY.ROLE.ADMIN, areCategoriesEnabled: true });
                    categories = (_a = {},
                        _a[FIRST_CATEGORY] = {
                            name: FIRST_CATEGORY,
                            enabled: true,
                        },
                        _a[SECOND_CATEGORY] = {
                            name: SECOND_CATEGORY,
                            enabled: true,
                        },
                        _a);
                    // Initialize categories
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id), policy)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policy.id), categories)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    // Initialize categories
                    _b.sent();
                    unmount = renderPage(SCREENS_1.default.WORKSPACE.CATEGORIES, { policyID: policy.id }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _b.sent();
                    // Wait for initial render and verify categories are visible
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText(FIRST_CATEGORY)).toBeOnTheScreen();
                        })];
                case 4:
                    // Wait for initial render and verify categories are visible
                    _b.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText(SECOND_CATEGORY)).toBeOnTheScreen();
                        })];
                case 5:
                    _b.sent();
                    // Select categories to delete by clicking their checkboxes
                    react_native_1.fireEvent.press(react_native_1.screen.getByTestId("TableListItemCheckbox-".concat(FIRST_CATEGORY)));
                    react_native_1.fireEvent.press(react_native_1.screen.getByTestId("TableListItemCheckbox-".concat(SECOND_CATEGORY)));
                    dropdownMenuButtonTestID = "".concat(WorkspaceCategoriesPage_1.default.displayName, "-header-dropdown-menu-button");
                    // Wait for selection mode to be active and click the dropdown menu button
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
                        })];
                case 6:
                    // Wait for selection mode to be active and click the dropdown menu button
                    _b.sent();
                    dropdownButton = react_native_1.screen.getByTestId(dropdownMenuButtonTestID);
                    react_native_1.fireEvent.press(dropdownButton);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 7:
                    _b.sent();
                    // Wait for menu items to be visible
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            var deleteText = (0, Localize_1.translateLocal)('workspace.categories.deleteCategories');
                            expect(react_native_1.screen.getByText(deleteText)).toBeOnTheScreen();
                        })];
                case 8:
                    // Wait for menu items to be visible
                    _b.sent();
                    deleteMenuItem = react_native_1.screen.getByTestId('PopoverMenuItem-Delete categories');
                    expect(deleteMenuItem).toBeOnTheScreen();
                    mockEvent = {
                        nativeEvent: {},
                        type: 'press',
                        target: deleteMenuItem,
                        currentTarget: deleteMenuItem,
                    };
                    react_native_1.fireEvent.press(deleteMenuItem, mockEvent);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 9:
                    _b.sent();
                    // After clicking delete categories dropdown menu item, verify the confirmation modal appears
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            var confirmModalPrompt = (0, Localize_1.translateLocal)('workspace.categories.deleteCategoriesPrompt');
                            expect(react_native_1.screen.getByText(confirmModalPrompt)).toBeOnTheScreen();
                        })];
                case 10:
                    // After clicking delete categories dropdown menu item, verify the confirmation modal appears
                    _b.sent();
                    // Verify the delete button in the modal is visible
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            var deleteConfirmButton = react_native_1.screen.getByLabelText((0, Localize_1.translateLocal)('common.delete'));
                            expect(deleteConfirmButton).toBeOnTheScreen();
                        })];
                case 11:
                    // Verify the delete button in the modal is visible
                    _b.sent();
                    deleteConfirmButton = react_native_1.screen.getByLabelText((0, Localize_1.translateLocal)('common.delete'));
                    react_native_1.fireEvent.press(deleteConfirmButton);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 12:
                    _b.sent();
                    // Verify the categories are deleted from the UI
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.queryByText(FIRST_CATEGORY)).not.toBeOnTheScreen();
                        })];
                case 13:
                    // Verify the categories are deleted from the UI
                    _b.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.queryByText(SECOND_CATEGORY)).not.toBeOnTheScreen();
                        })];
                case 14:
                    _b.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 15:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should show a blocking modal when trying to disable the only enabled category when policy has requiresCategory set to true', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policy, categories, unmount, dropdownMenuButtonTestID, dropdownButton, disableMenuItem, mockEvent;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _b.sent();
                    policy = __assign(__assign({}, LHNTestUtils.getFakePolicy()), { role: CONST_1.default.POLICY.ROLE.ADMIN, areCategoriesEnabled: true, requiresCategory: true });
                    categories = (_a = {},
                        _a[FIRST_CATEGORY] = {
                            name: FIRST_CATEGORY,
                            enabled: true,
                        },
                        _a[SECOND_CATEGORY] = {
                            name: SECOND_CATEGORY,
                            enabled: true,
                        },
                        _a);
                    // Initialize categories
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id), policy)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policy.id), categories)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    // Initialize categories
                    _b.sent();
                    unmount = renderPage(SCREENS_1.default.WORKSPACE.CATEGORIES, { policyID: policy.id }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _b.sent();
                    // Wait for initial render and verify categories are visible
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText(FIRST_CATEGORY)).toBeOnTheScreen();
                        })];
                case 4:
                    // Wait for initial render and verify categories are visible
                    _b.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText(SECOND_CATEGORY)).toBeOnTheScreen();
                        })];
                case 5:
                    _b.sent();
                    // Select categories to delete by clicking their checkboxes
                    react_native_1.fireEvent.press(react_native_1.screen.getByTestId("TableListItemCheckbox-".concat(FIRST_CATEGORY)));
                    react_native_1.fireEvent.press(react_native_1.screen.getByTestId("TableListItemCheckbox-".concat(SECOND_CATEGORY)));
                    dropdownMenuButtonTestID = "".concat(WorkspaceCategoriesPage_1.default.displayName, "-header-dropdown-menu-button");
                    // Wait for selection mode to be active and click the dropdown menu button
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByTestId(dropdownMenuButtonTestID)).toBeOnTheScreen();
                        })];
                case 6:
                    // Wait for selection mode to be active and click the dropdown menu button
                    _b.sent();
                    dropdownButton = react_native_1.screen.getByTestId(dropdownMenuButtonTestID);
                    react_native_1.fireEvent.press(dropdownButton);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 7:
                    _b.sent();
                    // Wait for menu items to be visible
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            var disableText = (0, Localize_1.translateLocal)('workspace.categories.disableCategories');
                            expect(react_native_1.screen.getByText(disableText)).toBeOnTheScreen();
                        })];
                case 8:
                    // Wait for menu items to be visible
                    _b.sent();
                    disableMenuItem = react_native_1.screen.getByTestId('PopoverMenuItem-Disable categories');
                    expect(disableMenuItem).toBeOnTheScreen();
                    mockEvent = {
                        nativeEvent: {},
                        type: 'press',
                        target: disableMenuItem,
                        currentTarget: disableMenuItem,
                    };
                    react_native_1.fireEvent.press(disableMenuItem, mockEvent);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 9:
                    _b.sent();
                    // After clicking disable categories dropdown menu item, verify the blocking modal appears
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            var blockingPrompt = (0, Localize_1.translateLocal)('workspace.categories.cannotDeleteOrDisableAllCategories.title');
                            expect(react_native_1.screen.getByText(blockingPrompt)).toBeOnTheScreen();
                        })];
                case 10:
                    // After clicking disable categories dropdown menu item, verify the blocking modal appears
                    _b.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 11:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

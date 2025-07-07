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
var _a;
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
var WorkspaceTagsPage_1 = require("@pages/workspace/tags/WorkspaceTagsPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var LHNTestUtils = require("../utils/LHNTestUtils");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
TestHelper.setupGlobalFetchMock();
jest.unmock('react-native-reanimated');
var Stack = (0, createPlatformStackNavigator_1.default)();
var renderPage = function (initialRouteName, initialParams) {
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useCurrentReportID_1.CurrentReportIDContextProvider]}>
            <portal_1.PortalProvider>
                <native_1.NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen name={SCREENS_1.default.WORKSPACE.TAGS} component={WorkspaceTagsPage_1.default} initialParams={initialParams}/>
                    </Stack.Navigator>
                </native_1.NavigationContainer>
            </portal_1.PortalProvider>
        </ComposeProviders_1.default>);
};
var FIRST_TAG = 'Tag One';
var SECOND_TAG = 'Tag Two';
var tags = {
    TagListOne: {
        name: 'TagListOne',
        required: true,
        orderWeight: 1,
        tags: (_a = {},
            _a[FIRST_TAG] = {
                name: FIRST_TAG,
                enabled: true,
            },
            _a[SECOND_TAG] = {
                name: SECOND_TAG,
                enabled: true,
            },
            _a),
    },
};
describe('WorkspaceTags', function () {
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
                        isSmallScreenWidth: true,
                        shouldUseNarrowLayout: true,
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
    it('should show select option when the item is not selected and deselect option when the item is selected', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policy, unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    policy = __assign(__assign({}, LHNTestUtils.getFakePolicy()), { role: CONST_1.default.POLICY.ROLE.ADMIN, areTagsEnabled: true, requiresTag: true });
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id), policy)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policy.id), tags)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderPage(SCREENS_1.default.WORKSPACE.TAGS, { policyID: policy.id }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText(FIRST_TAG)).toBeOnTheScreen();
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText(SECOND_TAG)).toBeOnTheScreen();
                        })];
                case 5:
                    _a.sent();
                    // Long press on the first tag to trigger the select action
                    (0, react_native_1.fireEvent)(react_native_1.screen.getByTestId("base-list-item-Tag One"), 'onLongPress');
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    // Wait for the "Select" option to appear
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('common.select'))).toBeOnTheScreen();
                        })];
                case 7:
                    // Wait for the "Select" option to appear
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should show a blocking modal when trying to disable the only enabled tag when policy has requiresTag set to true', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policy, unmount, dropdownMenuButtonTestID, disableMenuItem, mockEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
                        isSmallScreenWidth: false,
                        shouldUseNarrowLayout: false,
                    });
                    return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    policy = __assign(__assign({}, LHNTestUtils.getFakePolicy()), { role: CONST_1.default.POLICY.ROLE.ADMIN, areTagsEnabled: true, requiresTag: true });
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id), policy)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policy.id), tags)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderPage(SCREENS_1.default.WORKSPACE.TAGS, { policyID: policy.id }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText(FIRST_TAG)).toBeOnTheScreen();
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText(SECOND_TAG)).toBeOnTheScreen();
                        })];
                case 5:
                    _a.sent();
                    react_native_1.fireEvent.press(react_native_1.screen.getByTestId("TableListItemCheckbox-".concat(FIRST_TAG)));
                    react_native_1.fireEvent.press(react_native_1.screen.getByTestId("TableListItemCheckbox-".concat(SECOND_TAG)));
                    dropdownMenuButtonTestID = "".concat(WorkspaceTagsPage_1.default.displayName, "-header-dropdown-menu-button");
                    react_native_1.fireEvent.press(react_native_1.screen.getByTestId(dropdownMenuButtonTestID));
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('workspace.tags.disableTags'))).toBeOnTheScreen();
                        })];
                case 6:
                    _a.sent();
                    disableMenuItem = react_native_1.screen.getByTestId('PopoverMenuItem-Disable tags');
                    mockEvent = { nativeEvent: {}, type: 'press', target: disableMenuItem, currentTarget: disableMenuItem };
                    react_native_1.fireEvent.press(disableMenuItem, mockEvent);
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('workspace.tags.cannotDeleteOrDisableAllTags.title'))).toBeOnTheScreen();
                        })];
                case 7:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

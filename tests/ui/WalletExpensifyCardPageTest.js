"use strict";
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
var ExpensifyCardPage_1 = require("@pages/settings/Wallet/ExpensifyCardPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
// Set up a global fetch mock for API requests in tests.
TestHelper.setupGlobalFetchMock();
// Create a stack navigator for the settings pages.
var Stack = (0, createPlatformStackNavigator_1.default)();
var userCardID = '1234';
// Renders the ExpensifyCardPage inside a navigation container with necessary providers.
var renderPage = function (initialRouteName, initialParams) {
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useCurrentReportID_1.CurrentReportIDContextProvider]}>
            <portal_1.PortalProvider>
                <native_1.NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen name={SCREENS_1.default.SETTINGS.WALLET.DOMAIN_CARD} component={ExpensifyCardPage_1.default} initialParams={initialParams}/>
                    </Stack.Navigator>
                </native_1.NavigationContainer>
            </portal_1.PortalProvider>
        </ComposeProviders_1.default>);
};
describe('ExpensifyCardPage', function () {
    beforeAll(function () {
        // Initialize Onyx with required keys before running any test.
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () {
        // Mock the useResponsiveLayout hook to control layout behavior in tests.
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        });
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Clear Onyx data and reset all mocks after each test to ensure a clean state.
                return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
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
                    // Clear Onyx data and reset all mocks after each test to ensure a clean state.
                    _a.sent();
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should show the Report Fraud and Reveal details options on screen', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Sign in as a test user before running the test.
                return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    // Sign in as a test user before running the test.
                    _a.sent();
                    // Add a mock card to Onyx storage to simulate a valid card being loaded.
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.CARD_LIST, (_a = {},
                                            _a[userCardID] = {
                                                cardID: 1234,
                                                state: CONST_1.default.EXPENSIFY_CARD.STATE.OPEN,
                                                domainName: 'xyz',
                                                nameValuePairs: {
                                                    isVirtual: true,
                                                    cardTitle: 'Test Virtual Card',
                                                },
                                                availableSpend: 50000,
                                                fraud: null,
                                            },
                                            _a))];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    // Add a mock card to Onyx storage to simulate a valid card being loaded.
                    _a.sent();
                    unmount = renderPage(SCREENS_1.default.SETTINGS.WALLET.DOMAIN_CARD, { cardID: '1234' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    // Verify that the "Report Fraud" option is displayed on the screen.
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('cardPage.reportFraud'))).toBeOnTheScreen();
                        })];
                case 4:
                    // Verify that the "Report Fraud" option is displayed on the screen.
                    _a.sent();
                    // Verify that the "Reveal Details" option is displayed on the screen.
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('cardPage.cardDetails.revealDetails'))).toBeOnTheScreen();
                        })];
                case 5:
                    // Verify that the "Reveal Details" option is displayed on the screen.
                    _a.sent();
                    // Unmount the component after assertions to clean up.
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not show the Report Fraud and Reveal details options on screen', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Sign in as a test user before running the test.
                return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    // Sign in as a test user before running the test.
                    _a.sent();
                    // Add a mock card to Onyx storage with additional delegated access data.
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.CARD_LIST, (_a = {},
                                            _a[userCardID] = {
                                                cardID: 1234,
                                                state: CONST_1.default.EXPENSIFY_CARD.STATE.OPEN,
                                                domainName: 'xyz',
                                                nameValuePairs: {
                                                    isVirtual: true,
                                                    cardTitle: 'Test Virtual Card',
                                                },
                                                availableSpend: 50000,
                                                fraud: null,
                                            },
                                            _a))];
                                    case 1:
                                        _b.sent();
                                        // Add delegated access data to simulate a user without fraud reporting permissions.
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, {
                                                delegatedAccess: {
                                                    delegate: 'test@test.com',
                                                },
                                            })];
                                    case 2:
                                        // Add delegated access data to simulate a user without fraud reporting permissions.
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    // Add a mock card to Onyx storage with additional delegated access data.
                    _a.sent();
                    unmount = renderPage(SCREENS_1.default.SETTINGS.WALLET.DOMAIN_CARD, { cardID: '1234' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    // Verify that the "Report Fraud" option is NOT displayed on the screen.
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.queryByText((0, Localize_1.translateLocal)('cardPage.reportFraud'))).not.toBeOnTheScreen();
                        })];
                case 4:
                    // Verify that the "Report Fraud" option is NOT displayed on the screen.
                    _a.sent();
                    // Verify that the "Reveal Details" option is NOT displayed on the screen.
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.queryByText((0, Localize_1.translateLocal)('cardPage.cardDetails.revealDetails'))).not.toBeOnTheScreen();
                        })];
                case 5:
                    // Verify that the "Reveal Details" option is NOT displayed on the screen.
                    _a.sent();
                    // Unmount the component after assertions to clean up.
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

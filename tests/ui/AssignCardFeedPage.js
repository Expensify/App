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
var Navigation_1 = require("@libs/Navigation/Navigation");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var AssignCardFeedPage_1 = require("@pages/workspace/companyCards/assignCard/AssignCardFeedPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var LHNTestUtils = require("../utils/LHNTestUtils");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
// Set up a global fetch mock for API requests in tests.
TestHelper.setupGlobalFetchMock();
jest.mock('@hooks/useNetwork', function () {
    return jest.fn(function () { return ({
        isOffline: false,
    }); });
});
jest.mock('@rnmapbox/maps', function () {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@react-native-community/geolocation', function () { return ({
    setRNConfiguration: jest.fn(),
}); });
jest.mock('react-native-plaid-link-sdk', function () { return ({
    dismissLink: jest.fn(),
    openLink: jest.fn(),
    usePlaidEmitter: jest.fn(),
}); });
jest.mock('@components/FormAlertWrapper', function () { return 'FormAlertWrapper'; });
jest.mock('@components/FormAlertWithSubmitButton', function () { return 'FormAlertWithSubmitButton'; });
// Create a stack navigator for the settings pages.
var Stack = (0, createPlatformStackNavigator_1.default)();
// Renders the AssignCardFeedPage inside a navigation container with necessary providers.
var renderPage = function (initialRouteName, initialParams) {
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useCurrentReportID_1.CurrentReportIDContextProvider]}>
            <portal_1.PortalProvider>
                <native_1.NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen name={SCREENS_1.default.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD} component={AssignCardFeedPage_1.default} initialParams={initialParams}/>
                    </Stack.Navigator>
                </native_1.NavigationContainer>
            </portal_1.PortalProvider>
        </ComposeProviders_1.default>);
};
describe('AssignCardFeedPage', function () {
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
    it('should navigate to the member details page as the assignee email has not changed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var goBack, policy, unmount, assignCardButton, mockEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Sign in as a test user before running the test.
                return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    // Sign in as a test user before running the test.
                    _a.sent();
                    goBack = jest.spyOn(Navigation_1.default, 'goBack');
                    policy = __assign(__assign({}, LHNTestUtils.getFakePolicy()), { role: CONST_1.default.POLICY.ROLE.ADMIN, areTagsEnabled: true, requiresTag: true });
                    // Add mock policy and mock the assign card details
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id), policy)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.ASSIGN_CARD, {
                                                data: {
                                                    bankName: 'vcf',
                                                    email: 'testaccount+1@gmail.com',
                                                    cardName: "Test 1's card",
                                                    cardNumber: '490901XXXXXX1234',
                                                    // cspell:disable-next-line
                                                    encryptedCardNumber: 'v12:74E3CA3C4C0FA02FDCF754FDSFDSF',
                                                    dateOption: 'fromBeginning',
                                                    startDate: '2024-12-27',
                                                },
                                                currentStep: 'Confirmation',
                                                isEditing: false,
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    // Add mock policy and mock the assign card details
                    _a.sent();
                    unmount = renderPage(SCREENS_1.default.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD, {
                        policyID: policy.id,
                        feed: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX,
                        backTo: ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policy === null || policy === void 0 ? void 0 : policy.id, 1234),
                    }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    // Verify that Assign card button is visible on the screen
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByTestId('assignCardButtonTestID')).toBeOnTheScreen();
                        })];
                case 4:
                    // Verify that Assign card button is visible on the screen
                    _a.sent();
                    assignCardButton = react_native_1.screen.getByTestId('assignCardButtonTestID');
                    mockEvent = {
                        nativeEvent: {},
                        type: 'press',
                        target: assignCardButton,
                        currentTarget: assignCardButton,
                    };
                    react_native_1.fireEvent.press(assignCardButton, mockEvent);
                    // Verify that we navigate to the member details page as the card assignee has not changed
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(goBack).toHaveBeenCalledWith(ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, 1234));
                        })];
                case 5:
                    // Verify that we navigate to the member details page as the card assignee has not changed
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
    it('should navigate to the company cards page as the assignee email has changed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var navigate, policy, unmount, assignCardButton, mockEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Sign in as a test user before running the test.
                return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    // Sign in as a test user before running the test.
                    _a.sent();
                    navigate = jest.spyOn(Navigation_1.default, 'navigate');
                    policy = __assign(__assign({}, LHNTestUtils.getFakePolicy()), { role: CONST_1.default.POLICY.ROLE.ADMIN, areTagsEnabled: true, requiresTag: true });
                    // Add mock policy and mock the assign card details
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id), policy)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.ASSIGN_CARD, {
                                                data: {
                                                    bankName: 'vcf',
                                                    email: 'testaccount+1@gmail.com',
                                                    cardName: "Test 1's card",
                                                    cardNumber: '490901XXXXXX1234',
                                                    // cspell:disable-next-line
                                                    encryptedCardNumber: 'v12:74E3CA3C4C0FA02FDCF754FDSFDSF',
                                                    dateOption: 'fromBeginning',
                                                    startDate: '2024-12-27',
                                                },
                                                currentStep: 'Confirmation',
                                                isEditing: false,
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    // Add mock policy and mock the assign card details
                    _a.sent();
                    unmount = renderPage(SCREENS_1.default.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD, {
                        policyID: policy.id,
                        feed: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX,
                        backTo: ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policy === null || policy === void 0 ? void 0 : policy.id, 1234),
                    }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    // Mock the action of changing the assignee of the card
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.ASSIGN_CARD, {
                                            data: {
                                                email: 'testaccount+2@gmail.com',
                                            },
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 4:
                    // Mock the action of changing the assignee of the card
                    _a.sent();
                    // Verify that Assign card button is visible on the screen
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByTestId('assignCardButtonTestID')).toBeOnTheScreen();
                        })];
                case 5:
                    // Verify that Assign card button is visible on the screen
                    _a.sent();
                    assignCardButton = react_native_1.screen.getByTestId('assignCardButtonTestID');
                    mockEvent = {
                        nativeEvent: {},
                        type: 'press',
                        target: assignCardButton,
                        currentTarget: assignCardButton,
                    };
                    react_native_1.fireEvent.press(assignCardButton, mockEvent);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    // Verify that we navigate to the company cards page as the card assignee has changed
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policy.id), { forceReplace: true });
                        })];
                case 7:
                    // Verify that we navigate to the company cards page as the card assignee has changed
                    _a.sent();
                    // Unmount the component after assertions to clean up.
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

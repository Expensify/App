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
var Link_1 = require("@libs/actions/Link");
var Session_1 = require("@libs/actions/Session");
var HttpUtils_1 = require("@libs/HttpUtils");
var Localize_1 = require("@libs/Localize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var OnboardingWorkEmail_1 = require("@pages/OnboardingWorkEmail");
var OnboardingWorkEmailValidation_1 = require("@pages/OnboardingWorkEmailValidation");
var CONST_1 = require("@src/CONST");
var Session_2 = require("@src/libs/actions/Session");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
jest.mock('@libs/actions/Link', function () { return ({
    openOldDotLink: jest.fn(),
}); });
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
TestHelper.setupGlobalFetchMock();
var Stack = (0, createPlatformStackNavigator_1.default)();
var workEmail = 'testprivateemail@privateEmail.com';
var renderOnboardingWorkEmailPage = function (initialRouteName, initialParams) {
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useCurrentReportID_1.CurrentReportIDContextProvider]}>
            <portal_1.PortalProvider>
                <native_1.NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORK_EMAIL} component={OnboardingWorkEmail_1.default} initialParams={initialParams}/>
                    </Stack.Navigator>
                </native_1.NavigationContainer>
            </portal_1.PortalProvider>
        </ComposeProviders_1.default>);
};
var renderOnboardingWorkEmailValidationPage = function (initialRouteName, initialParams) {
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useCurrentReportID_1.CurrentReportIDContextProvider]}>
            <portal_1.PortalProvider>
                <native_1.NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORK_EMAIL_VALIDATION} component={OnboardingWorkEmailValidation_1.default} initialParams={initialParams}/>
                    </Stack.Navigator>
                </native_1.NavigationContainer>
            </portal_1.PortalProvider>
        </ComposeProviders_1.default>);
};
var navigate = jest.spyOn(Navigation_1.default, 'navigate');
function MergeIntoAccountAndLoginBlockMerge() {
    var originalXhr = HttpUtils_1.default.xhr;
    HttpUtils_1.default.xhr = jest.fn().mockImplementation(function () {
        var mockedResponse = {
            jsonCode: 501,
            onyxData: [
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.NVP_ONBOARDING,
                    value: {
                        isMergeAccountStepCompleted: true,
                        shouldRedirectToClassicAfterMerge: false,
                        isMergingAccountBlocked: true,
                    },
                },
            ],
        };
        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    (0, Session_2.MergeIntoAccountAndLogin)(workEmail, '123456', 1);
    return (0, waitForBatchedUpdates_1.default)().then(function () { return (HttpUtils_1.default.xhr = originalXhr); });
}
function MergeIntoAccountAndLoginSuccessful() {
    var originalXhr = HttpUtils_1.default.xhr;
    HttpUtils_1.default.xhr = jest.fn().mockImplementation(function () {
        var mockedResponse = {
            jsonCode: 401,
            onyxData: [
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.NVP_ONBOARDING,
                    value: {
                        isMergeAccountStepCompleted: true,
                    },
                },
            ],
        };
        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    (0, Session_2.MergeIntoAccountAndLogin)(workEmail, '123456', 1);
    return (0, waitForBatchedUpdates_1.default)().then(function () { return (HttpUtils_1.default.xhr = originalXhr); });
}
function MergeIntoAccountAndLoginRedirectToClassic() {
    var originalXhr = HttpUtils_1.default.xhr;
    HttpUtils_1.default.xhr = jest.fn().mockImplementation(function () {
        var mockedResponse = {
            jsonCode: 200,
            onyxData: [
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.NVP_ONBOARDING,
                    value: {
                        isMergeAccountStepCompleted: true,
                        shouldRedirectToClassicAfterMerge: true,
                    },
                },
            ],
        };
        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    (0, Session_2.MergeIntoAccountAndLogin)(workEmail, '123456', 1);
    return (0, waitForBatchedUpdates_1.default)().then(function () { return (HttpUtils_1.default.xhr = originalXhr); });
}
function AddWorkEmailShouldValidateFailure() {
    var originalXhr = HttpUtils_1.default.xhr;
    HttpUtils_1.default.xhr = jest.fn().mockImplementation(function () {
        var mockedResponse = {
            jsonCode: 200,
            onyxData: [
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.NVP_ONBOARDING,
                    value: {
                        shouldValidate: false,
                    },
                },
            ],
        };
        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    (0, Session_1.AddWorkEmail)(workEmail);
    return (0, waitForBatchedUpdates_1.default)().then(function () { return (HttpUtils_1.default.xhr = originalXhr); });
}
function AddWorkEmailShouldValidate() {
    var originalXhr = HttpUtils_1.default.xhr;
    HttpUtils_1.default.xhr = jest.fn().mockImplementation(function () {
        var mockedResponse = {
            jsonCode: 200,
            onyxData: [
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.NVP_ONBOARDING,
                    value: {
                        shouldValidate: true,
                    },
                },
            ],
        };
        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    (0, Session_1.AddWorkEmail)(workEmail);
    return (0, waitForBatchedUpdates_1.default)().then(function () { return (HttpUtils_1.default.xhr = originalXhr); });
}
describe('OnboardingWorkEmail Page', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        });
    });
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
    it('should display onboarding work email screen content correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('onboarding.workEmail.title'))).toBeOnTheScreen();
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('onboarding.workEmail.addWorkEmail'))).toBeOnTheScreen();
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('common.skip'))).toBeOnTheScreen();
                        })];
                case 6:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should navigate to Onboarding purpose page when skip is pressed and there is no signupQualifier', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount, skipButton, mockEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    skipButton = react_native_1.screen.getByTestId('onboardingPrivateEmailSkipButton');
                    mockEvent = {
                        nativeEvent: {},
                        type: 'press',
                        target: skipButton,
                        currentTarget: skipButton,
                    };
                    react_native_1.fireEvent.press(skipButton, mockEvent);
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.ONBOARDING_PURPOSE.getRoute(), { forceReplace: true });
                        })];
                case 4:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should navigate to Onboarding private domain page when email is entered but shouldValidate is set to false', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    AddWorkEmailShouldValidateFailure();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.ONBOARDING_PRIVATE_DOMAIN.getRoute(), { forceReplace: true });
                        })];
                case 5:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should navigate to Onboarding work email validation page when email is entered and shouldValidate is set to true', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    AddWorkEmailShouldValidate();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute());
                        })];
                case 5:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should navigate to Onboarding employee page when skip is pressed and user is routed app via smb', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount, skipButton, mockEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                            signupQualifier: CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    skipButton = react_native_1.screen.getByTestId('onboardingPrivateEmailSkipButton');
                    mockEvent = {
                        nativeEvent: {},
                        type: 'press',
                        target: skipButton,
                        currentTarget: skipButton,
                    };
                    react_native_1.fireEvent.press(skipButton, mockEvent);
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.ONBOARDING_EMPLOYEES.getRoute(), { forceReplace: true });
                        })];
                case 4:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('OnboardingWorkEmailValidation Page', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        });
    });
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
    it('should display onboarding work email screen content correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                            shouldValidate: true,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                                                onboardingWorkEmail: workEmail,
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailValidationPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL_VALIDATION, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('onboarding.workEmailValidation.magicCodeSent', { workEmail: workEmail }))).toBeOnTheScreen();
                        })];
                case 4:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display onboarding merge block screen content correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                            shouldValidate: true,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                                                onboardingWorkEmail: workEmail,
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailValidationPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL_VALIDATION, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, MergeIntoAccountAndLoginBlockMerge()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('onboarding.mergeBlockScreen.subtitle', { workEmail: workEmail }))).toBeOnTheScreen();
                        })];
                case 6:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should navigate to Onboarding purpose page when skip is pressed and there is no signupQualifier', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount, skipButton, mockEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                            shouldValidate: true,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                                                onboardingWorkEmail: workEmail,
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailValidationPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL_VALIDATION, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    skipButton = react_native_1.screen.getByText((0, Localize_1.translateLocal)('common.skip'));
                    mockEvent = {
                        nativeEvent: {},
                        type: 'press',
                        target: skipButton,
                        currentTarget: skipButton,
                    };
                    react_native_1.fireEvent.press(skipButton, mockEvent);
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.ONBOARDING_PURPOSE.getRoute(), { forceReplace: true });
                        })];
                case 4:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should navigate to Onboarding workspaces page when validate code step is successful and there is no signupQualifier', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                            shouldValidate: true,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                                                onboardingWorkEmail: workEmail,
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailValidationPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL_VALIDATION, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    MergeIntoAccountAndLoginSuccessful();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.ONBOARDING_WORKSPACES.getRoute(), { forceReplace: true });
                        })];
                case 5:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should redirect to classic when merging is completed and shouldRedirectToClassicAfterMerge is returned as `true` by the API', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                            shouldValidate: true,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                                                onboardingWorkEmail: workEmail,
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailValidationPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL_VALIDATION, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    MergeIntoAccountAndLoginRedirectToClassic();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(Link_1.openOldDotLink).toHaveBeenCalledWith(CONST_1.default.OLDDOT_URLS.INBOX, true);
                        })];
                case 5:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should navigate to Onboarding employee page when validate code step is successful and user is routed app via smb', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, {
                                            hasCompletedGuidedSetupFlow: false,
                                            shouldValidate: true,
                                            signupQualifier: CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                                                onboardingWorkEmail: workEmail,
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    unmount = renderOnboardingWorkEmailValidationPage(SCREENS_1.default.ONBOARDING.WORK_EMAIL_VALIDATION, { backTo: '' }).unmount;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    MergeIntoAccountAndLoginSuccessful();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.ONBOARDING_EMPLOYEES.getRoute(), { forceReplace: true });
                        })];
                case 5:
                    _a.sent();
                    unmount();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

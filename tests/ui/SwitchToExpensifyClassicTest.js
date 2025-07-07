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
var NativeNavigation = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var react_test_renderer_1 = require("react-test-renderer");
var Localize_1 = require("@libs/Localize");
var App_1 = require("@src/App");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PusherHelper_1 = require("../utils/PusherHelper");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
var USER_A_ACCOUNT_ID = 1;
var USER_A_EMAIL = 'user_a@test.com';
jest.setTimeout(60000);
jest.mock('@react-navigation/native');
TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();
function navigateToSetting() {
    var hintText = (0, Localize_1.translateLocal)('sidebarScreen.buttonMySettings');
    var mySettingButton = react_native_1.screen.queryByAccessibilityHint(hintText);
    if (mySettingButton) {
        (0, react_native_1.fireEvent)(mySettingButton, 'press');
    }
    return (0, waitForBatchedUpdatesWithAct_1.default)();
}
function navigateToExpensifyClassicFlow() {
    var hintText = (0, Localize_1.translateLocal)('exitSurvey.goToExpensifyClassic');
    var switchToExpensifyClassicBtn = react_native_1.screen.queryByAccessibilityHint(hintText);
    if (switchToExpensifyClassicBtn) {
        (0, react_native_1.fireEvent)(switchToExpensifyClassicBtn, 'press');
    }
    return (0, waitForBatchedUpdatesWithAct_1.default)();
}
function signInAppAndEnterTestFlow(dismissedValue) {
    var _this = this;
    (0, react_native_1.render)(<App_1.default />);
    return (0, waitForBatchedUpdatesWithAct_1.default)()
        .then(function () { return __awaiter(_this, void 0, void 0, function () {
        var hintText, loginForm;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    hintText = (0, Localize_1.translateLocal)('loginForm.loginForm');
                    loginForm = react_native_1.screen.queryAllByLabelText(hintText);
                    expect(loginForm).toHaveLength(1);
                    return [4 /*yield*/, (0, react_test_renderer_1.act)(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_TRY_NEW_DOT, {
                            classicRedirect: {
                                dismissed: dismissedValue,
                            },
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 4:
                    _a.sent();
                    return [2 /*return*/, navigateToSetting()];
            }
        });
    }); })
        .then(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, react_test_renderer_1.act)(function () { return NativeNavigation.triggerTransitionEnd(); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, navigateToExpensifyClassicFlow()];
            }
        });
    }); });
}
describe('Switch to Expensify Classic flow', function () {
    beforeEach(function () {
        jest.clearAllMocks();
        react_native_onyx_1.default.clear();
        // Unsubscribe to pusher channels
        PusherHelper_1.default.teardown();
    });
    test('Should navigate to exit survey reason page', function () {
        signInAppAndEnterTestFlow(true).then(function () {
            expect(react_native_1.screen.getAllByText((0, Localize_1.translateLocal)('exitSurvey.reasonPage.subtitle')).at(0)).toBeOnTheScreen();
        });
    });
});

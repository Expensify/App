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
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var navigateAfterOnboarding_1 = require("@libs/navigateAfterOnboarding");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OnyxDerived_1 = require("@userActions/OnyxDerived");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var ONBOARDING_ADMINS_CHAT_REPORT_ID = '1';
var ONBOARDING_POLICY_ID = '2';
var REPORT_ID = '3';
var USER_ID = '4';
var mockFindLastAccessedReport = jest.fn();
var mockShouldOpenOnAdminRoom = jest.fn();
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useIsFocused: jest.fn(), triggerTransitionEnd: jest.fn() });
});
jest.mock('@libs/ReportUtils', function () { return ({
    findLastAccessedReport: function () { return mockFindLastAccessedReport(); },
    parseReportRouteParams: jest.fn(function () { return ({}); }),
    isConciergeChatReport: jest.requireActual('@libs/ReportUtils').isConciergeChatReport,
    isArchivedReport: jest.requireActual('@libs/ReportUtils').isArchivedReport,
    isThread: jest.requireActual('@libs/ReportUtils').isThread,
    generateReportName: jest.requireActual('@libs/ReportUtils').generateReportName,
    getAllPolicyReports: jest.requireActual('@libs/ReportUtils').getAllPolicyReports,
    isValidReport: jest.requireActual('@libs/ReportUtils').isValidReport,
    generateReportAttributes: jest.requireActual('@libs/ReportUtils').generateReportAttributes,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention: jest.requireActual('@libs/ReportUtils').getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getAllReportErrors: jest.requireActual('@libs/ReportUtils').getAllReportErrors,
    shouldDisplayViolationsRBRInLHN: jest.requireActual('@libs/ReportUtils').shouldDisplayViolationsRBRInLHN,
    generateIsEmptyReport: jest.requireActual('@libs/ReportUtils').generateIsEmptyReport,
}); });
jest.mock('@libs/Navigation/helpers/shouldOpenOnAdminRoom', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: function () { return mockShouldOpenOnAdminRoom(); },
}); });
describe('navigateAfterOnboarding', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
        (0, OnyxDerived_1.default)();
        return (0, waitForBatchedUpdates_1.default)();
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            jest.clearAllMocks();
            return [2 /*return*/, react_native_onyx_1.default.clear()];
        });
    }); });
    it('should navigate to the admin room report if onboardingAdminsChatReportID is provided', function () {
        var _a;
        var navigate = jest.spyOn(Navigation_1.default, 'navigate');
        var testSession = { email: 'realaccount@gmail.com' };
        (0, navigateAfterOnboarding_1.default)(false, true, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, ((_a = testSession === null || testSession === void 0 ? void 0 : testSession.email) !== null && _a !== void 0 ? _a : '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
    });
    it('should not navigate to the admin room report if onboardingAdminsChatReportID is not provided on larger screens', function () {
        (0, navigateAfterOnboarding_1.default)(false, true, undefined, undefined);
        expect(Navigation_1.default.navigate).not.toHaveBeenCalledWith(ROUTES_1.default.REPORT_WITH_ID.getRoute(undefined));
    });
    it('should not navigate to last accessed report if it is a concierge chat on small screens', function () { return __awaiter(void 0, void 0, void 0, function () {
        var navigate, lastAccessedReport;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    navigate = jest.spyOn(Navigation_1.default, 'navigate');
                    lastAccessedReport = {
                        reportID: REPORT_ID,
                        participants: (_a = {},
                            _a[CONST_1.default.ACCOUNT_ID.CONCIERGE.toString()] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                            _a[USER_ID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                            _a),
                        reportName: 'Concierge',
                        type: CONST_1.default.REPORT.TYPE.CHAT,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.CONCIERGE_REPORT_ID, REPORT_ID)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), lastAccessedReport)];
                case 2:
                    _b.sent();
                    mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
                    mockShouldOpenOnAdminRoom.mockReturnValue(false);
                    (0, navigateAfterOnboarding_1.default)(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
                    expect(navigate).not.toHaveBeenCalledWith(ROUTES_1.default.REPORT_WITH_ID.getRoute(REPORT_ID));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not navigate to last accessed report if it is onboarding expense chat on small screens', function () {
        var lastAccessedReport = { reportID: REPORT_ID, policyID: ONBOARDING_POLICY_ID };
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);
        (0, navigateAfterOnboarding_1.default)(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(Navigation_1.default.navigate).not.toHaveBeenCalledWith(ROUTES_1.default.REPORT_WITH_ID.getRoute(REPORT_ID));
    });
    it('should navigate to last accessed report if shouldOpenOnAdminRoom is true on small screens', function () {
        var navigate = jest.spyOn(Navigation_1.default, 'navigate');
        var lastAccessedReport = { reportID: REPORT_ID };
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);
        (0, navigateAfterOnboarding_1.default)(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.REPORT_WITH_ID.getRoute(REPORT_ID));
    });
    it('should navigate to Concierge room if user uses a test email', function () {
        var _a;
        var navigate = jest.spyOn(Navigation_1.default, 'navigate');
        var lastAccessedReport = { reportID: REPORT_ID };
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);
        var testSession = { email: 'test+account@gmail.com' };
        (0, navigateAfterOnboarding_1.default)(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID, ((_a = testSession === null || testSession === void 0 ? void 0 : testSession.email) !== null && _a !== void 0 ? _a : '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.REPORT_WITH_ID.getRoute(REPORT_ID));
    });
    it('should navigate to Test Drive Modal if user wants to manage a small team', function () { return __awaiter(void 0, void 0, void 0, function () {
        var navigate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    navigate = jest.spyOn(Navigation_1.default, 'navigate');
                    jest.spyOn(Navigation_1.default, 'isNavigationReady').mockReturnValue(Promise.resolve());
                    (0, navigateAfterOnboarding_1.default)(true, true);
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () { return expect(navigate).toHaveBeenCalledWith(ROUTES_1.default.TEST_DRIVE_MODAL_ROOT.route); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

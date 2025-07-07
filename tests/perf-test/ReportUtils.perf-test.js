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
var react_native_onyx_1 = require("react-native-onyx");
var reassure_1 = require("reassure");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reports_1 = require("../../__mocks__/reportData/reports");
var createCollection_1 = require("../utils/collections/createCollection");
var personalDetails_1 = require("../utils/collections/personalDetails");
var policies_1 = require("../utils/collections/policies");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_2 = require("../utils/collections/reports");
var transaction_1 = require("../utils/collections/transaction");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var getMockedReports = function (length) {
    if (length === void 0) { length = 500; }
    return (0, createCollection_1.default)(function (item) { return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(item.reportID); }, function (index) { return (0, reports_2.createRandomReport)(index); }, length);
};
var getMockedPolicies = function (length) {
    if (length === void 0) { length = 500; }
    return (0, createCollection_1.default)(function (item) { return "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(item.id); }, function (index) { return (0, policies_1.default)(index); }, length);
};
var personalDetails = (0, createCollection_1.default)(function (item) { return item.accountID; }, function (index) { return (0, personalDetails_1.default)(index); }, 1000);
var mockedReportsMap = getMockedReports(1000);
var mockedPoliciesMap = getMockedPolicies(1000);
var participantAccountIDs = Array.from({ length: 1000 }, function (v, i) { return i + 1; });
describe('ReportUtils', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign({}, mockedPoliciesMap), mockedReportsMap))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterAll(function () {
        react_native_onyx_1.default.clear();
    });
    test('[ReportUtils] findLastAccessedReport on 2k reports and policies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ignoreDomainRooms, reports, policies, openOnAdminRoom;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ignoreDomainRooms = true;
                    reports = getMockedReports(2000);
                    policies = getMockedPolicies(2000);
                    openOnAdminRoom = true;
                    return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.COLLECTION.REPORT] = reports,
                            _a[ONYXKEYS_1.default.COLLECTION.POLICY] = policies,
                            _a))];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.findLastAccessedReport)(ignoreDomainRooms, openOnAdminRoom); })];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] canDeleteReportAction on 1k reports and policies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportID, reportAction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reportID = '1';
                    reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.canDeleteReportAction)(reportAction, reportID); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getReportRecipientAccountID on 1k participants', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, currentLoginAccountID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { participantAccountIDs: participantAccountIDs });
                    currentLoginAccountID = 1;
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getReportRecipientAccountIDs)(report, currentLoginAccountID); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getIconsForParticipants on 1k participants', function () { return __awaiter(void 0, void 0, void 0, function () {
        var participants;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    participants = Array.from({ length: 1000 }, function (v, i) { return i + 1; });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getIconsForParticipants)(participants, personalDetails); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getIcons on 1k participants', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, defaultIcon, defaultName, defaultIconId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { parentReportID: '1', parentReportActionID: '1', type: CONST_1.default.REPORT.TYPE.CHAT });
                    policy = (0, policies_1.default)(1);
                    defaultIcon = null;
                    defaultName = '';
                    defaultIconId = -1;
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getIcons)(report, personalDetails, defaultIcon, defaultName, defaultIconId, policy); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getDisplayNamesWithTooltips 1k participants', function () { return __awaiter(void 0, void 0, void 0, function () {
        var isMultipleParticipantReport, shouldFallbackToHidden;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isMultipleParticipantReport = true;
                    shouldFallbackToHidden = true;
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getDisplayNamesWithTooltips)(personalDetails, isMultipleParticipantReport, shouldFallbackToHidden); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getReportPreviewMessage on 1k policies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportAction, report, policy, shouldConsiderReceiptBeingScanned, isPreviewMessageForParentChatReport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reportAction = (0, reportActions_1.default)(1);
                    report = (0, reports_2.createRandomReport)(1);
                    policy = (0, policies_1.default)(1);
                    shouldConsiderReceiptBeingScanned = true;
                    isPreviewMessageForParentChatReport = true;
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getReportPreviewMessage)(report, reportAction, shouldConsiderReceiptBeingScanned, isPreviewMessageForParentChatReport, policy); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getReportName on 1k participants', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: undefined, participantAccountIDs: participantAccountIDs });
                    policy = (0, policies_1.default)(1);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getReportName)(report, policy); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] canShowReportRecipientLocalTime on 1k participants', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, accountID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { participantAccountIDs: participantAccountIDs });
                    accountID = 1;
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.canShowReportRecipientLocalTime)(personalDetails, report, accountID); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] shouldReportBeInOptionList on 1k participant', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, currentReportId, isInFocusMode, betas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { participantAccountIDs: participantAccountIDs, type: CONST_1.default.REPORT.TYPE.CHAT });
                    currentReportId = '2';
                    isInFocusMode = true;
                    betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.shouldReportBeInOptionList)({ report: report, chatReport: reports_1.chatReportR14932, currentReportId: currentReportId, isInFocusMode: isInFocusMode, betas: betas, doesReportHaveViolations: false, excludeEmptyChats: false }); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getWorkspaceIcon on 1k policies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = (0, reports_2.createRandomReport)(1);
                    policy = (0, policies_1.default)(1);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getWorkspaceIcon)(report, policy); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getMoneyRequestOptions on 1k participants', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, reportParticipants;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true });
                    policy = (0, policies_1.default)(1);
                    reportParticipants = Array.from({ length: 1000 }, function (v, i) { return i + 1; });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, policy, reportParticipants); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getWorkspaceChat on 1k policies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policyID, accountsID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    policyID = '1';
                    accountsID = Array.from({ length: 20 }, function (v, i) { return i + 1; });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getWorkspaceChats)(policyID, accountsID); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getTransactionDetails on 1k reports', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transaction = (0, transaction_1.default)(1);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getTransactionDetails)(transaction, 'yyyy-MM-dd'); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportUtils] getIOUReportActionDisplayMessage on 1k policies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportAction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU, originalMessage: {
                            IOUReportID: '1',
                            IOUTransactionID: '1',
                            amount: 100,
                            participantAccountID: 1,
                            currency: CONST_1.default.CURRENCY.USD,
                            type: CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY,
                            paymentType: CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY,
                        } });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportUtils_1.getIOUReportActionDisplayMessage)(reportAction); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

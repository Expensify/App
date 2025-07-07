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
var useParentReport_1 = require("@hooks/useParentReport");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var Task_1 = require("@libs/actions/Task");
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var DateUtils_1 = require("@libs/DateUtils");
var Localize_1 = require("@libs/Localize");
var Parser_1 = require("@libs/Parser");
var OnyxDerived_1 = require("@userActions/OnyxDerived");
var CONST_1 = require("@src/CONST");
var OnyxUpdateManager_1 = require("@src/libs/actions/OnyxUpdateManager");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var LHNTestUtils = require("../utils/LHNTestUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
(0, OnyxUpdateManager_1.default)();
describe('actions/Task', function () {
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_native_onyx_1.default.init({
                        keys: ONYXKEYS_1.default,
                    });
                    (0, OnyxDerived_1.default)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('canModify and canAction task', function () {
        var managerAccountID = 1;
        var employeeAccountID = 2;
        var taskAssigneeAccountID = 3;
        // TaskReport with a non-archived parent
        var taskReport = __assign(__assign({}, LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID])), { type: CONST_1.default.REPORT.TYPE.TASK });
        var taskReportParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);
        // Cancelled Task report with a non-archived parent
        var taskReportCancelled = __assign(__assign({}, LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID])), { type: CONST_1.default.REPORT.TYPE.TASK });
        var taskReportCancelledParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);
        // Task report with an archived parent
        var taskReportArchived = __assign(__assign({}, LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID])), { type: CONST_1.default.REPORT.TYPE.TASK });
        var taskReportArchivedParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);
        // This report has no parent
        var taskReportWithNoParent = __assign(__assign({}, LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID])), { type: CONST_1.default.REPORT.TYPE.TASK });
        // Set the manager as the owner of each report
        taskReport.ownerAccountID = managerAccountID;
        taskReportCancelled.ownerAccountID = managerAccountID;
        taskReportArchived.ownerAccountID = managerAccountID;
        taskReportWithNoParent.ownerAccountID = managerAccountID;
        // Set the parent report ID of each report
        taskReport.parentReportID = taskReportParent.reportID;
        taskReportCancelled.parentReportID = taskReportCancelledParent.reportID;
        taskReportArchived.parentReportID = taskReportArchivedParent.reportID;
        // This is what indicates that the report is a cancelled task report (see ReportUtils.isCanceledTaskReport())
        taskReportCancelled.isDeletedParentAction = true;
        beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_native_onyx_1.default.init({
                            keys: ONYXKEYS_1.default,
                        });
                        (0, OnyxDerived_1.default)();
                        // Store all the necessary data in Onyx
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportWithNoParent.reportID), taskReportWithNoParent)];
                    case 1:
                        // Store all the necessary data in Onyx
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport.reportID), taskReport)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportParent.reportID), taskReportParent)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportCancelled.reportID), taskReportCancelled)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportCancelledParent.reportID), taskReportCancelledParent)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportArchived.reportID), taskReportArchived)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportArchivedParent.reportID), taskReportArchivedParent)];
                    case 7:
                        _a.sent();
                        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(taskReportArchivedParent.reportID), {
                                private_isArchived: new Date().toString(),
                            })];
                    case 8:
                        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                        _a.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        describe('canModifyTask', function () {
            it('returns false if the user modifying the task is not the author', function () {
                // Simulate how components call canModifyTask() by using the hook useReportIsArchived() to see if the report is archived
                var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(taskReport === null || taskReport === void 0 ? void 0 : taskReport.parentReportID); }).result;
                expect((0, Task_1.canModifyTask)(taskReport, employeeAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns false if the parent report is archived', function () {
                var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(taskReportArchived === null || taskReportArchived === void 0 ? void 0 : taskReportArchived.parentReportID); }).result;
                expect((0, Task_1.canModifyTask)(taskReportArchived, managerAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns false if the report is a cancelled task report', function () {
                var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(taskReportCancelled === null || taskReportCancelled === void 0 ? void 0 : taskReportCancelled.parentReportID); }).result;
                expect((0, Task_1.canModifyTask)(taskReportCancelled, managerAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns true if the user modifying the task is the author and the parent report is not archived or cancelled', function () {
                var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(taskReport === null || taskReport === void 0 ? void 0 : taskReport.parentReportID); }).result;
                expect((0, Task_1.canModifyTask)(taskReport, managerAccountID, isReportArchived.current)).toBe(true);
            });
        });
        describe('canActionTask', function () {
            it('returns false if there is no logged in user', function () {
                expect((0, Task_1.canActionTask)(taskReportCancelled)).toBe(false);
            });
            it('returns false if the report is a cancelled task report', function () {
                // The accountID doesn't matter here because the code will do an early return for the cancelled report
                expect((0, Task_1.canActionTask)(taskReportCancelled, 0)).toBe(false);
            });
            it('returns false if the report has an archived parent report', function () {
                // The accountID doesn't matter here because the code will do an early return for the archived report
                expect((0, Task_1.canActionTask)(taskReportArchived, 0)).toBe(false);
            });
            it('returns false if the user modifying the task is not the author', function () {
                var parentReport = (0, react_native_1.renderHook)(function () { return (0, useParentReport_1.default)(taskReport.reportID); }).result;
                var isParentReportArchived = (0, react_native_1.renderHook)(function () { var _a; return (0, useReportIsArchived_1.default)((_a = parentReport.current) === null || _a === void 0 ? void 0 : _a.reportID); }).result;
                expect((0, Task_1.canActionTask)(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
            });
            it('returns true if the user modifying the task is the author', function () {
                var parentReport = (0, react_native_1.renderHook)(function () { return (0, useParentReport_1.default)(taskReport.reportID); }).result;
                var isParentReportArchived = (0, react_native_1.renderHook)(function () { var _a; return (0, useReportIsArchived_1.default)((_a = parentReport.current) === null || _a === void 0 ? void 0 : _a.reportID); }).result;
                expect((0, Task_1.canActionTask)(taskReport, managerAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
            });
            // Looking up the task assignee is usually based on the report action
            describe('testing with report action', function () {
                beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                taskReport.parentReportActionID = 'a1';
                                return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport.reportID), taskReport)];
                            case 1:
                                _a.sent();
                                // Given that the task is assigned to a user who is not the author of the task
                                return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(taskReport.parentReportID), {
                                        a1: __assign(__assign({}, LHNTestUtils.getFakeReportAction()), { reportID: taskReport.parentReportID, childManagerAccountID: taskAssigneeAccountID }),
                                    })];
                            case 2:
                                // Given that the task is assigned to a user who is not the author of the task
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('returns false if the logged in user is not the author or the one assigned to the task', function () {
                    var parentReport = (0, react_native_1.renderHook)(function () { return (0, useParentReport_1.default)(taskReport.reportID); }).result;
                    var isParentReportArchived = (0, react_native_1.renderHook)(function () { var _a; return (0, useReportIsArchived_1.default)((_a = parentReport.current) === null || _a === void 0 ? void 0 : _a.reportID); }).result;
                    expect((0, Task_1.canActionTask)(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
                });
                it('returns true if the logged in user is the one assigned to the task', function () {
                    var parentReport = (0, react_native_1.renderHook)(function () { return (0, useParentReport_1.default)(taskReport.reportID); }).result;
                    var isParentReportArchived = (0, react_native_1.renderHook)(function () { var _a; return (0, useReportIsArchived_1.default)((_a = parentReport.current) === null || _a === void 0 ? void 0 : _a.reportID); }).result;
                    expect((0, Task_1.canActionTask)(taskReport, taskAssigneeAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });
            // Some old reports might only have report.managerID so be sure it's still supported
            describe('testing with report.managerID', function () {
                beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                taskReport.managerID = taskAssigneeAccountID;
                                return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport.reportID), taskReport)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('returns false if the logged in user is not the author or the one assigned to the task', function () {
                    var parentReport = (0, react_native_1.renderHook)(function () { return (0, useParentReport_1.default)(taskReport.reportID); }).result;
                    var isParentReportArchived = (0, react_native_1.renderHook)(function () { var _a; return (0, useReportIsArchived_1.default)((_a = parentReport.current) === null || _a === void 0 ? void 0 : _a.reportID); }).result;
                    expect((0, Task_1.canActionTask)(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
                });
                it('returns true if the logged in user is the one assigned to the task', function () {
                    var parentReport = (0, react_native_1.renderHook)(function () { return (0, useParentReport_1.default)(taskReport.reportID); }).result;
                    var isParentReportArchived = (0, react_native_1.renderHook)(function () { var _a; return (0, useReportIsArchived_1.default)((_a = parentReport.current) === null || _a === void 0 ? void 0 : _a.reportID); }).result;
                    expect((0, Task_1.canActionTask)(taskReport, taskAssigneeAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });
        });
    });
    describe('completeTestDriveTask', function () {
        var _a, _b, _c;
        var accountID = 2;
        var conciergeChatReport = LHNTestUtils.getFakeReport([accountID, CONST_1.default.ACCOUNT_ID.CONCIERGE]);
        var testDriveTaskReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { ownerAccountID: accountID });
        var testDriveTaskAction = __assign(__assign({}, LHNTestUtils.getFakeReportAction()), { childType: CONST_1.default.REPORT.TYPE.TASK, childReportName: Parser_1.default.replace((0, Localize_1.translateLocal)('onboarding.testDrive.name', { testDriveURL: "".concat(CONST_1.default.STAGING_NEW_EXPENSIFY_URL, "/").concat(ROUTES_1.default.TEST_DRIVE_DEMO_ROOT) })), childReportID: testDriveTaskReport.reportID });
        var reportCollectionDataSet = (_a = {},
            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(testDriveTaskReport.reportID)] = testDriveTaskReport,
            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(conciergeChatReport.reportID)] = conciergeChatReport,
            _a);
        var reportActionsCollectionDataSet = (_b = {},
            _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(conciergeChatReport.reportID)] = (_c = {},
                _c[testDriveTaskAction.reportActionID] = testDriveTaskAction,
                _c),
            _b);
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign(__assign({}, reportCollectionDataSet), reportActionsCollectionDataSet), (_a = {}, _a[ONYXKEYS_1.default.NVP_INTRO_SELECTED] = {
                                viewTour: testDriveTaskReport.reportID,
                            }, _a[ONYXKEYS_1.default.SESSION] = {
                                accountID: accountID,
                            }, _a)))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('Completes test drive task', function () {
            var writeSpy = jest.spyOn(API, 'write');
            (0, Task_1.completeTestDriveTask)(testDriveTaskReport, testDriveTaskReport.reportID);
            expect(writeSpy).toHaveBeenCalledWith(types_1.WRITE_COMMANDS.COMPLETE_TASK, expect.anything(), expect.anything());
        });
    });
    describe('getFinishOnboardingTaskOnyxData', function () {
        var _a;
        var parentReport = LHNTestUtils.getFakeReport();
        var taskReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.TASK, ownerAccountID: 1, managerID: 2, parentReportID: parentReport.reportID });
        var reportCollectionDataSet = (_a = {},
            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport.reportID)] = taskReport,
            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID)] = parentReport,
            _a);
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign({}, reportCollectionDataSet))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: 'user1@gmail.com', accountID: 2 })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.NVP_INTRO_SELECTED), { choice: CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM, setupCategories: taskReport.reportID })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('Return not empty object', function () {
            expect(Object.values((0, Task_1.getFinishOnboardingTaskOnyxData)('setupCategories')).length).toBeGreaterThan(0);
        });
        it('Return empty object', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportNameValuePairs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reportNameValuePairs = {
                            private_isArchived: DateUtils_1.default.getDBTime(),
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(parentReport.reportID), reportNameValuePairs)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _a.sent();
                        expect(Object.values((0, Task_1.getFinishOnboardingTaskOnyxData)('setupCategories')).length).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

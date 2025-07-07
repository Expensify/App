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
var DateUtils_1 = require("@libs/DateUtils");
var Localize_1 = require("@libs/Localize");
var CONST_1 = require("@src/CONST");
var OnyxUpdateManager_1 = require("@src/libs/actions/OnyxUpdateManager");
var Member = require("@src/libs/actions/Policy/Member");
var Policy = require("@src/libs/actions/Policy/Policy");
var ReportActionsUtils = require("@src/libs/ReportActionsUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var personalDetails_1 = require("../utils/collections/personalDetails");
var policies_1 = require("../utils/collections/policies");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_1 = require("../utils/collections/reports");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
(0, OnyxUpdateManager_1.default)();
describe('actions/PolicyMember', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    var mockFetch;
    beforeEach(function () {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch;
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    describe('acceptJoinRequest', function () {
        it('Accept user join request to a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, fakeReport, fakeReportAction;
            var _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakeReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { policyID: fakePolicy.id });
                        fakeReportAction = __assign(__assign({}, (0, reportActions_1.default)(0)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST });
                        (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(fakeReport.reportID), fakeReport);
                        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(fakeReport.reportID), (_a = {},
                            _a[fakeReportAction.reportActionID] = fakeReportAction,
                            _a));
                        Member.acceptJoinRequest(fakeReport.reportID, fakeReportAction);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(fakeReport.reportID),
                                    waitForCollectionCallback: false,
                                    callback: function (reportActions) {
                                        var _a, _b;
                                        react_native_onyx_1.default.disconnect(connection);
                                        var reportAction = reportActions === null || reportActions === void 0 ? void 0 : reportActions[fakeReportAction.reportActionID];
                                        if (!(0, EmptyObject_1.isEmptyObject)(reportAction)) {
                                            (_b = expect((_a = ReportActionsUtils.getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.choice)) === null || _b === void 0 ? void 0 : _b.toBe(CONST_1.default.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT);
                                            expect(reportAction === null || reportAction === void 0 ? void 0 : reportAction.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        }
                                        resolve();
                                    },
                                });
                            })];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, ((_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _c === void 0 ? void 0 : _c.call(mockFetch))];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(fakeReport.reportID),
                                    waitForCollectionCallback: false,
                                    callback: function (reportActions) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        var reportAction = reportActions === null || reportActions === void 0 ? void 0 : reportActions[fakeReportAction.reportActionID];
                                        if (!(0, EmptyObject_1.isEmptyObject)(reportAction)) {
                                            expect(reportAction === null || reportAction === void 0 ? void 0 : reportAction.pendingAction).toBeFalsy();
                                        }
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateWorkspaceMembersRole', function () {
        it('Update member to admin role', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakeUser2, fakePolicy, adminRoom;
            var _a, _b;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        fakeUser2 = (0, personalDetails_1.default)(2);
                        fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { employeeList: (_a = {},
                                _a[(_c = fakeUser2.login) !== null && _c !== void 0 ? _c : ''] = {
                                    email: fakeUser2.login,
                                    role: CONST_1.default.POLICY.ROLE.USER,
                                },
                                _a) });
                        adminRoom = __assign(__assign({}, (0, reports_1.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, policyID: fakePolicy.id });
                        (_d = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _d === void 0 ? void 0 : _d.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminRoom.reportID), adminRoom);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST), (_b = {}, _b[fakeUser2.accountID] = fakeUser2, _b));
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _f.sent();
                        // When a user's role is set as admin on a policy
                        Member.updateWorkspaceMembersRole(fakePolicy.id, [fakeUser2.accountID], CONST_1.default.POLICY.ROLE.ADMIN);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _f.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a, _b;
                                        react_native_onyx_1.default.disconnect(connection);
                                        var employee = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[(_b = fakeUser2 === null || fakeUser2 === void 0 ? void 0 : fakeUser2.login) !== null && _b !== void 0 ? _b : ''];
                                        // Then the policy employee role of the user should be set to admin.
                                        expect(employee === null || employee === void 0 ? void 0 : employee.role).toBe(CONST_1.default.POLICY.ROLE.ADMIN);
                                        resolve();
                                    },
                                });
                            })];
                    case 3:
                        _f.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminRoom.reportID),
                                    callback: function (report) {
                                        var _a;
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve();
                                        // Then the user's notification preference on the admin room should be set to always.
                                        expect((_a = report === null || report === void 0 ? void 0 : report.participants) === null || _a === void 0 ? void 0 : _a[fakeUser2.accountID].notificationPreference).toBe(CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS);
                                    },
                                });
                            })];
                    case 4:
                        _f.sent();
                        return [4 /*yield*/, ((_e = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _e === void 0 ? void 0 : _e.call(mockFetch))];
                    case 5:
                        _f.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 6:
                        _f.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a, _b;
                                        react_native_onyx_1.default.disconnect(connection);
                                        var employee = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[(_b = fakeUser2 === null || fakeUser2 === void 0 ? void 0 : fakeUser2.login) !== null && _b !== void 0 ? _b : ''];
                                        expect(employee === null || employee === void 0 ? void 0 : employee.pendingAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 7:
                        _f.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 8:
                        _f.sent();
                        // When an admin is demoted from their admin role to a user role
                        Member.updateWorkspaceMembersRole(fakePolicy.id, [fakeUser2.accountID], CONST_1.default.POLICY.ROLE.USER);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 9:
                        _f.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a, _b;
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve();
                                        var employee = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[(_b = fakeUser2 === null || fakeUser2 === void 0 ? void 0 : fakeUser2.login) !== null && _b !== void 0 ? _b : ''];
                                        // Then the policy employee role of the user should be set to user.
                                        expect(employee === null || employee === void 0 ? void 0 : employee.role).toBe(CONST_1.default.POLICY.ROLE.USER);
                                    },
                                });
                            })];
                    case 10:
                        _f.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminRoom.reportID),
                                    callback: function (report) {
                                        var _a;
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve();
                                        // Then the user should be removed from the admin room participants list of the policy.
                                        expect((_a = report === null || report === void 0 ? void 0 : report.participants) === null || _a === void 0 ? void 0 : _a[fakeUser2.accountID]).toBeUndefined();
                                    },
                                });
                            })];
                    case 11:
                        _f.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('requestWorkspaceOwnerChange', function () {
        it('Change the workspace`s owner', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, fakeEmail, fakeAccountID;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakeEmail = 'fake@gmail.com';
                        fakeAccountID = 1;
                        (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: fakeEmail, accountID: fakeAccountID });
                        Member.requestWorkspaceOwnerChange(fakePolicy.id);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(policy === null || policy === void 0 ? void 0 : policy.errorFields).toBeFalsy();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isLoading).toBeTruthy();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerSuccessful).toBeFalsy();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerFailed).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isLoading).toBeFalsy();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerSuccessful).toBeTruthy();
                                        (_a = expect(policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerFailed)) === null || _a === void 0 ? void 0 : _a.toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('addBillingCardAndRequestPolicyOwnerChange', function () {
        it('Add billing card and change the workspace`s owner', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, fakeEmail, fakeCard, fakeAccountID;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakeEmail = 'fake@gmail.com';
                        fakeCard = {
                            cardNumber: '1234567890123456',
                            cardYear: '2023',
                            cardMonth: '05',
                            cardCVV: '123',
                            addressName: 'John Doe',
                            addressZip: '12345',
                            currency: 'USD',
                        };
                        fakeAccountID = 1;
                        (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: fakeEmail, accountID: fakeAccountID });
                        Policy.addBillingCardAndRequestPolicyOwnerChange(fakePolicy.id, fakeCard);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(policy === null || policy === void 0 ? void 0 : policy.errorFields).toBeFalsy();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isLoading).toBeTruthy();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerSuccessful).toBeFalsy();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerFailed).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isLoading).toBeFalsy();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerSuccessful).toBeTruthy();
                                        (_a = expect(policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerFailed)) === null || _a === void 0 ? void 0 : _a.toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('addMembersToWorkspace', function () {
        it('Add a new member to a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, defaultApprover, newUserEmail;
            var _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        policyID = '1';
                        defaultApprover = 'approver@gmail.com';
                        newUserEmail = 'user@gmail.com';
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { approver: defaultApprover }))];
                    case 1:
                        _d.sent();
                        (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
                        Member.addMembersToWorkspace((_a = {}, _a[newUserEmail] = 1234, _a), 'Welcome', policyID, [], CONST_1.default.POLICY.ROLE.USER);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a;
                                        react_native_onyx_1.default.disconnect(connection);
                                        var newEmployee = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[newUserEmail];
                                        expect(newEmployee).not.toBeUndefined();
                                        expect(newEmployee === null || newEmployee === void 0 ? void 0 : newEmployee.email).toBe(newUserEmail);
                                        expect(newEmployee === null || newEmployee === void 0 ? void 0 : newEmployee.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(newEmployee === null || newEmployee === void 0 ? void 0 : newEmployee.role).toBe(CONST_1.default.POLICY.ROLE.USER);
                                        expect(newEmployee === null || newEmployee === void 0 ? void 0 : newEmployee.submitsTo).toBe(defaultApprover);
                                        resolve();
                                    },
                                });
                            })];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, ((_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _c === void 0 ? void 0 : _c.call(mockFetch))];
                    case 4:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('Add new members with admin/auditor role to the #admins room', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, adminRoomID, defaultApprover, ownerAccountID, adminAccountID, adminEmail, auditorAccountID, auditorEmail, userAccountID, userEmail, adminRoom;
            var _a, _b, _c, _d;
            var _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        policyID = '1';
                        adminRoomID = '1';
                        defaultApprover = 'approver@gmail.com';
                        ownerAccountID = 1;
                        adminAccountID = 1234;
                        adminEmail = 'admin@example.com';
                        auditorAccountID = 1235;
                        auditorEmail = 'auditor@example.com';
                        userAccountID = 1236;
                        userEmail = 'user@example.com';
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { approver: defaultApprover }))];
                    case 1:
                        _h.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminRoomID), __assign(__assign({}, (0, reports_1.createRandomReport)(Number(adminRoomID))), { policyID: policyID, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, participants: (_a = {},
                                    _a[ownerAccountID] = { notificationPreference: 'always' },
                                    _a) }))];
                    case 2:
                        _h.sent();
                        // When adding a new admin, auditor, and user members
                        Member.addMembersToWorkspace((_b = {}, _b[adminEmail] = adminAccountID, _b), 'Welcome', policyID, [], CONST_1.default.POLICY.ROLE.ADMIN);
                        Member.addMembersToWorkspace((_c = {}, _c[auditorEmail] = auditorAccountID, _c), 'Welcome', policyID, [], CONST_1.default.POLICY.ROLE.AUDITOR);
                        Member.addMembersToWorkspace((_d = {}, _d[userEmail] = userAccountID, _d), 'Welcome', policyID, [], CONST_1.default.POLICY.ROLE.USER);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _h.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminRoomID),
                                    callback: function (report) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(report);
                                    },
                                });
                            })];
                    case 4:
                        adminRoom = _h.sent();
                        expect((_e = adminRoom === null || adminRoom === void 0 ? void 0 : adminRoom.participants) === null || _e === void 0 ? void 0 : _e[adminAccountID]).toBeTruthy();
                        expect((_f = adminRoom === null || adminRoom === void 0 ? void 0 : adminRoom.participants) === null || _f === void 0 ? void 0 : _f[auditorAccountID]).toBeTruthy();
                        expect((_g = adminRoom === null || adminRoom === void 0 ? void 0 : adminRoom.participants) === null || _g === void 0 ? void 0 : _g[userAccountID]).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should unarchive existing workspace expense chat and expense report when adding back a member', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, workspaceReportID, expenseReportID, userAccountID, userEmail, expenseAction, isWorkspaceChatArchived, isExpenseReportArchived;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        policyID = '1';
                        workspaceReportID = '1';
                        expenseReportID = '2';
                        userAccountID = 1236;
                        userEmail = 'user@example.com';
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(workspaceReportID), __assign(__assign({}, (0, reports_1.createRandomReport)(Number(workspaceReportID))), { policyID: policyID, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, ownerAccountID: userAccountID }))];
                    case 1:
                        _c.sent();
                        expenseAction = __assign(__assign({}, (0, reportActions_1.default)(0)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, childReportID: expenseReportID });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(workspaceReportID), (_a = {},
                                _a[expenseAction.reportActionID] = expenseAction,
                                _a))];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(workspaceReportID), {
                                private_isArchived: DateUtils_1.default.getDBTime(),
                            })];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(expenseReportID), {
                                private_isArchived: DateUtils_1.default.getDBTime(),
                            })];
                    case 4:
                        _c.sent();
                        // When adding the user to the workspace
                        Member.addMembersToWorkspace((_b = {}, _b[userEmail] = userAccountID, _b), 'Welcome', policyID, [], CONST_1.default.POLICY.ROLE.USER);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(workspaceReportID),
                                    callback: function (nvp) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(!!(nvp === null || nvp === void 0 ? void 0 : nvp.private_isArchived));
                                    },
                                });
                            })];
                    case 6:
                        isWorkspaceChatArchived = _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(expenseReportID),
                                    callback: function (nvp) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(!!(nvp === null || nvp === void 0 ? void 0 : nvp.private_isArchived));
                                    },
                                });
                            })];
                    case 7:
                        isExpenseReportArchived = _c.sent();
                        expect(isWorkspaceChatArchived && isExpenseReportArchived).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('removeMembers', function () {
        it('Remove members with admin/auditor role from the #admins room', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, adminRoomID, defaultApprover, ownerAccountID, ownerEmail, adminAccountID, adminEmail, auditorAccountID, auditorEmail, userAccountID, userEmail, optimisticAdminRoomMetadata, successAdminRoomMetadata;
            var _a, _b, _c;
            var _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        policyID = '1';
                        adminRoomID = '1';
                        defaultApprover = 'approver@gmail.com';
                        ownerAccountID = 1;
                        ownerEmail = 'owner@gmail.com';
                        adminAccountID = 1234;
                        adminEmail = 'admin@example.com';
                        auditorAccountID = 1235;
                        auditorEmail = 'auditor@example.com';
                        userAccountID = 1236;
                        userEmail = 'user@example.com';
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST), (_a = {},
                                _a[adminAccountID] = { login: adminEmail },
                                _a[auditorAccountID] = { login: auditorEmail },
                                _a[userAccountID] = { login: userEmail },
                                _a))];
                    case 1:
                        _l.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { approver: defaultApprover, employeeList: (_b = {},
                                    _b[ownerEmail] = { role: CONST_1.default.POLICY.ROLE.ADMIN },
                                    _b[adminEmail] = { role: CONST_1.default.POLICY.ROLE.ADMIN },
                                    _b[auditorEmail] = { role: CONST_1.default.POLICY.ROLE.AUDITOR },
                                    _b[userEmail] = { role: CONST_1.default.POLICY.ROLE.USER },
                                    _b) }))];
                    case 2:
                        _l.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminRoomID), __assign(__assign({}, (0, reports_1.createRandomReport)(Number(adminRoomID))), { policyID: policyID, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, participants: (_c = {},
                                    _c[ownerAccountID] = { notificationPreference: 'always' },
                                    _c[adminAccountID] = { notificationPreference: 'always' },
                                    _c[auditorAccountID] = { notificationPreference: 'always' },
                                    _c[userAccountID] = { notificationPreference: 'always' },
                                    _c) }))];
                    case 3:
                        _l.sent();
                        // When removing am admin, auditor, and user members
                        (_d = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _d === void 0 ? void 0 : _d.call(mockFetch);
                        Member.removeMembers([adminAccountID, auditorAccountID, userAccountID], policyID);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _l.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(adminRoomID),
                                    callback: function (reportMetadata) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(reportMetadata);
                                    },
                                });
                            })];
                    case 5:
                        optimisticAdminRoomMetadata = _l.sent();
                        expect((_e = optimisticAdminRoomMetadata === null || optimisticAdminRoomMetadata === void 0 ? void 0 : optimisticAdminRoomMetadata.pendingChatMembers) === null || _e === void 0 ? void 0 : _e.length).toBe(2);
                        expect((_g = (_f = optimisticAdminRoomMetadata === null || optimisticAdminRoomMetadata === void 0 ? void 0 : optimisticAdminRoomMetadata.pendingChatMembers) === null || _f === void 0 ? void 0 : _f.find(function (pendingMember) { return pendingMember.accountID === String(adminAccountID); })) === null || _g === void 0 ? void 0 : _g.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                        expect((_j = (_h = optimisticAdminRoomMetadata === null || optimisticAdminRoomMetadata === void 0 ? void 0 : optimisticAdminRoomMetadata.pendingChatMembers) === null || _h === void 0 ? void 0 : _h.find(function (pendingMember) { return pendingMember.accountID === String(auditorAccountID); })) === null || _j === void 0 ? void 0 : _j.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                        return [4 /*yield*/, ((_k = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _k === void 0 ? void 0 : _k.call(mockFetch))];
                    case 6:
                        _l.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(adminRoomID),
                                    callback: function (reportMetadata) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(reportMetadata);
                                    },
                                });
                            })];
                    case 7:
                        successAdminRoomMetadata = _l.sent();
                        expect(successAdminRoomMetadata === null || successAdminRoomMetadata === void 0 ? void 0 : successAdminRoomMetadata.pendingChatMembers).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should archive the member expense chat and expense report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, workspaceReportID, expenseReportID, userAccountID, expenseAction, isWorkspaceChatArchived, isExpenseReportArchived;
            var _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        policyID = '1';
                        workspaceReportID = '1';
                        expenseReportID = '2';
                        userAccountID = 1236;
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(workspaceReportID), __assign(__assign({}, (0, reports_1.createRandomReport)(Number(workspaceReportID))), { policyID: policyID, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, ownerAccountID: userAccountID }))];
                    case 1:
                        _d.sent();
                        expenseAction = __assign(__assign({}, (0, reportActions_1.default)(0)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, childReportID: expenseReportID });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(workspaceReportID), (_a = {},
                                _a[expenseAction.reportActionID] = expenseAction,
                                _a))];
                    case 2:
                        _d.sent();
                        // When removing a member from the workspace
                        (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
                        Member.removeMembers([userAccountID], policyID);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(workspaceReportID),
                                    callback: function (nvp) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(!!(nvp === null || nvp === void 0 ? void 0 : nvp.private_isArchived));
                                    },
                                });
                            })];
                    case 4:
                        isWorkspaceChatArchived = _d.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(expenseReportID),
                                    callback: function (nvp) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(!!(nvp === null || nvp === void 0 ? void 0 : nvp.private_isArchived));
                                    },
                                });
                            })];
                    case 5:
                        isExpenseReportArchived = _d.sent();
                        expect(isWorkspaceChatArchived && isExpenseReportArchived).toBe(true);
                        return [4 /*yield*/, ((_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _c === void 0 ? void 0 : _c.call(mockFetch))];
                    case 6:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('importPolicyMembers', function () {
        it('should show a "single member added message" when a new member is added', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, importedSpreadsheet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = '1';
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign({}, (0, policies_1.default)(Number(policyID))))];
                    case 1:
                        _a.sent();
                        // When importing 1 new member to the workspace
                        Member.importPolicyMembers(policyID, [{ email: 'user@gmail.com', role: 'user' }]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 3:
                        importedSpreadsheet = _a.sent();
                        // Then it should show the singular member added success message
                        expect(importedSpreadsheet === null || importedSpreadsheet === void 0 ? void 0 : importedSpreadsheet.importFinalModal.prompt).toBe((0, Localize_1.translateLocal)('spreadsheet.importMembersSuccessfulDescription', { added: 1, updated: 0 }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show a "multiple members added message" when multiple new members are added', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, importedSpreadsheet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = '1';
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign({}, (0, policies_1.default)(Number(policyID))))];
                    case 1:
                        _a.sent();
                        // When importing multiple new members to the workspace
                        Member.importPolicyMembers(policyID, [
                            { email: 'user@gmail.com', role: 'user' },
                            { email: 'user2@gmail.com', role: 'user' },
                        ]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 3:
                        importedSpreadsheet = _a.sent();
                        // Then it should show the plural member added success message
                        expect(importedSpreadsheet === null || importedSpreadsheet === void 0 ? void 0 : importedSpreadsheet.importFinalModal.prompt).toBe((0, Localize_1.translateLocal)('spreadsheet.importMembersSuccessfulDescription', { added: 2, updated: 0 }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show a "no members added/updated message" when no new members are added or updated', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, userEmail, userRole, importedSpreadsheet;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyID = '1';
                        userEmail = 'user@gmail.com';
                        userRole = 'user';
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { employeeList: (_a = {},
                                    _a[userEmail] = {
                                        role: userRole,
                                    },
                                    _a) }))];
                    case 1:
                        _b.sent();
                        // When importing 1 existing member to the workspace with the same role
                        Member.importPolicyMembers(policyID, [{ email: userEmail, role: userRole }]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 3:
                        importedSpreadsheet = _b.sent();
                        // Then it should show the no member added/updated message
                        expect(importedSpreadsheet === null || importedSpreadsheet === void 0 ? void 0 : importedSpreadsheet.importFinalModal.prompt).toBe((0, Localize_1.translateLocal)('spreadsheet.importMembersSuccessfulDescription', { added: 0, updated: 0 }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show a "single member updated message" when a member is updated', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, userEmail, userRole, importedSpreadsheet;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyID = '1';
                        userEmail = 'user@gmail.com';
                        userRole = 'user';
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { employeeList: (_a = {},
                                    _a[userEmail] = {
                                        role: userRole,
                                    },
                                    _a) }))];
                    case 1:
                        _b.sent();
                        // When importing 1 existing member with a different role
                        Member.importPolicyMembers(policyID, [{ email: userEmail, role: 'admin' }]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 3:
                        importedSpreadsheet = _b.sent();
                        // Then it should show the singular member updated success message
                        expect(importedSpreadsheet === null || importedSpreadsheet === void 0 ? void 0 : importedSpreadsheet.importFinalModal.prompt).toBe((0, Localize_1.translateLocal)('spreadsheet.importMembersSuccessfulDescription', { added: 0, updated: 1 }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show a "multiple members updated message" when multiple members are updated', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, userEmail, userRole, userEmail2, userRole2, importedSpreadsheet;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyID = '1';
                        userEmail = 'user@gmail.com';
                        userRole = 'user';
                        userEmail2 = 'user2@gmail.com';
                        userRole2 = 'user';
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { employeeList: (_a = {},
                                    _a[userEmail] = {
                                        role: userRole,
                                    },
                                    _a[userEmail2] = {
                                        role: userRole2,
                                    },
                                    _a) }))];
                    case 1:
                        _b.sent();
                        // When importing multiple existing members with a different role
                        Member.importPolicyMembers(policyID, [
                            { email: userEmail, role: 'admin' },
                            { email: userEmail2, role: 'admin' },
                        ]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 3:
                        importedSpreadsheet = _b.sent();
                        // Then it should show the plural member updated success message
                        expect(importedSpreadsheet === null || importedSpreadsheet === void 0 ? void 0 : importedSpreadsheet.importFinalModal.prompt).toBe((0, Localize_1.translateLocal)('spreadsheet.importMembersSuccessfulDescription', { added: 0, updated: 2 }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show a "single member added and updated message" when a member is both added and updated', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, userEmail, userRole, importedSpreadsheet;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyID = '1';
                        userEmail = 'user@gmail.com';
                        userRole = 'user';
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { employeeList: (_a = {},
                                    _a[userEmail] = {
                                        role: userRole,
                                    },
                                    _a) }))];
                    case 1:
                        _b.sent();
                        // When importing 1 new member and 1 existing member with a different role
                        Member.importPolicyMembers(policyID, [
                            { email: 'new_user@gmail.com', role: 'user' },
                            { email: userEmail, role: 'admin' },
                        ]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 3:
                        importedSpreadsheet = _b.sent();
                        // Then it should show the singular member added and updated success message
                        expect(importedSpreadsheet === null || importedSpreadsheet === void 0 ? void 0 : importedSpreadsheet.importFinalModal.prompt).toBe((0, Localize_1.translateLocal)('spreadsheet.importMembersSuccessfulDescription', { added: 1, updated: 1 }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show a "multiple members added and updated message" when multiple members are both added and updated', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, userEmail, userRole, userEmail2, userRole2, importedSpreadsheet;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyID = '1';
                        userEmail = 'user@gmail.com';
                        userRole = 'user';
                        userEmail2 = 'user2@gmail.com';
                        userRole2 = 'user';
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, (0, policies_1.default)(Number(policyID))), { employeeList: (_a = {},
                                    _a[userEmail] = {
                                        role: userRole,
                                    },
                                    _a[userEmail2] = {
                                        role: userRole2,
                                    },
                                    _a) }))];
                    case 1:
                        _b.sent();
                        // When importing multiple new members and multiple existing members with a different role
                        Member.importPolicyMembers(policyID, [
                            { email: 'new_user@gmail.com', role: 'user' },
                            { email: 'new_user2@gmail.com', role: 'user' },
                            { email: userEmail, role: 'admin' },
                            { email: userEmail2, role: 'admin' },
                        ]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 3:
                        importedSpreadsheet = _b.sent();
                        // Then it should show the plural member added and updated success message
                        expect(importedSpreadsheet === null || importedSpreadsheet === void 0 ? void 0 : importedSpreadsheet.importFinalModal.prompt).toBe((0, Localize_1.translateLocal)('spreadsheet.importMembersSuccessfulDescription', { added: 2, updated: 2 }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

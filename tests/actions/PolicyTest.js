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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_native_onyx_1 = require("react-native-onyx");
var OnboardingFlow_1 = require("@libs/actions/Welcome/OnboardingFlow");
var Localize_1 = require("@libs/Localize");
// eslint-disable-next-line no-restricted-syntax
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var OnyxUpdateManager_1 = require("@src/libs/actions/OnyxUpdateManager");
var Policy = require("@src/libs/actions/Policy/Policy");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var reports_1 = require("../utils/collections/reports");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var ESH_EMAIL = 'eshgupta1217@gmail.com';
var ESH_ACCOUNT_ID = 1;
var ESH_PARTICIPANT_ADMINS_ROOM = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS };
var ESH_PARTICIPANT_EXPENSE_CHAT = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS };
var WORKSPACE_NAME = "Esh's Workspace";
(0, OnyxUpdateManager_1.default)();
describe('actions/Policy', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    var mockFetch;
    beforeEach(function () {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch;
        IntlStore_1.default.load(CONST_1.default.LOCALES.EN);
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    describe('createWorkspace', function () {
        afterEach(function () {
            var _a;
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
        });
        it('creates a new workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, adminReportID, expenseReportID, policyID, policy, activePolicyID, allReports, workspaceReports, reportActions, adminReportActions, expenseReportActions, workspaceReportActions, onboardingMessages, expectedManageTeamDefaultTasksCount, expectedReportActionsOfTypeCreatedCount, expectedSignOffMessagesCount, reportActionsOfTypeCreatedCount, signOffMessagesCount, manageTeamTasksCount;
            var _a;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        (_b = fetch === null || fetch === void 0 ? void 0 : fetch.pause) === null || _b === void 0 ? void 0 : _b.call(fetch);
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID })];
                    case 1:
                        _h.sent();
                        fakePolicy = (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)];
                    case 2:
                        _h.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID), fakePolicy.id)];
                    case 3:
                        _h.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.NVP_INTRO_SELECTED), { choice: CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM })];
                    case 4:
                        _h.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 5:
                        _h.sent();
                        policyID = Policy.generatePolicyID();
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 6:
                        _h.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                    callback: function (workspace) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(workspace);
                                    },
                                });
                            })];
                    case 7:
                        policy = _h.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID),
                                    callback: function (id) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(id);
                                    },
                                });
                            })];
                    case 8:
                        activePolicyID = _h.sent();
                        // check if NVP_ACTIVE_POLICY_ID is updated to created policy id
                        expect(activePolicyID).toBe(policyID);
                        // check if policy was created with correct values
                        expect(policy === null || policy === void 0 ? void 0 : policy.id).toBe(policyID);
                        expect(policy === null || policy === void 0 ? void 0 : policy.name).toBe(WORKSPACE_NAME);
                        expect(policy === null || policy === void 0 ? void 0 : policy.type).toBe(CONST_1.default.POLICY.TYPE.TEAM);
                        expect(policy === null || policy === void 0 ? void 0 : policy.role).toBe(CONST_1.default.POLICY.ROLE.ADMIN);
                        expect(policy === null || policy === void 0 ? void 0 : policy.owner).toBe(ESH_EMAIL);
                        expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBe(true);
                        expect(policy === null || policy === void 0 ? void 0 : policy.approvalMode).toBe(CONST_1.default.POLICY.APPROVAL_MODE.BASIC);
                        expect(policy === null || policy === void 0 ? void 0 : policy.approver).toBe(ESH_EMAIL);
                        expect(policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled).toBe(true);
                        expect(policy === null || policy === void 0 ? void 0 : policy.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                        expect(policy === null || policy === void 0 ? void 0 : policy.employeeList).toEqual((_a = {}, _a[ESH_EMAIL] = { email: ESH_EMAIL, submitsTo: ESH_EMAIL, errors: {}, role: CONST_1.default.POLICY.ROLE.ADMIN }, _a));
                        expect(policy === null || policy === void 0 ? void 0 : policy.mccGroup).toBeDefined();
                        expect(policy === null || policy === void 0 ? void 0 : policy.requiresCategory).toBe(true);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: function (reports) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(reports);
                                    },
                                });
                            })];
                    case 9:
                        allReports = _h.sent();
                        workspaceReports = Object.values(allReports !== null && allReports !== void 0 ? allReports : {})
                            .filter(function (report) { return (report === null || report === void 0 ? void 0 : report.policyID) === policyID; })
                            .filter(function (report) { return (report === null || report === void 0 ? void 0 : report.type) !== 'task'; });
                        expect(workspaceReports.length).toBe(2);
                        workspaceReports.forEach(function (report) {
                            var _a, _b;
                            var _c;
                            expect((_c = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _c === void 0 ? void 0 : _c.addWorkspaceRoom).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            switch (report === null || report === void 0 ? void 0 : report.chatType) {
                                case CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS: {
                                    expect(report === null || report === void 0 ? void 0 : report.participants).toEqual((_a = {}, _a[ESH_ACCOUNT_ID] = ESH_PARTICIPANT_ADMINS_ROOM, _a));
                                    adminReportID = report.reportID;
                                    break;
                                }
                                case CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT: {
                                    expect(report === null || report === void 0 ? void 0 : report.participants).toEqual((_b = {}, _b[ESH_ACCOUNT_ID] = ESH_PARTICIPANT_EXPENSE_CHAT, _b));
                                    expenseReportID = report.reportID;
                                    break;
                                }
                                default:
                                    break;
                            }
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: function (actions) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(actions);
                                    },
                                });
                            })];
                    case 10:
                        reportActions = _h.sent();
                        adminReportActions = Object.values((_c = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(adminReportID)]) !== null && _c !== void 0 ? _c : {});
                        expenseReportActions = Object.values((_d = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReportID)]) !== null && _d !== void 0 ? _d : {});
                        workspaceReportActions = adminReportActions.concat(expenseReportActions);
                        expect(expenseReportActions.length).toBe(1);
                        __spreadArray([], expenseReportActions, true).forEach(function (reportAction) {
                            expect(reportAction.actionName).toBe(CONST_1.default.REPORT.ACTIONS.TYPE.CREATED);
                            expect(reportAction.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
                        });
                        onboardingMessages = (0, OnboardingFlow_1.getOnboardingMessages)().onboardingMessages;
                        expectedManageTeamDefaultTasksCount = onboardingMessages[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM].tasks.length - 3;
                        expectedReportActionsOfTypeCreatedCount = 1;
                        expectedSignOffMessagesCount = 1;
                        expect(adminReportActions.length).toBe(expectedManageTeamDefaultTasksCount + expectedReportActionsOfTypeCreatedCount + expectedSignOffMessagesCount);
                        reportActionsOfTypeCreatedCount = 0;
                        signOffMessagesCount = 0;
                        manageTeamTasksCount = 0;
                        adminReportActions.forEach(function (reportAction) {
                            if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED) {
                                reportActionsOfTypeCreatedCount++;
                                expect(reportAction.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
                                return;
                            }
                            if (reportAction.childType === CONST_1.default.REPORT.TYPE.TASK) {
                                manageTeamTasksCount++;
                                expect(reportAction.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                // we dont check actorAccountID as it will be a random account id for the guide
                                return;
                            }
                            signOffMessagesCount++;
                        });
                        expect(reportActionsOfTypeCreatedCount).toBe(expectedReportActionsOfTypeCreatedCount);
                        expect(signOffMessagesCount).toBe(expectedSignOffMessagesCount);
                        expect(manageTeamTasksCount).toBe(expectedManageTeamDefaultTasksCount);
                        // Check for success data
                        (_e = fetch === null || fetch === void 0 ? void 0 : fetch.resume) === null || _e === void 0 ? void 0 : _e.call(fetch);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 11:
                        _h.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.COLLECTION.POLICY,
                                    waitForCollectionCallback: true,
                                    callback: function (workspace) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(workspace);
                                    },
                                });
                            })];
                    case 12:
                        policy = _h.sent();
                        // Check if the policy pending action was cleared
                        expect(policy === null || policy === void 0 ? void 0 : policy.pendingAction).toBeFalsy();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: function (reports) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(reports);
                                    },
                                });
                            })];
                    case 13:
                        allReports = _h.sent();
                        // Check if the report pending action and fields were cleared
                        Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).forEach(function (report) {
                            var _a;
                            expect(report === null || report === void 0 ? void 0 : report.pendingAction).toBeFalsy();
                            expect((_a = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _a === void 0 ? void 0 : _a.addWorkspaceRoom).toBeFalsy();
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: function (actions) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(actions);
                                    },
                                });
                            })];
                    case 14:
                        reportActions = _h.sent();
                        // Check if the report action pending action was cleared
                        adminReportActions = Object.values((_f = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(adminReportID)]) !== null && _f !== void 0 ? _f : {});
                        expenseReportActions = Object.values((_g = reportActions === null || reportActions === void 0 ? void 0 : reportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReportID)]) !== null && _g !== void 0 ? _g : {});
                        workspaceReportActions = adminReportActions.concat(expenseReportActions);
                        workspaceReportActions.forEach(function (reportAction) {
                            expect(reportAction.pendingAction).toBeFalsy();
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('creates a new workspace with BASIC approval mode if the introSelected is MANAGE_TEAM', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, policy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        // When a new workspace is created with introSelected set to MANAGE_TEAM
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                    callback: function (workspace) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(workspace);
                                    },
                                });
                            })];
                    case 2:
                        policy = _a.sent();
                        // Then the policy should have approval mode set to BASIC
                        expect(policy === null || policy === void 0 ? void 0 : policy.approvalMode).toBe(CONST_1.default.POLICY.APPROVAL_MODE.BASIC);
                        return [2 /*return*/];
                }
            });
        }); });
        it('creates a new workspace with OPTIONAL approval mode if the introSelected is TRACK_WORKSPACE', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, policy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        // When a new workspace is created with introSelected set to TRACK_WORKSPACE
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                    callback: function (workspace) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(workspace);
                                    },
                                });
                            })];
                    case 2:
                        policy = _a.sent();
                        // Then the policy should have approval mode set to OPTIONAL
                        expect(policy === null || policy === void 0 ? void 0 : policy.approvalMode).toBe(CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL);
                        return [2 /*return*/];
                }
            });
        }); });
        it('create a new workspace fails will reset hasCompletedGuidedSetupFlow to the correct value', function () { return __awaiter(void 0, void 0, void 0, function () {
            var onboarding;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        (_a = fetch === null || fetch === void 0 ? void 0 : fetch.pause) === null || _a === void 0 ? void 0 : _a.call(fetch);
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID })];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true, chatReportID: '12345' })];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _d.sent();
                        (_b = fetch === null || fetch === void 0 ? void 0 : fetch.fail) === null || _b === void 0 ? void 0 : _b.call(fetch);
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, undefined, CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        (_c = fetch === null || fetch === void 0 ? void 0 : fetch.resume) === null || _c === void 0 ? void 0 : _c.call(fetch);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 5:
                        _d.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: ONYXKEYS_1.default.NVP_ONBOARDING,
                                waitForCollectionCallback: false,
                                callback: function (val) {
                                    onboarding = val;
                                },
                            })];
                    case 6:
                        _d.sent();
                        expect(onboarding === null || onboarding === void 0 ? void 0 : onboarding.hasCompletedGuidedSetupFlow).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('create a new workspace with delayed submission set to manually if the onboarding choice is newDotManageTeam or newDotLookingAround', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        // When a new workspace is created with introSelected set to MANAGE_TEAM
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                waitForCollectionCallback: false,
                                callback: function (policy) {
                                    var _a;
                                    // Then the autoReportingFrequency should be set to manually
                                    expect(policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency).toBe(CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
                                    expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBeTruthy();
                                    expect((_a = policy === null || policy === void 0 ? void 0 : policy.harvesting) === null || _a === void 0 ? void 0 : _a.enabled).toBe(false);
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('create a new workspace with delayed submission set to manually if the onboarding choice is not selected', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, undefined);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                waitForCollectionCallback: false,
                                callback: function (policy) {
                                    var _a;
                                    // Then the autoReportingFrequency should be set to manually
                                    expect(policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency).toBe(CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
                                    expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBeTruthy();
                                    expect((_a = policy === null || policy === void 0 ? void 0 : policy.harvesting) === null || _a === void 0 ? void 0 : _a.enabled).toBe(false);
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('create a new workspace with enabled workflows if the onboarding choice is newDotManageTeam', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        // When a new workspace is created with introSelected set to MANAGE_TEAM
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                waitForCollectionCallback: false,
                                callback: function (policy) {
                                    // Then the workflows feature is enabled
                                    expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBeTruthy();
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('create a new workspace with enabled workflows if the onboarding choice is newDotLookingAround', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        // When a new workspace is created with introSelected set to LOOKING_AROUND
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                waitForCollectionCallback: false,
                                callback: function (policy) {
                                    // Then the workflows feature is enabled
                                    expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBeTruthy();
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('create a new workspace with enabled workflows if the onboarding choice is newDotTrackWorkspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        // When a new workspace is created with introSelected set to TRACK_WORKSPACE
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                waitForCollectionCallback: false,
                                callback: function (policy) {
                                    // Then workflows is enabled
                                    expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBeTruthy();
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('create a new workspace with disabled workflows if the onboarding choice is newDotEmployer', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        // When a new workspace is created with introSelected set to EMPLOYER
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.EMPLOYER);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                waitForCollectionCallback: false,
                                callback: function (policy) {
                                    // Then workflows are not enabled
                                    expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBeFalsy();
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('create a new workspace with disabled workflows if the onboarding choice is newDotSplitChat', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        // When a new workspace is created with introSelected set to CHAT_SPLIT
                        Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                                waitForCollectionCallback: false,
                                callback: function (policy) {
                                    // Then workflows are not enabled
                                    expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBeFalsy();
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('upgradeToCorporate', function () {
        it('upgradeToCorporate should not alter initial values of autoReporting and autoReportingFrequency', function () { return __awaiter(void 0, void 0, void 0, function () {
            var autoReporting, autoReportingFrequency, fakePolicy, policy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        autoReporting = true;
                        autoReportingFrequency = CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
                        fakePolicy = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.TEAM)), { autoReporting: autoReporting, autoReportingFrequency: autoReportingFrequency });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)];
                    case 1:
                        _a.sent();
                        // When a policy is upgradeToCorporate
                        Policy.upgradeToCorporate(fakePolicy.id);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    callback: function (workspace) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(workspace);
                                    },
                                });
                            })];
                    case 3:
                        policy = _a.sent();
                        // Then the policy autoReporting and autoReportingFrequency should equal the initial value.
                        expect(policy === null || policy === void 0 ? void 0 : policy.autoReporting).toBe(autoReporting);
                        expect(policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency).toBe(autoReportingFrequency);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('disableWorkflows', function () {
        it('disableWorkflow should reset autoReportingFrequency to INSTANT', function () { return __awaiter(void 0, void 0, void 0, function () {
            var autoReporting, autoReportingFrequency, fakePolicy, policy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        autoReporting = true;
                        autoReportingFrequency = CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY;
                        fakePolicy = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.TEAM)), { autoReporting: autoReporting, autoReportingFrequency: autoReportingFrequency });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)];
                    case 1:
                        _a.sent();
                        // When workflows are disabled for the policy
                        Policy.enablePolicyWorkflows(fakePolicy.id, false);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    callback: function (workspace) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(workspace);
                                    },
                                });
                            })];
                    case 3:
                        policy = _a.sent();
                        // Then the policy autoReportingFrequency should revert to "INSTANT"
                        expect(policy === null || policy === void 0 ? void 0 : policy.autoReporting).toBe(false);
                        expect(policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency).toBe(CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('enablePolicyRules', function () {
        it('should disable preventSelfApproval when the rule feature is turned off', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, policy;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        (_a = fetch === null || fetch === void 0 ? void 0 : fetch.pause) === null || _a === void 0 ? void 0 : _a.call(fetch);
                        react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID });
                        fakePolicy = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.TEAM)), { areRulesEnabled: true, preventSelfApproval: true });
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _e.sent();
                        // Disable the rule feature
                        Policy.enablePolicyRules(fakePolicy.id, false);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    callback: function (workspace) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(workspace);
                                    },
                                });
                            })];
                    case 3:
                        policy = _e.sent();
                        // Check if the preventSelfApproval is reset to false
                        expect(policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval).toBeFalsy();
                        expect(policy === null || policy === void 0 ? void 0 : policy.areRulesEnabled).toBeFalsy();
                        expect((_b = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _b === void 0 ? void 0 : _b.areRulesEnabled).toEqual(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        (_c = fetch === null || fetch === void 0 ? void 0 : fetch.resume) === null || _c === void 0 ? void 0 : _c.call(fetch);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _e.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    callback: function (workspace) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(workspace);
                                    },
                                });
                            })];
                    case 5:
                        policy = _e.sent();
                        // Check if the pending action is cleared
                        expect((_d = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _d === void 0 ? void 0 : _d.areRulesEnabled).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('deleteWorkspace', function () {
        it('should apply failure data when deleteWorkspace fails', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, fakeReport, fakeReimbursementAccount;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakeReport = __assign(__assign({}, (0, reports_1.createRandomReport)(0)), { stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN, statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyName: fakePolicy.name });
                        fakeReimbursementAccount = { errors: {} };
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(fakeReport.reportID), fakeReport)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, fakeReimbursementAccount)];
                    case 3:
                        _b.sent();
                        // When deleting a workspace fails
                        (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                        Policy.deleteWorkspace(fakePolicy.id, fakePolicy.name);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _b.sent();
                        // Then it should apply the correct failure data
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    callback: function (policy) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(policy === null || policy === void 0 ? void 0 : policy.pendingAction).toBeUndefined();
                                        expect(policy === null || policy === void 0 ? void 0 : policy.avatarURL).toBe(fakePolicy.avatarURL);
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        // Then it should apply the correct failure data
                        _b.sent();
                        // Unarchive the report (report key)
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(fakeReport.reportID),
                                    callback: function (report) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(report === null || report === void 0 ? void 0 : report.stateNum).toBe(fakeReport.stateNum);
                                        expect(report === null || report === void 0 ? void 0 : report.statusNum).toBe(fakeReport.statusNum);
                                        expect(report === null || report === void 0 ? void 0 : report.policyName).toBe(fakeReport.policyName);
                                        expect(report === null || report === void 0 ? void 0 : report.oldPolicyName).toBe(fakePolicy.name);
                                        resolve();
                                    },
                                });
                            })];
                    case 6:
                        // Unarchive the report (report key)
                        _b.sent();
                        // Unarchive the report (reportNameValuePairs key)
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(fakeReport.reportID),
                                    callback: function (reportNameValuePairs) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.private_isArchived).toBeUndefined();
                                        resolve();
                                    },
                                });
                            })];
                    case 7:
                        // Unarchive the report (reportNameValuePairs key)
                        _b.sent();
                        // Restore the reimbursement account errors
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                                    callback: function (reimbursementAccount) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors).not.toBeUndefined();
                                        resolve();
                                    },
                                });
                            })];
                    case 8:
                        // Restore the reimbursement account errors
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should remove violation from expense report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, expenseChatReportID, expenseReportID, transactionID, violations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyID = '123';
                        expenseChatReportID = '1';
                        expenseReportID = '2';
                        transactionID = '3';
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseChatReportID), __assign(__assign({}, (0, reports_1.createRandomReport)(Number(expenseChatReportID))), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID: policyID, iouReportID: expenseReportID }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), {
                                reportID: expenseReportID,
                                transactionID: transactionID,
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID), [
                                { name: 'cashExpenseWithNoReceipt', type: CONST_1.default.VIOLATION_TYPES.VIOLATION },
                                { name: 'hold', type: CONST_1.default.VIOLATION_TYPES.WARNING },
                            ])];
                    case 3:
                        _a.sent();
                        Policy.deleteWorkspace(policyID, 'test');
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
                                    callback: resolve,
                                });
                            })];
                    case 5:
                        violations = _a.sent();
                        expect(violations === null || violations === void 0 ? void 0 : violations.every(function (violation) { return violation.type !== CONST_1.default.VIOLATION_TYPES.VIOLATION; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    var TEST_EMAIL = 'esh@gmail.com';
    var TEST_EMAIL_2 = 'eshofficial@gmail.com';
    var TEST_ACCOUNT_ID = 1;
    var TEST_DISPLAY_NAME = 'Esh Gupta';
    var TEST_PHONE_NUMBER = '1234567890';
    var TEST_NON_PUBLIC_DOMAIN_EMAIL = 'esh@example.com';
    var TEST_SMS_DOMAIN_EMAIL = 'esh@expensify.sms';
    describe('generateDefaultWorkspaceName', function () {
        beforeAll(function () {
            react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, {});
        });
        it('should generate a workspace name based on the email domain when the domain is not public', function () {
            var _a;
            var domain = 'example.com';
            var displayNameForWorkspace = expensify_common_1.Str.UCFirst((_a = domain.split('.').at(0)) !== null && _a !== void 0 ? _a : '');
            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });
            var workspaceName = Policy.generateDefaultWorkspaceName(TEST_NON_PUBLIC_DOMAIN_EMAIL);
            expect(workspaceName).toBe((0, Localize_1.translateLocal)('workspace.new.workspaceName', { userName: displayNameForWorkspace }));
        });
        it('should generate a workspace name based on the display name when the domain is public and display name is available', function () {
            var displayNameForWorkspace = expensify_common_1.Str.UCFirst(TEST_DISPLAY_NAME);
            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });
            var workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL);
            expect(workspaceName).toBe((0, Localize_1.translateLocal)('workspace.new.workspaceName', { userName: displayNameForWorkspace }));
        });
        it('should generate a workspace name based on the username when the domain is public and display name is not available', function () {
            var _a;
            var emailParts = TEST_EMAIL_2.split('@');
            var username = (_a = emailParts.at(0)) !== null && _a !== void 0 ? _a : '';
            var displayNameForWorkspace = expensify_common_1.Str.UCFirst(username);
            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: '',
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });
            var workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL_2);
            expect(workspaceName).toBe((0, Localize_1.translateLocal)('workspace.new.workspaceName', { userName: displayNameForWorkspace }));
        });
        it('should generate a workspace name with an incremented number when there are existing policies with similar names', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingPolicies, workspaceName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingPolicies = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL, "".concat(TEST_DISPLAY_NAME, "'s Workspace"))), (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL, "".concat(TEST_DISPLAY_NAME, "'s Workspace 1")));
                        jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                            displayName: TEST_DISPLAY_NAME,
                            phoneNumber: TEST_PHONE_NUMBER,
                            accountID: TEST_ACCOUNT_ID,
                        });
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, existingPolicies)];
                    case 1:
                        _a.sent();
                        workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL);
                        expect(workspaceName).toBe((0, Localize_1.translateLocal)('workspace.new.workspaceName', { userName: TEST_DISPLAY_NAME, workspaceNumber: 2 }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return "My Group Workspace" when the domain is SMS', function () {
            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });
            var workspaceName = Policy.generateDefaultWorkspaceName(TEST_SMS_DOMAIN_EMAIL);
            expect(workspaceName).toBe((0, Localize_1.translateLocal)('workspace.new.myGroupWorkspace', {}));
        });
        it('should generate a workspace name with an incremented number even if previous workspaces were created in english lang', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingPolicies, workspaceName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, IntlStore_1.default.load(CONST_1.default.LOCALES.ES)];
                    case 2:
                        _a.sent();
                        existingPolicies = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL, "".concat(TEST_DISPLAY_NAME, "'s Workspace"))), (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.PERSONAL, "".concat(TEST_DISPLAY_NAME, "'s Workspace 1")));
                        jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                            displayName: TEST_DISPLAY_NAME,
                            phoneNumber: TEST_PHONE_NUMBER,
                            accountID: TEST_ACCOUNT_ID,
                        });
                        jest.spyOn(expensify_common_1.Str, 'UCFirst').mockReturnValue(TEST_DISPLAY_NAME);
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.COLLECTION.POLICY, existingPolicies)];
                    case 3:
                        _a.sent();
                        workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL);
                        expect(workspaceName).toBe((0, Localize_1.translateLocal)('workspace.new.workspaceName', { userName: TEST_DISPLAY_NAME, workspaceNumber: 2 }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('enablePolicyWorkflows', function () {
        it('should update delayed submission to instant when disabling the workflows feature', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (_a = fetch === null || fetch === void 0 ? void 0 : fetch.pause) === null || _a === void 0 ? void 0 : _a.call(fetch);
                        react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID });
                        fakePolicy = __assign(__assign({}, (0, policies_1.default)(0, CONST_1.default.POLICY.TYPE.TEAM)), { areWorkflowsEnabled: true, autoReporting: true, autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE });
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _b.sent();
                        // Disable the workflow feature
                        Policy.enablePolicyWorkflows(fakePolicy.id, false);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                waitForCollectionCallback: false,
                                callback: function (policy) {
                                    // Check if the autoReportingFrequency is updated to instant
                                    expect(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled).toBeFalsy();
                                    expect(policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency).toBe(CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
                                },
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

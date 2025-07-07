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
var react_native_onyx_1 = require("react-native-onyx");
var DateUtils_1 = require("@libs/DateUtils");
var WorkspaceReportFieldUtils_1 = require("@libs/WorkspaceReportFieldUtils");
var CONST_1 = require("@src/CONST");
var OnyxUpdateManager_1 = require("@src/libs/actions/OnyxUpdateManager");
var Policy = require("@src/libs/actions/Policy/Policy");
var ReportField = require("@src/libs/actions/Policy/ReportField");
var ReportUtils = require("@src/libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceReportFieldForm_1 = require("@src/types/form/WorkspaceReportFieldForm");
var policies_1 = require("../utils/collections/policies");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
(0, OnyxUpdateManager_1.default)();
describe('actions/ReportField', function () {
    function connectToFetchPolicy(policyID) {
        return new Promise(function (resolve) {
            var connection = react_native_onyx_1.default.connect({
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                callback: function (workspace) {
                    react_native_onyx_1.default.disconnect(connection);
                    resolve(workspace);
                },
            });
        });
    }
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
    describe('createReportField', function () {
        it('creates a new text report field of a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, reportFieldName, reportFieldID, reportFieldKey, newReportField, createReportFieldArguments, policy;
            var _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        mockFetch.pause();
                        react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {});
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        policyID = Policy.generatePolicyID();
                        reportFieldName = 'Test Field';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        newReportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.TEXT,
                            target: 'expense',
                            defaultValue: 'Default Value',
                            values: [],
                            disabledOptions: [],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            externalIDs: [],
                            isTax: false,
                        };
                        createReportFieldArguments = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.TEXT,
                            initialValue: 'Default Value',
                        };
                        ReportField.createReportField(policyID, createReportFieldArguments);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 3:
                        policy = _d.sent();
                        // check if the new report field was added to the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_a = {},
                            _a[reportFieldKey] = __assign(__assign({}, newReportField), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                            _a));
                        // Check for success data
                        mockFetch.resume();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 5:
                        policy = _d.sent();
                        // Check if the policy pending action was cleared
                        expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _b === void 0 ? void 0 : _b[reportFieldKey]) === null || _c === void 0 ? void 0 : _c.pendingAction).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('creates a new date report field of a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, reportFieldName, reportFieldID, reportFieldKey, defaultDate, newReportField, createReportFieldArguments, policy;
            var _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        mockFetch.pause();
                        react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {});
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        policyID = Policy.generatePolicyID();
                        reportFieldName = 'Test Field 2';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        defaultDate = DateUtils_1.default.extractDate(new Date().toString());
                        newReportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.DATE,
                            target: 'expense',
                            defaultValue: defaultDate,
                            values: [],
                            disabledOptions: [],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            externalIDs: [],
                            isTax: false,
                        };
                        createReportFieldArguments = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.DATE,
                            initialValue: defaultDate,
                        };
                        ReportField.createReportField(policyID, createReportFieldArguments);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 3:
                        policy = _d.sent();
                        // check if the new report field was added to the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_a = {},
                            _a[reportFieldKey] = __assign(__assign({}, newReportField), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                            _a));
                        // Check for success data
                        mockFetch.resume();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 5:
                        policy = _d.sent();
                        // Check if the policy pending action was cleared
                        expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _b === void 0 ? void 0 : _b[reportFieldKey]) === null || _c === void 0 ? void 0 : _c.pendingAction).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('creates a new list report field of a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, reportFieldName, reportFieldID, reportFieldKey, newReportField, createReportFieldArguments, policy;
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        mockFetch.pause();
                        react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, (_a = {},
                            _a[WorkspaceReportFieldForm_1.default.LIST_VALUES] = ['Value 1', 'Value 2'],
                            _a[WorkspaceReportFieldForm_1.default.DISABLED_LIST_VALUES] = [false, true],
                            _a));
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        policyID = Policy.generatePolicyID();
                        reportFieldName = 'Test Field 3';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        newReportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.LIST,
                            target: 'expense',
                            defaultValue: '',
                            values: ['Value 1', 'Value 2'],
                            disabledOptions: [false, true],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            externalIDs: [],
                            isTax: false,
                            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        };
                        createReportFieldArguments = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.LIST,
                            initialValue: '',
                        };
                        ReportField.createReportField(policyID, createReportFieldArguments);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 3:
                        policy = _d.sent();
                        // check if the new report field was added to the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_b = {},
                            _b[reportFieldKey] = __assign(__assign({}, newReportField), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                            _b));
                        // Check for success data
                        mockFetch.resume();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 5:
                        policy = _d.sent();
                        // Check if the policy pending action was cleared
                        expect((_c = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _c === void 0 ? void 0 : _c[reportFieldKey].pendingAction).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('deleteReportField', function () {
        it('Deleted a report field from a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, reportFieldName, reportFieldID, reportFieldKey, fakeReportField, policy;
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        reportFieldName = 'Test Field';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        fakeReportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.TEXT,
                            defaultValue: 'Default Value',
                            values: [],
                            disabledOptions: [],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                            value: 'default',
                            externalIDs: [],
                            isTax: false,
                        };
                        fakePolicy.fieldList = (_a = {},
                            _a[reportFieldKey] = fakeReportField,
                            _a);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(fakePolicy.id)];
                    case 2:
                        policy = _d.sent();
                        // check if the report field exists in the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_b = {},
                            _b[reportFieldKey] = fakeReportField,
                            _b));
                        ReportField.deleteReportFields(fakePolicy.id, [reportFieldKey]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _d.sent();
                        // Check for success data
                        mockFetch.resume();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(fakePolicy.id)];
                    case 5:
                        policy = _d.sent();
                        // Check if the policy report field was removed
                        expect((_c = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _c === void 0 ? void 0 : _c[reportFieldKey]).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('Deleted a report field from a workspace when API fails', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, fakePolicy, reportFieldName, reportFieldID, reportFieldKey, fakeReportField, policy;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        policyID = Policy.generatePolicyID();
                        fakePolicy = (0, policies_1.default)(Number(policyID));
                        reportFieldName = 'Test Field';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        fakeReportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.TEXT,
                            defaultValue: 'Default Value',
                            values: [],
                            disabledOptions: [],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            value: 'default',
                            externalIDs: [],
                            isTax: false,
                        };
                        fakePolicy.fieldList = (_a = {},
                            _a[reportFieldKey] = fakeReportField,
                            _a);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), fakePolicy);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 2:
                        policy = _d.sent();
                        // check if the report field exists in the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_b = {},
                            _b[reportFieldKey] = fakeReportField,
                            _b));
                        // Check for failure data
                        mockFetch.fail();
                        ReportField.deleteReportFields(policyID, [reportFieldKey]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _d.sent();
                        mockFetch.resume();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 5:
                        policy = _d.sent();
                        // check if the deleted report field was reset in the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_c = {},
                            _c[reportFieldKey] = fakeReportField,
                            _c));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateReportFieldInitialValue', function () {
        it('updates the initial value of a text report field', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, reportFieldName, oldInitialValue, newInitialValue, reportFieldID, reportFieldKey, reportField, fakePolicy, policy;
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        mockFetch.pause();
                        policyID = Policy.generatePolicyID();
                        reportFieldName = 'Test Field';
                        oldInitialValue = 'Old initial value';
                        newInitialValue = 'New initial value';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        reportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.TEXT,
                            defaultValue: oldInitialValue,
                            values: [],
                            disabledOptions: [],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            externalIDs: [],
                            isTax: false,
                        };
                        fakePolicy = (0, policies_1.default)(Number(policyID));
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, fakePolicy), { fieldList: (_a = {}, _a[reportFieldKey] = reportField, _a) }));
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        ReportField.updateReportFieldInitialValue(policyID, reportFieldID, newInitialValue);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 3:
                        policy = _d.sent();
                        // check if the updated report field was set to the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_b = {},
                            _b[reportFieldKey] = __assign(__assign({}, reportField), { defaultValue: newInitialValue, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }),
                            _b));
                        // Check for success data
                        mockFetch.resume();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 5:
                        policy = _d.sent();
                        // Check if the policy pending action was cleared
                        expect((_c = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _c === void 0 ? void 0 : _c[reportFieldKey].pendingAction).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates the initial value of a text report field when api returns an error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, reportFieldName, oldInitialValue, newInitialValue, reportFieldID, reportFieldKey, reportField, fakePolicy, policy;
            var _a, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        mockFetch.pause();
                        policyID = Policy.generatePolicyID();
                        reportFieldName = 'Test Field';
                        oldInitialValue = 'Old initial value';
                        newInitialValue = 'New initial value';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        reportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.TEXT,
                            defaultValue: oldInitialValue,
                            values: [],
                            disabledOptions: [],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            externalIDs: [],
                            isTax: false,
                        };
                        fakePolicy = (0, policies_1.default)(Number(policyID));
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, fakePolicy), { fieldList: (_a = {}, _a[reportFieldKey] = reportField, _a) }));
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _e.sent();
                        ReportField.updateReportFieldInitialValue(policyID, reportFieldID, newInitialValue);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 3:
                        policy = _e.sent();
                        // check if the updated report field was set to the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_b = {},
                            _b[reportFieldKey] = __assign(__assign({}, reportField), { defaultValue: newInitialValue, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }),
                            _b));
                        // Check for failure data
                        mockFetch.fail();
                        mockFetch.resume();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _e.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 5:
                        policy = _e.sent();
                        // check if the updated report field was reset in the policy
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_c = {},
                            _c[reportFieldKey] = reportField,
                            _c));
                        // Check if the policy errors was set
                        expect((_d = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _d === void 0 ? void 0 : _d[reportFieldKey]).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateReportFieldListValueEnabled', function () {
        it('updates the enabled flag of report field list values', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, reportFieldName, valueIndexesTpUpdate, reportFieldID, reportFieldKey, reportField, fakePolicy, policy;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mockFetch.pause();
                        policyID = Policy.generatePolicyID();
                        reportFieldName = 'Test Field';
                        valueIndexesTpUpdate = [1, 2];
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        reportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.LIST,
                            defaultValue: 'Value 2',
                            values: ['Value 1', 'Value 2', 'Value 3'],
                            disabledOptions: [false, false, true],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            externalIDs: [],
                            isTax: false,
                            value: CONST_1.default.REPORT_FIELD_TYPES.LIST,
                        };
                        fakePolicy = (0, policies_1.default)(Number(policyID));
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, fakePolicy), { fieldList: (_a = {}, _a[reportFieldKey] = reportField, _a) }));
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _c.sent();
                        ReportField.updateReportFieldListValueEnabled(policyID, reportFieldID, valueIndexesTpUpdate, false);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 3:
                        policy = _c.sent();
                        // check if the new report field was added to the policy optimistically
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_b = {},
                            _b[reportFieldKey] = __assign(__assign({}, reportField), { defaultValue: '', disabledOptions: [false, true, true] }),
                            _b));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('addReportFieldListValue', function () {
        it('adds a new value to a report field list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, reportFieldName, reportFieldID, reportFieldKey, reportField, fakePolicy, newListValueName, policy;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mockFetch.pause();
                        policyID = Policy.generatePolicyID();
                        reportFieldName = 'Test Field';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        reportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.LIST,
                            defaultValue: 'Value 2',
                            values: ['Value 1', 'Value 2', 'Value 3'],
                            disabledOptions: [false, false, true],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            externalIDs: [],
                            isTax: false,
                            value: CONST_1.default.REPORT_FIELD_TYPES.LIST,
                        };
                        fakePolicy = (0, policies_1.default)(Number(policyID));
                        newListValueName = 'Value 4';
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, fakePolicy), { fieldList: (_a = {}, _a[reportFieldKey] = reportField, _a) }));
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _c.sent();
                        ReportField.addReportFieldListValue(policyID, reportFieldID, newListValueName);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 3:
                        policy = _c.sent();
                        // Check if the new report field was added to the policy optimistically
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_b = {},
                            _b[reportFieldKey] = __assign(__assign({}, reportField), { values: __spreadArray(__spreadArray([], reportField.values, true), [newListValueName], false), disabledOptions: __spreadArray(__spreadArray([], reportField.disabledOptions, true), [false], false) }),
                            _b));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('removeReportFieldListValue', function () {
        it('removes list values from a report field list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyID, reportFieldName, reportFieldID, reportFieldKey, reportField, fakePolicy, policy;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mockFetch.pause();
                        policyID = Policy.generatePolicyID();
                        reportFieldName = 'Test Field';
                        reportFieldID = (0, WorkspaceReportFieldUtils_1.generateFieldID)(reportFieldName);
                        reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
                        reportField = {
                            name: reportFieldName,
                            type: CONST_1.default.REPORT_FIELD_TYPES.LIST,
                            defaultValue: 'Value 2',
                            values: ['Value 1', 'Value 2', 'Value 3'],
                            disabledOptions: [false, false, true],
                            fieldID: reportFieldID,
                            orderWeight: 1,
                            deletable: false,
                            keys: [],
                            externalIDs: [],
                            isTax: false,
                            value: CONST_1.default.REPORT_FIELD_TYPES.LIST,
                        };
                        fakePolicy = (0, policies_1.default)(Number(policyID));
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), __assign(__assign({}, fakePolicy), { fieldList: (_a = {}, _a[reportFieldKey] = reportField, _a) }));
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _c.sent();
                        ReportField.removeReportFieldListValue(policyID, reportFieldID, [1, 2]);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, connectToFetchPolicy(policyID)];
                    case 3:
                        policy = _c.sent();
                        // Check if the values were removed from the report field optimistically
                        expect(policy === null || policy === void 0 ? void 0 : policy.fieldList).toStrictEqual((_b = {},
                            _b[reportFieldKey] = __assign(__assign({}, reportField), { defaultValue: '', values: ['Value 1'], disabledOptions: [false] }),
                            _b));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

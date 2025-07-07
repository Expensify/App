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
/* eslint-disable @typescript-eslint/naming-convention */
var react_native_onyx_1 = require("react-native-onyx");
var OnyxUtils_1 = require("react-native-onyx/dist/OnyxUtils");
var OnyxDerived_1 = require("@userActions/OnyxDerived");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reports_1 = require("../utils/collections/reports");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('OnyxDerived', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
        (0, OnyxDerived_1.default)();
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('reportAttributes', function () {
        var mockReport = {
            reportID: "test_1",
            reportName: 'Test Report',
            type: 'chat',
            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM,
            lastVisibleActionCreated: '2023-01-01T00:00:00.000Z',
            lastMessageText: 'Test message',
            lastActorAccountID: 1,
            lastMessageHtml: '<p>Test message</p>',
            policyID: '123',
            ownerAccountID: 1,
            stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
        };
        it('returns empty reports when dependencies are not set', function () { return __awaiter(void 0, void 0, void 0, function () {
            var derivedReportAttributes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, OnyxUtils_1.default.get(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES)];
                    case 2:
                        derivedReportAttributes = _a.sent();
                        expect(derivedReportAttributes).toMatchObject({
                            reports: {},
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('computes report attributes when reports are set', function () { return __awaiter(void 0, void 0, void 0, function () {
            var derivedReportAttributes;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(mockReport.reportID), mockReport)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, 'en')];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, OnyxUtils_1.default.get(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES)];
                    case 4:
                        derivedReportAttributes = _b.sent();
                        expect(derivedReportAttributes).toMatchObject({
                            reports: (_a = {},
                                _a[mockReport.reportID] = {
                                    reportName: mockReport.reportName,
                                },
                                _a),
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates when locale changes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var derivedReportAttributes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(mockReport.reportID), mockReport)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, 'es')];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, OnyxUtils_1.default.get(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES)];
                    case 4:
                        derivedReportAttributes = _a.sent();
                        expect(derivedReportAttributes).toMatchObject({
                            locale: 'es',
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        describe('reportErrors', function () {
            it('returns empty errors when no errors exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report, derivedReportAttributes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = (0, reports_1.createRandomReport)(1);
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, OnyxUtils_1.default.get(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES)];
                        case 3:
                            derivedReportAttributes = _a.sent();
                            expect(derivedReportAttributes === null || derivedReportAttributes === void 0 ? void 0 : derivedReportAttributes.reports[report.reportID].reportErrors).toEqual({});
                            return [2 /*return*/];
                    }
                });
            }); });
            it('combines report error fields with report action errors', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report, reportActions, derivedReportAttributes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = __assign(__assign({}, (0, reports_1.createRandomReport)(1)), { errorFields: {
                                    field1: {
                                        '1234567890': 'Error message 1',
                                    },
                                } });
                            reportActions = {
                                '1': {
                                    reportActionID: '1',
                                    actionName: 'ADDCOMMENT',
                                    created: '2024-01-01',
                                    message: [{ html: 'some content', text: 'some content', type: 'text' }],
                                    errors: {
                                        field2: {
                                            '1234567891': 'Error message 2',
                                        },
                                    },
                                },
                            };
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), reportActions)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, OnyxUtils_1.default.get(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES)];
                        case 4:
                            derivedReportAttributes = _a.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 5:
                            _a.sent();
                            expect(derivedReportAttributes === null || derivedReportAttributes === void 0 ? void 0 : derivedReportAttributes.reports[report.reportID].reportErrors).toEqual({
                                '1234567890': 'Error message 1',
                                '1234567891': 'Error message 2',
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
            it('handles multiple error sources', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report, reportActions, derivedReportAttributes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = __assign(__assign({}, (0, reports_1.createRandomReport)(1)), { errorFields: {
                                    field1: {
                                        '1234567890': 'Error message 1',
                                    },
                                    field2: {
                                        '1234567891': 'Error message 2',
                                    },
                                } });
                            reportActions = {
                                '1': {
                                    reportActionID: '1',
                                    actionName: 'ADDCOMMENT',
                                    created: '2024-01-01',
                                    message: [{ html: 'some content', text: 'some content', type: 'text' }],
                                    errors: {
                                        field3: {
                                            '1234567892': 'Error message 3',
                                        },
                                    },
                                },
                                '2': {
                                    reportActionID: '2',
                                    actionName: 'ADDCOMMENT',
                                    created: '2024-01-01',
                                    message: [{ html: 'some content', text: 'some content', type: 'text' }],
                                    errors: {
                                        field4: {
                                            '1234567893': 'Error message 4',
                                        },
                                    },
                                },
                            };
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), reportActions)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, OnyxUtils_1.default.get(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES)];
                        case 4:
                            derivedReportAttributes = _a.sent();
                            expect(derivedReportAttributes === null || derivedReportAttributes === void 0 ? void 0 : derivedReportAttributes.reports[report.reportID].reportErrors).toEqual({
                                '1234567890': 'Error message 1',
                                '1234567891': 'Error message 2',
                                '1234567892': 'Error message 3',
                                '1234567893': 'Error message 4',
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
            it('handles empty error objects in sources', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report, reportActions, derivedReportAttributes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = __assign(__assign({}, (0, reports_1.createRandomReport)(1)), { errorFields: {
                                    field1: {},
                                    field2: {
                                        '1234567890': 'Error message 1',
                                    },
                                } });
                            reportActions = {
                                '1': {
                                    reportActionID: '1',
                                    actionName: 'ADDCOMMENT',
                                    created: '2024-01-01',
                                    message: [{ html: 'some content', text: 'some content', type: 'text' }],
                                    errors: {},
                                },
                                '2': {
                                    reportActionID: '2',
                                    actionName: 'ADDCOMMENT',
                                    created: '2024-01-01',
                                    message: [{ html: 'some content', text: 'some content', type: 'text' }],
                                    errors: {
                                        field3: {
                                            '1234567891': 'Error message 2',
                                        },
                                    },
                                },
                            };
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), reportActions)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, OnyxUtils_1.default.get(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES)];
                        case 4:
                            derivedReportAttributes = _a.sent();
                            expect(derivedReportAttributes === null || derivedReportAttributes === void 0 ? void 0 : derivedReportAttributes.reports[report.reportID].reportErrors).toEqual({
                                '1234567890': 'Error message 1',
                                '1234567891': 'Error message 2',
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});

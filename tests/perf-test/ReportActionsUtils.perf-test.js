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
var reassure_1 = require("reassure");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var createCollection_1 = require("../utils/collections/createCollection");
var reportActions_1 = require("../utils/collections/reportActions");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var getMockedReportActionsMap = function (reportsLength, actionsPerReportLength) {
    if (reportsLength === void 0) { reportsLength = 10; }
    if (actionsPerReportLength === void 0) { actionsPerReportLength = 100; }
    var mockReportActions = Array.from({ length: actionsPerReportLength }, function (v, i) {
        var _a;
        var reportActionKey = i + 1;
        var reportAction = (0, reportActions_1.default)(reportActionKey);
        return _a = {}, _a[reportActionKey] = reportAction, _a;
    });
    var reportKeysMap = Array.from({ length: reportsLength }, function (v, i) {
        var _a;
        var key = i + 1;
        return _a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(key)] = Object.assign.apply(Object, __spreadArray([{}], mockReportActions, false)), _a;
    });
    return Object.assign.apply(Object, __spreadArray([{}], reportKeysMap, false));
};
var mockedReportActionsMap = getMockedReportActionsMap(2, 10000);
var reportActions = (0, createCollection_1.default)(function (item) { return "".concat(item.reportActionID); }, function (index) { return (0, reportActions_1.default)(index); });
var reportId = '1';
describe('ReportActionsUtils', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
        react_native_onyx_1.default.multiSet(__assign({}, mockedReportActionsMap));
    });
    afterAll(function () {
        react_native_onyx_1.default.clear();
    });
    /**
     * This function will be executed 20 times and the average time will be used on the comparison.
     * It will fail based on the CI configuration around Reassure:
     * @see /.github/workflows/reassurePerformanceTests.yml
     *
     * Max deviation on the duration is set to 20% at the time of writing.
     *
     * More on the measureFunction API:
     * @see https://callstack.github.io/reassure/docs/api#measurefunction-function
     */
    test('[ReportActionsUtils] getLastVisibleAction on 10k reportActions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportActionsUtils_1.getLastVisibleAction)(reportId); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportActionsUtils] getLastVisibleAction on 10k reportActions with actionsToMerge', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parentReportActionId, fakeParentAction, actionsToMerge;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    parentReportActionId = '1';
                    fakeParentAction = reportActions[parentReportActionId];
                    actionsToMerge = (_a = {},
                        _a[parentReportActionId] = {
                            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            previousMessage: fakeParentAction.message,
                            message: [
                                {
                                    translationKey: '',
                                    type: 'COMMENT',
                                    html: '',
                                    text: '',
                                    isEdited: true,
                                    isDeletedParentAction: true,
                                },
                            ],
                            errors: null,
                            linkMetaData: [],
                        },
                        _a);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportActionsUtils_1.getLastVisibleAction)(reportId, true, actionsToMerge); })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportActionsUtils] getMostRecentIOURequestActionID on 10k ReportActions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportActionsArray;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reportActionsArray = (0, ReportActionsUtils_1.getSortedReportActionsForDisplay)(reportActions, true);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportActionsUtils_1.getMostRecentIOURequestActionID)(reportActionsArray); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportActionsUtils] getLastVisibleMessage on 10k ReportActions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportActionsUtils_1.getLastVisibleMessage)(reportId); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportActionsUtils] getLastVisibleMessage on 10k ReportActions with actionsToMerge', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parentReportActionId, fakeParentAction, actionsToMerge;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    parentReportActionId = '1';
                    fakeParentAction = reportActions[parentReportActionId];
                    actionsToMerge = (_a = {},
                        _a[parentReportActionId] = {
                            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            previousMessage: fakeParentAction.message,
                            message: [
                                {
                                    translationKey: '',
                                    type: 'COMMENT',
                                    html: '',
                                    text: '',
                                    isEdited: true,
                                    isDeletedParentAction: true,
                                },
                            ],
                            errors: null,
                            linkMetaData: [],
                        },
                        _a);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportActionsUtils_1.getLastVisibleMessage)(reportId, true, actionsToMerge); })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportActionsUtils] getSortedReportActionsForDisplay on 10k ReportActions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportActionsUtils_1.getSortedReportActionsForDisplay)(reportActions, true); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[ReportActionsUtils] getLastClosedReportAction on 10k ReportActions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, ReportActionsUtils_1.getLastClosedReportAction)(reportActions); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

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
var ReportUtils_1 = require("@libs/ReportUtils");
var IntlStore_1 = require("@src/languages/IntlStore");
var actions_1 = require("../../__mocks__/reportData/actions");
var reports_1 = require("../../__mocks__/reportData/reports");
var CONST_1 = require("../../src/CONST");
var ReportActionsUtils = require("../../src/libs/ReportActionsUtils");
var ReportActionsUtils_1 = require("../../src/libs/ReportActionsUtils");
var ONYXKEYS_1 = require("../../src/ONYXKEYS");
var reports_2 = require("../utils/collections/reports");
var LHNTestUtils = require("../utils/LHNTestUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
describe('ReportActionsUtils', function () {
    beforeAll(function () {
        return react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
    });
    beforeEach(function () {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        IntlStore_1.default.load(CONST_1.default.LOCALES.DEFAULT);
        // Initialize the network key for OfflineWithFeedback
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false });
        return (0, waitForBatchedUpdates_1.default)();
    });
    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(function () {
        react_native_onyx_1.default.clear();
    });
    describe('getSortedReportActions', function () {
        var cases = [
            [
                [
                    // This is the highest created timestamp, so should appear last
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    // These reportActions were created in the same millisecond so should appear ordered by reportActionID
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
                [
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
            ],
            [
                [
                    // Given three reportActions with the same timestamp
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '3',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '2',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '1',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
                [
                    // The CREATED action should appear first, then we should sort by reportActionID
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '2',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '1',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '3',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
            ],
            [
                [
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    // this item has no created field, so it should appear right after CONST.REPORT.ACTIONS.TYPE.CREATED
                    {
                        reportActionID: '2962390724708756',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.889',
                        reportActionID: '1609646094152486',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.989',
                        reportActionID: '1661970171066218',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
                [
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        reportActionID: '2962390724708756',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.889',
                        reportActionID: '1609646094152486',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.989',
                        reportActionID: '1661970171066218',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
            ],
        ];
        test.each(cases)('sorts by created, then actionName, then reportActionID', function (input, expectedOutput) {
            var result = ReportActionsUtils.getSortedReportActions(input);
            expect(result).toStrictEqual(expectedOutput);
        });
        test.each(cases)('in descending order', function (input, expectedOutput) {
            var result = ReportActionsUtils.getSortedReportActions(input, true);
            expect(result).toStrictEqual(expectedOutput.reverse());
        });
    });
    describe('isIOUActionMatchingTransactionList', function () {
        var nonIOUAction = {
            created: '2022-11-13 22:27:01.825',
            reportActionID: '8401445780099176',
            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {
                html: 'Hello world',
                whisperedTo: [],
            },
            message: [
                {
                    html: 'Hello world',
                    type: 'Action type',
                    text: 'Action text',
                },
            ],
        };
        it('returns false for non-money request actions when defaultToFalseForNonIOU is true', function () {
            expect((0, ReportActionsUtils_1.isIOUActionMatchingTransactionList)(nonIOUAction, undefined, true)).toBeFalsy();
        });
        it('returns true for non-money request actions when defaultToFalseForNonIOU is false', function () {
            expect((0, ReportActionsUtils_1.isIOUActionMatchingTransactionList)(nonIOUAction, undefined, false)).toBeTruthy();
        });
        it('returns true if no reportTransactionIDs are provided', function () {
            expect((0, ReportActionsUtils_1.isIOUActionMatchingTransactionList)(actions_1.actionR14932)).toBeTruthy();
        });
        it('returns true if action is of excluded type', function () {
            var action = __assign(__assign({}, actions_1.actionR14932), { originalMessage: __assign(__assign({}, actions_1.originalMessageR14932), { type: CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK }) });
            expect((0, ReportActionsUtils_1.isIOUActionMatchingTransactionList)(action, ['124', '125', '126'])).toBeTruthy();
        });
        it('returns true if IOUTransactionID matches any provided reportTransactionIDs', function () {
            expect((0, ReportActionsUtils_1.isIOUActionMatchingTransactionList)(actions_1.actionR14932, ['123', '124', actions_1.originalMessageR14932.IOUTransactionID])).toBeTruthy();
        });
        it('returns false if IOUTransactionID does not match any provided reportTransactionIDs', function () {
            expect((0, ReportActionsUtils_1.isIOUActionMatchingTransactionList)(actions_1.actionR14932, ['123', '124'])).toBeFalsy();
        });
    });
    describe('getOneTransactionThreadReportID', function () {
        var _a;
        var IOUReportID = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "REPORT_IOU");
        var IOUTransactionID = "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "TRANSACTION_IOU");
        var IOUExpenseTransactionID = "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "TRANSACTION_EXPENSE");
        var mockChatReportID = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reports_1.chatReportR14932.reportID);
        var mockedReports = (_a = {},
            _a[IOUReportID] = __assign(__assign({}, reports_1.iouReportR14932), { reportID: IOUReportID }),
            _a[mockChatReportID] = reports_1.chatReportR14932,
            _a);
        var linkedCreateAction = __assign(__assign({}, actions_1.actionR14932), { originalMessage: __assign(__assign({}, (0, ReportActionsUtils_1.getOriginalMessage)(actions_1.actionR14932)), { IOUTransactionID: IOUTransactionID }) });
        var unlinkedCreateAction = __assign(__assign({}, actions_1.actionR14932), { originalMessage: __assign(__assign({}, (0, ReportActionsUtils_1.getOriginalMessage)(actions_1.actionR14932)), { IOUTransactionID: IOUExpenseTransactionID }) });
        var linkedDeleteAction = __assign(__assign({}, actions_1.actionR14932), { originalMessage: __assign(__assign({}, (0, ReportActionsUtils_1.getOriginalMessage)(actions_1.actionR14932)), { IOUTransactionID: IOUTransactionID, type: CONST_1.default.IOU.REPORT_ACTION_TYPE.DELETE }) });
        var linkedPayAction = __assign(__assign({}, actions_1.actionR14932), { originalMessage: __assign(__assign({}, (0, ReportActionsUtils_1.getOriginalMessage)(actions_1.actionR14932)), { IOUTransactionID: IOUTransactionID, type: CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY }) });
        it('should return the childReportID for a valid single IOU action', function () {
            var result = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedCreateAction], false, [IOUTransactionID]);
            expect(result).toEqual(linkedCreateAction.childReportID);
        });
        it('should return undefined for action with a transaction that is not linked to it', function () {
            var result = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(mockedReports[IOUReportID], mockedReports[mockChatReportID], [unlinkedCreateAction], false, [IOUTransactionID]);
            expect(result).toBeUndefined();
        });
        it('should return undefined if multiple IOU actions are present', function () {
            var result = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedCreateAction, linkedCreateAction], false, [IOUTransactionID]);
            expect(result).toBeUndefined();
        });
        it('should skip actions where original message type is PAY', function () {
            var result = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedPayAction, linkedCreateAction], false, [IOUTransactionID]);
            expect(result).toEqual(linkedCreateAction.childReportID);
        });
        it('should return undefined if no valid IOU actions are present', function () {
            var result = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(mockedReports[IOUReportID], mockedReports[mockChatReportID], [unlinkedCreateAction, linkedDeleteAction, linkedPayAction], false, [
                IOUTransactionID,
            ]);
            expect(result).toBeUndefined();
        });
    });
    describe('getSortedReportActionsForDisplay', function () {
        it('should filter out non-whitelisted actions', function () {
            var input = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '2962390724708756',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        amount: 0,
                        currency: 'USD',
                        type: 'split', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-10 22:27:01.825',
                    reportActionID: '1609646094152486',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED,
                    originalMessage: {
                        html: 'Hello world',
                        lastModified: '2022-11-10 22:27:01.825',
                        oldName: 'old name',
                        newName: 'new name',
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '8049485084562457',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD,
                    originalMessage: {},
                    message: [{ html: 'updated the Approval Mode from "Submit and Approve" to "Submit and Close"', type: 'Action type', text: 'Action text' }],
                },
                {
                    created: '2022-11-08 22:27:06.825',
                    reportActionID: '1661970171066216',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
                    originalMessage: {
                        paymentType: 'ACH',
                    },
                    message: [{ html: 'Waiting for the bank account', type: 'Action type', text: 'Action text' }],
                },
                {
                    created: '2022-11-06 22:27:08.825',
                    reportActionID: '1661970171066220',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.TASK_EDITED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{ html: 'I have changed the task', type: 'Action type', text: 'Action text' }],
                },
            ];
            // Expected output should have the `CREATED` action at last
            // eslint-disable-next-line rulesdir/prefer-at
            var expectedOutput = __spreadArray(__spreadArray(__spreadArray([], input.slice(0, 1), true), input.slice(2), true), [input[1]], false);
            var result = ReportActionsUtils.getSortedReportActionsForDisplay(input, true);
            expect(result).toStrictEqual(expectedOutput);
        });
        it('should filter out closed actions', function () {
            var input = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '2962390724708756',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        amount: 0,
                        currency: 'USD',
                        type: 'split', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-10 22:27:01.825',
                    reportActionID: '1609646094152486',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED,
                    originalMessage: {
                        html: 'Hello world',
                        lastModified: '2022-11-10 22:27:01.825',
                        oldName: 'old name',
                        newName: 'new name',
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '1661970171066218',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        policyName: 'default', // change to const
                        reason: 'default', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];
            // Expected output should have the `CREATED` action at last and `CLOSED` action removed
            // eslint-disable-next-line rulesdir/prefer-at
            var expectedOutput = __spreadArray(__spreadArray(__spreadArray([], input.slice(0, 1), true), input.slice(2, -1), true), [input[1]], false);
            var result = ReportActionsUtils.getSortedReportActionsForDisplay(input, true);
            expect(result).toStrictEqual(expectedOutput);
        });
        it('should filter out deleted, non-pending comments', function () {
            var input = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '8401445780099175',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{ html: '', type: 'Action type', text: 'Action text' }],
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '8401445780099174',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{ html: '', type: 'Action type', text: 'Action text' }],
                },
            ];
            var result = ReportActionsUtils.getSortedReportActionsForDisplay(input, true);
            input.pop();
            expect(result).toStrictEqual(input);
        });
        it('should filter actionable whisper actions e.g. "join", "create room" when room is archived', function () {
            // Given several different action types, including actionable whispers for creating, inviting and joining rooms, as well as non-actionable whispers
            // - ADD_COMMENT
            // - ACTIONABLE_REPORT_MENTION_WHISPER
            // - ACTIONABLE_MENTION_WHISPER
            var input = [
                {
                    created: '2024-11-19 08:04:13.728',
                    reportActionID: '1607371725956675966',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: '<mention-user accountID="18414674"/>',
                        whisperedTo: [],
                        lastModified: '2024-11-19 08:04:13.728',
                        mentionedAccountIDs: [18301266],
                    },
                    message: [
                        {
                            html: '<mention-user accountID="18414674"/>',
                            text: '@as',
                            type: 'COMMENT',
                            whisperedTo: [],
                        },
                    ],
                },
                {
                    created: '2024-11-19 08:00:14.352',
                    reportActionID: '4655978522337302598',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: '#join',
                        whisperedTo: [],
                        lastModified: '2024-11-19 08:00:14.352',
                    },
                    message: [
                        {
                            html: '#join',
                            text: '#join',
                            type: 'COMMENT',
                            whisperedTo: [],
                        },
                    ],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '8049485084562457',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER,
                    originalMessage: {
                        lastModified: '2024-11-19 08:00:14.353',
                        mentionedAccountIDs: [],
                        whisperedTo: [18301266],
                    },
                    message: {
                        html: "Heads up, <mention-report>#join</mention-report> doesn't exist yet. Do you want to create it?",
                        text: "Heads up, #join doesn't exist yet. Do you want to create it?",
                        type: 'COMMENT',
                        whisperedTo: [18301266],
                    },
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER,
                    originalMessage: {
                        inviteeAccountIDs: [18414674],
                        lastModified: '2024-11-19 08:04:25.813',
                        whisperedTo: [18301266],
                    },
                    message: [
                        {
                            html: "Heads up, <mention-user accountID=18414674></mention-user> isn't a member of this room.",
                            text: "Heads up,  isn't a member of this room.",
                            type: 'COMMENT',
                        },
                    ],
                },
            ];
            // When the report actions are sorted for display with the second parameter (canUserPerformWriteAction) set to false (to simulate a report that has been archived)
            var result = ReportActionsUtils.getSortedReportActionsForDisplay(input, false);
            // The output should correctly filter out the actionable whisper types for "join," "invite," and "create room" because the report is archived.
            // Taking these actions not only doesn't make sense from a UX standpoint,  but also leads to server errors since such actions are not possible.
            var expectedOutput = input.filter(function (action) {
                return action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER &&
                    action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST &&
                    action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER;
            });
            expect(result).toStrictEqual(expectedOutput);
        });
    });
    describe('getLastVisibleAction', function () {
        it('should return the last visible action for a report', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport([8401445480599174, 9401445480599174], 3, true)), { reportID: '1' });
            var action = __assign(__assign({}, LHNTestUtils.getFakeReportAction('email1@test.com', 3)), { created: '2023-08-01 16:00:00', reportActionID: 'action1', actionName: 'ADDCOMMENT', originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                } });
            var action2 = __assign(__assign({}, LHNTestUtils.getFakeReportAction('email2@test.com', 3)), { created: '2023-08-01 18:00:00', reportActionID: 'action2', actionName: 'ADDCOMMENT', originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                } });
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a, _b;
                return react_native_onyx_1.default.multiSet((_a = {},
                    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID)] = (_b = {}, _b[action.reportActionID] = action, _b[action2.reportActionID] = action2, _b),
                    _a));
            })
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
                        callback: function () {
                            react_native_onyx_1.default.disconnect(connection);
                            var res = ReportActionsUtils.getLastVisibleAction(report.reportID);
                            expect(res).toEqual(action2);
                            resolve();
                        },
                    });
                });
            }));
        });
    });
    describe('getReportActionMessageFragments', function () {
        it('should return the correct fragment for the REIMBURSED action', function () {
            var action = {
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSED,
                reportActionID: '1',
                created: '1',
                message: [
                    {
                        type: 'TEXT',
                        style: 'strong',
                        text: 'Concierge',
                    },
                    {
                        type: 'TEXT',
                        style: 'normal',
                        text: ' reimbursed this report',
                    },
                    {
                        type: 'TEXT',
                        style: 'normal',
                        text: ' on behalf of you',
                    },
                    {
                        type: 'TEXT',
                        style: 'normal',
                        text: ' from the bank account ending in 1111',
                    },
                    {
                        type: 'TEXT',
                        style: 'normal',
                        text: '. Money is on its way to your bank account ending in 0000. Reimbursement estimated to complete on Dec 16.',
                    },
                ],
            };
            var expectedMessage = ReportActionsUtils.getReportActionMessageText(action);
            var expectedFragments = ReportActionsUtils.getReportActionMessageFragments(action);
            expect(expectedFragments).toEqual([{ text: expectedMessage, html: "<muted-text>".concat(expectedMessage, "</muted-text>"), type: 'COMMENT' }]);
        });
    });
    describe('getSendMoneyFlowOneTransactionThreadID', function () {
        var _a;
        var mockChatReportID = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "REPORT");
        var mockDMChatReportID = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "REPORT_DM");
        var childReportID = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "childReport123");
        var mockedReports = (_a = {},
            _a[mockChatReportID] = __assign(__assign({}, reports_1.chatReportR14932), { reportID: mockChatReportID }),
            _a[mockDMChatReportID] = __assign(__assign({}, reports_1.chatReportR14932), { reportID: mockDMChatReportID, chatType: undefined, parentReportID: undefined, parentReportActionID: undefined }),
            _a);
        var createAction = __assign(__assign({}, actions_1.actionR14932), { childReportID: childReportID, originalMessage: __assign(__assign({}, (0, ReportActionsUtils_1.getOriginalMessage)(actions_1.actionR14932)), { type: CONST_1.default.IOU.TYPE.CREATE }) });
        var nonIOUAction = __assign(__assign({}, actions_1.actionR14932), { childReportID: childReportID, type: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED });
        var payAction = __assign(__assign({}, actions_1.actionR14932), { childReportID: childReportID, originalMessage: __assign(__assign({}, (0, ReportActionsUtils_1.getOriginalMessage)(actions_1.actionR14932)), { type: CONST_1.default.IOU.TYPE.PAY }) });
        it('should return undefined for a single non-IOU action', function () {
            expect((0, ReportActionsUtils_1.getSendMoneyFlowOneTransactionThreadID)([nonIOUAction], mockedReports[mockDMChatReportID])).toBeUndefined();
        });
        it('should return undefined for multiple IOU actions regardless of type', function () {
            expect((0, ReportActionsUtils_1.getSendMoneyFlowOneTransactionThreadID)([payAction, payAction], mockedReports[mockDMChatReportID])).toBeUndefined();
        });
        it('should return undefined for a single IOU action that is not `Pay`', function () {
            expect((0, ReportActionsUtils_1.getSendMoneyFlowOneTransactionThreadID)([createAction], mockedReports[mockDMChatReportID])).toBeUndefined();
        });
        it('should return the appropriate childReportID for a valid single `Pay` IOU action in DM chat', function () {
            expect((0, ReportActionsUtils_1.getSendMoneyFlowOneTransactionThreadID)([payAction], mockedReports[mockDMChatReportID])).toEqual(childReportID);
        });
        it('should return undefined for a valid single `Pay` IOU action in a chat that is not DM', function () {
            expect((0, ReportActionsUtils_1.getSendMoneyFlowOneTransactionThreadID)([payAction], mockedReports[mockChatReportID])).toBeUndefined();
        });
        it('should return undefined for a valid `Pay` IOU action in DM chat that has also a create IOU action', function () {
            expect((0, ReportActionsUtils_1.getSendMoneyFlowOneTransactionThreadID)([payAction, createAction], mockedReports[mockDMChatReportID])).toBeUndefined();
        });
    });
    describe('shouldShowAddMissingDetails', function () {
        it('should return true if personal detail is not completed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var card, mockPersonalDetail, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = {
                            cardID: 1,
                            state: CONST_1.default.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED,
                            bank: 'vcf',
                            domainName: 'expensify',
                            lastUpdated: '2022-11-09 22:27:01.825',
                            fraud: CONST_1.default.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
                        };
                        mockPersonalDetail = {
                            address: {
                                street: '123 Main St',
                                city: 'New York',
                                state: 'NY',
                                postalCode: '10001',
                            },
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, mockPersonalDetail)];
                    case 1:
                        _a.sent();
                        res = ReportActionsUtils.shouldShowAddMissingDetails(CONST_1.default.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS, card);
                        expect(res).toEqual(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true if card state is STATE_NOT_ISSUED', function () { return __awaiter(void 0, void 0, void 0, function () {
            var card, mockPersonalDetail, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = {
                            cardID: 1,
                            state: CONST_1.default.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED,
                            bank: 'vcf',
                            domainName: 'expensify',
                            lastUpdated: '2022-11-09 22:27:01.825',
                            fraud: CONST_1.default.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
                        };
                        mockPersonalDetail = {
                            addresses: [
                                {
                                    street: '123 Main St',
                                    city: 'New York',
                                    state: 'NY',
                                    postalCode: '10001',
                                },
                            ],
                            legalFirstName: 'John',
                            legalLastName: 'David',
                            phoneNumber: '+162992973',
                            dob: '9-9-2000',
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, mockPersonalDetail)];
                    case 1:
                        _a.sent();
                        res = ReportActionsUtils.shouldShowAddMissingDetails(CONST_1.default.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS, card);
                        expect(res).toEqual(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if no condition is matched', function () { return __awaiter(void 0, void 0, void 0, function () {
            var card, mockPersonalDetail, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = {
                            cardID: 1,
                            state: CONST_1.default.EXPENSIFY_CARD.STATE.OPEN,
                            bank: 'vcf',
                            domainName: 'expensify',
                            lastUpdated: '2022-11-09 22:27:01.825',
                            fraud: CONST_1.default.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
                        };
                        mockPersonalDetail = {
                            addresses: [
                                {
                                    street: '123 Main St',
                                    city: 'New York',
                                    state: 'NY',
                                    postalCode: '10001',
                                },
                            ],
                            legalFirstName: 'John',
                            legalLastName: 'David',
                            phoneNumber: '+162992973',
                            dob: '9-9-2000',
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, mockPersonalDetail)];
                    case 1:
                        _a.sent();
                        res = ReportActionsUtils.shouldShowAddMissingDetails(CONST_1.default.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS, card);
                        expect(res).toEqual(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('isDeletedAction', function () {
        it('should return true if reportAction is undefined', function () {
            expect(ReportActionsUtils.isDeletedAction(undefined)).toBe(true);
        });
        it('should return false for POLICY_CHANGE_LOG.INVITE_TO_ROOM action', function () {
            var reportAction = {
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM,
                originalMessage: {
                    html: '',
                    whisperedTo: [],
                },
                reportActionID: '1',
                created: '1',
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(false);
        });
        it('should return true if message is an empty array', function () {
            var reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });
        it('should return true if message html is empty', function () {
            var reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: {
                    html: '',
                    type: 'Action type',
                    text: 'Action text',
                },
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });
        it('should return true if message is not an array and deleted is not empty', function () {
            var reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: {
                    html: 'Hello world',
                    deleted: 'deleted',
                    type: 'Action type',
                    text: 'Action text',
                },
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });
        it('should return true if message an array and first element deleted is not empty', function () {
            var reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: [
                    {
                        html: 'Hello world',
                        deleted: 'deleted',
                        type: 'Action type',
                        text: 'Action text',
                    },
                ],
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });
        it('should return true if message is an object with html field with empty string as value is empty', function () {
            var reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: [
                    {
                        html: '',
                        type: 'Action type',
                        text: 'Action text',
                    },
                ],
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });
        it('should return false otherwise', function () {
            var reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: [
                    {
                        html: 'Hello world',
                        type: 'Action type',
                        text: 'Action text',
                    },
                ],
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(false);
        });
    });
    describe('getRenamedAction', function () {
        it('should return the correct translated message for a renamed action', function () {
            var reportAction = {
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                    lastModified: '2022-11-09 22:27:01.825',
                    oldName: 'Old name',
                    newName: 'New name',
                },
                reportActionID: '1',
                created: '1',
            };
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(2)), { type: CONST_1.default.REPORT.TYPE.CHAT });
            expect(ReportActionsUtils.getRenamedAction(reportAction, (0, ReportUtils_1.isExpenseReport)(report), 'John')).toBe('John renamed this room to "New name" (previously "Old name")');
        });
        it('should return the correct translated message for a renamed action in expense report', function () {
            var reportAction = {
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                    lastModified: '2022-11-09 22:27:01.825',
                    oldName: 'Old name',
                    newName: 'New name',
                },
                reportActionID: '1',
                created: '1',
            };
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(2)), { type: CONST_1.default.REPORT.TYPE.EXPENSE });
            expect(ReportActionsUtils.getRenamedAction(reportAction, (0, ReportUtils_1.isExpenseReport)(report), 'John')).toBe('John renamed to "New name" (previously "Old name")');
        });
    });
});

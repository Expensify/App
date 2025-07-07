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
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var Localize_1 = require("@libs/Localize");
var ReportDetailsPage_1 = require("@pages/ReportDetailsPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_1 = require("../utils/collections/reports");
var transaction_1 = require("../utils/collections/transaction");
jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useIsFocused: jest.fn(), useRoute: jest.fn(), usePreventRemove: jest.fn() });
});
describe('ReportDetailsPage', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('self DM track options should disappear when report moved to workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
        var selfDMReportID, trackExpenseReportID, trackExpenseActionID, transactionID, transaction, trackExpenseReport, rerender, submitText, categorizeText, shareText, movedTrackExpenseReport;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.BETAS, [CONST_1.default.BETAS.TRACK_FLOWS])];
                case 1:
                    _b.sent();
                    selfDMReportID = '1';
                    trackExpenseReportID = '2';
                    trackExpenseActionID = '123';
                    transactionID = '3';
                    transaction = (0, transaction_1.default)(1);
                    trackExpenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(Number(trackExpenseReportID))), { chatType: '', parentReportID: selfDMReportID, parentReportActionID: trackExpenseActionID });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selfDMReportID), __assign(__assign({}, (0, reports_1.createRandomReport)(Number(selfDMReportID))), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM }))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(trackExpenseReportID), trackExpenseReport)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), transaction)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(selfDMReportID), (_a = {},
                            _a[trackExpenseActionID] = __assign(__assign({}, (0, reportActions_1.default)(Number(trackExpenseActionID))), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU, originalMessage: {
                                    type: CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK,
                                } }),
                            _a))];
                case 5:
                    _b.sent();
                    rerender = (0, react_native_1.render)(<OnyxProvider_1.default>
                <LocaleContextProvider_1.LocaleContextProvider>
                    <ReportDetailsPage_1.default betas={[]} isLoadingReportData={false} navigation={{}} policy={undefined} report={trackExpenseReport} reportMetadata={undefined} route={{ params: { reportID: trackExpenseReportID } }}/>
                </LocaleContextProvider_1.LocaleContextProvider>
            </OnyxProvider_1.default>).rerender;
                    submitText = (0, Localize_1.translateLocal)('actionableMentionTrackExpense.submit');
                    categorizeText = (0, Localize_1.translateLocal)('actionableMentionTrackExpense.categorize');
                    shareText = (0, Localize_1.translateLocal)('actionableMentionTrackExpense.share');
                    return [4 /*yield*/, react_native_1.screen.findByText(submitText)];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, react_native_1.screen.findByText(categorizeText)];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, react_native_1.screen.findByText(shareText)];
                case 8:
                    _b.sent();
                    movedTrackExpenseReport = __assign(__assign({}, trackExpenseReport), { parentReportID: '3', parentReportActionID: '234' });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(trackExpenseReportID), movedTrackExpenseReport)];
                case 9:
                    _b.sent();
                    rerender(<OnyxProvider_1.default>
                <LocaleContextProvider_1.LocaleContextProvider>
                    <ReportDetailsPage_1.default betas={[]} isLoadingReportData={false} navigation={{}} policy={undefined} report={movedTrackExpenseReport} reportMetadata={undefined} route={{ params: { reportID: trackExpenseReportID } }}/>
                </LocaleContextProvider_1.LocaleContextProvider>
            </OnyxProvider_1.default>);
                    expect(react_native_1.screen.queryByText(submitText)).not.toBeVisible();
                    expect(react_native_1.screen.queryByText(categorizeText)).not.toBeVisible();
                    expect(react_native_1.screen.queryByText(shareText)).not.toBeVisible();
                    return [2 /*return*/];
            }
        });
    }); });
});

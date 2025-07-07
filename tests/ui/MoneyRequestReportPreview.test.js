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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var portal_1 = require("@gorhom/portal");
var NativeNavigation = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var ComposeProviders_1 = require("@components/ComposeProviders");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var MoneyRequestReportPreview_1 = require("@components/ReportActionItem/MoneyRequestReportPreview");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TransactionPreviewSkeletonView_1 = require("@components/TransactionPreviewSkeletonView");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DateUtils_1 = require("@libs/DateUtils");
var Localize_1 = require("@libs/Localize");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ReportActionUtils = require("@src/libs/ReportActionsUtils");
var ReportUtils = require("@src/libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var actions_1 = require("../../__mocks__/reportData/actions");
var reports_1 = require("../../__mocks__/reportData/reports");
var transactions_1 = require("../../__mocks__/reportData/transactions");
var violations_1 = require("../../__mocks__/reportData/violations");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
var mockSecondTransactionID = "".concat(transactions_1.transactionR14932.transactionID, "2");
jest.mock('@react-navigation/native');
jest.mock('@rnmapbox/maps', function () {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@react-native-community/geolocation', function () { return ({
    setRNConfiguration: jest.fn(),
}); });
jest.mock('@src/hooks/useReportWithTransactionsAndViolations', function () {
    return jest.fn(function () {
        return [reports_1.chatReportR14932, [transactions_1.transactionR14932, __assign(__assign({}, transactions_1.transactionR14932), { transactionID: mockSecondTransactionID })], { violations: violations_1.violationsR14932 }];
    });
});
var getIOUActionForReportID = function (reportID, transactionID) {
    if (!reportID || !transactionID) {
        return undefined;
    }
    return __assign(__assign({}, actions_1.actionR14932), { originalMessage: __assign(__assign({}, actions_1.actionR14932), { IOUTransactionID: transactionID }) });
};
var hasViolations = function (reportID, transactionViolations, shouldShowInReview) {
    return (shouldShowInReview === undefined || shouldShowInReview) && Object.values(transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : {}).length > 0;
};
var renderPage = function (_a) {
    var _b = _a.isWhisper, isWhisper = _b === void 0 ? false : _b, _c = _a.isHovered, isHovered = _c === void 0 ? false : _c, _d = _a.contextMenuAnchor, contextMenuAnchor = _d === void 0 ? null : _d;
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider]}>
            <OptionListContextProvider_1.default>
                <ScreenWrapper_1.default testID="test">
                    <portal_1.PortalProvider>
                        <MoneyRequestReportPreview_1.default policyID={reports_1.chatReportR14932.policyID} action={actions_1.actionR14932} iouReportID={reports_1.iouReportR14932.iouReportID} chatReportID={reports_1.chatReportR14932.chatReportID} contextMenuAnchor={contextMenuAnchor} checkIfContextMenuActive={function () { }} onPaymentOptionsShow={function () { }} onPaymentOptionsHide={function () { }} isHovered={isHovered} isWhisper={isWhisper}/>
                    </portal_1.PortalProvider>
                </ScreenWrapper_1.default>
            </OptionListContextProvider_1.default>
        </ComposeProviders_1.default>);
};
var getTransactionDisplayAmountAndHeaderText = function (transaction) {
    var created = (0, TransactionUtils_1.getFormattedCreated)(transaction);
    var date = DateUtils_1.default.formatWithUTCTimeZone(created, DateUtils_1.default.doesDateBelongToAPastYear(created) ? CONST_1.default.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST_1.default.DATE.MONTH_DAY_ABBR_FORMAT);
    var isTransactionMadeWithCard = (0, TransactionUtils_1.isCardTransaction)(transaction);
    var cashOrCard = isTransactionMadeWithCard ? (0, Localize_1.translateLocal)('iou.card') : (0, Localize_1.translateLocal)('iou.cash');
    var transactionHeaderText = "".concat(date, " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat(cashOrCard);
    var transactionDisplayAmount = (0, CurrencyUtils_1.convertToDisplayString)(transaction.amount, transaction.currency);
    return { transactionHeaderText: transactionHeaderText, transactionDisplayAmount: transactionDisplayAmount };
};
var setCurrentWidth = function () {
    (0, react_native_1.fireEvent)(react_native_1.screen.getByTestId('carouselWidthSetter'), 'layout', {
        nativeEvent: { layout: { width: 500 } },
    });
};
var mockSecondTransaction = __assign(__assign({}, transactions_1.transactionR14932), { amount: transactions_1.transactionR14932.amount * 2, transactionID: mockSecondTransactionID });
var mockOnyxTransactions = (_a = {},
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactions_1.transactionR14932.transactionID)] = transactions_1.transactionR14932,
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(mockSecondTransaction.transactionID)] = mockSecondTransaction,
    _a);
var mockOnyxViolations = (_b = {},
    _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactions_1.transactionR14932.transactionID)] = violations_1.violationsR14932,
    _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(mockSecondTransaction.transactionID)] = violations_1.violationsR14932,
    _b);
var arrayOfTransactions = Object.values(mockOnyxTransactions);
TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();
describe('MoneyRequestReportPreview', function () {
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_native_onyx_1.default.init({
                        keys: ONYXKEYS_1.default,
                    });
                    jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({ key: '', name: '' });
                    jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(getIOUActionForReportID);
                    jest.spyOn(ReportUtils, 'hasViolations').mockImplementation(hasViolations);
                    return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    beforeEach(function () {
        jest.clearAllMocks();
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    it('renders transaction details and associated report name correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, moneyRequestReportPreviewName, _i, arrayOfTransactions_1, transaction, _b, transactionDisplayAmount, transactionHeaderText;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    renderPage({});
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _c.sent();
                    setCurrentWidth();
                    return [4 /*yield*/, react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.TRANSACTION, mockOnyxTransactions).then(waitForBatchedUpdates_1.default)];
                case 2:
                    _c.sent();
                    _a = reports_1.chatReportR14932.reportName, moneyRequestReportPreviewName = _a === void 0 ? '' : _a;
                    for (_i = 0, arrayOfTransactions_1 = arrayOfTransactions; _i < arrayOfTransactions_1.length; _i++) {
                        transaction = arrayOfTransactions_1[_i];
                        _b = getTransactionDisplayAmountAndHeaderText(transaction), transactionDisplayAmount = _b.transactionDisplayAmount, transactionHeaderText = _b.transactionHeaderText;
                        expect(react_native_1.screen.getByText(moneyRequestReportPreviewName)).toBeOnTheScreen();
                        expect(react_native_1.screen.getByText(transactionDisplayAmount)).toBeOnTheScreen();
                        expect(react_native_1.screen.getAllByText(transactionHeaderText)).toHaveLength(arrayOfTransactions.length);
                        expect(react_native_1.screen.getAllByText(transaction.merchant)).toHaveLength(arrayOfTransactions.length);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('renders RBR for every transaction with violations', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderPage({});
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    setCurrentWidth();
                    return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign({}, mockOnyxTransactions), mockOnyxViolations))];
                case 2:
                    _a.sent();
                    expect(react_native_1.screen.getAllByText((0, Localize_1.translateLocal)('violations.reviewRequired'))).toHaveLength(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('renders a skeleton if the transaction is empty', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderPage({});
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    setCurrentWidth();
                    expect(react_native_1.screen.getAllByTestId(TransactionPreviewSkeletonView_1.default.displayName)).toHaveLength(2);
                    return [2 /*return*/];
            }
        });
    }); });
});

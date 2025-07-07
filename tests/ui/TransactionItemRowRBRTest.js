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
var ComposeProviders_1 = require("@components/ComposeProviders");
var HTMLEngineProvider_1 = require("@components/HTMLEngineProvider");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var TransactionItemRow_1 = require("@components/TransactionItemRow");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_1 = require("../utils/collections/reports");
var transaction_1 = require("../utils/collections/transaction");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
jest.mock('@components/Icon/Expensicons');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useAnimatedHighlightStyle');
var MOCK_TRANSACTION_ID = '1';
var MOCK_REPORT_ID = '1';
// Default props for TransactionItemRow component
var defaultProps = {
    shouldUseNarrowLayout: false,
    isSelected: false,
    shouldShowTooltip: false,
    dateColumnSize: CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    amountColumnSize: CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    taxAmountColumnSize: CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    onCheckboxPress: jest.fn(),
    shouldShowCheckbox: false,
    columns: Object.values(CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS),
    onButtonPress: jest.fn(),
    isParentHovered: false,
};
// Helper function to render TransactionItemRow with providers
var renderTransactionItemRow = function (transactionItem, isInReportTableView) {
    if (isInReportTableView === void 0) { isInReportTableView = true; }
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, HTMLEngineProvider_1.default]}>
            <TransactionItemRow_1.default transactionItem={transactionItem} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...defaultProps} isInReportTableView={isInReportTableView}/>
        </ComposeProviders_1.default>);
};
// Helper function to create base transaction
var createBaseTransaction = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign(__assign(__assign({}, (0, transaction_1.default)(1)), { pendingAction: null, transactionID: MOCK_TRANSACTION_ID, reportID: MOCK_REPORT_ID }), overrides));
};
// Helper function to create base report action
var createBaseReportAction = function (id, overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign(__assign(__assign({}, (0, reportActions_1.default)(id)), { pendingAction: null }), overrides));
};
// Helper function to create IOU report action
var createIOUReportAction = function () {
    return createBaseReportAction(1, {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
        childReportID: MOCK_REPORT_ID,
        originalMessage: {
            IOUReportID: MOCK_REPORT_ID,
            amount: -100,
            currency: 'USD',
            comment: '',
            IOUTransactionID: MOCK_TRANSACTION_ID,
        },
    });
};
// Helper function to create error report action
var createErrorReportAction = function () {
    return createBaseReportAction(2, {
        errors: {
            ERROR: 'Unexpected error posting the comment. Please try again later.',
        },
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    });
};
describe('TransactionItemRowRBRWithOnyx', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
        react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, CONST_1.default.LOCALES.DEFAULT);
    });
    beforeEach(function () {
        jest.clearAllMocks();
        return react_native_onyx_1.default.clear([ONYXKEYS_1.default.NVP_PREFERRED_LOCALE]).then(waitForBatchedUpdates_1.default);
    });
    it('should display RBR message for transaction with single violation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockViolations, mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockViolations = [
                        {
                            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                    ];
                    mockTransaction = createBaseTransaction({ violations: mockViolations });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), mockViolations)];
                case 2:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then the RBR message should be displayed
                    expect(react_native_1.screen.getByText('Missing category.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display RBR message for transaction with multiple violations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockViolations, mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockViolations = [
                        {
                            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                        {
                            name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                    ];
                    mockTransaction = createBaseTransaction({ violations: mockViolations });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), mockViolations)];
                case 2:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then the RBR message should be displayed with both violations
                    expect(react_native_1.screen.getByText('Missing category. Potential duplicate.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display RBR message for transaction with report action errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTransaction, mockReportActionIOU, mockReportActionErrors;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockTransaction = createBaseTransaction();
                    mockReportActionIOU = createIOUReportAction();
                    mockReportActionErrors = createErrorReportAction();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(MOCK_TRANSACTION_ID), (_a = {},
                            _a[mockReportActionIOU.reportActionID] = mockReportActionIOU,
                            _a[mockReportActionErrors.reportActionID] = mockReportActionErrors,
                            _a))];
                case 2:
                    _b.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _b.sent();
                    // Then the RBR message should be displayed for report action errors
                    expect(react_native_1.screen.getByText('Unexpected error posting the comment. Please try again later.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display RBR message for transaction with missing merchant error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockReport, mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockReport = __assign(__assign({}, (0, reports_1.createRandomReport)(1)), { pendingAction: null, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                    mockTransaction = createBaseTransaction({
                        modifiedMerchant: '',
                        merchant: '',
                    });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT_ID), mockReport)];
                case 2:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then the RBR message should be displayed with missing merchant error
                    expect(react_native_1.screen.getByText('Missing merchant.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display RBR message for transaction with both violations and errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockViolations, mockTransaction, mockReportActionIOU, mockReportActionErrors;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockViolations = [
                        {
                            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                    ];
                    mockTransaction = createBaseTransaction({ violations: mockViolations });
                    mockReportActionIOU = createIOUReportAction();
                    mockReportActionErrors = createErrorReportAction();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), mockViolations)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(MOCK_TRANSACTION_ID), (_a = {},
                            _a[mockReportActionIOU.reportActionID] = mockReportActionIOU,
                            _a[mockReportActionErrors.reportActionID] = mockReportActionErrors,
                            _a))];
                case 3:
                    _b.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 4:
                    _b.sent();
                    // Then the RBR message should be displayed with both report action errors and violations
                    expect(react_native_1.screen.getByText('Unexpected error posting the comment. Please try again later. Missing category.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display RBR message for transaction with violations, errors, and missing merchant error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockViolations, mockReport, mockTransaction, mockReportActionIOU, mockReportActionErrors;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockViolations = [
                        {
                            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                    ];
                    mockReport = __assign(__assign({}, (0, reports_1.createRandomReport)(1)), { pendingAction: null, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                    mockTransaction = createBaseTransaction({
                        violations: mockViolations,
                        modifiedMerchant: '',
                        merchant: '',
                    });
                    mockReportActionIOU = createIOUReportAction();
                    mockReportActionErrors = createErrorReportAction();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT_ID), mockReport)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), mockViolations)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(MOCK_TRANSACTION_ID), (_a = {},
                            _a[mockReportActionIOU.reportActionID] = mockReportActionIOU,
                            _a[mockReportActionErrors.reportActionID] = mockReportActionErrors,
                            _a))];
                case 4:
                    _b.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 5:
                    _b.sent();
                    // Then the RBR message should be displayed with transaction errors, missing merchant error, and violations
                    expect(react_native_1.screen.getByText('Unexpected error posting the comment. Please try again later. Missing merchant. Missing category.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not display RBR message for transaction with no violations or errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockTransaction = createBaseTransaction({ violations: [] });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), [])];
                case 2:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then the RBR message should not be displayed
                    expect(react_native_1.screen.queryByTestId('TransactionItemRowRBRWithOnyx')).not.toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('TransactionItemRowRBR', function () {
    beforeAll(function () {
        return react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
    });
    beforeEach(function () {
        jest.clearAllMocks();
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    it('should display RBR message for transaction with single violation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockViolations, mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockViolations = [
                        {
                            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                    ];
                    mockTransaction = createBaseTransaction({ violations: mockViolations });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), mockViolations)];
                case 2:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction, false);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then the RBR message should be displayed
                    expect(react_native_1.screen.getByText('Missing category.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display RBR message for transaction with multiple violations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockViolations, mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockViolations = [
                        {
                            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                        {
                            name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                    ];
                    mockTransaction = createBaseTransaction({ violations: mockViolations });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), mockViolations)];
                case 2:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction, false);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then the RBR message should be displayed with both violations
                    expect(react_native_1.screen.getByText('Missing category. Potential duplicate.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display RBR message for transaction with violations, and missing merchant error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockViolations, mockReport, mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockViolations = [
                        {
                            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        },
                    ];
                    mockReport = __assign(__assign({}, (0, reports_1.createRandomReport)(1)), { pendingAction: null, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                    mockTransaction = createBaseTransaction({
                        violations: mockViolations,
                        modifiedMerchant: '',
                        merchant: '',
                    });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT_ID), mockReport)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), mockViolations)];
                case 3:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction, false);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 4:
                    _a.sent();
                    // Then the RBR message should be displayed with missing merchant error and violations
                    expect(react_native_1.screen.getByText('Missing merchant. Missing category.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display RBR message for transaction with missing merchant error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockReport, mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockReport = __assign(__assign({}, (0, reports_1.createRandomReport)(1)), { pendingAction: null, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                    mockTransaction = createBaseTransaction({
                        modifiedMerchant: '',
                        merchant: '',
                    });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT_ID), mockReport)];
                case 2:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction, false);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then the RBR message should be displayed with missing merchant error
                    expect(react_native_1.screen.getByText('Missing merchant.')).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not display RBR message for transaction with no violations or errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockTransaction = createBaseTransaction({ violations: [] });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION_ID), mockTransaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION_ID), [])];
                case 2:
                    _a.sent();
                    // When rendering the transaction item row
                    renderTransactionItemRow(mockTransaction, false);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then the RBR message should not be displayed
                    expect(react_native_1.screen.queryByTestId('TransactionItemRowRBR')).not.toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
});

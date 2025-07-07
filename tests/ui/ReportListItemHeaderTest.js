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
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var SearchContext_1 = require("@components/Search/SearchContext");
var ReportListItemHeader_1 = require("@components/SelectionList/Search/ReportListItemHeader");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@components/AvatarWithDisplayName.tsx');
// Mock search context
var mockSearchContext = {
    currentSearchHash: 12345,
    selectedReports: {},
    selectedTransactionIDs: [],
    selectedTransactions: {},
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    setSelectedReports: jest.fn(),
    clearSelectedTransactions: jest.fn(),
    setLastSearchType: jest.fn(),
    setCurrentSearchHash: jest.fn(),
    setSelectedTransactions: jest.fn(),
    setShouldShowFiltersBarLoading: jest.fn(),
    setShouldShowExportModeOption: jest.fn(),
    setExportMode: jest.fn(),
};
var mockPersonalDetails = {
    john: {
        accountID: 1,
        displayName: 'John Doe',
        login: 'john.doe@example.com',
        avatar: 'https://example.com/avatar1.jpg',
    },
    jane: {
        accountID: 2,
        displayName: 'Jane Smith',
        login: 'jane.smith@example.com',
        avatar: 'https://example.com/avatar2.jpg',
    },
    fake: {
        accountID: 0,
        displayName: '',
        login: '',
        avatar: '',
    },
};
var mockPolicy = (0, policies_1.default)(1);
var createReportListItem = function (type, from, to, options) {
    if (options === void 0) { options = {}; }
    return (__assign({ shouldAnimateInHighlight: false, action: 'view', chatReportID: '123', created: '2024-01-01', currency: 'USD', isOneTransactionReport: false, isPolicyExpenseChat: false, isWaitingOnBankAccount: false, nonReimbursableTotal: 0, policyID: mockPolicy.id, private_isArchived: '', reportID: '789', reportName: 'Test Report', stateNum: 1, statusNum: 1, total: 100, type: type, unheldTotal: 100, keyForList: '789', 
        // @ts-expect-error - Intentionally allowing undefined for testing edge cases
        from: from ? mockPersonalDetails[from] : undefined, 
        // @ts-expect-error - Intentionally allowing undefined for testing edge cases
        to: to ? mockPersonalDetails[to] : undefined, transactions: [] }, options));
};
// Helper function to wrap component with context
var renderReportListItemHeader = function (reportItem) {
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider]}>
            {/* @ts-expect-error - Disable TypeScript errors to simplify the test */}
            <SearchContext_1.Context.Provider value={mockSearchContext}>
                <ReportListItemHeader_1.default report={reportItem} policy={mockPolicy} onSelectRow={jest.fn()} onCheckboxPress={jest.fn()} isDisabled={false} canSelectMultiple={false}/>
            </SearchContext_1.Context.Provider>
        </ComposeProviders_1.default>);
};
describe('ReportListItemHeader', function () {
    beforeAll(function () {
        return react_native_onyx_1.default.init({
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
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('UserInfoCellsWithArrow', function () {
        describe('when report type is IOU', function () {
            it('should display both submitter and recipient if both are present', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.IOU, 'john', 'jane');
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.getByText('John Doe')).toBeOnTheScreen();
                            expect(react_native_1.screen.getByText('Jane Smith')).toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should not display submitter and recipient if only submitter is present', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.IOU, 'john', undefined);
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.queryByText('John Doe')).not.toBeOnTheScreen();
                            expect(react_native_1.screen.queryByTestId('ArrowRightLong Icon')).not.toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should display submitter and receiver, even if submitter and recipient are the same', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.IOU, 'john', 'john');
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.getAllByText('John Doe')).toHaveLength(2);
                            expect(react_native_1.screen.getByTestId('ArrowRightLong Icon')).toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should not render anything if neither submitter nor recipient is present', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.IOU, undefined, undefined);
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.queryByTestId('ArrowRightLong Icon')).not.toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should only display submitter if recipient is invalid', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.IOU, 'john', 'fake');
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.getByText('John Doe')).toBeOnTheScreen();
                            expect(react_native_1.screen.queryByTestId('ArrowRightLong Icon')).not.toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('when report type is EXPENSE', function () {
            it('should display both submitter and recipient if they are different', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.EXPENSE, 'john', 'jane');
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.getByText('John Doe')).toBeOnTheScreen();
                            expect(react_native_1.screen.getByText('Jane Smith')).toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should display submitter if only submitter is present', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.EXPENSE, 'john', undefined);
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.getByText('John Doe')).toBeOnTheScreen();
                            expect(react_native_1.screen.queryByTestId('ArrowRightLong Icon')).not.toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should display submitter and receiver, even if submitter and recipient are the same', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.EXPENSE, 'john', 'john');
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.getAllByText('John Doe')).toHaveLength(2);
                            expect(react_native_1.screen.getByTestId('ArrowRightLong Icon')).toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should not render anything if no participants are present', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.EXPENSE, undefined, undefined);
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.queryByTestId('ArrowRightLong Icon')).not.toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should only display submitter if recipient is invalid', function () { return __awaiter(void 0, void 0, void 0, function () {
                var reportItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reportItem = createReportListItem(CONST_1.default.REPORT.TYPE.EXPENSE, 'john', 'fake');
                            renderReportListItemHeader(reportItem);
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            expect(react_native_1.screen.getByText('John Doe')).toBeOnTheScreen();
                            expect(react_native_1.screen.queryByTestId('ArrowRightLong Icon')).not.toBeOnTheScreen();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});

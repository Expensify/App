"use strict";
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
var react_native_1 = require("@testing-library/react-native");
var useNewTransactions_1 = require("@hooks/useNewTransactions");
// We need to mock requestAnimationFrame to mimic long Onyx merge overhead
jest.spyOn(global, 'requestAnimationFrame').mockImplementation(function (callback) {
    setTimeout(function () {
        callback(performance.now());
    }, 30);
    return 0;
});
var delay = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};
describe('useNewTransactions with empty cache', function () {
    var transactionsAlreadyInReport = [
        { transactionID: '2', amount: 200, created: '2023-10-02', currency: 'USD', reportID: 'report1', merchant: '' },
        { transactionID: '3', amount: 300, created: '2023-10-03', currency: 'USD', reportID: 'report1', merchant: '' },
    ];
    var newTransaction = { transactionID: '1', amount: 100, created: '2023-10-01T00:00:00Z', currency: 'USD', reportID: 'report1', merchant: '' };
    it("doesn't return new transactions when no transactions are added", function () {
        // 1. Report and transactions data is not loaded yet
        var _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
            initialProps: {
                hasOnceLoadedReportActions: false,
                transactions: [],
            },
        }), rerender = _a.rerender, result = _a.result;
        // 2. Report is loaded and it has no transactions so there are no further rerenders
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);
    });
    it('returns no new transactions when transactions come from initial Report load', function () {
        // 1. Report and transactions data is not loaded yet
        var _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
            initialProps: {
                hasOnceLoadedReportActions: false,
                transactions: [],
            },
        }), rerender = _a.rerender, result = _a.result;
        expect(result.current).toEqual([]);
        // 2. Report is loaded and transactions data is not loaded yet
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);
        // 3. Report is loaded and transactions data is loaded
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        // there is no new transactions, because the transactions that were already in the report are not considered new
        expect(result.current).toEqual([]);
    });
    it('returns new transactions when transactions are added after initial load', function () {
        // 1. Report and transactions data is not loaded yet
        var _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
            initialProps: {
                hasOnceLoadedReportActions: false,
                transactions: [],
            },
        }), rerender = _a.rerender, result = _a.result;
        expect(result.current).toEqual([]);
        // 2. Report is loaded and transactions data is not loaded yet
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);
        // 3. Report is loaded and transactions data is loaded
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        expect(result.current).toEqual([]);
        // 4. User added new transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: __spreadArray(__spreadArray([], transactionsAlreadyInReport, true), [newTransaction], false),
        });
        expect(result.current).toEqual([newTransaction]);
    });
    it('returns new transactions when adding transactions to empty report', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, rerender, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
                        initialProps: {
                            hasOnceLoadedReportActions: false,
                            transactions: [],
                        },
                    }), rerender = _a.rerender, result = _a.result;
                    // 2. Report is loaded and it has no transactions so there are no further rerenders
                    rerender({
                        hasOnceLoadedReportActions: true,
                        transactions: [],
                    });
                    return [4 /*yield*/, delay(1000)];
                case 1:
                    _b.sent(); // We need to wait to ensure that the skipFirstTransactionsChange is set to false by the useEffect
                    expect(result.current).toEqual([]);
                    // 3. User added new transaction
                    rerender({
                        hasOnceLoadedReportActions: true,
                        transactions: [newTransaction],
                    });
                    expect(result.current).toEqual([newTransaction]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('returns no new transactions when transactions are removed', function () {
        // 1. Report and transactions data is not loaded yet
        var _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
            initialProps: {
                hasOnceLoadedReportActions: false,
                transactions: [],
            },
        }), rerender = _a.rerender, result = _a.result;
        expect(result.current).toEqual([]);
        // 2. Report is loaded and transactions data is not loaded yet
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);
        // 3. Report is loaded and transactions data is loaded
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        expect(result.current).toEqual([]);
        // 4. User removes a transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport.slice(1),
        });
        expect(result.current).toEqual([]);
    });
});
describe('useNewTransactions with transactions in cache', function () {
    var transactionsAlreadyInReport = [
        { transactionID: '2', amount: 200, created: '2023-10-02', currency: 'USD', reportID: 'report1', merchant: '' },
        { transactionID: '3', amount: 300, created: '2023-10-03', currency: 'USD', reportID: 'report1', merchant: '' },
    ];
    var newTransaction = { transactionID: '1', amount: 100, created: '2023-10-01T00:00:00Z', currency: 'USD', reportID: 'report1', merchant: '' };
    it("doesn't return new transactions when no transactions are added", function () {
        // 1. Report and transactions data is loaded from Onyx
        var _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: [],
            },
        }), rerender = _a.rerender, result = _a.result;
        // 2. Report is loaded and transactions data is loaded, but there were no new transactions
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);
    });
    it('returns new transactions when newly added transactions come from initial Report load', function () {
        // 1. Report and transactions data is loaded from Onyx
        var _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: transactionsAlreadyInReport,
            },
        }), rerender = _a.rerender, result = _a.result;
        expect(result.current).toEqual([]);
        // 2. New transaction comes in when report is loaded
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: __spreadArray(__spreadArray([], transactionsAlreadyInReport, true), [newTransaction], false),
        });
        expect(result.current).toEqual([newTransaction]);
    });
    it('returns new transactions when transactions are added after initial load', function () {
        // 1. Report and transactions data is loaded from Onyx
        var _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: transactionsAlreadyInReport,
            },
        }), rerender = _a.rerender, result = _a.result;
        expect(result.current).toEqual([]);
        // 2. Report is loaded and transactions data is loaded, but there were no new transactions
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        expect(result.current).toEqual([]);
        // 3. User added new transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: __spreadArray(__spreadArray([], transactionsAlreadyInReport, true), [newTransaction], false),
        });
        expect(result.current).toEqual([newTransaction]);
    });
    it('returns new transactions when adding transactions to empty report', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, rerender, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
                        initialProps: {
                            hasOnceLoadedReportActions: true,
                            transactions: [],
                        },
                    }), rerender = _a.rerender, result = _a.result;
                    // 2. Report is loaded and it has no transactions, so there are no further rerenders
                    rerender({
                        hasOnceLoadedReportActions: true,
                        transactions: [],
                    });
                    return [4 /*yield*/, delay(1000)];
                case 1:
                    _b.sent();
                    expect(result.current).toEqual([]);
                    // 3. User added new transaction
                    rerender({
                        hasOnceLoadedReportActions: true,
                        transactions: [newTransaction],
                    });
                    expect(result.current).toEqual([newTransaction]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('returns no new transactions when transactions are removed', function () {
        // 1. Report and transactions data is loaded from Onyx
        var _a = (0, react_native_1.renderHook)(function (props) { return (0, useNewTransactions_1.default)(props.hasOnceLoadedReportActions, props.transactions); }, {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: transactionsAlreadyInReport,
            },
        }), rerender = _a.rerender, result = _a.result;
        expect(result.current).toEqual([]);
        // 2. Report is loaded and transactions data is loaded, but there were no new transactions
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        expect(result.current).toEqual([]);
        // 3. User removes a transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport.slice(1),
        });
        expect(result.current).toEqual([]);
    });
});
afterAll(function () {
    jest.restoreAllMocks();
});

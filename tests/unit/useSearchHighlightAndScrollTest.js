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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var react_native_1 = require("@testing-library/react-native");
var useSearchHighlightAndScroll_1 = require("@hooks/useSearchHighlightAndScroll");
var Search_1 = require("@libs/actions/Search");
jest.mock('@libs/actions/Search');
jest.mock('@react-navigation/native', function () { return ({
    useIsFocused: jest.fn(function () { return true; }),
    createNavigationContainerRef: function () { return ({}); },
}); });
jest.mock('@rnmapbox/maps', function () { return ({
    __esModule: true,
    default: {},
    MarkerView: {},
    setAccessToken: jest.fn(),
}); });
jest.mock('@react-native-community/geolocation', function () { return ({
    setRNConfiguration: jest.fn(),
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
}); });
var mockUseIsFocused = jest.fn().mockReturnValue(true);
afterEach(function () {
    jest.clearAllMocks();
});
describe('useSearchHighlightAndScroll', function () {
    var baseProps = {
        searchResults: {
            data: {
                personalDetailsList: {},
            },
            search: {
                columnsToShow: { shouldShowCategoryColumn: true, shouldShowTagColumn: true, shouldShowTaxColumn: true },
                hasMoreResults: false,
                hasResults: true,
                offset: 0,
                status: 'all',
                type: 'expense',
                isLoading: false,
            },
        },
        transactions: {},
        previousTransactions: {},
        reportActions: {},
        previousReportActions: {},
        queryJSON: {
            type: 'expense',
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
            filters: { operator: 'and', left: 'tag', right: '' },
            inputQuery: 'type:expense status:all',
            flatFilters: [],
            hash: 123,
            recentSearchHash: 456,
        },
        offset: 0,
    };
    it('should not trigger search when collections are empty', function () {
        (0, react_native_1.renderHook)(function () { return (0, useSearchHighlightAndScroll_1.default)(baseProps); });
        expect(Search_1.search).not.toHaveBeenCalled();
    });
    it('should trigger search when new transaction added and focused', function () {
        var initialProps = __assign(__assign({}, baseProps), { transactions: { '1': { transactionID: '1' } }, previousTransactions: { '1': { transactionID: '1' } } });
        var rerender = (0, react_native_1.renderHook)(function (props) { return (0, useSearchHighlightAndScroll_1.default)(props); }, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: initialProps,
        }).rerender;
        var updatedProps = __assign(__assign({}, baseProps), { transactions: {
                '1': { transactionID: '1' },
                '2': { transactionID: '2' },
            }, previousTransactions: { '1': { transactionID: '1' } } });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(Search_1.search).toHaveBeenCalledWith({ queryJSON: baseProps.queryJSON, offset: 0 });
    });
    it('should not trigger search when not focused', function () {
        mockUseIsFocused.mockReturnValue(false);
        var rerender = (0, react_native_1.renderHook)(function (props) { return (0, useSearchHighlightAndScroll_1.default)(props); }, {
            initialProps: baseProps,
        }).rerender;
        var updatedProps = __assign(__assign({}, baseProps), { transactions: { '1': { transactionID: '1' } } });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(Search_1.search).not.toHaveBeenCalled();
    });
    it('should trigger search for chat when report actions added and focused', function () {
        mockUseIsFocused.mockReturnValue(true);
        var chatProps = __assign(__assign({}, baseProps), { queryJSON: __assign(__assign({}, baseProps.queryJSON), { type: 'chat' }), reportActions: {
                reportActions_1: {
                    '1': { actionName: 'EXISTING', reportActionID: '1' },
                },
            }, previousReportActions: {
                reportActions_1: {
                    '1': { actionName: 'EXISTING', reportActionID: '1' },
                },
            } });
        var rerender = (0, react_native_1.renderHook)(function (props) { return (0, useSearchHighlightAndScroll_1.default)(props); }, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: chatProps,
        }).rerender;
        var updatedProps = __assign(__assign({}, chatProps), { reportActions: {
                reportActions_1: {
                    '1': { actionName: 'EXISTING', reportActionID: '1' },
                    '2': { actionName: 'ADDCOMMENT', reportActionID: '2' },
                },
            } });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(Search_1.search).toHaveBeenCalledWith({ queryJSON: chatProps.queryJSON, offset: 0 });
    });
    it('should not trigger search when new transaction removed and focused', function () {
        var initialProps = __assign(__assign({}, baseProps), { transactions: {
                '1': { transactionID: '1' },
                '2': { transactionID: '2' },
            }, previousTransactions: {
                '1': { transactionID: '1' },
                '2': { transactionID: '2' },
            } });
        var rerender = (0, react_native_1.renderHook)(function (props) { return (0, useSearchHighlightAndScroll_1.default)(props); }, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: initialProps,
        }).rerender;
        var updatedProps = __assign(__assign({}, baseProps), { transactions: {
                '1': { transactionID: '1' },
            } });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(Search_1.search).not.toHaveBeenCalled();
    });
    it('should not trigger search for chat when report actions removed and focused', function () {
        mockUseIsFocused.mockReturnValue(true);
        var chatProps = __assign(__assign({}, baseProps), { queryJSON: __assign(__assign({}, baseProps.queryJSON), { type: 'chat' }), reportActions: {
                reportActions_1: {
                    '1': { actionName: 'EXISTING', reportActionID: '1' },
                    '2': { actionName: 'ADDCOMMENT', reportActionID: '2' },
                },
            }, previousReportActions: {
                reportActions_1: {
                    '1': { actionName: 'EXISTING', reportActionID: '1' },
                    '2': { actionName: 'ADDCOMMENT', reportActionID: '2' },
                },
            } });
        var rerender = (0, react_native_1.renderHook)(function (props) { return (0, useSearchHighlightAndScroll_1.default)(props); }, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: chatProps,
        }).rerender;
        var updatedProps = __assign(__assign({}, chatProps), { reportActions: {
                reportActions_1: {
                    '1': { actionName: 'EXISTING', reportActionID: '1' },
                },
            } });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(Search_1.search).not.toHaveBeenCalled();
    });
});

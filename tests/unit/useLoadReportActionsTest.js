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
var react_native_1 = require("@testing-library/react-native");
var useLoadReportActions_1 = require("@hooks/useLoadReportActions");
jest.mock('@hooks/useNetwork', function () { return jest.fn(function () { return ({ isOffline: false }); }); });
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useNavigationState: function () { return true; }, useRoute: jest.fn(), useFocusEffect: jest.fn(), useIsFocused: function () { return true; }, useNavigation: function () { return ({
            navigate: jest.fn(),
            addListener: jest.fn(),
        }); }, createNavigationContainerRef: jest.fn() });
});
describe('useLoadReportActions', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    // Base test data from your example
    var baseProps = {
        reportID: '6549335221793525',
        reportActions: [
        /* your 4 reportActions array here */
        ],
        allReportActionIDs: ['8759152536123291182', '2034215190990675144', '186758379215594799'],
        transactionThreadReport: undefined,
        hasOlderActions: true,
        hasNewerActions: false,
    };
    describe('Base cases', function () {
        test('correctly identifies current report actions', function () {
            jest.doMock('@userActions/Report', function () { return ({
                getNewerActions: function (_, reportActionID) {
                    expect(reportActionID).toBe('186758379215594799');
                },
                getOlderActions: function (_, reportActionID) {
                    expect(reportActionID).toBe('8759152536123291182');
                },
            }); });
            var result = (0, react_native_1.renderHook)(function () { return (0, useLoadReportActions_1.default)(baseProps); }).result;
            result.current.loadOlderChats();
            result.current.loadNewerChats();
        });
        test('handles transaction thread report actions', function () {
            jest.doMock('@userActions/Report', function () { return ({
                getNewerActions: function (_, reportActionID) {
                    expect(reportActionID).toBe('186758379215594799');
                },
                getOlderActions: function (_, reportActionID) {
                    expect(reportActionID).toBe('2034215190990675144');
                },
            }); });
            var propsWithTransaction = __assign(__assign({}, baseProps), { transactionThreadReport: { reportID: '186758379215594798' }, allReportActionIDs: ['8759152536123291182'] });
            var result = (0, react_native_1.renderHook)(function () { return (0, useLoadReportActions_1.default)(propsWithTransaction); }).result;
            result.current.loadOlderChats();
            result.current.loadNewerChats();
        });
    });
    describe('loadOlderChats behavior', function () {
        test('loads older actions for current report', function () {
            jest.doMock('@userActions/Report', function () { return ({
                getNewerActions: jest.fn(),
                getOlderActions: function (reportID, reportActionID) {
                    expect(reportID).toBe('6549335221793525');
                    expect(reportActionID).toBe('186758379215594799');
                },
            }); });
            var result = (0, react_native_1.renderHook)(function () { return (0, useLoadReportActions_1.default)(baseProps); }).result;
            result.current.loadOlderChats();
        });
        test('loads actions for both reports when transaction thread exists', function () {
            jest.doMock('@userActions/Report', function () { return ({
                getNewerActions: jest.fn(),
                getOlderActions: function (reportID, reportActionID) {
                    if (reportID !== 'TRANSACTION_THREAD_REPORT') {
                        expect(reportID).toBe('8759152536123291182');
                        expect(reportActionID).toBe('6549335221793525');
                    }
                    else {
                        expect(reportID).toBe('TRANSACTION_THREAD_REPORT');
                        expect(reportActionID).toBe('186758379215594799');
                    }
                },
            }); });
            var props = __assign(__assign({}, baseProps), { transactionThreadReport: { reportID: 'TRANSACTION_THREAD_REPORT' } });
            var result = (0, react_native_1.renderHook)(function () { return (0, useLoadReportActions_1.default)(props); }).result;
            result.current.loadOlderChats();
        });
    });
    describe('loadNewerChats behavior', function () {
        test('loads newer actions when conditions met', function () {
            jest.doMock('@userActions/Report', function () { return ({
                getNewerActions: function (reportID, reportActionID) {
                    expect(reportID).toBe('6549335221793525');
                    expect(reportActionID).toBe('8759152536123291182');
                },
                getOlderActions: jest.fn(),
            }); });
            var props = __assign(__assign({}, baseProps), { hasNewerActions: true, reportActionID: 'EXISTING_ACTION_ID' });
            var result = (0, react_native_1.renderHook)(function () { return (0, useLoadReportActions_1.default)(props); }).result;
            result.current.loadNewerChats();
        });
        test('handles transaction thread newer actions', function () {
            jest.doMock('@userActions/Report', function () { return ({
                getNewerActions: function (reportID, reportActionID) {
                    if (reportID !== 'TRANSACTION_THREAD_REPORT') {
                        expect(reportID).toBe('6549335221793525');
                        expect(reportActionID).toBe('8759152536123291182');
                    }
                    else {
                        expect(reportID).toBe('TRANSACTION_THREAD_REPORT');
                        expect(reportActionID).toBe('2034215190990675144');
                    }
                },
                getOlderActions: jest.fn(),
            }); });
            var props = __assign(__assign({}, baseProps), { transactionThreadReport: { reportID: 'TRANSACTION_THREAD_REPORT' }, hasNewerActions: true });
            var result = (0, react_native_1.renderHook)(function () { return (0, useLoadReportActions_1.default)(props); }).result;
            result.current.loadNewerChats();
        });
    });
    describe('Edge cases', function () {
        test('handles empty reportActions', function () {
            var mockGetOlderActions = jest.fn();
            var mockGetNewerActions = jest.fn();
            jest.doMock('@userActions/Report', function () { return ({
                getNewerActions: mockGetNewerActions,
                getOlderActions: mockGetOlderActions,
            }); });
            var props = __assign(__assign({}, baseProps), { reportActions: [] });
            var result = (0, react_native_1.renderHook)(function () { return (0, useLoadReportActions_1.default)(props); }).result;
            result.current.loadOlderChats();
            result.current.loadNewerChats();
            expect(mockGetOlderActions).not.toHaveBeenCalled();
            expect(mockGetNewerActions).not.toHaveBeenCalled();
        });
    });
});

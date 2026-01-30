/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import useReportCounts from '@hooks/useReportCounts';
import * as ReportPrimaryActionUtils from '@libs/ReportPrimaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

jest.mock('@libs/ReportPrimaryActionUtils', () => ({
    isSubmitAction: jest.fn(),
    isApproveAction: jest.fn(),
    isPrimaryPayAction: jest.fn(),
    isExportAction: jest.fn(),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () =>
    jest.fn(() => ({
        login: 'test@example.com',
        accountID: 1,
    })),
);

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string) => {
    const value = onyxData[key];
    return [value];
});

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

// Mock the direct useOnyx import from react-native-onyx
jest.mock('react-native-onyx', () => ({
    useOnyx: (key: string) => mockUseOnyx(key),
}));

describe('useReportCounts', () => {
    beforeEach(() => {
        onyxData[ONYXKEYS.COLLECTION.REPORT] = {};
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {};
        onyxData[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS] = {};
        onyxData[ONYXKEYS.COLLECTION.TRANSACTION] = {};
        onyxData[ONYXKEYS.COLLECTION.REPORT_ACTIONS] = {};
        onyxData[ONYXKEYS.BANK_ACCOUNT_LIST] = {};

        jest.clearAllMocks();
    });

    it('returns zero counts when there are no reports', () => {
        const {result} = renderHook(() => useReportCounts());

        expect(result.current).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 0,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 0,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 0,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 0,
        });
    });

    it('counts reports to submit correctly', () => {
        const expenseReport: Report = {
            reportID: '1',
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: 'policy1',
        };

        onyxData[ONYXKEYS.COLLECTION.REPORT] = {
            report_1: expenseReport,
        };

        (ReportPrimaryActionUtils.isSubmitAction as jest.Mock).mockReturnValue(true);
        (ReportPrimaryActionUtils.isApproveAction as jest.Mock).mockReturnValue(false);
        (ReportPrimaryActionUtils.isPrimaryPayAction as jest.Mock).mockReturnValue(false);
        (ReportPrimaryActionUtils.isExportAction as jest.Mock).mockReturnValue(false);

        const {result} = renderHook(() => useReportCounts());

        expect(result.current[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(1);
        expect(result.current[CONST.SEARCH.SEARCH_KEYS.APPROVE]).toBe(0);
        expect(result.current[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(0);
        expect(result.current[CONST.SEARCH.SEARCH_KEYS.EXPORT]).toBe(0);
    });

    it('counts reports for multiple categories', () => {
        const expenseReport1: Report = {
            reportID: '1',
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: 'policy1',
        };

        const expenseReport2: Report = {
            reportID: '2',
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: 'policy1',
        };

        onyxData[ONYXKEYS.COLLECTION.REPORT] = {
            report_1: expenseReport1,
            report_2: expenseReport2,
        };

        (ReportPrimaryActionUtils.isSubmitAction as jest.Mock).mockImplementation((report: Report) => report.reportID === '1');
        (ReportPrimaryActionUtils.isApproveAction as jest.Mock).mockImplementation((report: Report) => report.reportID === '1');
        (ReportPrimaryActionUtils.isPrimaryPayAction as jest.Mock).mockImplementation((report: Report) => report.reportID === '2');
        (ReportPrimaryActionUtils.isExportAction as jest.Mock).mockImplementation((report: Report) => report.reportID === '2');

        const {result} = renderHook(() => useReportCounts());

        expect(result.current[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(1);
        expect(result.current[CONST.SEARCH.SEARCH_KEYS.APPROVE]).toBe(1);
        expect(result.current[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(1);
        expect(result.current[CONST.SEARCH.SEARCH_KEYS.EXPORT]).toBe(1);
    });

    it('ignores non-expense reports', () => {
        const chatReport: Report = {
            reportID: '1',
            type: CONST.REPORT.TYPE.CHAT,
            policyID: 'policy1',
        };

        onyxData[ONYXKEYS.COLLECTION.REPORT] = {
            report_1: chatReport,
        };

        (ReportPrimaryActionUtils.isSubmitAction as jest.Mock).mockReturnValue(true);

        const {result} = renderHook(() => useReportCounts());

        expect(result.current).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 0,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 0,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 0,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 0,
        });
    });
});

import {renderHook} from '@testing-library/react-native';

import useMoneyReportHeaderMoreContentVisibility from '@hooks/useMoneyReportHeaderMoreContentVisibility';
import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useOnyx from '@hooks/useOnyx';

import {isInvoiceReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import type {UseOnyxResult} from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';

const TEST_REPORT_ID = '1001';
const TEST_POLICY_ID = 'policy1';

const report = {
    reportID: TEST_REPORT_ID,
    policyID: TEST_POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
} as Report;

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

// Spread the real module: the live PolicyUtils import chain relies on many other ReportUtils exports.
jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualReportUtils = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualReportUtils,
        __esModule: true,
        isInvoiceReport: jest.fn(() => false),
    };
});

jest.mock('@hooks/useMoneyReportHeaderStatusBar', () => ({__esModule: true, default: jest.fn(() => ({shouldShowStatusBar: false, statusBarType: undefined}))}));
jest.mock('@hooks/useOnyx', () => jest.fn());

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedStatusBar = jest.mocked(useMoneyReportHeaderStatusBar);
const mockedIsInvoiceReport = jest.mocked(isInvoiceReport);

let policyValue: Policy | undefined;

function mockPolicyType(type: Policy['type']) {
    policyValue = {...createRandomPolicy(1, type), id: TEST_POLICY_ID};
}

/**
 * `hasStatusOrNextStep` is what the header uses to decide where the report actions go: at the end of the
 * more-content row when that row has its own content, or in the header row when it would otherwise be blank.
 */
describe('useMoneyReportHeaderMoreContentVisibility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        policyValue = undefined;
        mockedIsInvoiceReport.mockReturnValue(false);
        mockedStatusBar.mockReturnValue({shouldShowStatusBar: false, statusBarType: undefined});
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_REPORT_ID}`) {
                return createOnyxResult<Report>(report);
            }
            if (key === `${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`) {
                return createOnyxResult<Policy>(policyValue);
            }
            return createOnyxResult(undefined);
        });
    });

    it('shows the next step for a Submit workspace', () => {
        mockPolicyType(CONST.POLICY.TYPE.SUBMIT);
        const {result} = renderHook(() => useMoneyReportHeaderMoreContentVisibility(TEST_REPORT_ID));
        expect(result.current.shouldShowNextStep).toBe(true);
        expect(result.current.hasStatusOrNextStep).toBe(true);
    });

    it('shows the next step for a paid (team) workspace', () => {
        mockPolicyType(CONST.POLICY.TYPE.TEAM);
        const {result} = renderHook(() => useMoneyReportHeaderMoreContentVisibility(TEST_REPORT_ID));
        expect(result.current.shouldShowNextStep).toBe(true);
        expect(result.current.hasStatusOrNextStep).toBe(true);
    });

    it('does not show the next step for a personal workspace', () => {
        mockPolicyType(CONST.POLICY.TYPE.PERSONAL);
        const {result} = renderHook(() => useMoneyReportHeaderMoreContentVisibility(TEST_REPORT_ID));
        expect(result.current.shouldShowNextStep).toBe(false);
    });

    it('does not show the next step when a status bar is shown', () => {
        mockPolicyType(CONST.POLICY.TYPE.SUBMIT);
        mockedStatusBar.mockReturnValue({shouldShowStatusBar: true, statusBarType: CONST.REPORT.STATUS_BAR_TYPE.ON_HOLD});
        const {result} = renderHook(() => useMoneyReportHeaderMoreContentVisibility(TEST_REPORT_ID));
        expect(result.current.shouldShowNextStep).toBe(false);
        // A status bar still fills the more-content row, so the actions stay in it.
        expect(result.current.hasStatusOrNextStep).toBe(true);
    });

    it('reports an empty more-content row for a personal workspace with no status bar', () => {
        mockPolicyType(CONST.POLICY.TYPE.PERSONAL);
        const {result} = renderHook(() => useMoneyReportHeaderMoreContentVisibility(TEST_REPORT_ID));
        // This is the 1:1 DM IOU case: nothing to show, so the actions move up into the header row
        // instead of sitting alone on a blank line under the title.
        expect(result.current.hasStatusOrNextStep).toBe(false);
    });

    it('reports an empty more-content row for an invoice report, even on a paid workspace', () => {
        mockPolicyType(CONST.POLICY.TYPE.TEAM);
        mockedIsInvoiceReport.mockReturnValue(true);
        const {result} = renderHook(() => useMoneyReportHeaderMoreContentVisibility(TEST_REPORT_ID));
        expect(result.current.shouldShowNextStep).toBe(false);
        expect(result.current.hasStatusOrNextStep).toBe(false);
    });
});

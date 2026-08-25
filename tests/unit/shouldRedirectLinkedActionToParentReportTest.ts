import {isOneTransactionThread, isReportTransactionThread} from '@libs/ReportUtils';
// eslint-disable-next-line no-restricted-imports -- type-only namespace (erased at runtime) used solely for the requireActual generic; no restricted functions are actually imported
import type * as ReportUtilsModule from '@libs/ReportUtils';

import shouldRedirectLinkedActionToParentReport from '@pages/inbox/shouldRedirectLinkedActionToParentReport';

import type {Report, ReportAction} from '@src/types/onyx';

// Covers the open-time redirect decision for issue #86919. A copied link points at the report that owns the action (the
// transaction thread for a one-transaction expense). We redirect to the parent expense report ONLY while the thread is
// still the parent's only transaction, so the combined view with the parent's "Submitted" message opens. Once a second
// expense is added the redirect must stop firing, so the previously copied link still resolves on the thread itself.

jest.mock('@libs/ReportUtils', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ReportUtilsModule>('@libs/ReportUtils'),
    isReportTransactionThread: jest.fn(),
    isOneTransactionThread: jest.fn(),
}));

const mockIsReportTransactionThread = jest.mocked(isReportTransactionThread);
const mockIsOneTransactionThread = jest.mocked(isOneTransactionThread);

const THREAD_REPORT_ID = 'transaction-thread-1';
const PARENT_REPORT_ID = 'parent-expense-1';
const LINKED_ACTION_ID = 'action-1';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the ids the helper reads matter here
const threadReport = {reportID: THREAD_REPORT_ID, parentReportID: PARENT_REPORT_ID} as Report;
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the id the helper passes through matters here
const parentReport = {reportID: PARENT_REPORT_ID} as Report;
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only passed through to isOneTransactionThread, which is mocked
const parentReportAction = {reportActionID: 'iou-action-1'} as ReportAction;

const baseParams = {
    report: threadReport,
    parentReport,
    parentReportAction,
    reportActionIDFromRoute: LINKED_ACTION_ID,
    isOffline: false,
};

describe('shouldRedirectLinkedActionToParentReport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReportTransactionThread.mockReturnValue(true);
        mockIsOneTransactionThread.mockReturnValue(true);
    });

    it("redirects while the thread is still the parent report's only transaction", () => {
        expect(shouldRedirectLinkedActionToParentReport(baseParams)).toBe(true);
        expect(mockIsOneTransactionThread).toHaveBeenCalledWith(threadReport, parentReport, parentReportAction, false);
    });

    it('does NOT redirect once the parent report has more than one transaction, so the copied link still resolves on the thread', () => {
        mockIsOneTransactionThread.mockReturnValue(false);

        expect(shouldRedirectLinkedActionToParentReport(baseParams)).toBe(false);
    });

    it('does NOT redirect when the route has no linked action (a plain thread visit)', () => {
        expect(shouldRedirectLinkedActionToParentReport({...baseParams, reportActionIDFromRoute: undefined})).toBe(false);
        // Short-circuits before the more expensive one-transaction check.
        expect(mockIsOneTransactionThread).not.toHaveBeenCalled();
    });

    it('does NOT redirect when the report is not a transaction thread (e.g. a regular chat deep link)', () => {
        mockIsReportTransactionThread.mockReturnValue(false);

        expect(shouldRedirectLinkedActionToParentReport(baseParams)).toBe(false);
        expect(mockIsOneTransactionThread).not.toHaveBeenCalled();
    });

    it('does NOT redirect when the report has no parent to redirect to', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- deliberately missing parentReportID
        const orphanReport = {reportID: THREAD_REPORT_ID} as Report;

        expect(shouldRedirectLinkedActionToParentReport({...baseParams, report: orphanReport})).toBe(false);
        expect(mockIsOneTransactionThread).not.toHaveBeenCalled();
    });

    it('does NOT redirect when the report is undefined', () => {
        expect(shouldRedirectLinkedActionToParentReport({...baseParams, report: undefined})).toBe(false);
    });

    it('forwards the offline flag to the one-transaction check', () => {
        shouldRedirectLinkedActionToParentReport({...baseParams, isOffline: true});

        expect(mockIsOneTransactionThread).toHaveBeenCalledWith(threadReport, parentReport, parentReportAction, true);
    });
});

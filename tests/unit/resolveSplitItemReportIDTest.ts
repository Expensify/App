import {resolveSplitItemReportID} from '@libs/actions/IOU/SplitExpenseItems';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

const SELF_DM_CONTEXT_REPORT_ID = 'selfDM-1';
const SELF_DM_FALLBACK_REPORT_ID = 'selfDM-fallback';
const WORKSPACE_REPORT_ID = 'workspace-1';
const OTHER_SELF_DM_REPORT_ID = 'selfDM-2';

const reportKey = (id: string) => `${ONYXKEYS.COLLECTION.REPORT}${id}` as const;

const buildAllReports = (reports: Report[]): OnyxCollection<Report> =>
    reports.reduce<Record<string, Report>>((acc, report) => {
        acc[reportKey(report.reportID)] = report;
        return acc;
    }, {});

const makeReport = (reportID: string, chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>): Report => ({reportID, chatType}) as unknown as Report;

const makeTransaction = (reportID: string | undefined): Transaction => ({reportID}) as unknown as Transaction;

describe('resolveSplitItemReportID', () => {
    describe('workspace (non-selfDM) context', () => {
        it('returns undefined for a child that already lives in a real report — initSplitExpenseItemData will fall back to transaction.reportID', () => {
            const childTransaction = makeTransaction(WORKSPACE_REPORT_ID);
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([makeReport(WORKSPACE_REPORT_ID)]),
                selfDMContextReportID: undefined,
                selfDMReportIDFallback: SELF_DM_FALLBACK_REPORT_ID,
            });
            expect(result).toBeUndefined();
        });

        it('returns the selfDM fallback when the child is UNREPORTED', () => {
            const childTransaction = makeTransaction(CONST.REPORT.UNREPORTED_REPORT_ID);
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([]),
                selfDMContextReportID: undefined,
                selfDMReportIDFallback: SELF_DM_FALLBACK_REPORT_ID,
            });
            expect(result).toBe(SELF_DM_FALLBACK_REPORT_ID);
        });

        it('returns undefined when the child is UNREPORTED but no selfDM fallback is available', () => {
            const childTransaction = makeTransaction(CONST.REPORT.UNREPORTED_REPORT_ID);
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([]),
                selfDMContextReportID: undefined,
                selfDMReportIDFallback: undefined,
            });
            expect(result).toBeUndefined();
        });
    });

    describe('selfDM context', () => {
        it('returns the selfDM context reportID when the child is UNREPORTED', () => {
            const childTransaction = makeTransaction(CONST.REPORT.UNREPORTED_REPORT_ID);
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([]),
                selfDMContextReportID: SELF_DM_CONTEXT_REPORT_ID,
                selfDMReportIDFallback: SELF_DM_FALLBACK_REPORT_ID,
            });
            expect(result).toBe(SELF_DM_CONTEXT_REPORT_ID);
        });

        it("returns the child's workspace reportID when the split was moved to a workspace report", () => {
            const childTransaction = makeTransaction(WORKSPACE_REPORT_ID);
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([makeReport(WORKSPACE_REPORT_ID)]),
                selfDMContextReportID: SELF_DM_CONTEXT_REPORT_ID,
                selfDMReportIDFallback: SELF_DM_FALLBACK_REPORT_ID,
            });
            expect(result).toBe(WORKSPACE_REPORT_ID);
        });

        it('collapses a child whose report is itself a selfDM back to the context reportID', () => {
            const childTransaction = makeTransaction(OTHER_SELF_DM_REPORT_ID);
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([makeReport(OTHER_SELF_DM_REPORT_ID, CONST.REPORT.CHAT_TYPE.SELF_DM)]),
                selfDMContextReportID: SELF_DM_CONTEXT_REPORT_ID,
                selfDMReportIDFallback: SELF_DM_FALLBACK_REPORT_ID,
            });
            expect(result).toBe(SELF_DM_CONTEXT_REPORT_ID);
        });

        it('falls back to the context reportID when the child references a report that is missing from allReports', () => {
            const childTransaction = makeTransaction('missing-report');
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([]),
                selfDMContextReportID: SELF_DM_CONTEXT_REPORT_ID,
                selfDMReportIDFallback: SELF_DM_FALLBACK_REPORT_ID,
            });
            expect(result).toBe(SELF_DM_CONTEXT_REPORT_ID);
        });

        it('returns the context reportID when the child has no reportID at all', () => {
            const childTransaction = makeTransaction(undefined);
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([]),
                selfDMContextReportID: SELF_DM_CONTEXT_REPORT_ID,
                selfDMReportIDFallback: SELF_DM_FALLBACK_REPORT_ID,
            });
            expect(result).toBe(SELF_DM_CONTEXT_REPORT_ID);
        });

        it('prefers the selfDM context reportID over the fallback when both are provided', () => {
            const childTransaction = makeTransaction(CONST.REPORT.UNREPORTED_REPORT_ID);
            const result = resolveSplitItemReportID({
                childTransaction,
                allReports: buildAllReports([]),
                selfDMContextReportID: SELF_DM_CONTEXT_REPORT_ID,
                selfDMReportIDFallback: SELF_DM_FALLBACK_REPORT_ID,
            });
            expect(result).toBe(SELF_DM_CONTEXT_REPORT_ID);
        });
    });
});

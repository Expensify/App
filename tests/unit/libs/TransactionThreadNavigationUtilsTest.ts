import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';
import {getOrCreateTransactionThreadReportID, getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return -- jest factory mocks use CommonJS require() which returns untyped modules */
import Onyx from 'react-native-onyx';

import {actionR14932} from '../../../__mocks__/reportData/actions';
import {transactionR14932} from '../../../__mocks__/reportData/transactions';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/Report', () => {
    const actual = jest.requireActual('@libs/actions/Report');
    return {
        ...actual,
        createTransactionThreadReport: jest.fn(() => ({reportID: 'created_thread'})),
        setOptimisticTransactionThread: jest.fn(),
    };
});

const mockCreateTransactionThreadReport = jest.mocked(createTransactionThreadReport);
const mockSetOptimisticTransactionThread = jest.mocked(setOptimisticTransactionThread);

const CONTEXT = {
    introSelected: undefined,
    betas: undefined,
    currentUserEmail: 'me@test.com',
    currentUserAccountID: 1,
    personalDetails: undefined,
    conciergeChat: undefined,
    isSelfTourViewed: undefined,
    hasCompletedGuidedSetupFlow: undefined,
};

function buildTransaction(transactionID: string, reportID: string): Transaction {
    return {transactionID, reportID, amount: 0, created: '', currency: 'USD', merchant: '', comment: {}};
}

function buildIOUAction(reportActionID: string, childReportID?: string): ReportAction {
    return {...actionR14932, reportActionID, childReportID};
}

describe('getReportIDToOpenForExpense', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockCreateTransactionThreadReport.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns the snapshot-resolved thread for an unreported (tracked) expense', () => {
        const expense: TransactionThreadNavigationDescriptor = {
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            transaction: buildTransaction('t1', CONST.REPORT.UNREPORTED_REPORT_ID),
            reportAction: buildIOUAction('a1', 'self_dm_thread'),
        };

        expect(getReportIDToOpenForExpense(expense, CONTEXT)).toBe('self_dm_thread');
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('returns the snapshot thread (childReportID) without touching the main collection when it is already known', () => {
        const expense: TransactionThreadNavigationDescriptor = {
            reportID: 'parent1',
            transaction: buildTransaction('t1', 'parent1'),
            reportAction: buildIOUAction('a1', 'snapshot_thread'),
        };

        expect(getReportIDToOpenForExpense(expense, CONTEXT)).toBe('snapshot_thread');
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('resolves the thread from the main reportActions collection when the snapshot has no thread', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}parent2`, {a1: buildIOUAction('a1', 'main_thread')});
        await waitForBatchedUpdates();

        const expense: TransactionThreadNavigationDescriptor = {reportID: 'parent2', transaction: buildTransaction(transactionR14932.transactionID, 'parent2')};

        expect(getReportIDToOpenForExpense(expense, CONTEXT)).toBe('main_thread');
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('creates the thread from the snapshot action/report when the expense is only in the Search snapshot, not the main Onyx collection', () => {
        const expense: TransactionThreadNavigationDescriptor = {
            reportID: 'parent3',
            transaction: buildTransaction('t3', 'parent3'),
            reportAction: buildIOUAction('a3'),
            report: {reportID: 'parent3'} as Report,
        };

        expect(getReportIDToOpenForExpense(expense, CONTEXT)).toBe('created_thread');
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledTimes(1);
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(
            expect.objectContaining({
                iouReport: expect.objectContaining({reportID: 'parent3'}),
                iouReportAction: expect.objectContaining({reportActionID: 'a3'}),
                transaction: expect.objectContaining({transactionID: 't3'}),
            }),
        );
    });

    it('falls back to the parent report when no IOU action exists anywhere', () => {
        const expense: TransactionThreadNavigationDescriptor = {reportID: 'parent4', transaction: buildTransaction('t4', 'parent4')};

        expect(getReportIDToOpenForExpense(expense, CONTEXT)).toBe('parent4');
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    /**
     * An unreported (tracked) expense keeps its IOU action in the self-DM, since report "0" is a placeholder rather
     * than a report. Resolving from there is the only way such an expense opens at all.
     */
    describe('unreported (tracked) expenses', () => {
        const buildUnreportedExpense = (transactionID: string, reportAction?: ReportAction): TransactionThreadNavigationDescriptor => ({
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            transaction: buildTransaction(transactionID, CONST.REPORT.UNREPORTED_REPORT_ID),
            reportAction,
        });

        beforeEach(async () => {
            await Onyx.set(ONYXKEYS.SELF_DM_REPORT_ID, 'selfDM');
            await waitForBatchedUpdates();
        });

        it("resolves the thread from the self-DM's report actions when the snapshot has no thread", async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}selfDM`, {a1: buildIOUAction('a1', 'self_dm_thread')});
            await waitForBatchedUpdates();

            expect(getReportIDToOpenForExpense(buildUnreportedExpense(transactionR14932.transactionID), CONTEXT)).toBe('self_dm_thread');
            expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
        });

        /**
         * Regression guard: this used to fall through to report "0", which is not a report that can be opened. The
         * prev/next carousel enabled the arrow from the transaction alone and then had nowhere to navigate, so the
         * press did nothing at all.
         */
        it("creates the thread when the self-DM's IOU action has none yet", async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}selfDM`, {a1: buildIOUAction('a1')});
            await waitForBatchedUpdates();

            expect(getReportIDToOpenForExpense(buildUnreportedExpense(transactionR14932.transactionID), CONTEXT)).toBe('created_thread');
            expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(
                expect.objectContaining({
                    // Report "0" is a placeholder, so there is no parent expense report to build the thread from;
                    // createTransactionThreadReport parents it to the self-DM off the transaction instead.
                    iouReport: undefined,
                    iouReportAction: expect.objectContaining({reportActionID: 'a1'}),
                    transaction: expect.objectContaining({transactionID: transactionR14932.transactionID}),
                }),
            );
        });

        it('creates the thread from the snapshot action when the self-DM actions were never fetched', () => {
            expect(getReportIDToOpenForExpense(buildUnreportedExpense('t5', buildIOUAction('a5')), CONTEXT)).toBe('created_thread');
            expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({iouReportAction: expect.objectContaining({reportActionID: 'a5'})}));
        });

        it('falls back to the unreported placeholder when no IOU action exists anywhere', () => {
            expect(getReportIDToOpenForExpense(buildUnreportedExpense('t6'), CONTEXT)).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
            expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
        });
    });
});

describe('getOrCreateTransactionThreadReportID', () => {
    const iouReport = {reportID: 'parent', policyID: 'policy1'} as Report;

    beforeEach(() => {
        mockCreateTransactionThreadReport.mockClear();
        mockSetOptimisticTransactionThread.mockClear();
    });

    it('returns the existing thread without side effects when it is already in Onyx', () => {
        const reportID = getOrCreateTransactionThreadReportID(
            {
                threadReportID: 'existing_thread',
                threadReportExists: true,
                iouReport,
                iouReportAction: buildIOUAction('a1', 'existing_thread'),
                transaction: buildTransaction('t1', 'parent'),
            },
            CONTEXT,
        );

        expect(reportID).toBe('existing_thread');
        expect(mockSetOptimisticTransactionThread).not.toHaveBeenCalled();
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('optimistically materializes the existing thread when it has not been fetched to Onyx yet', () => {
        const reportID = getOrCreateTransactionThreadReportID(
            {
                threadReportID: 'existing_thread',
                threadReportExists: false,
                iouReport,
                iouReportAction: buildIOUAction('a1', 'existing_thread'),
                transaction: buildTransaction('t1', 'parent'),
            },
            CONTEXT,
        );

        expect(reportID).toBe('existing_thread');
        expect(mockSetOptimisticTransactionThread).toHaveBeenCalledTimes(1);
        expect(mockSetOptimisticTransactionThread).toHaveBeenCalledWith('existing_thread', 'parent', 'a1', 'policy1');
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('creates a new thread when none exists yet', () => {
        const reportID = getOrCreateTransactionThreadReportID(
            {
                threadReportID: undefined,
                threadReportExists: false,
                iouReport,
                iouReportAction: buildIOUAction('a1'),
                transaction: buildTransaction('t1', 'parent'),
            },
            CONTEXT,
        );

        expect(reportID).toBe('created_thread');
        expect(mockSetOptimisticTransactionThread).not.toHaveBeenCalled();
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledTimes(1);
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(
            expect.objectContaining({
                iouReport: expect.objectContaining({reportID: 'parent'}),
                iouReportAction: expect.objectContaining({reportActionID: 'a1'}),
                transaction: expect.objectContaining({transactionID: 't1'}),
            }),
        );
    });
});

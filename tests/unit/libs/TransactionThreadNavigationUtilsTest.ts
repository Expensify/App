import {createTransactionThreadReport} from '@libs/actions/Report';
import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

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
    };
});

const mockCreateTransactionThreadReport = jest.mocked(createTransactionThreadReport);

const CONTEXT = {introSelected: undefined, betas: undefined, currentUserEmail: 'me@test.com', currentUserAccountID: 1};

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
});

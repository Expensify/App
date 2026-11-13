import {act, render, screen} from '@testing-library/react-native';

import MoneyRequestHeaderPrimaryAction from '@components/MoneyRequestHeaderPrimaryAction';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const ACCOUNT_ID = 1;
const THREAD_REPORT_ID = 'thread';
const EXPENSE_REPORT_ID = 'expenseReport';
const OTHER_REPORT_ID = 'otherReport';
const IOU_ACTION_ID = 'iouAction';
const TRANSACTION_ID = 'transaction';
const DUPLICATE_TRANSACTION_ID = 'duplicate';

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

// The header is opened from a duplicate's preview inside the review, which is where Keep this one is offered
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: jest.fn(() => ({key: 'report', name: '', params: {reportID: 'thread', backTo: '/r/thread/duplicates/review/thread'}})),
}));

// Which action the thread gets is covered by ReportPrimaryActionUtilsTest; this test is about whether it can be offered
jest.mock('@libs/ReportPrimaryActionUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ReportPrimaryActionUtils'),
    getTransactionThreadPrimaryAction: jest.fn(() => jest.requireActual<{default: typeof CONST}>('@src/CONST').default.REPORT.TRANSACTION_PRIMARY_ACTIONS.KEEP_THIS_ONE),
}));

const buildExpense = (transactionID: string, reportID: string) => ({
    transactionID,
    reportID,
    amount: -1000,
    currency: CONST.CURRENCY.USD,
    created: '2026-10-01',
    merchant: 'Ramen',
    comment: {},
});

const buildOpenExpenseReport = (reportID: string) => ({
    reportID,
    type: CONST.REPORT.TYPE.EXPENSE,
    ownerAccountID: ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
});

const loadDuplicate = async (report: Partial<Report>) => {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${DUPLICATE_TRANSACTION_ID}`, buildExpense(DUPLICATE_TRANSACTION_ID, OTHER_REPORT_ID));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${OTHER_REPORT_ID}`, report);
    });
};

const renderHeader = async () => {
    render(
        <OnyxListItemProvider>
            <MoneyRequestHeaderPrimaryAction reportID={THREAD_REPORT_ID} />
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
};

describe('MoneyRequestHeaderPrimaryAction Keep this one', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, buildOpenExpenseReport(EXPENSE_REPORT_ID));
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, {
                ...LHNTestUtils.getFakeReport(),
                reportID: THREAD_REPORT_ID,
                parentReportID: EXPENSE_REPORT_ID,
                parentReportActionID: IOU_ACTION_ID,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, {
                [IOU_ACTION_ID]: {
                    ...LHNTestUtils.getFakeReportAction(),
                    reportActionID: IOU_ACTION_ID,
                    reportID: EXPENSE_REPORT_ID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    actorAccountID: ACCOUNT_ID,
                    childReportID: THREAD_REPORT_ID,
                    message: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: TRANSACTION_ID,
                        IOUReportID: EXPENSE_REPORT_ID,
                        amount: 1000,
                        currency: CONST.CURRENCY.USD,
                        text: '',
                    },
                },
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, buildExpense(TRANSACTION_ID, EXPENSE_REPORT_ID));
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [
                {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.WARNING, data: {duplicates: [DUPLICATE_TRANSACTION_ID]}},
            ]);
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('is offered when every duplicate and its report are loaded', async () => {
        // Given the duplicate and its open report are both in Onyx
        await loadDuplicate(buildOpenExpenseReport(OTHER_REPORT_ID));

        // When the header renders
        await renderHeader();

        // Then Keep this one shows, because the merge would include the duplicate
        expect(screen.getByText('violations.keepThisOne')).toBeOnTheScreen();
    });

    it('is not offered while the duplicate is not loaded', async () => {
        // Given only this expense is in Onyx

        // When the header renders
        await renderHeader();

        // Then Keep this one is hidden, because the merge would leave the missing duplicate out
        expect(screen.queryByText('violations.keepThisOne')).not.toBeOnTheScreen();
    });

    it("is not offered while the duplicate's report is not loaded", async () => {
        // Given the duplicate is cached without its report
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${DUPLICATE_TRANSACTION_ID}`, buildExpense(DUPLICATE_TRANSACTION_ID, OTHER_REPORT_ID));
        });

        // When the header renders
        await renderHeader();

        // Then Keep this one is hidden, because the duplicate is filtered out of the merge and Confirm would fail
        expect(screen.queryByText('violations.keepThisOne')).not.toBeOnTheScreen();
    });

    it('is offered when the violation lists this expense and a duplicate more than once', async () => {
        // Given every duplicate is loaded, but the violation repeats the duplicate and references this expense
        await loadDuplicate(buildOpenExpenseReport(OTHER_REPORT_ID));
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [
                {
                    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {duplicates: [DUPLICATE_TRANSACTION_ID, DUPLICATE_TRANSACTION_ID, TRANSACTION_ID]},
                },
            ]);
        });

        // When the header renders
        await renderHeader();

        // Then Keep this one shows, because the extra IDs don't stand for duplicates that are still missing
        expect(screen.getByText('violations.keepThisOne')).toBeOnTheScreen();
    });

    it('is not offered when a duplicate is on a paid report', async () => {
        // Given the duplicate is loaded on a paid report
        await loadDuplicate({...buildOpenExpenseReport(OTHER_REPORT_ID), stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED});

        // When the header renders
        await renderHeader();

        // Then Keep this one is hidden, because the paid duplicate is filtered out of the merge and Confirm would fail
        expect(screen.queryByText('violations.keepThisOne')).not.toBeOnTheScreen();
    });
});

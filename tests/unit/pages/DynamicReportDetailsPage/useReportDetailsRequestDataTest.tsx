import {renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useReportDetailsRequestData from '@pages/DynamicReportDetailsPage/useReportDetailsRequestData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const CHAT_REPORT_ID = '20';
const IOU_REPORT_ID = '10';
const TRANSACTION_THREAD_REPORT_ID = '30';
const TASK_REPORT_ID = '40';
const IOU_ACTION_ID = '100';
const TRANSACTION_ID = '1000';

function buildIOUReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: IOU_REPORT_ID,
        type: CONST.REPORT.TYPE.IOU,
        chatReportID: CHAT_REPORT_ID,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        managerID: OTHER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        currency: CONST.CURRENCY.USD,
        total: 1000,
        ...overrides,
    };
}

function buildIOUAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: IOU_ACTION_ID,
        reportID: IOU_REPORT_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        childReportID: TRANSACTION_THREAD_REPORT_ID,
        created: '2026-01-01 00:00:00.000',
        message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: '$10.00', text: '$10.00'}],
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            IOUReportID: IOU_REPORT_ID,
            IOUTransactionID: TRANSACTION_ID,
            amount: 1000,
            currency: CONST.CURRENCY.USD,
        },
        ...overrides,
    } as ReportAction;
}

/** Stores an IOU report holding one expense, and the transaction thread opened from that expense */
async function setMoneyRequestData({iouReport = buildIOUReport(), iouAction = buildIOUAction()}: {iouReport?: Report; iouAction?: ReportAction} = {}) {
    const transaction: Transaction = {
        transactionID: TRANSACTION_ID,
        reportID: IOU_REPORT_ID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        created: '2026-01-01',
        merchant: 'Merchant',
        comment: {},
    };
    await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'user@test.com'});
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, {reportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, iouReportID: IOU_REPORT_ID});
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`, iouReport);
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${TRANSACTION_THREAD_REPORT_ID}`, {
        reportID: TRANSACTION_THREAD_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        parentReportID: IOU_REPORT_ID,
        parentReportActionID: IOU_ACTION_ID,
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`, {[IOU_ACTION_ID]: iouAction});
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
    await waitForBatchedUpdates();
}

function wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

async function renderRequestData(reportID: string) {
    const hook = renderHook(() => useReportDetailsRequestData(reportID), {wrapper});
    await waitForBatchedUpdates();
    return hook;
}

describe('useReportDetailsRequestData', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should resolve the expense from the parent action of a transaction thread', async () => {
        // Given a transaction thread whose parent action is an expense the current user created
        await setMoneyRequestData();

        // When the request data is read for the thread
        const {result} = await renderRequestData(TRANSACTION_THREAD_REPORT_ID);

        // Then the expense comes from the thread's parent action, and the money request report is the parent IOU report
        expect(result.current.requestParentReportAction?.reportActionID).toBe(IOU_ACTION_ID);
        expect(result.current.moneyRequestReport?.reportID).toBe(IOU_REPORT_ID);
        expect(result.current.iouReport?.reportID).toBe(IOU_REPORT_ID);
        expect(result.current.chatIOUReport?.reportID).toBe(CHAT_REPORT_ID);
        expect(result.current.iouTransactionID).toBe(TRANSACTION_ID);
        expect(result.current.iouTransaction?.transactionID).toBe(TRANSACTION_ID);
        expect(result.current.requestParentReportActionChildReport?.reportID).toBe(TRANSACTION_THREAD_REPORT_ID);
        expect(result.current.isSingleTransactionView).toBe(true);
    });

    it('should show the delete row for an open expense the current user created', async () => {
        // Given an open IOU report holding an expense the current user created
        await setMoneyRequestData();

        // When the request data is read for the transaction thread
        const {result} = await renderRequestData(TRANSACTION_THREAD_REPORT_ID);

        // Then the expense can be deleted and the row is titled after the IOU action
        expect(result.current.isDeletedParentAction).toBe(false);
        expect(result.current.shouldShowDeleteButton).toBe(true);
        expect(result.current.shouldShowEditSplitOnDeleteAction).toBe(false);
        expect(result.current.deleteMenuItemTitle).toBe('Delete expense');
    });

    it('should hide the delete row when another user created the expense', async () => {
        // Given an expense that was created by someone other than the current user
        await setMoneyRequestData({iouAction: buildIOUAction({actorAccountID: OTHER_ACCOUNT_ID})});

        // When the request data is read for the transaction thread
        const {result} = await renderRequestData(TRANSACTION_THREAD_REPORT_ID);

        // Then the delete row is hidden, because only the action owner may delete an expense
        expect(result.current.shouldShowDeleteButton).toBe(false);
    });

    it('should hide the delete row when the IOU report is approved', async () => {
        // Given the current user's expense sits on an approved IOU report
        await setMoneyRequestData({iouReport: buildIOUReport({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED})});

        // When the request data is read for the transaction thread
        const {result} = await renderRequestData(TRANSACTION_THREAD_REPORT_ID);

        // Then the delete row is hidden, because transactions can no longer be removed from an approved report
        expect(result.current.shouldShowDeleteButton).toBe(false);
    });

    it('should resolve the single expense of a money report through its transaction thread', async () => {
        // Given an IOU report with exactly one expense and its transaction thread
        await setMoneyRequestData();

        // When the request data is read for the IOU report itself
        const {result} = await renderRequestData(IOU_REPORT_ID);

        // Then the expense is found via the one transaction thread, and the money request report is the report itself
        expect(result.current.requestParentReportAction?.reportActionID).toBe(IOU_ACTION_ID);
        expect(result.current.moneyRequestReport?.reportID).toBe(IOU_REPORT_ID);
        expect(result.current.iouTransactionID).toBe(TRANSACTION_ID);
        expect(result.current.isSingleTransactionView).toBe(false);
    });

    it('should title the delete row as a plain delete for a non-money report', async () => {
        // Given a task report, which resolves to the default case
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TASK_REPORT_ID}`, {reportID: TASK_REPORT_ID, type: CONST.REPORT.TYPE.TASK});
        await waitForBatchedUpdates();

        // When the request data is read for it
        const {result} = await renderRequestData(TASK_REPORT_ID);

        // Then there is no expense to resolve, and the row falls back to the generic delete title
        expect(result.current.requestParentReportAction).toBeUndefined();
        expect(result.current.iouTransactionID).toBeUndefined();
        expect(result.current.deleteMenuItemTitle).toBe('Delete');
    });
});

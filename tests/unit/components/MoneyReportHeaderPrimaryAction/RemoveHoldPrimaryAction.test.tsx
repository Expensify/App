import {render} from '@testing-library/react-native';

import Button from '@components/Button';
import RemoveHoldPrimaryAction from '@components/MoneyReportHeaderPrimaryAction/RemoveHoldPrimaryAction';
import useTransactionThreadData from '@components/MoneyReportHeaderPrimaryAction/useTransactionThreadData';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {changeMoneyRequestHoldStatus} from '@libs/actions/IOU/Hold';
import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

import type {UseOnyxResult} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../../utils/collections/transaction';
import {getCurrencyDecimalsLocal} from '../../../utils/TestHelper';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const IOU_REPORT_ID = '1001';
const THREAD_REPORT_ID = '1002';
const IOU_ACTION_ID = 'iou-action-1';
const TRANSACTION_ID = 'transaction-1';
const TEST_ACCOUNT_ID = 12345;
const TEST_EMAIL = 'test@expensify.com';

jest.mock('@components/Button', () =>
    Object.assign(
        jest.fn(() => null),
        {Text: jest.fn(() => null)},
    ),
);

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: jest.fn(() => ({isDelegateAccessRestricted: false})),
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: jest.fn()})),
}));

jest.mock('@components/MoneyReportHeaderPrimaryAction/useTransactionThreadData', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useDelegateAccountID', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: jest.fn(() => ({translate: (key: string) => key})),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/actions/IOU/Hold', () => ({
    __esModule: true,
    changeMoneyRequestHoldStatus: jest.fn(),
}));

const mockButton = jest.mocked(Button);
const mockChangeMoneyRequestHoldStatus = jest.mocked(changeMoneyRequestHoldStatus);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockUseDelegateAccountID = jest.mocked(useDelegateAccountID);
const mockUseOnyx = jest.mocked(useOnyx);
const mockUseTransactionThreadData = jest.mocked(useTransactionThreadData);
const mockUseTransactionsAndViolationsForReport = jest.mocked(useTransactionsAndViolationsForReport);

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

const HOLD_ACTION_ID = 'hold-report-action-id';

const iouReport: Report = {
    reportID: IOU_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: 'policy-1',
};

const transactionThreadReport: Report = {
    reportID: THREAD_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
    parentReportID: IOU_REPORT_ID,
    parentReportActionID: IOU_ACTION_ID,
};

const transaction: Transaction = {
    ...createRandomTransaction(1),
    transactionID: TRANSACTION_ID,
    reportID: IOU_REPORT_ID,
    comment: {hold: HOLD_ACTION_ID},
};

function buildIOUAction(reportActionID: string, transactionID: string, childReportID: string): ReportAction {
    return {
        ...buildOptimisticIOUReportAction({
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: transaction.amount,
            currency: transaction.currency,
            comment: '',
            participants: [],
            transactionID,
            iouReportID: IOU_REPORT_ID,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
        }),
        reportActionID,
        childReportID,
        childType: CONST.REPORT.TYPE.CHAT,
        actorAccountID: TEST_ACCOUNT_ID,
    };
}

const iouAction = buildIOUAction(IOU_ACTION_ID, TRANSACTION_ID, THREAD_REPORT_ID);

const allReports = {
    [`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`]: iouReport,
    [`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`]: transactionThreadReport,
};

describe('RemoveHoldPrimaryAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseCurrentUserPersonalDetails.mockReturnValue({login: TEST_EMAIL, accountID: TEST_ACCOUNT_ID});
        mockUseDelegateAccountID.mockReturnValue(undefined);
        mockUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.COLLECTION.REPORT) {
                return createOnyxResult<Record<string, Report>>(allReports);
            }
            return createOnyxResult(undefined);
        });
        mockUseTransactionThreadData.mockReturnValue({
            moneyRequestReport: iouReport,
            chatReport: undefined,
            isOffline: false,
            reportActions: [],
            visibleTransactions: [transaction],
            reportTransactionIDs: [transaction.transactionID],
            transactionThreadReportID: THREAD_REPORT_ID,
            transactionThreadReport,
            requestParentReportAction: iouAction,
            iouTransactionID: transaction.transactionID,
            transaction,
        });
        mockUseTransactionsAndViolationsForReport.mockReturnValue({
            transactions: {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction},
            violations: {},
            isLoaded: true,
        });
    });

    it('passes the transaction report and the action child report when removing a hold', () => {
        // Given an expense on hold that belongs to an IOU report and whose IOU action has a transaction thread
        render(
            <RemoveHoldPrimaryAction
                reportID={IOU_REPORT_ID}
                chatReportID="chat-report-1"
            />,
        );

        // When the user presses the "Unhold" button
        const buttonProps = mockButton.mock.lastCall?.[0];
        expect(buttonProps?.isDisabled).toBeFalsy();
        buttonProps?.onPress?.();

        // Then the hold status is changed with both reports resolved from the report collection, so the unhold
        // request has the report and its transaction thread available
        expect(mockChangeMoneyRequestHoldStatus).toHaveBeenCalledTimes(1);
        const payload = mockChangeMoneyRequestHoldStatus.mock.calls.at(0)?.at(0);
        expect(payload).toEqual(
            expect.objectContaining({
                reportAction: iouAction,
                iouTransaction: transaction,
                iouTransactionReport: iouReport,
                reportActionChildReport: transactionThreadReport,
            }),
        );
    });

    it('unholds every held expense with its own transaction thread report', async () => {
        // Given a report with two held expenses, each with its own IOU action and transaction thread
        const secondThreadReportID = '1003';
        const secondActionID = 'iou-action-2';
        const secondTransactionID = 'transaction-2';
        const secondHoldActionID = 'hold-report-action-id-2';
        const secondTransaction: Transaction = {
            ...createRandomTransaction(2),
            transactionID: secondTransactionID,
            reportID: IOU_REPORT_ID,
            comment: {hold: secondHoldActionID},
        };
        const secondThreadReport: Report = {
            reportID: secondThreadReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: IOU_REPORT_ID,
            parentReportActionID: secondActionID,
        };
        const secondIOUAction = buildIOUAction(secondActionID, secondTransactionID, secondThreadReportID);
        const reports = {
            ...allReports,
            [`${ONYXKEYS.COLLECTION.REPORT}${secondThreadReportID}`]: secondThreadReport,
        };

        mockUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.COLLECTION.REPORT) {
                return createOnyxResult<Record<string, Report>>(reports);
            }
            return createOnyxResult(undefined);
        });
        mockUseTransactionThreadData.mockReturnValue({
            moneyRequestReport: iouReport,
            chatReport: undefined,
            isOffline: false,
            reportActions: [iouAction, secondIOUAction],
            visibleTransactions: [transaction, secondTransaction],
            reportTransactionIDs: [transaction.transactionID, secondTransaction.transactionID],
            transactionThreadReportID: THREAD_REPORT_ID,
            transactionThreadReport,
            requestParentReportAction: iouAction,
            iouTransactionID: transaction.transactionID,
            transaction,
        });
        mockUseTransactionsAndViolationsForReport.mockReturnValue({
            transactions: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${secondTransaction.transactionID}`]: secondTransaction,
            },
            violations: {},
            isLoaded: true,
        });
        const buildHoldAction = (reportActionID: string): ReportAction => ({
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: TEST_ACCOUNT_ID,
            created: '2024-01-01 00:00:00.000',
        });
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: TEST_ACCOUNT_ID, email: TEST_EMAIL},
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {[HOLD_ACTION_ID]: buildHoldAction(HOLD_ACTION_ID)},
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${secondThreadReportID}`]: {[secondHoldActionID]: buildHoldAction(secondHoldActionID)},
        });
        await waitForBatchedUpdates();

        render(
            <RemoveHoldPrimaryAction
                reportID={IOU_REPORT_ID}
                chatReportID="chat-report-1"
            />,
        );

        // When the user presses the "Unhold" button
        const buttonProps = mockButton.mock.lastCall?.[0];
        buttonProps?.onPress?.();

        // Then both expenses are unheld, and each call gets its own transaction thread as the action child report
        expect(mockChangeMoneyRequestHoldStatus).toHaveBeenCalledTimes(2);
        expect(mockChangeMoneyRequestHoldStatus).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                reportAction: iouAction,
                iouTransaction: transaction,
                iouTransactionReport: iouReport,
                reportActionChildReport: transactionThreadReport,
            }),
        );
        expect(mockChangeMoneyRequestHoldStatus).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                reportAction: secondIOUAction,
                iouTransaction: secondTransaction,
                iouTransactionReport: iouReport,
                reportActionChildReport: secondThreadReport,
            }),
        );
    });
});

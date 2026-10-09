import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TransactionPreviewContent from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

// Expose the canEdit translation parameter in the rendered output so canEdit-dependent messages can be asserted.
// The message must stay under CONST.REPORT_VIOLATIONS.RBR_MESSAGE_MAX_CHARACTERS_FOR_PREVIEW or the preview
// swaps it for the generic "review required" message.
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, params?: Record<string, unknown>) => (params && 'canEdit' in params ? `smartscan#${String(params.canEdit)}` : key)),
        numberFormat: jest.fn((num: number) => num.toString()),
        toLocaleDigit: jest.fn((digit: string) => digit),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
    })),
);

const currentUserAccountID = 20;
const currentUserEmail = 'submitter@test.com';
const approverAccountID = 21;
const approverEmail = 'approver@test.com';
const policyID = 'policy_tpc_test';
const expenseReportID = 'expense_tpc_123';
const transactionID = 'txn_tpc_test';

const corporatePolicy = {
    id: policyID,
    type: CONST.POLICY.TYPE.CORPORATE,
    role: CONST.POLICY.ROLE.USER,
    name: 'Corporate Policy',
    owner: '',
    outputCurrency: CONST.CURRENCY.USD,
    employeeList: {
        [currentUserEmail]: {
            email: currentUserEmail,
            role: CONST.POLICY.ROLE.USER,
            submitsTo: approverEmail,
        },
    },
} as Policy;

const expenseReport = {
    reportID: expenseReportID,
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID,
    ownerAccountID: currentUserAccountID,
    managerID: approverAccountID,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
} as Report;

const moneyRequestAction = {
    ...LHNTestUtils.getFakeReportAction(),
    reportActionID: 'tpc_iou_action',
    reportID: expenseReportID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    actorAccountID: currentUserAccountID,
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        IOUTransactionID: transactionID,
        amount: 5000,
        currency: CONST.CURRENCY.USD,
    },
} as ReportAction;

const transaction = {
    transactionID,
    reportID: expenseReportID,
    amount: 5000,
    currency: CONST.CURRENCY.USD,
    created: '2026-04-20',
    merchant: 'Coffee Shop',
    comment: {},
} as Transaction;

const smartscanFailedViolation: TransactionViolation = {
    name: CONST.VIOLATIONS.SMARTSCAN_FAILED,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};

const personalDetails: PersonalDetailsList = {
    [currentUserAccountID]: {accountID: currentUserAccountID, login: currentUserEmail, displayName: 'Submitter'},
    [approverAccountID]: {accountID: approverAccountID, login: approverEmail, displayName: 'Approver'},
};

const renderTransactionPreviewContent = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <TransactionPreviewContent
                action={moneyRequestAction}
                isWhisper={false}
                isHovered={false}
                chatReport={undefined}
                personalDetails={personalDetails}
                report={expenseReport}
                policy={corporatePolicy}
                transaction={transaction}
                violations={[smartscanFailedViolation]}
                transactionRawAmount={5000}
                offlineWithFeedbackOnClose={() => {}}
                containerStyles={[]}
                transactionPreviewWidth={303}
                isBillSplit={false}
                areThereDuplicates={false}
                sessionAccountID={currentUserAccountID}
                walletTermsErrors={undefined}
                reportPreviewAction={undefined}
                navigateToReviewFields={() => {}}
                routeName="Report"
            />
        </ComposeProviders>,
    );

describe('TransactionPreviewContent', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    const seedOnyx = async (reportActions: Record<string, ReportAction>) => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, corporatePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`, reportActions);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        });
        await waitForBatchedUpdatesWithAct();
    };

    it('shows the editable smartscan-failed message for the submitter when the report has not been forwarded', async () => {
        await seedOnyx({
            [moneyRequestAction.reportActionID]: moneyRequestAction,
            submitted: {...LHNTestUtils.getFakeReportAction(), reportActionID: 'submitted', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED, created: '2026-04-21 17:00:00'},
        });

        renderTransactionPreviewContent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('smartscan#true')).toBeOnTheScreen();
        });
    });

    it('shows the read-only smartscan-failed message for the submitter after the report was forwarded since the last submit', async () => {
        await seedOnyx({
            [moneyRequestAction.reportActionID]: moneyRequestAction,
            submitted: {...LHNTestUtils.getFakeReportAction(), reportActionID: 'submitted', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED, created: '2026-04-21 17:00:00'},
            forwarded: {...LHNTestUtils.getFakeReportAction(), reportActionID: 'forwarded', actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED, created: '2026-04-21 17:10:00'},
        });

        renderTransactionPreviewContent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('smartscan#false')).toBeOnTheScreen();
        });
    });
});

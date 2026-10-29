import {renderHook} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportPreviewActionDecision from '@components/ReportActionItem/MoneyRequestReportPreview/useReportPreviewActionDecision';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const PAYER = 1; // current user: workspace admin / payer (NOT the report manager)
const SUBMITTER = 2; // report owner + manager
const OUTSIDER = 3; // neither payer nor submitter
const IOU_REPORT_ID = 'exp1';
const DM_CHAT_ID = 'dm1';
const POLICY_ID = 'pol1';
const PAYER_EMAIL = 'payer@test.com';
const OUTSIDER_EMAIL = 'outsider@test.com';

// A workspace EXPENSE report whose preview card is rendered inside a 1:1 DM.
const iouReport = {
    ...createRandomReport(1),
    reportID: IOU_REPORT_ID,
    chatReportID: DM_CHAT_ID,
    policyID: POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    managerID: SUBMITTER,
    ownerAccountID: SUBMITTER,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    total: -10000,
    reimbursableTotal: -10000,
    nonReimbursableTotal: 0,
    currency: CONST.CURRENCY.USD,
    isWaitingOnBankAccount: false,
};

// A personal 1:1 DM has no policyID — this is what makes the chat-vs-report policy sourcing observable.
const dmChatReport = {...createRandomReport(2), reportID: DM_CHAT_ID, type: CONST.REPORT.TYPE.CHAT, iouReportID: IOU_REPORT_ID, policyID: undefined};

const policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
    id: POLICY_ID,
    role: CONST.POLICY.ROLE.ADMIN,
    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
};

const transactions = [{...createRandomTransaction(1), transactionID: 'txn1', reportID: IOU_REPORT_ID, amount: -10000, currency: CONST.CURRENCY.USD}];

// A personal 1:1 DM IOU (no policy). Used to check that a bystander who is neither payer nor submitter gets no action.
const PERSONAL_IOU_ID = 'iou1';
const PERSONAL_DM_ID = 'dm2';
const personalIouReport = {
    ...createRandomReport(3),
    reportID: PERSONAL_IOU_ID,
    chatReportID: PERSONAL_DM_ID,
    policyID: undefined,
    type: CONST.REPORT.TYPE.IOU,
    managerID: PAYER,
    ownerAccountID: SUBMITTER,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    total: -10000,
    reimbursableTotal: -10000,
    nonReimbursableTotal: 0,
    currency: CONST.CURRENCY.USD,
    isWaitingOnBankAccount: false,
};
const personalDmChatReport = {...createRandomReport(4), reportID: PERSONAL_DM_ID, type: CONST.REPORT.TYPE.CHAT, iouReportID: PERSONAL_IOU_ID, policyID: undefined};

TestHelper.setupApp();

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>{children}</CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>
    );
}

describe('useReportPreviewActionDecision', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await TestHelper.signInWithTestUser(PAYER, PAYER_EMAIL);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`, iouReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${DM_CHAT_ID}`, dmChatReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await waitForBatchedUpdatesWithAct();
    });

    const baseParams = {
        iouReportID: IOU_REPORT_ID,
        chatReportID: DM_CHAT_ID,
        iouReport,
        chatReport: dmChatReport,
        invoiceReceiverPolicy: undefined,
        transactions,
        transactionViolations: undefined,
        isPaidAnimationRunning: false,
        isApprovedAnimationRunning: false,
        isSubmittingAnimationRunning: false,
    };

    it('resolves the payable decision using the report policy even when the preview lives in a policy-less DM', async () => {
        const {result} = renderHook(() => useReportPreviewActionDecision(baseParams), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        expect(result.current.reportPreviewAction).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
        expect(result.current.canIOUBePaid).toBe(true);
        expect(result.current.shouldShowPayButton).toBe(true);
    });

    it('does not offer PAY to a user who is neither the payer nor the submitter', async () => {
        await TestHelper.signInWithTestUser(OUTSIDER, OUTSIDER_EMAIL);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PERSONAL_IOU_ID}`, personalIouReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PERSONAL_DM_ID}`, personalDmChatReport);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(
            () =>
                useReportPreviewActionDecision({
                    ...baseParams,
                    iouReportID: PERSONAL_IOU_ID,
                    chatReportID: PERSONAL_DM_ID,
                    iouReport: personalIouReport,
                    chatReport: personalDmChatReport,
                }),
            {wrapper: Wrapper},
        );
        await waitForBatchedUpdatesWithAct();

        expect(result.current.reportPreviewAction).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
        expect(result.current.canIOUBePaid).toBe(false);
        expect(result.current.shouldShowPayButton).toBe(false);
    });
});

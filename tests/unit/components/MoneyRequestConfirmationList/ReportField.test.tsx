import {render, screen, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ReportField from '@components/MoneyRequestConfirmationList/sections/ReportField';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@components/MenuItem/presets/MenuItemFieldHTML', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({value}: {value?: string}) => <Text>{value}</Text>;
});

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)}));
jest.mock('@hooks/useReportAttributes', () => ({
    ...jest.requireActual<Record<string, unknown>>('@hooks/useReportAttributes'),
    useDerivedReportNameByReportID: () => undefined,
}));

const mockIsBetaEnabled = jest.fn<boolean, [string]>(() => false);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: (beta: string) => mockIsBetaEnabled(beta)}));

const TRANSACTION_ID = '1';
const POLICY_ID = 'policy-test-1';
const CHAT_REPORT_ID = 'report-chat-1';
const SUBMITTED_REPORT_ID = 'expense-report-awaiting-approval';
const OPEN_REPORT_ID = 'expense-report-open';
const SUBMITTER_ACCOUNT_ID = 100;
const SUBMITTER_EMAIL = 'submitter@example.com';
const APPROVER_ACCOUNT_ID = 300;
const APPROVER_EMAIL = 'approver@example.com';

const chatReport: Report = {
    reportID: CHAT_REPORT_ID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: POLICY_ID,
    isOwnPolicyExpenseChat: true,
    type: CONST.REPORT.TYPE.CHAT,
};

function buildExpenseReport(reportID: string, reportName: string, created: string): Report {
    return {
        reportID,
        reportName,
        type: CONST.REPORT.TYPE.EXPENSE,
        policyID: POLICY_ID,
        chatReportID: CHAT_REPORT_ID,
        ownerAccountID: SUBMITTER_ACCOUNT_ID,
        managerID: SUBMITTER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        currency: 'USD',
        total: 0,
        created,
    };
}

const submittedReport: Report = {
    ...buildExpenseReport(SUBMITTED_REPORT_ID, 'Submitted report', '2024-03-04'),
    // Awaiting first-level approval, which is what lets `canAddTransaction` accept this report when it is picked by hand.
    managerID: APPROVER_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
};

const renderReportField = () =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={CHAT_REPORT_ID}
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
        >
            <ReportField
                selectedParticipants={[{accountID: 0, reportID: CHAT_REPORT_ID, policyID: POLICY_ID, ownerAccountID: SUBMITTER_ACCOUNT_ID, isPolicyExpenseChat: true, selected: true}]}
                iouType={CONST.IOU.TYPE.SUBMIT}
                reportID={CHAT_REPORT_ID}
                reportActionID={undefined}
                action={CONST.IOU.ACTION.CREATE}
                transactionID={TRANSACTION_ID}
                isPerDiemRequest={false}
                isPolicyExpenseChat
            />
        </ConfirmationFieldsProvider>,
    );

describe('ReportField', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        mockIsBetaEnabled.mockReturnValue(false);
        await Onyx.clear();
        // `canAddTransaction` requires the submitter to own the report and the policy to be a group policy with an approver.
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: SUBMITTER_ACCOUNT_ID, email: SUBMITTER_EMAIL});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [SUBMITTER_ACCOUNT_ID]: {accountID: SUBMITTER_ACCOUNT_ID, login: SUBMITTER_EMAIL},
            [APPROVER_ACCOUNT_ID]: {accountID: APPROVER_ACCOUNT_ID, login: APPROVER_EMAIL},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.USER,
            approver: APPROVER_EMAIL,
            owner: APPROVER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });
        await waitForBatchedUpdates();
    });

    async function givenExpense(iouRequestType: ValueOf<typeof CONST.IOU.REQUEST_TYPE> = CONST.IOU.REQUEST_TYPE.MANUAL) {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            amount: 1000,
            currency: 'USD',
            iouRequestType,
            participants: [{accountID: 0, reportID: CHAT_REPORT_ID, policyID: POLICY_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
    }

    it('shows New report when the submitter only has a report that is awaiting approval', async () => {
        // Given the submitter just sent their only report for approval, which clears the chat's iouReportID
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SUBMITTED_REPORT_ID}`, submittedReport);
        await givenExpense();

        // When the confirmation form renders the report row
        renderReportField();

        // Then the row says New report, because saving never adds the expense to a report awaiting approval
        await waitFor(() => {
            expect(screen.getByText('iou.newReport')).toBeOnTheScreen();
        });
        expect(screen.queryByText('Submitted report')).toBeNull();
    });

    it('shows the newest open report rather than a newer report awaiting approval', async () => {
        // Given the submitter has an open report and a more recent report awaiting approval
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OPEN_REPORT_ID}`, buildExpenseReport(OPEN_REPORT_ID, 'Open report', '2024-01-02'));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SUBMITTED_REPORT_ID}`, submittedReport);
        await givenExpense();

        // When the confirmation form renders the report row
        renderReportField();

        // Then the row shows the open report, which is where saving adds the expense
        await waitFor(() => {
            expect(screen.getByText('Open report')).toBeOnTheScreen();
        });
        expect(screen.queryByText('Submitted report')).toBeNull();
    });

    it('shows New report for a scan in the ASAP submit beta even when the chat points at an open report', async () => {
        // Given the chat points at an open report and the user is in the ASAP submit beta
        mockIsBetaEnabled.mockImplementation((beta: string) => beta === CONST.BETAS.ASAP_SUBMIT);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, {...chatReport, iouReportID: OPEN_REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OPEN_REPORT_ID}`, buildExpenseReport(OPEN_REPORT_ID, 'Open report', '2024-01-02'));
        await givenExpense(CONST.IOU.REQUEST_TYPE.SCAN);

        // When the confirmation form renders the report row for the scan
        renderReportField();

        // Then the row says New report, because saving a scan in this beta always starts a new report
        await waitFor(() => {
            expect(screen.getByText('iou.newReport')).toBeOnTheScreen();
        });
        expect(screen.queryByText('Open report')).toBeNull();
    });

    it('shows the open report the chat points at for a manual expense', async () => {
        // Given the chat points at an open report
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, {...chatReport, iouReportID: OPEN_REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OPEN_REPORT_ID}`, buildExpenseReport(OPEN_REPORT_ID, 'Open report', '2024-01-02'));
        await givenExpense();

        // When the confirmation form renders the report row
        renderReportField();

        // Then the row shows that report, which is where saving adds the expense
        await waitFor(() => {
            expect(screen.getByText('Open report')).toBeOnTheScreen();
        });
    });
});

import {render, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import type ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ReportField from '@components/MoneyRequestConfirmationList/sections/ReportField';

import Navigation from '@libs/Navigation/Navigation';
import {canAddTransaction} from '@libs/ReportUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {ComponentProps} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), navigationRef: {getCurrentRoute: jest.fn(() => undefined)}}));
jest.mock('@hooks/useReportAttributes', () => ({useDerivedReportNameByReportID: () => undefined}));

let mockIsAnchoredDropdownsBetaEnabled = true;
jest.mock('@hooks/usePermissions', () => () => ({
    isBetaEnabled: (beta: string) => mockIsAnchoredDropdownsBetaEnabled && beta === jest.requireActual<{default: typeof CONST}>('@src/CONST').default.BETAS.ANCHORED_FIELD_DROPDOWNS,
}));

// The reports the user could move the expense to. The row only offers a choice when there is one.
let mockOutstandingReports: Report[] = [];
jest.mock('@hooks/useOutstandingReports', () => () => mockOutstandingReports);

// Records what the row decided and renders its list straight away, so each test can read both without pressing anything.
let mockShouldOpenInDropdown: boolean | undefined;
let mockIsInteractive: boolean | undefined;
let mockReportName: string | undefined;
type ExpenseFieldDropdownMockProps = Pick<ComponentProps<typeof ExpenseFieldDropdown>, 'shouldOpenInDropdown' | 'renderDropdown' | 'isInteractive' | 'value'>;
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    return ({shouldOpenInDropdown, renderDropdown, isInteractive, value}: ExpenseFieldDropdownMockProps) => {
        const {MODAL} = jest.requireActual<{default: typeof CONST}>('@src/CONST').default;
        mockShouldOpenInDropdown = shouldOpenInDropdown;
        mockIsInteractive = isInteractive;
        mockReportName = value;
        return renderDropdown({
            isVisible: true,
            onClose: () => {},
            anchorPosition: {horizontal: 0, vertical: 0},
            anchorAlignment: {horizontal: MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: MODAL.ANCHOR_ORIGIN_VERTICAL.TOP},
            shouldMeasureAnchorPositionFromTop: true,
            shouldSwitchPositionIfOverflow: false,
            popoverWidth: 300,
            popoverHeight: 300,
        });
    };
});

let mockDropdownTransactionID: string | undefined;
jest.mock('@components/MoneyRequestConfirmationList/sections/ReportFieldDropdown', () => ({transactionID}: {transactionID: string}) => {
    mockDropdownTransactionID = transactionID;
    return null;
});

const TRANSACTION_ID = '1';
const CHAT_REPORT_ID = 'chat1';
const POLICY_ID = 'policy1';
const ACCOUNT_ID = 1;

const outstandingReport: Report = {
    reportID: 'report1',
    reportName: 'Expense Report',
    policyID: POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    chatReportID: CHAT_REPORT_ID,
    ownerAccountID: ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    created: '2026-01-01 00:00:00',
};
const otherOutstandingReport: Report = {...outstandingReport, reportID: 'report2', reportName: 'Other Expense Report', created: '2026-01-02 00:00:00'};

type RenderParams = {
    action?: IOUAction;
    isPerDiemRequest?: boolean;
};

const renderReportRow = ({action = CONST.IOU.ACTION.CREATE, isPerDiemRequest = false}: RenderParams = {}) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={CHAT_REPORT_ID}
            action={action}
            iouType={CONST.IOU.TYPE.SUBMIT}
            isPolicyExpenseChat
        >
            <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                <ReportField
                    selectedParticipants={[{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, ownerAccountID: ACCOUNT_ID, isPolicyExpenseChat: true, selected: true}]}
                    iouType={CONST.IOU.TYPE.SUBMIT}
                    reportID={CHAT_REPORT_ID}
                    reportActionID={undefined}
                    action={action}
                    transactionID={TRANSACTION_ID}
                    isPerDiemRequest={isPerDiemRequest}
                    isPolicyExpenseChat
                />
            </ExpenseFormLayoutContext.Provider>
        </ConfirmationFieldsProvider>,
    );

describe('ReportField', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        mockIsAnchoredDropdownsBetaEnabled = true;
        // A new expense's row only offers a choice once there is more than one report it could go on.
        mockOutstandingReports = [outstandingReport, otherOutstandingReport];
        mockShouldOpenInDropdown = undefined;
        mockIsInteractive = undefined;
        mockReportName = undefined;
        mockDropdownTransactionID = undefined;
        jest.mocked(Navigation.navigate).mockClear();
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: ACCOUNT_ID, email: 'reportfield@example.com'},
            [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const]: {
                id: POLICY_ID,
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                autoReporting: true,
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
            },
            [`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}` as const]: {
                reportID: CHAT_REPORT_ID,
                policyID: POLICY_ID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                iouReportID: outstandingReport.reportID,
            },
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${outstandingReport.reportID}`, outstandingReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${otherOutstandingReport.reportID}`, otherOutstandingReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: '',
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, ownerAccountID: ACCOUNT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
    });

    it('opens the report list in place while creating an expense', async () => {
        // Given a workspace with two outstanding reports the expense could go on, and the anchored dropdowns beta on
        // When the expense form renders the report row
        renderReportRow();

        // Then the row opens its list in a container anchored to it, for this expense, rather than pushing the full-page selector
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
        expect(mockDropdownTransactionID).toBe(TRANSACTION_ID);
    });

    it('keeps the full-page selector when the beta is off', async () => {
        // Given the same workspace, for a user without the anchored dropdowns beta
        mockIsAnchoredDropdownsBetaEnabled = false;

        // When the form renders the report row
        renderReportRow();

        // Then the row opens the full-page selector as before
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('does not open the list when there is no report to choose', async () => {
        // Given a workspace with no outstanding report, where the row reads as a locked field
        mockOutstandingReports = [];

        // When the form renders the report row
        renderReportRow();

        // Then the row does not open a list, in place or otherwise
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('keeps the full-page selector for a per diem expense', async () => {
        // Given a per diem expense, whose report pick can send the user on to the destination step
        // When the form renders the report row
        renderReportRow({isPerDiemRequest: true});

        // Then the row keeps the full-page selector, which handles that navigation
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('keeps the full-page selector when editing a saved expense', async () => {
        // Given an expense that already exists
        // When the form renders the report row to edit it
        renderReportRow({action: CONST.IOU.ACTION.EDIT});

        // Then the row keeps the full-page selector, as the category and tag rows do for edits
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    const addNonReimbursableExpense = async (report: Report) => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}expense-${report.reportID}`, {
            transactionID: `expense-${report.reportID}`,
            reportID: report.reportID,
            amount: -100,
            currency: 'USD',
            created: '2026-01-01',
            merchant: 'Merchant',
            reimbursable: false,
        });
        await waitForBatchedUpdates();
    };

    it.each([false, true])('shows a locked New report field with only non-reimbursable reports (global create: %s)', async (isFromGlobalCreate) => {
        // Given two retracted reports which the save path cannot add a new expense to
        await addNonReimbursableExpense(outstandingReport);
        await addNonReimbursableExpense(otherOutstandingReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {isFromGlobalCreate});
        await waitForBatchedUpdates();
        expect(canAddTransaction(outstandingReport, undefined)).toBe(false);

        // When creating an expense from either the global button or the workspace chat
        renderReportRow();

        // Then the default agrees with the save path and cannot open an empty picker
        await waitFor(() => {
            expect(mockReportName).toBe('iou.newReport');
            expect(mockIsInteractive).toBe(false);
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it.each([false, true])('keeps New report locked with one eligible alternative (global create: %s)', async (isFromGlobalCreate) => {
        // Given an ineligible chat default and just one eligible report
        await addNonReimbursableExpense(outstandingReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {isFromGlobalCreate});
        await waitForBatchedUpdates();
        expect(canAddTransaction(otherOutstandingReport, undefined)).toBe(true);

        // When the confirmation field is rendered
        renderReportRow();

        // Then the > 1 threshold is preserved, even though another report could be selected
        await waitFor(() => {
            expect(mockReportName).toBe('iou.newReport');
            expect(mockIsInteractive).toBe(false);
        });
    });

    it('preserves the report default and interaction when submitting a tracked expense', async () => {
        // Given reports which are not valid creation destinations but remain usable by the submit flow
        await addNonReimbursableExpense(outstandingReport);
        await addNonReimbursableExpense(otherOutstandingReport);

        // When submitting rather than creating the expense
        renderReportRow({action: CONST.IOU.ACTION.SUBMIT});

        // Then creation-only restrictions do not change the existing field
        await waitFor(() => {
            expect(mockReportName).toBe(outstandingReport.reportName);
            expect(mockIsInteractive).toBe(true);
        });
    });

    it('uses the newest open report when the chat has no default', async () => {
        // Given two eligible open reports and a chat without an iouReportID
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, {iouReportID: null});
        await waitForBatchedUpdates();

        // When creation falls back to an outstanding report
        renderReportRow();

        // Then the label names the same newest open report the builder will use
        await waitFor(() => {
            expect(mockReportName).toBe(otherOutstandingReport.reportName);
            expect(mockIsInteractive).toBe(true);
        });
    });
});

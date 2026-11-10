import {render, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import type ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ReportField from '@components/MoneyRequestConfirmationList/sections/ReportField';

import Navigation from '@libs/Navigation/Navigation';

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
type ExpenseFieldDropdownMockProps = Pick<ComponentProps<typeof ExpenseFieldDropdown>, 'shouldOpenInDropdown' | 'renderDropdown' | 'isInteractive'>;
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    return ({shouldOpenInDropdown, renderDropdown, isInteractive}: ExpenseFieldDropdownMockProps) => {
        const {MODAL} = jest.requireActual<{default: typeof CONST}>('@src/CONST').default;
        mockShouldOpenInDropdown = shouldOpenInDropdown;
        mockIsInteractive = isInteractive;
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

const outstandingReport: Report = {reportID: 'report1', reportName: 'Expense Report', policyID: POLICY_ID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID: CHAT_REPORT_ID};
const otherOutstandingReport: Report = {reportID: 'report2', reportName: 'Other Expense Report', policyID: POLICY_ID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID: CHAT_REPORT_ID};

type RenderParams = {
    action?: IOUAction;
    isPerDiemRequest?: boolean;
    reportID?: string;
};

const renderReportRow = ({action = CONST.IOU.ACTION.CREATE, isPerDiemRequest = false, reportID = CHAT_REPORT_ID}: RenderParams = {}) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={reportID}
            action={action}
            iouType={CONST.IOU.TYPE.SUBMIT}
            isPolicyExpenseChat
        >
            <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                <ReportField
                    selectedParticipants={[{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}]}
                    iouType={CONST.IOU.TYPE.SUBMIT}
                    reportID={reportID}
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
    });

    beforeEach(async () => {
        mockIsAnchoredDropdownsBetaEnabled = true;
        // Two reports the expense could go on, which leaves a choice to make whether or not the list offers a new report.
        mockOutstandingReports = [outstandingReport, otherOutstandingReport];
        mockShouldOpenInDropdown = undefined;
        mockIsInteractive = undefined;
        mockDropdownTransactionID = undefined;
        jest.mocked(Navigation.navigate).mockClear();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: '',
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
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

    it('opens the list when the workspace has no report open yet', async () => {
        // Given a workspace with no outstanding report, where the expense would go on a new report
        mockOutstandingReports = [];

        // When the form renders the report row
        renderReportRow();

        // Then the row still opens its list, which offers a new report or no report at all
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
        expect(mockIsInteractive).toBe(true);
    });

    it('opens the list when the workspace has only the report the expense goes on', async () => {
        // Given an expense created in a workspace chat whose only outstanding report is the one it will go on
        mockOutstandingReports = [outstandingReport];

        // When the form renders the report row
        renderReportRow();

        // Then the row still opens its list, which offers a new report next to that one
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
        expect(mockIsInteractive).toBe(true);
    });

    it('opens the full-page selector when the workspace has only one report and the beta is off', async () => {
        // Given a workspace with one outstanding report, for a user without the anchored dropdowns beta
        mockIsAnchoredDropdownsBetaEnabled = false;
        mockOutstandingReports = [outstandingReport];

        // When the form renders the report row
        renderReportRow();

        // Then the row can be changed, so the user can pick a new report instead, through the full-page selector
        await waitFor(() => {
            expect(mockIsInteractive).toBe(true);
        });
        expect(mockShouldOpenInDropdown).toBe(false);
    });

    it('keeps the row locked when editing an expense on the only report it can go on', async () => {
        // Given a saved expense on a report, in a workspace with no other outstanding report. The list can hide its new
        // report option for an edit, which would leave nothing but the report the expense is already on
        mockOutstandingReports = [outstandingReport];
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${outstandingReport.reportID}`, {
            ...outstandingReport,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {reportID: outstandingReport.reportID});
        await waitForBatchedUpdates();

        // When the form renders the report row to edit it
        renderReportRow({action: CONST.IOU.ACTION.EDIT});

        // Then the row reads as a locked field rather than opening a list with nothing to choose
        await waitFor(() => {
            expect(mockIsInteractive).toBe(false);
        });
    });

    it('keeps the row editable when editing an unreported expense with one report to move it to', async () => {
        // Given a saved expense that is on no report, which always keeps the new report option, and one outstanding report
        mockOutstandingReports = [outstandingReport];
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
        await waitForBatchedUpdates();

        // When the form renders the report row to edit it
        renderReportRow({action: CONST.IOU.ACTION.EDIT});

        // Then the row can be changed, as that report and a new one are both real choices
        await waitFor(() => {
            expect(mockIsInteractive).toBe(true);
        });
    });

    it('keeps the row locked when the expense is created inside a report', async () => {
        // Given an expense created from inside an expense report, whose destination is already that report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${outstandingReport.reportID}`, outstandingReport);
        await waitForBatchedUpdates();

        // When the form renders the report row
        renderReportRow({reportID: outstandingReport.reportID});

        // Then the row reads as a locked field and opens nothing
        await waitFor(() => {
            expect(mockIsInteractive).toBe(false);
        });
        expect(mockShouldOpenInDropdown).toBe(false);
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
});

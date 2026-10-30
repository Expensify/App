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
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
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
type ExpenseFieldDropdownMockProps = Pick<ComponentProps<typeof ExpenseFieldDropdown>, 'shouldOpenInDropdown' | 'renderDropdown'>;
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    return ({shouldOpenInDropdown, renderDropdown}: ExpenseFieldDropdownMockProps) => {
        const {MODAL} = jest.requireActual<{default: typeof CONST}>('@src/CONST').default;
        mockShouldOpenInDropdown = shouldOpenInDropdown;
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
                    selectedParticipants={[{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}]}
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
    });

    beforeEach(async () => {
        mockIsAnchoredDropdownsBetaEnabled = true;
        // A new expense's row only offers a choice once there is more than one report it could go on.
        mockOutstandingReports = [outstandingReport, otherOutstandingReport];
        mockShouldOpenInDropdown = undefined;
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
});

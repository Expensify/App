import {render} from '@testing-library/react-native';

import ReportPreviewActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewActionButton';

import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

import React from 'react';

// The dispatcher owns no props and reads its decision from context, so drive the decision through the mocked context
// slice and stub each branch component with a spy so we can assert which one gets rendered for a given action.
const mockActionState: {reportPreviewAction: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>; connectedIntegration: ConnectionName | undefined} = {
    reportPreviewAction: CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW,
    connectedIntegration: undefined,
};

const mockSubmit = jest.fn();
const mockApprove = jest.fn();
const mockPay = jest.fn();
const mockExport = jest.fn();
const mockAddExpense = jest.fn();
const mockView = jest.fn();

jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext', () => ({
    __esModule: true,
    useReportPreviewActionState: () => mockActionState,
    useReportPreviewUIState: () => ({buttonMaxWidth: {}}),
    useReportPreviewActions: () => ({openReportFromPreview: jest.fn()}),
}));

jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/SubmitActionButton', () => ({
    __esModule: true,
    default: () => {
        mockSubmit();
        return null;
    },
}));
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/ApproveActionButton', () => ({
    __esModule: true,
    default: () => {
        mockApprove();
        return null;
    },
}));
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/PayActionButton', () => ({
    __esModule: true,
    default: () => {
        mockPay();
        return null;
    },
}));
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/ExportActionButton', () => ({
    __esModule: true,
    default: () => {
        mockExport();
        return null;
    },
}));
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/AddExpenseActionButton', () => ({
    __esModule: true,
    default: () => {
        mockAddExpense();
        return null;
    },
}));
jest.mock('@components/ButtonComposed', () => {
    function MockButton() {
        mockView();
        return null;
    }

    MockButton.Text = () => null;

    return {
        __esModule: true,
        default: MockButton,
    };
});

jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({flex1: {}})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));

describe('ReportPreviewActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
        mockActionState.connectedIntegration = undefined;
    });

    it.each([
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT, mockSubmit],
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE, mockApprove],
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY, mockPay],
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE, mockAddExpense],
        [CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW, mockView],
    ])('renders the matching button when the decision is %s', (action, expectedButton) => {
        mockActionState.reportPreviewAction = action;
        render(<ReportPreviewActionButton />);
        expect(expectedButton).toHaveBeenCalled();
    });

    it('renders ExportActionButton for EXPORT_TO_ACCOUNTING when an integration is connected', () => {
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
        mockActionState.connectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;
        render(<ReportPreviewActionButton />);
        expect(mockExport).toHaveBeenCalled();
        expect(mockView).not.toHaveBeenCalled();
    });

    it('falls back to the View button for EXPORT_TO_ACCOUNTING when no integration is connected', () => {
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
        mockActionState.connectedIntegration = undefined;
        render(<ReportPreviewActionButton />);
        expect(mockView).toHaveBeenCalled();
        expect(mockExport).not.toHaveBeenCalled();
    });
});

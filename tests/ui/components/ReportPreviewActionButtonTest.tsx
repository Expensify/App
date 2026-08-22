import {render} from '@testing-library/react-native';

import ReportPreviewActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewActionButton';

import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

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

// These must stay distinct objects: with `{}` values the style assertions below pass even when the styles are missing.
const mockStyles = {flex1: {flex: 1}, flexRow: {flexDirection: 'row'}, gap2: {gap: 8}};
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => mockStyles}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));

function flattenContainerStyle(rendered: ReturnType<typeof render>): unknown[] {
    const container = rendered.UNSAFE_getAllByType(View).at(0);
    const style: unknown = container?.props.style;
    return Array.isArray(style) ? style : [style];
}

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
        // View renders alongside the primary action, not instead of it.
        expect(mockView).toHaveBeenCalled();
    });

    it('falls back to the View button for EXPORT_TO_ACCOUNTING when no integration is connected', () => {
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
        mockActionState.connectedIntegration = undefined;
        render(<ReportPreviewActionButton />);
        expect(mockView).toHaveBeenCalled();
        expect(mockExport).not.toHaveBeenCalled();
    });
    it('lays the primary action and View out in a row, and keeps a lone View full-width', () => {
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
        const withPrimary = render(<ReportPreviewActionButton />);
        expect(flattenContainerStyle(withPrimary)).toEqual(expect.arrayContaining([mockStyles.flexRow, mockStyles.gap2]));
        withPrimary.unmount();

        jest.clearAllMocks();
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
        const viewOnly = render(<ReportPreviewActionButton />);
        expect(flattenContainerStyle(viewOnly)).not.toEqual(expect.arrayContaining([mockStyles.flexRow]));
    });
});

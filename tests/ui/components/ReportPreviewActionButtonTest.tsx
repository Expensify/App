import {render, screen} from '@testing-library/react-native';

import ReportPreviewActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewActionButton';

import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View as MockView} from 'react-native';

const mockActionState: {reportPreviewAction: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>; connectedIntegration: ConnectionName | undefined} = {
    reportPreviewAction: CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW,
    connectedIntegration: undefined,
};
const mockAnimationState = {isApprovedAnimationRunning: false};

const mockSubmit = jest.fn();
const mockApprove = jest.fn();
const mockPay = jest.fn();
const mockExport = jest.fn();
const mockAddExpense = jest.fn();
const mockView = jest.fn();
const mockOpenReport = jest.fn();

jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext', () => ({
    __esModule: true,
    useReportPreviewActionState: () => mockActionState,
    useReportPreviewAnimationState: () => mockAnimationState,
    useReportPreviewUIState: () => ({buttonMaxWidth: {}}),
    useReportPreviewActions: () => ({openReportFromPreview: mockOpenReport}),
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
        return <MockView testID="approve-button" />;
    },
}));
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/PayActionButton', () => ({
    __esModule: true,
    default: () => {
        mockPay();
        return <MockView testID="pay-button" />;
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
jest.mock('@components/Button', () => {
    function MockButton(props: unknown) {
        mockView(props);
        return <MockView testID="view-button" />;
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
    const container = rendered.UNSAFE_getAllByType(MockView).at(0);
    const style: unknown = container?.props.style;
    return Array.isArray(style) ? style : [style];
}

function getButtonOrder() {
    return screen.getAllByTestId(/^(approve|pay|view)-button$/).map((button) => String(button.props.testID));
}

describe('ReportPreviewActionButton', () => {
    it('keeps Approve and promotes View without changing its navigation', () => {
        // Given an approvable report with visible violations
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE_WITH_VIOLATIONS;

        // When its preview buttons render
        render(<ReportPreviewActionButton />);

        // Then both actions remain, with View styled as primary and using the existing navigation handler
        expect(mockApprove).toHaveBeenCalled();
        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({variant: CONST.BUTTON_VARIANT.SUCCESS, onPress: mockOpenReport}));
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
        mockActionState.connectedIntegration = undefined;
        mockAnimationState.isApprovedAnimationRunning = false;
    });

    it.each([CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE, CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE_WITH_VIOLATIONS])(
        'keeps approval feedback in its original position until the animation finishes for %s',
        (action) => {
            // Given an approvable report, whose violations determine which side Approve occupies
            mockActionState.reportPreviewAction = action;
            const rendered = render(<ReportPreviewActionButton />);
            const isViewFirst = action === CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE_WITH_VIOLATIONS;
            expect(getButtonOrder()).toEqual(isViewFirst ? ['view-button', 'approve-button'] : ['approve-button', 'view-button']);

            // When approval uses the Pay component for loading and completion feedback
            mockAnimationState.isApprovedAnimationRunning = true;
            mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
            rendered.rerender(<ReportPreviewActionButton />);

            // Then the feedback stays where Approve was, and View keeps its styling and navigation
            expect(getButtonOrder()).toEqual(isViewFirst ? ['view-button', 'pay-button'] : ['pay-button', 'view-button']);
            expect(mockView).toHaveBeenLastCalledWith(expect.objectContaining({variant: isViewFirst ? CONST.BUTTON_VARIANT.SUCCESS : undefined, onPress: mockOpenReport}));

            // When the animation finishes and payment is available
            mockAnimationState.isApprovedAnimationRunning = false;
            rendered.rerender(<ReportPreviewActionButton />);

            // Then Pay takes the primary position and View returns to its normal styling
            expect(getButtonOrder()).toEqual(['pay-button', 'view-button']);
            expect(mockView).toHaveBeenLastCalledWith(expect.objectContaining({variant: undefined}));
        },
    );

    it('preserves the secondary approval position after a failed approval and on retry', () => {
        // Given a report with violations whose approval is awaiting backend validation
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE_WITH_VIOLATIONS;
        const rendered = render(<ReportPreviewActionButton />);
        mockAnimationState.isApprovedAnimationRunning = true;
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
        rendered.rerender(<ReportPreviewActionButton />);

        // When validation fails and the report can be approved again
        mockAnimationState.isApprovedAnimationRunning = false;
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE_WITH_VIOLATIONS;
        rendered.rerender(<ReportPreviewActionButton />);

        // Then Approve returns to its original secondary position
        expect(getButtonOrder()).toEqual(['view-button', 'approve-button']);

        // When the user retries approval
        mockAnimationState.isApprovedAnimationRunning = true;
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
        rendered.rerender(<ReportPreviewActionButton />);

        // Then loading still occupies the secondary position
        expect(getButtonOrder()).toEqual(['view-button', 'pay-button']);
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

    it('splits the row evenly between the primary action and View', () => {
        // Given a report whose preview shows a primary action next to View
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;

        // When the buttons render
        const rendered = render(<ReportPreviewActionButton />);

        // Then both children of the row flex equally, so neither button hugs its label while the other fills the rest
        const primaryWrapperStyle: unknown = rendered.UNSAFE_getAllByType(MockView).at(1)?.props.style;
        expect(primaryWrapperStyle).toEqual(expect.arrayContaining([mockStyles.flex1]));
        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({style: mockStyles.flex1}));
    });

    it('does not flex a lone View button', () => {
        // Given a report whose preview shows only View
        mockActionState.reportPreviewAction = CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;

        // When the buttons render
        render(<ReportPreviewActionButton />);

        // Then View keeps its content height, because flex: 1 in the column layout collapses it on iOS Safari and cuts off the button
        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({style: undefined}));
    });
});

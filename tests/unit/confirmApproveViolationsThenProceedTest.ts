import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';
import confirmApproveViolationsThenProceed from '@libs/Violations/confirmApproveViolationsThenProceed';
import type getReportApproveViolationSummary from '@libs/Violations/getReportApproveViolationSummary';

import CONST from '@src/CONST';

import createMock from '../utils/createMock';

jest.mock('@components/Modal/Global/ModalContext', () => ({ModalActions: {CONFIRM: 'CONFIRM', CLOSE: 'CLOSE'}}));
jest.mock('@components/SubmitViolationsList', () => 'SubmitViolationsList');
jest.mock('@libs/showConfirmModalAfterMoreMenuDismiss', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Violations/getReportSubmitViolationSummary', () => ({
    hasAnySubmitViolation: (summary: {otherViolations: Map<string, unknown>}) => summary.otherViolations.size > 0,
    buildSubmitViolationBullets: () => ['Receipt required'],
}));

type ApprovalSummary = ReturnType<typeof getReportApproveViolationSummary>;

const translate = createMock<LocaleContextProps['translate']>(jest.fn((...args: [string, ...unknown[]]) => args[0]));
const dateFnsLocale = createMock<LocaleContextProps['dateFnsLocale']>({});

function createSummary(hasViolations = false): ApprovalSummary {
    const otherViolations: ApprovalSummary['otherViolations'] = new Map();
    if (hasViolations) {
        otherViolations.set(CONST.VIOLATIONS.RECEIPT_REQUIRED, {name: CONST.VIOLATIONS.RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.WARNING});
    }

    return {
        hasRejectedExpense: false,
        hasReportBeenRejected: false,
        hasPendingCardMatch: false,
        hasMissingMerchant: false,
        hasMissingAmount: false,
        otherViolations,
    };
}

function confirmApproval(summary: ApprovalSummary, onProceed: () => void) {
    confirmApproveViolationsThenProceed({summary, onProceed, showConfirmModal: jest.fn(), translate, dateFnsLocale, convertToDisplayString: jest.fn()});
}

describe('confirmApproveViolationsThenProceed', () => {
    beforeEach(() => jest.clearAllMocks());

    it('approves immediately without a warning for a clean report', () => {
        // Given a report without locally available violations
        const onProceed = jest.fn();

        // When approval is requested
        confirmApproval(createSummary(), onProceed);

        // Then no confirmation is necessary
        expect(onProceed).toHaveBeenCalledWith();
        expect(showConfirmModalAfterMoreMenuDismiss).not.toHaveBeenCalled();
    });

    it('waits for explicit confirmation and leaves the violations unchanged', async () => {
        // Given a report with a policy violation and a modal the approver has not answered
        const summary = createSummary(true);
        const onProceed = jest.fn();
        let confirm: (result: {action: typeof ModalActions.CONFIRM}) => void = () => {};
        jest.mocked(showConfirmModalAfterMoreMenuDismiss).mockReturnValue(
            new Promise((resolve) => {
                confirm = resolve;
            }),
        );

        // When the approver requests approval, then confirms the warning
        confirmApproval(summary, onProceed);
        expect(onProceed).not.toHaveBeenCalled();
        expect(showConfirmModalAfterMoreMenuDismiss).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                title: 'iou.confirmApproveReportViolations.title',
                subtitle: 'iou.confirmApproveReportViolations.description',
                confirmText: 'common.approveAnyway',
                cancelText: 'common.cancel',
            }),
        );
        confirm({action: ModalActions.CONFIRM});
        await Promise.resolve();

        // Then approval proceeds once without a flag to resolve violations
        expect(onProceed).toHaveBeenCalledTimes(1);
        expect(onProceed).toHaveBeenCalledWith();
        expect(summary.otherViolations.size).toBe(1);
    });

    it('does not approve when the warning is cancelled or dismissed', async () => {
        // Given a report with violations and a cancelled modal
        const onProceed = jest.fn();
        jest.mocked(showConfirmModalAfterMoreMenuDismiss).mockResolvedValue(createMock({action: ModalActions.CLOSE}));

        // When approval is requested
        confirmApproval(createSummary(true), onProceed);
        await Promise.resolve();

        // Then no approval side effects run
        expect(onProceed).not.toHaveBeenCalled();
    });
});

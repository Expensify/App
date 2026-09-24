import {renderHook} from '@testing-library/react-native';

import SubmitViolationsList from '@components/SubmitViolationsList';

import useConfirmSubmitReportViolations from '@hooks/useConfirmSubmitReportViolations';

import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import createMock from '../../utils/createMock';
import {getShowConfirmModalOption, mockShowConfirmModal, MockModalActions, resetMockConfirmModal, resolveShowConfirmModal} from '../../utils/mockUseConfirmModal';

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string, ...params: unknown[]) => {
        const suffix = params.filter((param) => param !== undefined && param !== '').join(',');
        return suffix.length > 0 ? `${key}(${suffix})` : key;
    },
    dateFnsLocale: {},
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayString: (amount: number, currency: string) => `${amount} ${currency}`}),
}));

jest.mock('@userActions/Transaction', () => ({
    markPendingRTERTransactionsAsCash: jest.fn(),
}));

const mockMarkPendingRTERTransactionsAsCash = jest.mocked(markPendingRTERTransactionsAsCash);

function violationsKey(transactionID: string) {
    return `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
}

function violation(name: TransactionViolation['name'], data?: TransactionViolation['data']): TransactionViolation {
    return createMock<TransactionViolation>({name, data});
}

const transaction1 = createMock<Transaction>({transactionID: '1'});
const reportActions: ReportAction[] = [];
const report: OnyxEntry<Report> = undefined;

/** The hook passes a <SubmitViolationsList violations={...} /> element as `prompt`; this reads its violations prop back out. */
function getPromptViolations(): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- reading the JSX element's props back out for assertions
    const prompt = getShowConfirmModalOption('prompt') as unknown as {props: {violations: string[]}};
    return prompt.props.violations;
}

describe('useConfirmSubmitReportViolations', () => {
    beforeEach(() => {
        resetMockConfirmModal();
        mockMarkPendingRTERTransactionsAsCash.mockClear();
    });

    it('calls onProceed immediately with no flag when there are no violations', () => {
        // Given a report with no transaction violations at all
        const {result} = renderHook(() => useConfirmSubmitReportViolations([transaction1], {}, reportActions, report));
        const onProceed = jest.fn();

        // When the caller tries to submit
        result.current(onProceed);

        // Then submission must proceed straight away without ever showing the modal, since there's nothing to warn the user about
        expect(onProceed).toHaveBeenCalledWith();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('shows the confirm modal with the rejected-expense bullet and does not call onProceed until confirmed', () => {
        // Given a report whose only transaction has a rejected-expense violation
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result} = renderHook(() => useConfirmSubmitReportViolations([transaction1], violationsCollection, reportActions, report));
        const onProceed = jest.fn();

        // When the caller tries to submit
        result.current(onProceed);

        // Then the modal must open with the rejected-expense bullet, and submission must stay blocked until the user answers,
        // otherwise a rejected expense could be submitted silently without the user ever seeing the warning
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getPromptViolations()).toContain('iou.confirmSubmitReportViolations.rejectedExpense');
        expect(onProceed).not.toHaveBeenCalled();
    });

    it('does not call onProceed or mark-as-cash when the user cancels', async () => {
        // Given a report with a pending RTER card-match violation
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.RTER, {pendingPattern: true})]};
        const {result} = renderHook(() => useConfirmSubmitReportViolations([transaction1], violationsCollection, reportActions, report));
        const onProceed = jest.fn();

        // When the user cancels the confirmation modal
        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CLOSE});
        await Promise.resolve();

        // Then the report must stay a draft: neither the submit callback nor the cash-marking side effect may run,
        // so Cancel really means "make no changes" as promised by the modal copy
        expect(onProceed).not.toHaveBeenCalled();
        expect(mockMarkPendingRTERTransactionsAsCash).not.toHaveBeenCalled();
    });

    it('marks pending RTER transactions as cash and calls onProceed(true) when the user confirms', async () => {
        // Given a report with a pending RTER card-match violation
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.RTER, {pendingPattern: true})]};
        const {result} = renderHook(() => useConfirmSubmitReportViolations([transaction1], violationsCollection, reportActions, report));
        const onProceed = jest.fn();

        // When the user confirms "Submit anyway"
        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await Promise.resolve();

        // Then the pending card-match must be resolved as cash before submitting, and the caller must be told to set
        // shouldResolveAcknowledgedViolations so the backend knows this violation was explicitly acknowledged
        expect(mockMarkPendingRTERTransactionsAsCash).toHaveBeenCalledWith([transaction1], violationsCollection, reportActions);
        expect(onProceed).toHaveBeenCalledWith(true);
    });

    it('calls onProceed(false) without marking as cash when the only violation is an "other" violation', async () => {
        // Given a report whose only violation is an "other" one (e.g. over category limit), which is informational only
        // and has nothing for the backend to resolve, unlike rejected-expense or pending-card-match
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT)]};
        const {result} = renderHook(() => useConfirmSubmitReportViolations([transaction1], violationsCollection, reportActions, report));
        const onProceed = jest.fn();

        // When the user confirms "Submit anyway"
        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await Promise.resolve();

        // Then shouldResolveAcknowledgedViolations must stay false even though the user confirmed the modal, and cash-marking
        // must not run, since there's no rejected-expense or pending-card-match violation for the backend to resolve
        expect(mockMarkPendingRTERTransactionsAsCash).not.toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalledWith(false);
    });

    it('renders the violations with SubmitViolationsList (dot icon, not a unicode bullet) and keeps the danger button variant', () => {
        // Given a report whose only transaction has a rejected-expense violation
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result} = renderHook(() => useConfirmSubmitReportViolations([transaction1], violationsCollection, reportActions, report));
        const onProceed = jest.fn();

        // When the caller tries to submit
        result.current(onProceed);

        // Then the modal's prompt must be the SubmitViolationsList component (design asked for a real dot icon
        // instead of a unicode bullet character), and the confirm button must stay red, since design decided a
        // green button didn't make sense for an action being discouraged
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- reading the JSX element's type back out for assertions
        const prompt = getShowConfirmModalOption('prompt') as unknown as {type: unknown};
        expect(prompt.type).toBe(SubmitViolationsList);
        expect(getShowConfirmModalOption('buttonVariant')).toBe(CONST.BUTTON_VARIANT.DANGER);
    });

    it('shows the report-rejected bullet (not the rejected-expense one) when the whole report was rejected to the submitter', () => {
        // Given a report with no transaction-level violations, but rejected in full (nextStep.messageKey is
        // REJECTED_REPORT, report reopened to OPEN) - a report-level state, not a TransactionViolations entry
        const rejectedReport = createMock<Report>({
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT},
        });
        const {result} = renderHook(() => useConfirmSubmitReportViolations([transaction1], {}, reportActions, rejectedReport));
        const onProceed = jest.fn();

        // When the caller tries to submit
        result.current(onProceed);

        // Then the modal must open with the dedicated report-rejected bullet, not the transaction-level rejected-expense
        // one, since the PO asked for these to read differently: a report-level rejection has no per-expense
        // "Mark as resolved" action, so "Rejected expense not marked as resolved" would be misleading here
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        const violations = getPromptViolations();
        expect(violations).toContain('iou.confirmSubmitReportViolations.reportRejected');
        expect(violations).not.toContain('iou.confirmSubmitReportViolations.rejectedExpense');
    });
});

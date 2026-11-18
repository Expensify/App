import {renderHook, waitFor} from '@testing-library/react-native';

import SubmitViolationsList from '@components/SubmitViolationsList';

import useConfirmSubmitReportViolations from '@hooks/useConfirmSubmitReportViolations';
import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';

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

jest.mock('@libs/showConfirmModalAfterMoreMenuDismiss');

// Run TransitionTracker callbacks immediately, there is no real modal transition to wait for in a unit test.
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: ({callback}: {callback: () => void | Promise<void>}) => {
            callback();
            return {cancel: jest.fn()};
        },
        startTransition: jest.fn(),
        endTransition: jest.fn(),
    },
}));

// Every test passes transactions/violationsCollection explicitly (the hook's override path), so the internal
// useTransactionsAndViolationsForReport call never needs real data - just a safe default so its
// useAllReportsTransactionsAndViolations() call (which throws outside a real OnyxListItemProvider) doesn't blow up.
jest.mock('@components/OnyxListItemProvider', () => ({
    useAllReportsTransactionsAndViolations: jest.fn(() => undefined),
}));

function violationsKey(transactionID: string) {
    return `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
}

function violation(name: TransactionViolation['name'], data?: TransactionViolation['data']): TransactionViolation {
    return createMock<TransactionViolation>({name, data});
}

const transaction1 = createMock<Transaction>({transactionID: '1'});
// A reportID with no corresponding report in Onyx, used by every test below that doesn't need real report data.
const NO_REPORT_ID = '1';

/** The hook passes a <SubmitViolationsList violations={...} /> element as `prompt`; this reads its violations prop back out. */
function getPromptViolations(): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- reading the JSX element's props back out for assertions
    const prompt = getShowConfirmModalOption('prompt') as unknown as {props: {violations: string[]}};
    return prompt.props.violations;
}

describe('useConfirmSubmitReportViolations', () => {
    beforeEach(() => {
        resetMockConfirmModal();
        jest.mocked(showConfirmModalAfterMoreMenuDismiss).mockClear();
        jest.mocked(showConfirmModalAfterMoreMenuDismiss).mockImplementation((showConfirmModal, options) => showConfirmModal(options));
    });

    it.each([false, true])('ignores repeated presses while confirmation is pending (popover: %s)', async (shouldDeferForPopoverDismiss) => {
        // Given a violation that requires confirmation before submitting
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result, rerender} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        const onProceed = jest.fn();
        const onDuplicateProceed = jest.fn();

        // When two presses occur before the modal settles, even across a render
        const confirmation = result.current(onProceed, {shouldDeferForPopoverDismiss});
        rerender({});
        await result.current(onDuplicateProceed, {shouldDeferForPopoverDismiss});

        // Then only one modal opens and only the first submission proceeds after confirmation
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(showConfirmModalAfterMoreMenuDismiss).toHaveBeenCalledTimes(shouldDeferForPopoverDismiss ? 1 : 0);
        expect(onProceed).not.toHaveBeenCalled();
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await confirmation;
        expect(onProceed).toHaveBeenCalledTimes(1);
        expect(onDuplicateProceed).not.toHaveBeenCalled();
    });

    it.each([MockModalActions.CLOSE, MockModalActions.CONFIRM])('allows another confirmation after the modal settles with %s', async (action) => {
        // Given a report whose violations require a confirmation modal
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        const onProceed = jest.fn();

        // When the user closes or confirms the first modal and later submits again
        const confirmation = result.current(onProceed);
        resolveShowConfirmModal({action});
        await confirmation;
        const nextConfirmation = result.current(onProceed);

        // Then the guard is released and a fresh modal can open
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        expect(showConfirmModalAfterMoreMenuDismiss).not.toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalledTimes(action === MockModalActions.CONFIRM ? 1 : 0);
        resolveShowConfirmModal({action: MockModalActions.CLOSE});
        await nextConfirmation;
    });

    it('preserves menu dismissal deferral unless a direct button overrides it', async () => {
        // Given a menu caller that opts into deferral by default
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({
                reportID: NO_REPORT_ID,
                report: undefined,
                policy: undefined,
                transactions: [transaction1],
                violationsCollection,
                shouldDeferForPopoverDismiss: true,
            }),
        );

        // When the menu action submits, then a direct button submits after cancellation
        const confirmation = result.current(jest.fn());
        expect(showConfirmModalAfterMoreMenuDismiss).toHaveBeenCalledTimes(1);
        resolveShowConfirmModal({action: MockModalActions.CLOSE});
        await confirmation;
        const directConfirmation = result.current(jest.fn(), {shouldDeferForPopoverDismiss: false});

        // Then the second modal opens immediately without scheduling another menu wait
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        expect(showConfirmModalAfterMoreMenuDismiss).toHaveBeenCalledTimes(1);
        resolveShowConfirmModal({action: MockModalActions.CLOSE});
        await directConfirmation;
    });

    it('releases the guard when opening the modal fails', async () => {
        // Given a modal presenter that fails on its first invocation
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        mockShowConfirmModal.mockRejectedValueOnce(new Error('Modal presentation failed'));
        const onProceed = jest.fn();

        // When presentation fails and the user retries
        await expect(result.current(onProceed)).rejects.toThrow('Modal presentation failed');
        const confirmation = result.current(onProceed);

        // Then retrying opens a new modal instead of leaving submission permanently blocked
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        expect(onProceed).not.toHaveBeenCalled();
        resolveShowConfirmModal({action: MockModalActions.CLOSE});
        await confirmation;
    });

    it('calls onProceed immediately with no flag when there are no violations', () => {
        // Given a report with no transaction violations at all
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection: {}}),
        );
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
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        const onProceed = jest.fn();

        // When the caller tries to submit
        result.current(onProceed);

        // Then the modal must open with the rejected-expense bullet, and submission must stay blocked until the user answers,
        // otherwise a rejected expense could be submitted silently without the user ever seeing the warning
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getPromptViolations()).toContain('iou.confirmSubmitReportViolations.rejectedExpense');
        expect(onProceed).not.toHaveBeenCalled();
    });

    it('does not call onProceed when the user cancels a rejected-expense violation', async () => {
        // Given a report whose only transaction has a rejected-expense violation
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        const onProceed = jest.fn();

        // When the user cancels the confirmation modal
        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CLOSE});

        // Then the report must stay a draft: Cancel must mean "make no changes" as promised by the modal copy, with
        // no exception for any violation type
        await waitFor(() => {
            expect(onProceed).not.toHaveBeenCalled();
        });
    });

    it('does not call onProceed when the user cancels and a pending card match is the only violation', async () => {
        // Given a report whose only violation is a pending card match. Cancel always just returns the user to the
        // report so they can resolve it manually (e.g. via the separate explicit "Mark as cash" action) - there is
        // no exception that lets a pending-card-match-only summary proceed on cancel
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.RTER, {pendingPattern: true})]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        const onProceed = jest.fn();

        // When the user cancels the confirmation modal
        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CLOSE});

        // Then submission must not proceed
        await waitFor(() => {
            expect(onProceed).not.toHaveBeenCalled();
        });
    });

    it('calls onProceed(false) without resolving when the user confirms and a pending card match is the only violation', async () => {
        // Given a report whose only violation is a pending card match
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.RTER, {pendingPattern: true})]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        const onProceed = jest.fn();

        // When the user confirms "Submit anyway"
        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then submission must proceed, but shouldResolveAcknowledgedViolations must stay false: only the
        // rejected-expense violation is ever resolved this way, so the pending card match must stay on the expense
        // for the approver to review. The confirm-modal promise resolves through an extra microtask hop
        // (showConfirmModalAfterMoreMenuDismiss's own internal .then), so wait for it rather than assuming a single
        // `await Promise.resolve()` tick is enough.
        await waitFor(() => {
            expect(onProceed).toHaveBeenCalledWith(false);
        });
    });

    it('calls onProceed(true) when the user confirms a rejected-expense violation', async () => {
        // Given a report whose only transaction has a rejected-expense violation
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        const onProceed = jest.fn();

        // When the user confirms "Submit anyway"
        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then shouldResolveAcknowledgedViolations must be true: acknowledging the modal is enough to confirm the
        // submitter saw the rejection, so the backend can resolve it
        await waitFor(() => {
            expect(onProceed).toHaveBeenCalledWith(true);
        });
    });

    it('calls onProceed(false) when the only violation is an "other" violation', async () => {
        // Given a report whose only violation is an "other" one (e.g. over category limit), which is informational only
        // and has nothing for the backend to resolve, unlike a rejected expense
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.OVER_CATEGORY_LIMIT)]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
        const onProceed = jest.fn();

        // When the user confirms "Submit anyway"
        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then shouldResolveAcknowledgedViolations must stay false even though the user confirmed the modal, since
        // there's no rejected-expense violation for the backend to resolve
        await waitFor(() => {
            expect(onProceed).toHaveBeenCalledWith(false);
        });
    });

    it('renders the violations with SubmitViolationsList (dot icon, not a unicode bullet) and keeps the danger button variant', () => {
        // Given a report whose only transaction has a rejected-expense violation
        const violationsCollection = {[violationsKey('1')]: [violation(CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)]};
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({reportID: NO_REPORT_ID, report: undefined, policy: undefined, transactions: [transaction1], violationsCollection}),
        );
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

    describe('when a missing merchant is the only problem', () => {
        const expenseReport = createMock<Report>({type: CONST.REPORT.TYPE.EXPENSE});
        const transactionWithoutMerchant = createMock<Transaction>({transactionID: '1', merchant: CONST.TRANSACTION.DEFAULT_MERCHANT});

        it('opens the modal with the missing merchant bullet instead of submitting immediately', () => {
            // Given an expense report with no violations and one expense without a merchant
            const {result} = renderHook(() =>
                useConfirmSubmitReportViolations({
                    reportID: expenseReport.reportID,
                    report: expenseReport,
                    policy: undefined,
                    transactions: [transactionWithoutMerchant],
                    violationsCollection: {},
                }),
            );
            const onProceed = jest.fn();

            // When the caller tries to submit
            result.current(onProceed);

            // Then the user must see the warning first, since the server accepts the submission without one
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(getPromptViolations()).toEqual(['iou.missingMerchant']);
            expect(onProceed).not.toHaveBeenCalled();
        });

        it('calls onProceed(false) when the user confirms', async () => {
            // Given the same report, where the warning is only informational
            const {result} = renderHook(() =>
                useConfirmSubmitReportViolations({
                    reportID: expenseReport.reportID,
                    report: expenseReport,
                    policy: undefined,
                    transactions: [transactionWithoutMerchant],
                    violationsCollection: {},
                }),
            );
            const onProceed = jest.fn();

            // When the user confirms "Submit anyway"
            result.current(onProceed);
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});

            // Then the submission must go ahead without asking the backend to resolve anything
            await waitFor(() => {
                expect(onProceed).toHaveBeenCalledWith(false);
            });
        });
    });

    it('shows the report-rejected bullet (not the rejected-expense one) when the whole report was rejected to the submitter', () => {
        // Given a report with no transaction-level violations, but rejected in full (nextStep.messageKey is
        // REJECTED_REPORT, report reopened to OPEN) - a report-level state, not a TransactionViolations entry
        const rejectedReport = createMock<Report>({
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            nextStep: {icon: CONST.NEXT_STEP.ICONS.HOURGLASS, messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT},
        });
        const {result} = renderHook(() =>
            useConfirmSubmitReportViolations({
                reportID: rejectedReport.reportID,
                report: rejectedReport,
                policy: undefined,
                transactions: [transaction1],
                violationsCollection: {},
            }),
        );
        const onProceed = jest.fn();

        // When the caller tries to submit
        result.current(onProceed);

        // Then the modal must open with the dedicated report-rejected bullet, not the transaction-level rejected-expense
        // one: a report-level rejection has no per-expense "Mark as resolved" action, so "Rejected expense not
        // marked as resolved" would be misleading here
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        const violations = getPromptViolations();
        expect(violations).toContain('iou.confirmSubmitReportViolations.reportRejected');
        expect(violations).not.toContain('iou.confirmSubmitReportViolations.rejectedExpense');
    });
});

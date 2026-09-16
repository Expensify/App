import {renderHook} from '@testing-library/react-native';

import useConfirmViolationsAndProceed from '@hooks/useConfirmViolationsAndProceed';

import type {SubmitViolationsSummary} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockShowConfirmModal, MockModalActions, resetMockConfirmModal, resolveShowConfirmModal} from '../../utils/mockUseConfirmModal';

// Referencing imported helpers directly inside jest.mock() factories is disallowed by Jest's hoisting rules (only
// "mock"-prefixed bindings are exempt), so each factory re-requires the util via jest.requireActual instead —
// mirrors the pattern in tests/unit/hooks/useFilesValidation.test.ts.
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});
jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: jest.fn(() => ({translate: (key: string) => key, dateFnsLocale: undefined}))}));
jest.mock('@hooks/useCurrencyList', () => ({__esModule: true, useCurrencyListActions: jest.fn(() => ({convertToDisplayString: (amount: number) => `$${amount}`}))}));

const EMPTY_SUMMARY: SubmitViolationsSummary = {
    hasSevenDayHoldViolation: false,
    hasGenericPendingRTERViolation: false,
    hasRejectedViolation: false,
    hasReportBeenRejected: false,
    otherViolations: [],
};

describe('useConfirmViolationsAndProceed', () => {
    beforeEach(() => {
        resetMockConfirmModal();
    });

    it('proceeds immediately without showing a modal when there are no violations', () => {
        const onProceed = jest.fn();
        const onMarkPendingRTERTransactionsAsCash = jest.fn();
        const onMarkRejectedTransactionsAsResolved = jest.fn();
        const {result} = renderHook(() => useConfirmViolationsAndProceed(EMPTY_SUMMARY, onMarkPendingRTERTransactionsAsCash, onMarkRejectedTransactionsAsResolved));

        result.current(onProceed);

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalledTimes(1);
        expect(onMarkPendingRTERTransactionsAsCash).not.toHaveBeenCalled();
        expect(onMarkRejectedTransactionsAsResolved).not.toHaveBeenCalled();
    });

    it('shows the modal and runs the mark-as-cash side effect when confirmed for a seven-day-hold violation', async () => {
        const onProceed = jest.fn();
        const onMarkPendingRTERTransactionsAsCash = jest.fn();
        const onMarkRejectedTransactionsAsResolved = jest.fn();
        const summary: SubmitViolationsSummary = {...EMPTY_SUMMARY, hasSevenDayHoldViolation: true};
        const {result} = renderHook(() => useConfirmViolationsAndProceed(summary, onMarkPendingRTERTransactionsAsCash, onMarkRejectedTransactionsAsResolved));

        result.current(onProceed);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('prompt')).toMatchObject({props: {items: expect.arrayContaining([expect.stringContaining('iou.sevenDayHoldSubmitDescription')])}});

        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await Promise.resolve();

        expect(onMarkPendingRTERTransactionsAsCash).toHaveBeenCalledTimes(1);
        expect(onMarkRejectedTransactionsAsResolved).not.toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalledTimes(1);
    });

    it('shows the modal and runs the mark-as-cash side effect when confirmed for a generic (non-seven-day) pending RTER violation', async () => {
        // This case predates #101213 (the pre-existing "receipt pending match with card" flow) and must keep its
        // existing mark-as-cash resolution on confirm, same as the seven-day-hold case above.
        const onProceed = jest.fn();
        const onMarkPendingRTERTransactionsAsCash = jest.fn();
        const onMarkRejectedTransactionsAsResolved = jest.fn();
        const summary: SubmitViolationsSummary = {...EMPTY_SUMMARY, hasGenericPendingRTERViolation: true};
        const {result} = renderHook(() => useConfirmViolationsAndProceed(summary, onMarkPendingRTERTransactionsAsCash, onMarkRejectedTransactionsAsResolved));

        result.current(onProceed);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('prompt')).toMatchObject({props: {items: expect.arrayContaining([expect.stringContaining('iou.pendingMatchSubmitDescription')])}});

        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await Promise.resolve();

        expect(onMarkPendingRTERTransactionsAsCash).toHaveBeenCalledTimes(1);
        expect(onMarkRejectedTransactionsAsResolved).not.toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalledTimes(1);
    });

    it('shows the modal and runs the mark-as-resolved side effect when confirmed for a rejected violation', async () => {
        const onProceed = jest.fn();
        const onMarkPendingRTERTransactionsAsCash = jest.fn();
        const onMarkRejectedTransactionsAsResolved = jest.fn();
        const summary: SubmitViolationsSummary = {...EMPTY_SUMMARY, hasRejectedViolation: true};
        const {result} = renderHook(() => useConfirmViolationsAndProceed(summary, onMarkPendingRTERTransactionsAsCash, onMarkRejectedTransactionsAsResolved));

        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await Promise.resolve();

        expect(onMarkPendingRTERTransactionsAsCash).not.toHaveBeenCalled();
        expect(onMarkRejectedTransactionsAsResolved).toHaveBeenCalledTimes(1);
        expect(onProceed).toHaveBeenCalledTimes(1);
    });

    it('runs both side effects when both a seven-day-hold and a rejected violation are present', async () => {
        const onProceed = jest.fn();
        const onMarkPendingRTERTransactionsAsCash = jest.fn();
        const onMarkRejectedTransactionsAsResolved = jest.fn();
        const summary: SubmitViolationsSummary = {...EMPTY_SUMMARY, hasSevenDayHoldViolation: true, hasRejectedViolation: true};
        const {result} = renderHook(() => useConfirmViolationsAndProceed(summary, onMarkPendingRTERTransactionsAsCash, onMarkRejectedTransactionsAsResolved));

        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await Promise.resolve();

        expect(onMarkPendingRTERTransactionsAsCash).toHaveBeenCalledTimes(1);
        expect(onMarkRejectedTransactionsAsResolved).toHaveBeenCalledTimes(1);
        expect(onProceed).toHaveBeenCalledTimes(1);
    });

    it('runs no side effect and does not proceed when the user cancels', async () => {
        const onProceed = jest.fn();
        const onMarkPendingRTERTransactionsAsCash = jest.fn();
        const onMarkRejectedTransactionsAsResolved = jest.fn();
        const summary: SubmitViolationsSummary = {...EMPTY_SUMMARY, hasRejectedViolation: true};
        const {result} = renderHook(() => useConfirmViolationsAndProceed(summary, onMarkPendingRTERTransactionsAsCash, onMarkRejectedTransactionsAsResolved));

        result.current(onProceed);
        resolveShowConfirmModal({action: MockModalActions.CLOSE});
        await Promise.resolve();

        expect(onMarkRejectedTransactionsAsResolved).not.toHaveBeenCalled();
        expect(onProceed).not.toHaveBeenCalled();
    });

    it('shows an "other" violation via getViolationTranslation with no side effect on confirm', async () => {
        const onProceed = jest.fn();
        const onMarkPendingRTERTransactionsAsCash = jest.fn();
        const onMarkRejectedTransactionsAsResolved = jest.fn();
        const summary: SubmitViolationsSummary = {...EMPTY_SUMMARY, otherViolations: [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}]};
        const {result} = renderHook(() => useConfirmViolationsAndProceed(summary, onMarkPendingRTERTransactionsAsCash, onMarkRejectedTransactionsAsResolved));

        result.current(onProceed);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('prompt')).toMatchObject({props: {items: expect.arrayContaining([expect.stringContaining('violations.missingCategory')])}});

        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await Promise.resolve();

        expect(onMarkPendingRTERTransactionsAsCash).not.toHaveBeenCalled();
        expect(onMarkRejectedTransactionsAsResolved).not.toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalledTimes(1);
    });

    it('shows the modal for a whole-report rejection with no side effect on confirm', async () => {
        const onProceed = jest.fn();
        const onMarkPendingRTERTransactionsAsCash = jest.fn();
        const onMarkRejectedTransactionsAsResolved = jest.fn();
        const summary: SubmitViolationsSummary = {...EMPTY_SUMMARY, hasReportBeenRejected: true};
        const {result} = renderHook(() => useConfirmViolationsAndProceed(summary, onMarkPendingRTERTransactionsAsCash, onMarkRejectedTransactionsAsResolved));

        result.current(onProceed);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('prompt')).toMatchObject({props: {items: expect.arrayContaining([expect.stringContaining('iou.rejectedExpenseSubmitDescription')])}});

        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await Promise.resolve();

        expect(onMarkPendingRTERTransactionsAsCash).not.toHaveBeenCalled();
        expect(onMarkRejectedTransactionsAsResolved).not.toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalledTimes(1);
    });
});

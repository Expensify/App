import {act, renderHook} from '@testing-library/react-native';

import useParticipantSubmission from '@hooks/useParticipantSubmission';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

import createRandomTransaction from '../utils/collections/transaction';

// The confirmation page reaches the RHP by replacing the recipient picker, so goToNextStep must pass an explicit
// backTo (the active route) for it to be able to navigate back to the picker. These tests lock that in by asserting
// on the route handed to Navigation.goBack, which is invisible in the rest of CI and only surfaces as the back
// button doing the wrong thing (the deploy blocker in #99145).

const ACTIVE_ROUTE = 'r/R2/participants';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: jest.fn(),
        getActiveRoute: jest.fn(() => ACTIVE_ROUTE),
        // Run the queued navigation synchronously so the assertions can read goBack right after goToNextStep.
        setNavigationActionToMicrotaskQueue: (callback: () => void) => callback(),
    },
}));

jest.mock('@src/utils/keyboard', () => ({
    __esModule: true,
    default: {
        dismissKeyboardAndExecute: (callback: () => void) => callback(),
    },
}));

// Stub out the hook's data dependencies so the test can render it in isolation and focus purely on the backTo logic.
jest.mock('@hooks/useCommuterExclusionGuard', () => ({__esModule: true, default: () => () => false}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2})}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1, email: 'test@example.com', localCurrencyCode: 'USD'})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useMappedPolicies', () => ({__esModule: true, default: () => [{}]}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@hooks/useOptimisticDraftTransactions', () => ({__esModule: true, default: () => [[]]}));
jest.mock('@hooks/usePersonalPolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/usePolicyForMovingExpenses', () => ({__esModule: true, default: () => ({policyForMovingExpenses: undefined})}));
jest.mock('@hooks/useTransactionsByID', () => ({__esModule: true, default: () => [[]]}));

const mockGoBack = jest.mocked(Navigation.goBack);

const RECIPIENT: Participant = {accountID: 2, login: 'recipient@example.com', reportID: 'R2'};

function renderSubmission(overrides: Partial<Parameters<typeof useParticipantSubmission>[0]> = {}) {
    // Positive amount keeps the negative-expense-on-self-DM guard from short-circuiting goToNextStep.
    const initialTransaction = {...createRandomTransaction(1), transactionID: 'T1', amount: 100, currency: CONST.CURRENCY.USD, reportID: 'R1'};
    return renderHook(() =>
        useParticipantSubmission({
            reportID: 'R1',
            initialTransactionID: 'T1',
            initialTransaction,
            participants: [RECIPIENT],
            iouType: CONST.IOU.TYPE.SUBMIT,
            action: CONST.IOU.ACTION.SUBMIT,
            isSplitRequest: false,
            isMovingTransactionFromTrackExpense: true,
            isFocused: true,
            ...overrides,
        }),
    );
}

describe('useParticipantSubmission goToNextStep backTo', () => {
    beforeEach(() => {
        mockGoBack.mockClear();
    });

    it('passes an explicit backTo for the "Send to someone" flow (SUBMIT moving a tracked expense)', () => {
        const {result} = renderSubmission();

        act(() => {
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(expect.stringContaining('backTo='), expect.anything());
    });

    it('does not pass backTo for a global-create SUBMIT (not moving a tracked expense)', () => {
        const {result} = renderSubmission({isMovingTransactionFromTrackExpense: false});

        act(() => {
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(expect.not.stringContaining('backTo='), expect.anything());
    });
});

import {renderHook} from '@testing-library/react-native';

import {isTransactionStillPending3DSReview, isTransactionStillPendingFraudReview} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import useNavigateToForcedTransactionReview from '@libs/Navigation/useNavigateToForcedTransactionReview';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => () => ({
    deviceVerificationType: undefined,
    doesDeviceSupportAuthenticationMethod: () => Promise.resolve(false),
}));

jest.mock('@hooks/useRootNavigationState', () => (selector: (state: undefined) => unknown) => selector(undefined));

jest.mock('@libs/actions/MultifactorAuthentication', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/MultifactorAuthentication'),
    isTransactionStillPending3DSReview: jest.fn(() => Promise.resolve(true)),
    isTransactionStillPendingFraudReview: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn(), isNavigationReady: () => Promise.resolve()},
    isMFAFlowScreen: () => false,
}));

const THREE_DS_TRANSACTION_ID = '1';
const FRAUD_TRANSACTION_ID = '2';

describe('useNavigateToForcedTransactionReview', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('opens the fraud review when the pending 3DS review cannot be completed on this device', async () => {
        // Given a pending 3DS review this device has no allowed authentication method for, and a pending fraud review
        await Onyx.merge(ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW, {
            [THREE_DS_TRANSACTION_ID]: {
                transactionID: THREE_DS_TRANSACTION_ID,
                created: '2026-11-09 10:00:00',
                expires: '2099-01-01 00:00:00',
                lastFourPAN: '1234',
                amount: 4000,
                currency: 'USD',
                merchant: 'Coffee shop',
            },
        });
        await Onyx.merge(ONYXKEYS.TRANSACTIONS_PENDING_FRAUD_REVIEW, {
            [FRAUD_TRANSACTION_ID]: {transactionID: FRAUD_TRANSACTION_ID, created: '2026-11-09 10:00:00', lastFourPAN: '1234', amount: 4000, currency: 'USD', merchant: 'Amazon', cardID: 1},
        });

        // When the forced review handler runs
        renderHook(() => useNavigateToForcedTransactionReview());
        await waitForBatchedUpdates();

        // Then the user lands on the fraud review, since the 3DS one could not be finished here anyway
        expect(isTransactionStillPending3DSReview).not.toHaveBeenCalled();
        expect(isTransactionStillPendingFraudReview).toHaveBeenCalledWith(FRAUD_TRANSACTION_ID);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MULTIFACTOR_AUTHENTICATION_REVIEW_TRANSACTION.getRoute(FRAUD_TRANSACTION_ID));
    });

    it('does not open any review when the fraud review was already answered on another device', async () => {
        // Given a pending fraud review that the server reports as already reviewed
        jest.mocked(isTransactionStillPendingFraudReview).mockResolvedValueOnce(false);
        await Onyx.merge(ONYXKEYS.TRANSACTIONS_PENDING_FRAUD_REVIEW, {
            [FRAUD_TRANSACTION_ID]: {transactionID: FRAUD_TRANSACTION_ID, created: '2026-11-09 10:00:00', lastFourPAN: '1234', amount: 4000, currency: 'USD', merchant: 'Amazon', cardID: 1},
        });

        // When the forced review handler runs
        renderHook(() => useNavigateToForcedTransactionReview());
        await waitForBatchedUpdates();

        // Then the user stays where they are instead of seeing a review they can no longer answer
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});

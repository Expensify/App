/** Wallet scenario completion owns refresh/navigation, never the initialization promise. */
import AddToDigitalWallet from '@components/MultifactorAuthentication/config/scenarios/AddToDigitalWallet';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import {handleAddCardToWallet} from '@libs/Wallet';
import WalletProvisioningError from '@libs/Wallet/WalletProvisioningError';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import createMock from '../../../../../utils/createMock';

jest.mock('@libs/Wallet', () => ({handleAddCardToWallet: jest.fn()}));
jest.mock('@libs/actions/PaymentMethods', () => ({getPaymentMethods: jest.fn()}));
jest.mock('@libs/getPlatform', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));

const params = {
    card: createMock<Card>({cardID: 123}),
    cardHolderName: 'Jane',
    cardDescription: 'Card',
    signedChallenge: {rawId: 'key', type: 'public-key' as const, response: {authenticatorData: 'auth', clientDataJSON: 'client', signature: 'signature'}},
    authenticationMethod: 'BIOMETRIC_FACE' as const,
};

describe('AddToDigitalWallet scenario', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each(['success', 'canceled', 'error'] as const)('normalizes native %s without exposing provisioning data', async (status) => {
        // Given authorization has produced a structured signed challenge.
        jest.mocked(handleAddCardToWallet).mockResolvedValue(status);
        const context = {signal: new AbortController().signal};

        // When the scenario action owns the native wallet handoff.
        const response = await AddToDigitalWallet.action(params, context);

        // Then only actual native success is successful, with no secrets in the response body.
        expect(handleAddCardToWallet).toHaveBeenCalledWith(params.card, 'Jane', 'Card', {
            authentication: {signedChallenge: params.signedChallenge, authenticationMethod: 'BIOMETRIC_FACE'},
            signal: context.signal,
        });
        expect(response.httpStatusCode).toBe(status === 'success' ? 200 : undefined);
        const expectedReasons = {
            success: undefined,
            canceled: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED,
            error: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNRECOGNIZED,
        };
        expect(response.reason).toBe(expectedReasons[status]);
        expect(response).not.toHaveProperty('body');
        expect(getPaymentMethods).not.toHaveBeenCalled();
    });

    it('preserves normalized server failures', async () => {
        // Given provisioning failed before the native bridge rejected.
        const failure = {httpStatusCode: 403, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.UNRECOGNIZED, message: 'Rejected'};
        jest.mocked(handleAddCardToWallet).mockRejectedValue(new WalletProvisioningError(failure));

        // When the scenario catches that failure.
        const response = await AddToDigitalWallet.action(params, undefined);

        // Then the server status and reason survive without an invented successful status.
        expect(response).toEqual(failure);
    });

    it('sanitizes native exceptions instead of exposing card data', async () => {
        // Given native code rejected with a potentially sensitive error.
        jest.mocked(handleAddCardToWallet).mockRejectedValue(new Error('sensitive native data'));

        // When the scenario normalizes it.
        const response = await AddToDigitalWallet.action(params, undefined);

        // Then the existing generic failure screen receives only a local reason.
        expect(response).toEqual({httpStatusCode: undefined, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, message: undefined});
    });

    it.each([CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID])('refreshes successful %s tokenization and skips the MFA success screen', async (platform) => {
        // Given native tokenization actually succeeded.
        jest.mocked(getPlatform).mockReturnValue(platform);

        // When the provider invokes the scenario completion callback.
        const result = await AddToDigitalWallet.callback(true, {httpStatusCode: 200}, params);

        // Then refresh occurs once and only iOS retains the added-card navigation.
        expect(getPaymentMethods).toHaveBeenCalledTimes(1);
        if (platform === CONST.PLATFORM.IOS) {
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_CARD_ADDED_TO_WALLET.getRoute('123'));
        } else {
            expect(Navigation.navigate).not.toHaveBeenCalled();
        }
        expect(result).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN);
    });

    it('keeps existing failure UX without refresh or added-card navigation', async () => {
        // Given authentication, provisioning, or native tokenization failed or was canceled.
        // When the provider completes the failed scenario.
        const result = await AddToDigitalWallet.callback(false, {httpStatusCode: undefined}, params);
        // Then the shared failure UI owns dismissal/retry and success side effects never run.
        expect(result).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});

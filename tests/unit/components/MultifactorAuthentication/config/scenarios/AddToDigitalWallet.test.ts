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
            canceled: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_CANCELED,
            error: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED,
        };
        expect(response.reason).toBe(expectedReasons[status]);
        expect(response).not.toHaveProperty('body');
        expect(getPaymentMethods).not.toHaveBeenCalled();
    });

    it('maps server failures to the wallet reason and keeps status and backend details', async () => {
        // Given provisioning failed before the native bridge rejected.
        const message = '404 Could not find an active card for user trying to create a digital wallet';
        const failure = {httpStatusCode: 404, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.UNRECOGNIZED, message};
        jest.mocked(handleAddCardToWallet).mockRejectedValue(new WalletProvisioningError(failure));

        // When the scenario catches that failure.
        const response = await AddToDigitalWallet.action(params, undefined);

        // Then the wallet reason replaces the backend one and the message keeps the backend detail.
        expect(response).toEqual({...failure, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED, message: `${failure.reason} - ${message}`});
    });

    it.each(['401 Authentication required', '401 Unauthorized', '401 Registration required', '401 Invalid signed challenge', '400 Invalid authentication method'])(
        'keeps a rejected signed challenge (%s) as an MFA failure',
        async (message) => {
            // Given the backend rejected the signed challenge before looking at the card.
            const failure = {httpStatusCode: Number(message.slice(0, 3)), reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.UNRECOGNIZED, message};
            jest.mocked(handleAddCardToWallet).mockRejectedValue(new WalletProvisioningError(failure));

            // When the scenario catches that failure.
            const response = await AddToDigitalWallet.action(params, undefined);

            // Then the response is kept as is, so the default MFA failure screen shows instead of the wallet one.
            expect(response).toEqual(failure);
        },
    );

    it('sanitizes native exceptions instead of exposing card data', async () => {
        // Given native code rejected with a potentially sensitive error.
        jest.mocked(handleAddCardToWallet).mockRejectedValue(new Error('sensitive native data'));

        // When the scenario normalizes it.
        const response = await AddToDigitalWallet.action(params, undefined);

        // Then only the wallet reason is exposed.
        expect(response).toEqual({httpStatusCode: undefined, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED, message: undefined});
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

    it('shows the outcome screen for a wallet failure without refresh or navigation', async () => {
        // Given authentication succeeded but native tokenization failed.
        // When the provider completes the failed scenario.
        const result = await AddToDigitalWallet.callback(
            false,
            {httpStatusCode: undefined, message: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED},
            params,
        );

        // Then the failure screen is shown and success side effects never run.
        expect(result).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('skips the outcome screen when the user dismisses the wallet sheet', async () => {
        // Given the user dismissed the wallet sheet after authentication succeeded.
        // When the provider completes the canceled scenario.
        const result = await AddToDigitalWallet.callback(
            false,
            {httpStatusCode: undefined, message: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_CANCELED},
            params,
        );

        // Then no failure screen is shown.
        expect(result).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN);
        expect(getPaymentMethods).not.toHaveBeenCalled();
    });

    it('shows the outcome screen when the user cancels the MFA flow', async () => {
        // Given the user closed the MFA modal, which the provider reports as a generic cancel.
        // When the provider completes the canceled scenario.
        const result = await AddToDigitalWallet.callback(false, {httpStatusCode: undefined, message: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED}, params);

        // Then the default failure screen is shown like in other scenarios.
        expect(result).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
        expect(getPaymentMethods).not.toHaveBeenCalled();
    });

    it('keeps the generic cancel reason when the flow was aborted', async () => {
        // Given the MFA flow was aborted while the wallet sheet reported a cancel.
        jest.mocked(handleAddCardToWallet).mockResolvedValue('canceled');
        const controller = new AbortController();
        controller.abort();

        // When the scenario action normalizes the result.
        const response = await AddToDigitalWallet.action(params, {signal: controller.signal});

        // Then the flow cancel reason wins over the wallet sheet one.
        expect(response.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED);
    });

    it('only overrides the failure screen for the wallet reason', () => {
        // Given a failure that happened before the wallet handoff.
        // When looking up a screen override for an MFA-stage reason.
        const overrides: Record<string, unknown> = AddToDigitalWallet.failureScreens;

        // Then only the wallet reason is overridden.
        expect(Object.keys(overrides)).toEqual([CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED]);
    });
});

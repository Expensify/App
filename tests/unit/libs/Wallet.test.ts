import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import type * as WalletModule from '@libs/Wallet';
import {handleAddCardToWallet as addAndroid} from '@libs/Wallet/index.android';
import {handleAddCardToWallet as addIOS} from '@libs/Wallet/index.ios';
import type {WalletAuthentication} from '@libs/Wallet/types';

import CONST from '@src/CONST';
import type {Card, ProvisioningCardData} from '@src/types/onyx';

/** Exercises the actual platform handoffs with the API and native bridge mocked. */
import {addCardToAppleWallet, addCardToGoogleWallet, getSecureWalletInfo} from '@expensify/react-native-wallet';

import pkg from '../../../package.json';
import createMock from '../../utils/createMock';

jest.mock('@libs/API');
jest.mock('@expensify/react-native-wallet', () => ({
    addCardToAppleWallet: jest.fn(),
    addCardToGoogleWallet: jest.fn(),
    getSecureWalletInfo: jest.fn(),
    checkWalletAvailability: jest.fn(),
    getCardStatusByIdentifier: jest.fn(),
    getCardStatusBySuffix: jest.fn(),
}));

type APIResponse = NonNullable<Awaited<ReturnType<typeof API.makeRequestWithSideEffects>>>;
const card = createMock<Card>({cardID: 123, lastFourPAN: '1234'});
const authentication: WalletAuthentication = {
    signedChallenge: {rawId: 'key', type: 'public-key', response: {authenticatorData: 'auth', clientDataJSON: 'client', signature: 'signature'}},
    authenticationMethod: 'BIOMETRIC_FACE',
};
const iosPayload = {encryptedPassData: 'encrypted', activationData: 'activation', ephemeralPublicKey: 'ephemeral'};
const androidPayload: Pick<ProvisioningCardData, 'network' | 'opaquePaymentCard' | 'lastDigits' | 'userAddress'> = {
    network: 'VISA',
    opaquePaymentCard: 'opaque',
    lastDigits: '1234',
    userAddress: {
        name: 'Jane',
        address1: 'Street',
        address2: '',
        state: 'London',
        city: 'London',
        country: 'GB',
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Match the backend field so the test exercises its native address mapping.
        postal_code: 'SW1A',
        phone: '+441234',
    },
};
const mockRequest = jest.mocked(API.makeRequestWithSideEffects);
const mockApple = jest.mocked(addCardToAppleWallet);
const mockGoogle = jest.mocked(addCardToGoogleWallet);
const {handleAddCardToWallet: addWeb} = jest.requireActual<typeof WalletModule>('@libs/Wallet/index.ts');

describe('Wallet platform provisioning', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(getSecureWalletInfo).mockResolvedValue({deviceID: 'device', walletAccountID: 'wallet'});
        mockGoogle.mockResolvedValue('success');
        mockApple.mockImplementation(async (_data, issuer) => {
            await issuer('nonce', 'nonce-signature', ['certificate']);
            return 'success';
        });
    });

    it('waits for the iOS issuer callback and sends signed fields only on CreateDigitalWallet', async () => {
        // Given a native sheet that has not yet supplied its nonce and certificates.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode: 200, ...iosPayload}));
        let issuerCallback: Parameters<typeof addCardToAppleWallet>[1] | undefined;
        let finish: ((status: 'success') => void) | undefined;
        mockApple.mockImplementation((_data, issuer) => {
            issuerCallback = issuer;
            return new Promise((resolve) => {
                finish = resolve;
            });
        });
        const pending = addIOS(card, 'Jane', 'Card', {authentication});
        expect(mockRequest).not.toHaveBeenCalled();

        // When Apple supplies the actual issuer inputs after presentation.
        const payload = await issuerCallback?.('actual-nonce', 'actual-signature', ['actual-certificate']);
        finish?.('success');
        await expect(pending).resolves.toBe('success');

        // Then serialization happens once at the API boundary, without UI metadata.
        expect(payload).toEqual(iosPayload);
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.CREATE_DIGITAL_WALLET, {
            platform: 'ios',
            appVersion: pkg.version,
            cardID: 123,
            nonce: 'actual-nonce',
            nonceSignature: 'actual-signature',
            certificates: JSON.stringify({certificates: ['actual-certificate']}),
            signedChallenge: JSON.stringify(authentication.signedChallenge),
            authenticationMethod: authentication.authenticationMethod,
        });
    });

    it('maps signed Android provisioning into Google native card data', async () => {
        // Given a successful provisioning response and secure device/wallet identifiers.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode: 200, ...androidPayload}));

        // When signed provisioning completes before tokenization.
        await expect(addAndroid(card, 'Jane', 'Card', {authentication})).resolves.toBe('success');

        // Then only API fields are sent and the existing native address mapping is retained.
        expect(mockRequest).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.CREATE_DIGITAL_WALLET, {
            platform: 'android',
            appVersion: pkg.version,
            cardID: 123,
            deviceID: 'device',
            walletAccountID: 'wallet',
            signedChallenge: JSON.stringify(authentication.signedChallenge),
            authenticationMethod: authentication.authenticationMethod,
        });
        expect(mockGoogle).toHaveBeenCalledWith({
            network: 'VISA',
            opaquePaymentCard: 'opaque',
            cardHolderName: 'Jane',
            lastDigits: '1234',
            userAddress: {
                name: 'Jane',
                addressOne: 'Street',
                addressTwo: '',
                administrativeArea: 'London',
                locality: 'London',
                countryCode: 'GB',
                postalCode: 'SW1A',
                phoneNumber: '+441234',
            },
        });
    });

    it.each(['ios', 'android'] as const)('keeps %s legacy provisioning unsigned', async (platform) => {
        // Given a legacy card with no authentication context.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode: 200, ...(platform === 'ios' ? iosPayload : androidPayload)}));

        // When its existing platform helper is used.
        await (platform === 'ios' ? addIOS : addAndroid)(card, 'Jane', 'Card');

        // Then the command stays unchanged and no authentication fields are introduced.
        expect(mockRequest).toHaveBeenCalledTimes(1);
        const params = mockRequest.mock.calls.at(0)?.[1];
        expect(params).not.toHaveProperty('signedChallenge');
        expect(params).not.toHaveProperty('authenticationMethod');
    });

    it('accepts a UK address without a province or second address line', async () => {
        // Given a valid UK address where the province is empty and address2 is absent.
        const payload = {...androidPayload, userAddress: {...androidPayload.userAddress, address2: undefined, state: ''}};
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode: 200, ...payload}));
        // When signed provisioning maps that address.
        await expect(addAndroid(card, 'Jane', 'Card', {authentication})).resolves.toBe('success');
        // Then optional address content is preserved without rejecting valid UK data.
        expect(mockGoogle).toHaveBeenCalledWith(expect.objectContaining({userAddress: expect.objectContaining({administrativeArea: '', addressTwo: undefined})}));
    });

    it.each([400, 500])('preserves API %s when the iOS bridge subsequently rejects', async (jsonCode) => {
        // Given an issuer rejection followed by a separate native rejection.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode, message: 'Rejected'}));
        mockApple.mockImplementation(async (_data, issuer) => {
            await issuer('nonce', 'signature', []).catch(() => undefined);
            throw new Error('native rejection');
        });

        // When the signed issuer request fails.
        const pending = addIOS(card, 'Jane', 'Card', {authentication});

        // Then the original normalized API failure survives and no unsigned retry occurs.
        await expect(pending).rejects.toMatchObject({
            response: {
                httpStatusCode: jsonCode,
                reason: jsonCode === 400 ? CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.UNRECOGNIZED : CONST.MULTIFACTOR_AUTHENTICATION.REASON.SERVER_ERRORS.UNRECOGNIZED,
            },
        });
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it.each(['ios', 'android'] as const)('rejects malformed %s success data without native continuation', async (platform) => {
        // Given a successful HTTP result without usable provisioning fields.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode: 200}));

        // When secure provisioning runs.
        const pending = (platform === 'ios' ? addIOS : addAndroid)(card, 'Jane', 'Card', {authentication});

        // Then the helper fails closed instead of handing empty data to the native SDK.
        await expect(pending).rejects.toMatchObject({response: {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNRECOGNIZED}});
        expect(mockGoogle).not.toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['ios', {...iosPayload, activationData: ''}],
        ['ios', {...iosPayload, encryptedPassData: 123}],
        ['android', {...androidPayload, opaquePaymentCard: ''}],
        ['android', {...androidPayload, userAddress: {...androidPayload.userAddress, state: undefined}}],
    ] as const)('validates individual %s provisioning fields', async (platform, payload) => {
        // Given an otherwise successful response has one unusable field.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode: 200, ...payload}));
        // When the signed platform helper validates native input.
        const pending = (platform === 'ios' ? addIOS : addAndroid)(card, 'Jane', 'Card', {authentication});
        // Then malformed data is rejected before native continuation.
        await expect(pending).rejects.toMatchObject({response: {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNRECOGNIZED}});
        expect(mockGoogle).not.toHaveBeenCalled();
    });

    it.each(['ios', 'android'] as const)('rejects transport failures on %s without unsigned fallback', async (platform) => {
        // Given a rejected provisioning transport.
        mockRequest.mockRejectedValue(new Error('transport failed'));

        // When the signed platform helper requests card data.
        const pending = (platform === 'ios' ? addIOS : addAndroid)(card, 'Jane', 'Card', {authentication});

        // Then a normalized failure replaces raw transport details.
        await expect(pending).rejects.toMatchObject({response: {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE}});
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(mockGoogle).not.toHaveBeenCalled();
    });

    it('rejects a second iOS issuer callback instead of replaying a signed challenge', async () => {
        // Given Apple's Try Again reenters the issuer callback after successful provisioning.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode: 200, ...iosPayload}));
        mockApple.mockImplementation(async (_data, issuer) => {
            await issuer('first', 'signature', []);
            await issuer('second', 'signature', []);
            return 'success';
        });

        // When the native wrapper attempts to reuse that authentication.
        const pending = addIOS(card, 'Jane', 'Card', {authentication});

        // Then a fresh user authentication is required and no second request is sent.
        await expect(pending).rejects.toThrow('fresh authentication');
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it.each([400, 500])('does not continue Google tokenization after API %s', async (jsonCode) => {
        // Given the server rejects signed Android provisioning.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode}));
        // When the Android helper receives that response.
        const pending = addAndroid(card, 'Jane', 'Card', {authentication});
        // Then no native tokenization or unsigned retry occurs.
        await expect(pending).rejects.toMatchObject({response: {httpStatusCode: jsonCode}});
        expect(mockGoogle).not.toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('does not accept an iOS success status without an issuer request', async () => {
        // Given native code unexpectedly reports success without issuer provisioning.
        mockApple.mockResolvedValue('success');
        // When the secure helper receives that status.
        const pending = addIOS(card, 'Jane', 'Card', {authentication});
        // Then no successful MFA result can be synthesized without provisioning.
        await expect(pending).rejects.toThrow('without provisioning');
        expect(mockRequest).not.toHaveBeenCalled();
    });

    it('does not return issuer data after an in-flight iOS attempt is aborted', async () => {
        // Given cancellation occurs while the issuer request is pending.
        const controller = new AbortController();
        mockRequest.mockImplementation(async () => {
            controller.abort();
            return createMock<APIResponse>({jsonCode: 200, ...iosPayload});
        });
        // When the response arrives for the abandoned attempt.
        const pending = addIOS(card, 'Jane', 'Card', {authentication, signal: controller.signal});
        // Then the callback rejects rather than passing issuer data to native code (dismissal remains deferred).
        await expect(pending).rejects.toThrow('canceled');
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it.each(['canceled', 'error'] as const)('preserves native Google %s after valid provisioning', async (status) => {
        // Given provisioning succeeds but Google tokenization does not.
        mockRequest.mockResolvedValue(createMock<APIResponse>({jsonCode: 200, ...androidPayload}));
        mockGoogle.mockResolvedValue(status);
        // When the native Google flow completes.
        const result = await addAndroid(card, 'Jane', 'Card', {authentication});
        // Then tokenization status, not the earlier API success, controls the scenario outcome.
        expect(result).toBe(status);
    });

    it.each(['canceled', 'error'] as const)('preserves native iOS %s without inventing provisioning success', async (status) => {
        // Given native presentation ends before any issuer callback.
        mockApple.mockResolvedValue(status);

        // When the signed helper runs.
        const result = await addIOS(card, 'Jane', 'Card', {authentication});

        // Then native cancellation and failure stay distinct and no API request occurs.
        expect(result).toBe(status);
        expect(mockRequest).not.toHaveBeenCalled();
    });

    it('does not start Google tokenization after cancellation while provisioning is pending', async () => {
        // Given a request that will finish after the MFA attempt is canceled.
        const controller = new AbortController();
        mockRequest.mockImplementation(async () => {
            controller.abort();
            return createMock<APIResponse>({jsonCode: 200, ...androidPayload});
        });

        // When cancellation occurs before native continuation.
        const result = await addAndroid(card, 'Jane', 'Card', {authentication, signal: controller.signal});

        // Then Google receives no card data from the abandoned attempt.
        expect(result).toBe('canceled');
        expect(mockGoogle).not.toHaveBeenCalled();
    });

    it('keeps the web fallback inert', async () => {
        // Given a non-native platform.
        // When a helper is called defensively with signed authentication.
        const pending = addWeb(card, 'Jane', 'Card', {authentication});
        // Then it cannot provision or invoke either native wallet.
        await expect(pending).rejects.toThrow('not supported');
        expect(mockRequest).not.toHaveBeenCalled();
        expect(mockApple).not.toHaveBeenCalled();
        expect(mockGoogle).not.toHaveBeenCalled();
    });
});

/** Composed providers exercise signing, enrollment, and explicit wallet action cancellation. */
import {act, render, waitFor} from '@testing-library/react-native';

import type {AuthorizeResult, RegisterResult} from '@components/MultifactorAuthentication/biometrics/shared/types';
import {useMultifactorAuthenticationActions} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationActionsContext';
import MultifactorAuthenticationContextProviders from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationMainContext';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationStateContext';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import {requestValidateCodeAction} from '@libs/actions/User';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import {handleAddCardToWallet} from '@libs/Wallet';
import {handleAddCardToWallet as addAndroid} from '@libs/Wallet/index.android';

import {authorizeTransaction, denyTransaction, registerAuthenticationKey} from '@userActions/MultifactorAuthentication';

import CONST from '@src/CONST';
import type {Card, ProvisioningCardData} from '@src/types/onyx';

import type {TokenizationStatus} from '@expensify/react-native-wallet';

import {addCardToGoogleWallet, getSecureWalletInfo} from '@expensify/react-native-wallet';
import React, {useEffect} from 'react';

import createMock from '../../../utils/createMock';

const signedResult: AuthorizeResult = {
    success: true,
    signedChallenge: {rawId: 'key', type: 'public-key', response: {authenticatorData: 'auth', clientDataJSON: 'client', signature: 'signature'}},
    authenticationMethod: {name: 'Face ID', marqetaValue: 'BIOMETRIC_FACE'},
};
let mockIsOffline = false;
const mockBiometrics = {
    deviceVerificationType: 'BIOMETRICS_HSM',
    serverKnownCredentialIDs: ['key'],
    doesDeviceSupportAuthenticationMethod: jest.fn().mockResolvedValue(true),
    areLocalCredentialsKnownToServer: jest.fn().mockResolvedValue(true),
    authorize: jest.fn(async (_params: unknown, callback: (result: AuthorizeResult) => Promise<void>) => callback(signedResult)),
    register: jest.fn(async (callback: (result: RegisterResult) => Promise<void>) =>
        callback({
            success: true,
            keyInfo: {rawId: 'key', type: 'public-key', response: {clientDataJSON: 'client', attestationObject: 'attestation'}},
        }),
    ),
};

jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => ({__esModule: true, default: () => mockBiometrics}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 123})}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: mockIsOffline})}));
jest.mock('@libs/Wallet', () => ({handleAddCardToWallet: jest.fn()}));
jest.mock('@libs/API');
jest.mock('@expensify/react-native-wallet', () => ({addCardToGoogleWallet: jest.fn(), getSecureWalletInfo: jest.fn()}));
jest.mock('@libs/actions/PaymentMethods', () => ({getPaymentMethods: jest.fn()}));
jest.mock('@libs/actions/User', () => ({requestValidateCodeAction: jest.fn()}));
jest.mock('@libs/getPlatform', () => ({__esModule: true, default: () => 'ios'}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn(), runAfterTransition: jest.fn()}}));
jest.mock('@components/MultifactorAuthentication/mfaNavigation', () => ({navigate: jest.fn()}));
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@components/MultifactorAuthentication/observability/breadcrumbs', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@components/MultifactorAuthentication/observability/trackMFAFlowStart', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@components/MultifactorAuthentication/observability/trackMFAFlowOutcome', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@userActions/MultifactorAuthentication', () => ({
    getDeviceBiometricsOnyxKey: () => 'deviceBiometrics_123',
    requestAuthorizationChallenge: jest.fn().mockResolvedValue({httpStatusCode: 200, challenge: {allowCredentials: [], rpId: 'test', challenge: 'challenge'}}),
    requestRegistrationChallenge: jest.fn().mockResolvedValue({httpStatusCode: 200, challenge: {rp: {}, user: {}, challenge: 'registration'}}),
    registerAuthenticationKey: jest.fn().mockResolvedValue({httpStatusCode: 200}),
    clearLocalMFAPublicKeyList: jest.fn(),
    authorizeTransaction: jest.fn(),
    denyTransaction: jest.fn(),
    fireAndForgetDenyTransaction: jest.fn(),
}));

let controls: ReturnType<typeof useMultifactorAuthentication>;
let actions: ReturnType<typeof useMultifactorAuthenticationActions>;
let state: ReturnType<typeof useMultifactorAuthenticationState>;
function Probe() {
    const currentControls = useMultifactorAuthentication();
    const currentActions = useMultifactorAuthenticationActions();
    const currentState = useMultifactorAuthenticationState();
    useEffect(() => {
        controls = currentControls;
        actions = currentActions;
        state = currentState;
    }, [currentControls, currentActions, currentState]);
    return null;
}
const payload = {card: createMock<Card>({cardID: 123}), cardHolderName: 'Jane', cardDescription: 'Card'};
const mockRequest = jest.mocked(API.makeRequestWithSideEffects);
async function startScenario() {
    await act(async () => {
        await controls.executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.ADD_TO_DIGITAL_WALLET, payload);
        actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
    });
}

describe('Wallet MFA composed providers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockBiometrics.deviceVerificationType = 'BIOMETRICS_HSM';
        mockBiometrics.areLocalCredentialsKnownToServer.mockResolvedValue(true);
        mockBiometrics.doesDeviceSupportAuthenticationMethod.mockResolvedValue(true);
        mockBiometrics.authorize.mockImplementation(async (_params, callback) => callback(signedResult));
        jest.mocked(handleAddCardToWallet).mockResolvedValue('success');
        jest.mocked(authorizeTransaction).mockReset().mockResolvedValue({httpStatusCode: 200, reason: undefined, message: undefined});
        jest.mocked(denyTransaction)
            .mockReset()
            .mockResolvedValue({httpStatusCode: 200, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, message: undefined});
    });

    it('does not launch a wallet until authorization signs, then completes through the scenario callback', async () => {
        // Given the real providers and authorization waiting for user authentication.
        let finishAuthorization: ((result: AuthorizeResult) => Promise<void>) | undefined;
        mockBiometrics.authorize.mockImplementation(async (_params, callback) => {
            finishAuthorization = callback;
        });
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );

        // When scenario initialization resolves but signing is still pending.
        await startScenario();
        await waitFor(() => expect(mockBiometrics.authorize).toHaveBeenCalled());
        expect(handleAddCardToWallet).not.toHaveBeenCalled();
        await act(async () => {
            await finishAuthorization?.(signedResult);
        });

        // Then native success alone triggers refresh and the MFA modal closes without its success screen.
        await waitFor(() => expect(getPaymentMethods).toHaveBeenCalledTimes(1));
        expect(handleAddCardToWallet).toHaveBeenCalledTimes(1);
        expect(state.isFlowComplete).toBe(true);
        expect(state.isModalOpen).toBe(false);
        expect(state.scenarioResponse?.body).toBeUndefined();
    });

    it('requires the existing enrollment flow before wallet provisioning', async () => {
        // Given a device without an enrolled credential.
        mockBiometrics.areLocalCredentialsKnownToServer.mockResolvedValue(false);
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );

        // When a UK/EU card starts wallet authentication.
        await startScenario();

        // Then existing validate-code enrollment starts and no wallet/native authorization runs prematurely.
        await waitFor(() => expect(requestValidateCodeAction).toHaveBeenCalled());
        expect(handleAddCardToWallet).not.toHaveBeenCalled();
        expect(mockBiometrics.authorize).not.toHaveBeenCalled();
    });

    it('continues existing enrollment into signing and wallet provisioning', async () => {
        // Given the cardholder starts without an enrolled device credential.
        mockBiometrics.areLocalCredentialsKnownToServer.mockResolvedValue(false);
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await startScenario();
        await waitFor(() => expect(requestValidateCodeAction).toHaveBeenCalled());
        expect(handleAddCardToWallet).not.toHaveBeenCalled();

        // When the existing enrollment flow receives its validate code and registers the device.
        await act(async () => actions.dispatch({type: 'SET_VALIDATE_CODE', payload: '123456'}));

        // Then registration and authorization finish before the wallet action and successful refresh.
        await waitFor(() => expect(getPaymentMethods).toHaveBeenCalledTimes(1));
        expect(mockBiometrics.register).toHaveBeenCalledTimes(1);
        expect(mockBiometrics.authorize).toHaveBeenCalledTimes(1);
        expect(state.isRegistrationComplete).toBe(true);
    });

    it('rejects unsupported authentication methods before native wallet work', async () => {
        // Given this native-only scenario is offered a passkey authenticator.
        mockBiometrics.deviceVerificationType = 'PASSKEYS';
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        // When the real provider checks the scenario allowlist.
        await startScenario();
        // Then existing failure UX is used without invoking native wallet provisioning.
        await waitFor(() => expect(state.isFlowComplete).toBe(true));
        expect(state.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED);
        expect(handleAddCardToWallet).not.toHaveBeenCalled();
    });

    it('never provisions after authentication cancellation', async () => {
        // Given the native authenticator returns the existing canceled result.
        mockBiometrics.authorize.mockImplementation(async (_params, callback) =>
            callback({success: false, error: {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED, message: undefined}}),
        );
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );

        // When the real provider completes authorization.
        await startScenario();

        // Then no wallet launches and existing failure handling completes the flow.
        await waitFor(() => expect(state.isFlowComplete).toBe(true));
        expect(handleAddCardToWallet).not.toHaveBeenCalled();
        expect(getPaymentMethods).not.toHaveBeenCalled();
    });

    it.each(['confirmed cancel', 'offline close'] as const)('does not launch Google Wallet after %s while signed provisioning is pending', async (ending) => {
        // Given the real composed providers have signed and the real Android helper is awaiting CreateDigitalWallet.
        type APIResponse = NonNullable<Awaited<ReturnType<typeof API.makeRequestWithSideEffects>>>;
        let finishRequest: ((response: APIResponse) => void) | undefined;
        jest.mocked(handleAddCardToWallet).mockImplementation(addAndroid);
        jest.mocked(getSecureWalletInfo).mockResolvedValue({deviceID: 'device', walletAccountID: 'wallet'});
        mockRequest.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finishRequest = resolve;
                }),
        );
        const view = render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await startScenario();
        await waitFor(() => expect(mockRequest).toHaveBeenCalledTimes(1));
        expect(mockRequest).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.CREATE_DIGITAL_WALLET,
            expect.objectContaining({signedChallenge: JSON.stringify(signedResult.signedChallenge), authenticationMethod: 'BIOMETRIC_FACE'}),
        );
        const signal = jest.mocked(handleAddCardToWallet).mock.calls.at(0)?.[3]?.signal;

        // When back navigation cancels the flow before the already-sent server request succeeds.
        if (ending === 'offline close') {
            mockIsOffline = true;
            view.rerender(
                <MultifactorAuthenticationContextProviders>
                    <Probe />
                </MultifactorAuthenticationContextProviders>,
            );
        }
        await act(async () => controls.requestCancel());
        if (ending === 'confirmed cancel') {
            expect(state.isCancelConfirmVisible).toBe(true);
            expect(signal?.aborted).toBe(false);
            await act(async () => controls.confirmCancel());
        }
        expect(signal?.aborted).toBe(true);
        const provisioningData: Pick<ProvisioningCardData, 'network' | 'opaquePaymentCard' | 'lastDigits' | 'userAddress'> = {
            network: 'VISA',
            opaquePaymentCard: 'opaque',
            lastDigits: '1234',
            userAddress: {
                name: 'Jane',
                address1: 'Street',
                state: '',
                city: 'London',
                country: 'GB',
                // eslint-disable-next-line @typescript-eslint/naming-convention -- Match the provisioning API response field.
                postal_code: 'SW1A',
                phone: '+441234',
            },
        };
        await act(async () => {
            finishRequest?.(createMock<APIResponse>({jsonCode: 200, ...provisioningData}));
        });

        // Then cancellation blocks native continuation and success side effects, without undoing the server request.
        expect(addCardToGoogleWallet).not.toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(state.isAuthorizationComplete).toBe(false);
        expect(state.scenarioResponse).toBeUndefined();
        if (ending === 'offline close') {
            expect(state.isModalOpen).toBe(false);
        } else {
            expect(state.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED);
        }
    });

    it.each(['canceled', 'success'] as const)('keeps explicit cancellation unsuccessful when the wallet later returns %s', async (status) => {
        // Given the signed wallet action is pending and has received its cancellation signal.
        let finishWallet: ((result: TokenizationStatus) => void) | undefined;
        jest.mocked(handleAddCardToWallet).mockImplementation(
            () =>
                new Promise((resolve) => {
                    finishWallet = resolve;
                }),
        );
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await startScenario();
        await waitFor(() => expect(handleAddCardToWallet).toHaveBeenCalledTimes(1));
        const signal = jest.mocked(handleAddCardToWallet).mock.calls.at(0)?.[3]?.signal;

        // When explicit cancellation precedes a native canceled or late-success status.
        await act(async () => controls.confirmCancel());
        await act(async () => {
            finishWallet?.(status);
        });

        // Then the wallet scenario normalizes the aborted result without successful authorization or refresh.
        expect(signal?.aborted).toBe(true);
        expect(state.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED);
        expect(state.isAuthorizationComplete).toBe(false);
        expect(state.scenarioResponse).toBeUndefined();
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each(['cancel', 'reset'] as const)('ignores an old wallet result after %s and a replacement attempt starts', async (ending) => {
        // Given the first wallet attempt is still waiting for native provisioning.
        let finishFirstWallet: ((result: TokenizationStatus) => void) | undefined;
        let finishSecondWallet: ((result: TokenizationStatus) => void) | undefined;
        jest.mocked(handleAddCardToWallet)
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        finishFirstWallet = resolve;
                    }),
            )
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        finishSecondWallet = resolve;
                    }),
            );
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await startScenario();
        await waitFor(() => expect(handleAddCardToWallet).toHaveBeenCalledTimes(1));
        const firstSignal = jest.mocked(handleAddCardToWallet).mock.calls.at(0)?.[3]?.signal;

        // When that flow ends and a replacement starts before the old wallet result arrives.
        if (ending === 'cancel') {
            await act(async () => controls.confirmCancel());
            await waitFor(() => expect(state.isFlowComplete).toBe(true));
        }
        await act(async () => actions.dispatch({type: 'RESET'}));
        await startScenario();
        await waitFor(() => expect(handleAddCardToWallet).toHaveBeenCalledTimes(2));
        const secondSignal = jest.mocked(handleAddCardToWallet).mock.calls.at(1)?.[3]?.signal;
        const replacementState = state;
        await act(async () => finishFirstWallet?.('success'));

        // Then the old result leaves the replacement untouched, including ownership of its cancellation signal.
        expect(firstSignal?.aborted).toBe(true);
        expect(state).toBe(replacementState);
        expect(secondSignal?.aborted).toBe(false);
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        await act(async () => controls.confirmCancel());
        expect(secondSignal?.aborted).toBe(true);
        await act(async () => finishSecondWallet?.('canceled'));
    });

    it('ignores an old scenario rejection after cancellation and replacement', async () => {
        // Given a transaction action can reject after its flow has already been canceled.
        let rejectTransaction: ((error: Error) => void) | undefined;
        let finishWallet: ((result: TokenizationStatus) => void) | undefined;
        jest.mocked(authorizeTransaction).mockImplementationOnce(
            () =>
                new Promise((_resolve, reject) => {
                    rejectTransaction = reject;
                }),
        );
        jest.mocked(handleAddCardToWallet).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finishWallet = resolve;
                }),
        );
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await act(async () => {
            await controls.executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID: 'transaction'});
            actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
        });
        await waitFor(() => expect(authorizeTransaction).toHaveBeenCalledTimes(1));
        await act(async () => controls.confirmCancel());
        await waitFor(() => expect(state.isFlowComplete).toBe(true));
        await act(async () => actions.dispatch({type: 'RESET'}));
        await startScenario();
        await waitFor(() => expect(handleAddCardToWallet).toHaveBeenCalledTimes(1));
        const replacementState = state;

        // When the old action rejects while the replacement wallet is pending.
        await act(async () => rejectTransaction?.(new Error('Transaction request failed')));

        // Then the rejection cannot fail the replacement, which can still complete successfully.
        expect(state).toBe(replacementState);
        await act(async () => finishWallet?.('success'));
        await waitFor(() => expect(getPaymentMethods).toHaveBeenCalledTimes(1));
        expect(state.error).toBeUndefined();
        expect(state.isAuthorizationComplete).toBe(true);
    });

    it('still reports an action rejection for the current flow', async () => {
        // Given an existing scenario action rejects without being canceled or replaced.
        jest.mocked(authorizeTransaction).mockRejectedValueOnce(new Error('Transaction request failed'));
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );

        // When the active scenario reaches its action.
        await act(async () => {
            await controls.executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID: 'transaction'});
            actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
        });

        // Then normal failure handling still completes the current flow.
        await waitFor(() => expect(state.isFlowComplete).toBe(true));
        expect(state.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
        expect(state.error?.message).toBe('Transaction request failed');
        expect(state.isAuthorizationComplete).toBe(false);
    });

    it('aborts a pending wallet action when the provider unmounts', async () => {
        // Given native wallet work is still pending when its provider goes away.
        let finishWallet: ((result: TokenizationStatus) => void) | undefined;
        jest.mocked(handleAddCardToWallet).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finishWallet = resolve;
                }),
        );
        const view = render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await startScenario();
        await waitFor(() => expect(handleAddCardToWallet).toHaveBeenCalledTimes(1));
        const signal = jest.mocked(handleAddCardToWallet).mock.calls.at(0)?.[3]?.signal;

        // When the provider unmounts before native completion.
        view.unmount();

        // Then the helper sees cancellation and late success cannot refresh or navigate.
        expect(signal?.aborted).toBe(true);
        await act(async () => finishWallet?.('success'));
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('preserves an existing scenario-specific cancellation outcome', async () => {
        // Given an existing transaction scenario is waiting for authentication.
        mockBiometrics.authorize.mockImplementation(async () => {});
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await act(async () => {
            await controls.executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID: 'transaction'});
            actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
        });
        await waitFor(() => expect(mockBiometrics.authorize).toHaveBeenCalledTimes(1));

        // When the user confirms cancellation through the existing onCancel hook.
        await act(async () => controls.confirmCancel());

        // Then its denial request and established failure outcome are unchanged.
        await waitFor(() => expect(state.isFlowComplete).toBe(true));
        expect(denyTransaction).toHaveBeenCalledWith({transactionID: 'transaction'});
        expect(state.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.FLOW_OUTCOMES.TRANSACTION_DENIED);
        expect(state.isAuthorizationComplete).toBe(false);
    });

    it('re-enrolls and signs again when an existing scenario requires registration', async () => {
        // Given a signed non-wallet action reports that the server no longer recognizes the credential.
        jest.mocked(authorizeTransaction).mockImplementationOnce(async () => {
            mockBiometrics.areLocalCredentialsKnownToServer.mockResolvedValue(false);
            return {httpStatusCode: 400, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED, message: undefined};
        });
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await act(async () => {
            await controls.executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID: 'transaction'});
            actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
        });
        await waitFor(() => expect(requestValidateCodeAction).toHaveBeenCalled());

        // When the user completes the existing validate-code and soft-prompt enrollment steps.
        await act(async () => {
            actions.dispatch({type: 'SET_VALIDATE_CODE', payload: '123456'});
            actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
        });

        // Then the existing flow registers, re-signs and completes successfully.
        await waitFor(() => expect(state.isFlowComplete).toBe(true));
        expect(registerAuthenticationKey).toHaveBeenCalledTimes(1);
        expect(mockBiometrics.authorize).toHaveBeenCalledTimes(2);
        expect(authorizeTransaction).toHaveBeenCalledTimes(2);
        expect(state.error).toBeUndefined();
        expect(state.isAuthorizationComplete).toBe(true);
    });
});

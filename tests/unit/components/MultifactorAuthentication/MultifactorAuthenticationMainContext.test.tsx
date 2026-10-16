/** Composed providers exercise signing, long-running action cancellation, and reset isolation. */
import {act, render, waitFor} from '@testing-library/react-native';

import type {AuthorizeResult, RegisterResult} from '@components/MultifactorAuthentication/biometrics/shared/types';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import {useMultifactorAuthenticationActions} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationActionsContext';
import MultifactorAuthenticationContextProviders from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationComposedContextProviders';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationMainContext';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationStateContext';
import {navigate as mfaNavigate} from '@components/MultifactorAuthentication/mfaNavigation';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import {requestValidateCodeAction} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import {handleAddCardToWallet} from '@libs/Wallet';

import {authorizeTransaction, denyTransaction, registerAuthenticationKey} from '@userActions/MultifactorAuthentication';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {TokenizationStatus} from '@expensify/react-native-wallet';

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
async function startScenario(scenarioPayload = payload) {
    await act(async () => {
        await controls.executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.ADD_TO_DIGITAL_WALLET, scenarioPayload);
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

    afterEach(() => jest.restoreAllMocks());

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

    it.each(['cancel', 'offline close', 'reset'] as const)('invalidates a pending wallet action on %s and ignores its late result', async (ending) => {
        // Given tokenization is still pending in the composed MFA providers.
        let finishWallet: ((status: TokenizationStatus) => void) | undefined;
        jest.mocked(handleAddCardToWallet).mockImplementation(
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

        // When cancellation or reset ends that generation, before native completion.
        await act(async () => {
            if (ending === 'reset') {
                actions.dispatch({type: 'RESET'});
            } else if (ending === 'offline close') {
                mockIsOffline = true;
                view.rerender(
                    <MultifactorAuthenticationContextProviders>
                        <Probe />
                    </MultifactorAuthenticationContextProviders>,
                );
            } else {
                controls.confirmCancel();
            }
        });
        if (ending === 'offline close') {
            await act(async () => controls.requestCancel());
        }
        expect(signal?.aborted).toBe(true);
        if (ending === 'reset') {
            // A newer flow must not inherit the previous attempt's eventual success.
            mockBiometrics.areLocalCredentialsKnownToServer.mockResolvedValue(false);
            await startScenario();
        }
        await act(async () => {
            finishWallet?.('success');
        });

        // Then late tokenization cannot refresh, navigate, or mark a reset/new flow authorized.
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(state.isAuthorizationComplete).toBe(false);
        expect(state.scenarioResponse).toBeUndefined();
        if (ending === 'reset') {
            expect(state.error).toBeUndefined();
            expect(state.isFlowComplete).toBe(false);
        }
        if (ending === 'offline close') {
            expect(state.isModalOpen).toBe(false);
        }
    });

    it.each(['doesDeviceSupportAuthenticationMethod', 'areLocalCredentialsKnownToServer'] as const)(
        'does not adopt a replacement card generation after a pending %s',
        async (prerequisite) => {
            // Given the first card already has a challenge, but a repeated prerequisite check is pending.
            mockBiometrics.authorize.mockImplementation(async () => {});
            render(
                <MultifactorAuthenticationContextProviders>
                    <Probe />
                </MultifactorAuthenticationContextProviders>,
            );
            await startScenario();
            await waitFor(() => expect(mockBiometrics.authorize).toHaveBeenCalledTimes(1));
            let finishPrerequisite: ((value: boolean) => void) | undefined;
            mockBiometrics[prerequisite].mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        finishPrerequisite = resolve;
                    }),
            );
            await act(async () => actions.dispatch({type: 'SET_REGISTRATION_COMPLETE', payload: true}));
            expect(finishPrerequisite).toBeDefined();
            const oldExecution = actions.getActionExecution();

            // When cancellation finishes and a different card starts before the old check resolves.
            await act(async () => controls.confirmCancel());
            await waitFor(() => expect(state.isFlowComplete).toBe(true));
            await act(async () => actions.dispatch({type: 'RESET'}));
            const replacementPayload = {...payload, card: createMock<Card>({cardID: 456})};
            await startScenario(replacementPayload);
            await waitFor(() => expect(mockBiometrics.authorize).toHaveBeenCalledTimes(2));
            const finishReplacement = mockBiometrics.authorize.mock.calls.at(-1)?.[1];
            const replacementExecution = actions.getActionExecution();
            const replacementState = state;
            const navigationCount = jest.mocked(mfaNavigate).mock.calls.length;
            await act(async () => {
                finishPrerequisite?.(true);
            });

            // Then the old continuation cannot sign, provision, or change the replacement; its own signing still works.
            expect(oldExecution.controller.signal.aborted).toBe(true);
            expect(mockBiometrics.authorize).toHaveBeenCalledTimes(2);
            expect(handleAddCardToWallet).not.toHaveBeenCalled();
            expect(replacementExecution.started).toBe(false);
            expect(state).toBe(replacementState);
            expect(mfaNavigate).toHaveBeenCalledTimes(navigationCount);
            await act(async () => {
                await finishReplacement?.(signedResult);
            });
            await waitFor(() => expect(getPaymentMethods).toHaveBeenCalledTimes(1));
            expect(handleAddCardToWallet).toHaveBeenCalledTimes(1);
            expect(jest.mocked(handleAddCardToWallet).mock.calls.at(0)?.[0].cardID).toBe(456);
        },
    );

    it('aborts pending wallet work when the composed providers unmount', async () => {
        // Given signed wallet provisioning has not completed before AuthScreens is removed.
        let finishWallet: ((status: TokenizationStatus) => void) | undefined;
        jest.mocked(handleAddCardToWallet).mockImplementation(
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

        // When the provider unmounts and the abandoned action eventually reports success.
        view.unmount();
        await act(async () => {
            finishWallet?.('success');
        });

        // Then its signal is aborted and neither success refresh nor success navigation can run.
        expect(signal?.aborted).toBe(true);
        expect(getPaymentMethods).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('keeps a usable execution after StrictMode effect cleanup is replayed', async () => {
        // Given provider setup and cleanup are replayed by React StrictMode.
        const signals: AbortSignal[] = [];
        function LifecycleProbe() {
            const {getActionExecution} = useMultifactorAuthenticationActions();
            useEffect(() => {
                signals.push(getActionExecution().controller.signal);
            }, [getActionExecution]);
            return <Probe />;
        }
        render(
            <React.StrictMode>
                <MultifactorAuthenticationContextProviders>
                    <LifecycleProbe />
                </MultifactorAuthenticationContextProviders>
            </React.StrictMode>,
            {concurrentRoot: true},
        );
        expect(signals.some((signal) => signal.aborted)).toBe(true);
        expect(actions.getActionExecution().controller.signal.aborted).toBe(false);

        // When a card starts after the replay.
        await startScenario();

        // Then the active generation can still sign, provision and run its success callback exactly once.
        await waitFor(() => expect(getPaymentMethods).toHaveBeenCalledTimes(1));
        expect(handleAddCardToWallet).toHaveBeenCalledTimes(1);
        expect(state.isFlowComplete).toBe(true);
    });

    it.each(['callback', 'credentials'] as const)('ignores a completed outcome after reset while its %s await is pending', async (stage) => {
        // Given an existing scenario reaches its callback, with either callback or telemetry credentials still pending.
        let finishOutcome: (() => void) | undefined;
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION];
        jest.spyOn(config, 'callback').mockImplementationOnce(async () => {
            if (stage === 'callback') {
                await new Promise<void>((resolve) => {
                    finishOutcome = resolve;
                });
            } else {
                mockBiometrics.areLocalCredentialsKnownToServer.mockImplementationOnce(
                    () =>
                        new Promise((resolve) => {
                            finishOutcome = () => resolve(true);
                        }),
                );
            }
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
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
        await waitFor(() => expect(finishOutcome).toBeDefined());

        // When a new card is waiting for enrollment before the original outcome resumes.
        await act(async () => actions.dispatch({type: 'RESET'}));
        mockBiometrics.areLocalCredentialsKnownToServer.mockResolvedValue(false);
        await startScenario();
        await act(async () => {
            finishOutcome?.();
        });

        // Then the old callback cannot complete or navigate the new flow.
        expect(state.isFlowComplete).toBe(false);
        expect(state.error).toBeUndefined();
        expect(Navigation.runAfterTransition).not.toHaveBeenCalled();
    });

    it('ignores a transaction cancellation response after reset into a different card', async () => {
        // Given a scenario-specific asynchronous cancellation has not returned yet.
        let finishCancel: ((response: Awaited<ReturnType<typeof denyTransaction>>) => void) | undefined;
        jest.mocked(denyTransaction).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finishCancel = resolve;
                }),
        );
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
        await act(async () => controls.confirmCancel());

        // When another flow starts before the previous transaction denial arrives.
        await act(async () => actions.dispatch({type: 'RESET'}));
        mockBiometrics.areLocalCredentialsKnownToServer.mockResolvedValue(false);
        await startScenario();
        await act(async () => {
            finishCancel?.({httpStatusCode: 200, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, message: undefined});
        });

        // Then cancellation cannot fail or complete the replacement enrollment flow.
        expect(state.error).toBeUndefined();
        expect(state.isFlowComplete).toBe(false);
    });

    it('invalidates a pending cancellation outcome callback on provider unmount', async () => {
        // Given cancellation intentionally runs its failure callback even though the action signal is aborted.
        let finishCallback: (() => void) | undefined;
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION];
        jest.spyOn(config, 'callback').mockImplementationOnce(async () => {
            await new Promise<void>((resolve) => {
                finishCallback = resolve;
            });
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
        });
        mockBiometrics.authorize.mockImplementation(async () => {});
        const view = render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await act(async () => {
            await controls.executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID: 'transaction'});
            actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
        });
        await waitFor(() => expect(mockBiometrics.authorize).toHaveBeenCalledTimes(1));
        await act(async () => controls.confirmCancel());
        await waitFor(() => expect(finishCallback).toBeDefined());

        // When AuthScreens unmounts before that failure callback completes.
        view.unmount();
        await act(async () => {
            finishCallback?.();
        });

        // Then even an already-aborted cancellation generation cannot navigate after teardown.
        expect(Navigation.runAfterTransition).not.toHaveBeenCalled();
    });

    it('ignores an existing scenario action that rejects after reset into another flow', async () => {
        // Given a non-wallet scenario action can reject outside the wallet action error normalization.
        let rejectAction: ((error: Error) => void) | undefined;
        jest.mocked(authorizeTransaction).mockImplementationOnce(
            () =>
                new Promise((_resolve, reject) => {
                    rejectAction = reject;
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

        // When reset starts a new enrollment flow before the original action rejects into the outer effect catch.
        await act(async () => actions.dispatch({type: 'RESET'}));
        mockBiometrics.areLocalCredentialsKnownToServer.mockResolvedValue(false);
        await startScenario();
        await waitFor(() => expect(requestValidateCodeAction).toHaveBeenCalled());
        await act(async () => {
            rejectAction?.(new Error('late action failure'));
        });

        // Then neither a late error nor a completed failure outcome contaminates the replacement flow.
        expect(state.error).toBeUndefined();
        expect(state.isFlowComplete).toBe(false);
        expect(state.isAuthorizationComplete).toBe(false);
        expect(state.scenarioResponse).toBeUndefined();
        expect(handleAddCardToWallet).not.toHaveBeenCalled();
    });

    it('re-enrolls and signs exactly once more when an existing scenario requires registration', async () => {
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
        const execution = actions.getActionExecution();
        await act(async () => {
            await controls.executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID: 'transaction'});
            actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
        });
        await waitFor(() => expect(requestValidateCodeAction).toHaveBeenCalled());
        expect(execution.controller.signal.aborted).toBe(true);
        expect(actions.getActionExecution().started).toBe(false);

        // When the user completes the existing validate-code and soft-prompt enrollment steps.
        await act(async () => {
            actions.dispatch({type: 'SET_VALIDATE_CODE', payload: '123456'});
            actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
        });

        // Then the replacement execution registers, re-signs and completes without an extra action.
        await waitFor(() => expect(state.isFlowComplete).toBe(true));
        expect(registerAuthenticationKey).toHaveBeenCalledTimes(1);
        expect(mockBiometrics.authorize).toHaveBeenCalledTimes(2);
        expect(authorizeTransaction).toHaveBeenCalledTimes(2);
        expect(state.error).toBeUndefined();
        expect(state.isAuthorizationComplete).toBe(true);
    });

    it('lets asynchronous transaction cancellation win over an action that ignores its signal', async () => {
        // Given both the signed action and the scenario-specific cancellation request can stay pending.
        let finishAction: ((response: Awaited<ReturnType<typeof authorizeTransaction>>) => void) | undefined;
        let finishCancel: ((response: Awaited<ReturnType<typeof denyTransaction>>) => void) | undefined;
        jest.mocked(authorizeTransaction).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finishAction = resolve;
                }),
        );
        jest.mocked(denyTransaction).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finishCancel = resolve;
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

        // When the user cancels, the action returns success before the denial response arrives.
        await act(async () => controls.confirmCancel());
        await act(async () => {
            finishAction?.({httpStatusCode: 200, reason: undefined, message: undefined});
        });
        expect(state.isAuthorizationComplete).toBe(false);
        expect(state.isFlowComplete).toBe(false);
        await act(async () => {
            finishCancel?.({httpStatusCode: 200, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, message: undefined});
        });

        // Then cancellation still reaches its intentional outcome rather than authorizing the transaction.
        await waitFor(() => expect(state.isFlowComplete).toBe(true));
        expect(state.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.FLOW_OUTCOMES.TRANSACTION_DENIED);
        expect(state.isAuthorizationComplete).toBe(false);
        expect(state.scenarioResponse).toBeUndefined();
    });

    it('does not execute a pending wallet action twice when provider effects rerun', async () => {
        // Given wallet tokenization remains pending after signing.
        jest.mocked(handleAddCardToWallet).mockImplementation(() => new Promise(() => {}));
        render(
            <MultifactorAuthenticationContextProviders>
                <Probe />
            </MultifactorAuthenticationContextProviders>,
        );
        await startScenario();
        await waitFor(() => expect(handleAddCardToWallet).toHaveBeenCalledTimes(1));
        const signal = jest.mocked(handleAddCardToWallet).mock.calls.at(0)?.[3]?.signal;

        // When a relevant state change makes the process effect run again.
        await act(async () => actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: false}));
        await act(async () => actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true}));
        await act(async () => actions.dispatch({type: 'INIT', payload: {scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.ADD_TO_DIGITAL_WALLET, payload}}));

        // Then the action execution guard prevents a second wallet sheet/request.
        expect(handleAddCardToWallet).toHaveBeenCalledTimes(1);
        expect(signal?.aborted).toBe(false);
    });
});

import useBiometrics from '@components/MultifactorAuthentication/biometrics/useBiometrics';
import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import {MFAMachine, snapshotToState} from '@components/MultifactorAuthentication/machine';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';
import type {CredentialsState} from '@components/MultifactorAuthentication/observability/trackMFAFlowOutcome';
import trackMFAFlowStart from '@components/MultifactorAuthentication/observability/trackMFAFlowStart';
import useSyncMfaModalNavigatorWithHistory from '@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInspectedMachine from '@hooks/useInspectedMachine';
import useNetwork from '@hooks/useNetwork';

import getPlatform from '@libs/getPlatform';
import readOnyxValueOnce from '@libs/MultifactorAuthentication/shared/readOnyxValueOnce';

import {getDeviceBiometricsOnyxKey} from '@userActions/MultifactorAuthentication';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import React from 'react';

import type {MultifactorAuthenticationExecuteScenarioArgs, MultifactorAuthenticationExternalAPI} from './MultifactorAuthenticationExternalApiContext';
import type {MultifactorAuthenticationInternalApi} from './MultifactorAuthenticationInternalApiContext';

import MultifactorAuthenticationExternalAPIContext from './MultifactorAuthenticationExternalApiContext';
import MultifactorAuthenticationInternalApiContext from './MultifactorAuthenticationInternalApiContext';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

type MultifactorAuthenticationContextProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    const {accountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const platform = getPlatform();
    const biometrics = useBiometrics();

    const [snapshot, send] = useInspectedMachine(MFAMachine);
    const state = snapshotToState(snapshot);

    const captureCredentialsState = async (flowAccountID: number): Promise<CredentialsState> => {
        const [hasLocalCredentials, deviceBiometrics] = await Promise.all([biometrics.areLocalCredentialsKnownToServer(), readOnyxValueOnce(getDeviceBiometricsOnyxKey(flowAccountID))]);
        return {
            hasServerCredentials: biometrics.serverKnownCredentialIDs.length > 0,
            hasLocalCredentials,
            hasEverAcceptedSoftPrompt: deviceBiometrics?.hasAcceptedSoftPrompt ?? false,
        };
    };

    /**
     * Initiates a multifactor authentication scenario: captures start-of-flow telemetry, then sends
     * INIT. The machine takes over from there - the Provider holds no flow logic.
     */
    const executeScenario = async <T extends MultifactorAuthenticationScenario>(scenarioName: T, ...args: MultifactorAuthenticationExecuteScenarioArgs<T>): Promise<void> => {
        const [params] = args;

        // Perf short-circuit: while the modal is open or closing the machine drops INIT, so skip the
        // redundant captureCredentialsState() native call + breadcrumb on the happy path.
        if (state.modalState !== MFA_STATE.CLOSED) {
            return;
        }

        // The flow captures the account at INIT and keeps it for per-account device state, so a
        // session that has not hydrated yet must not start a flow keyed to the placeholder account.
        if (accountID === CONST.DEFAULT_NUMBER_ID) {
            addMFABreadcrumb('Flow rejected: account not initialized', {scenario: scenarioName}, 'warning');
            return;
        }

        const flowAccountID = accountID;
        const startCredentialsState = await captureCredentialsState(flowAccountID);

        // A session switch can happen while the asynchronous credential snapshot is being read. Read
        // the source of truth again immediately before INIT so stale account data never starts a flow.
        const currentSession = await readOnyxValueOnce(ONYXKEYS.SESSION);
        const currentAccountID = currentSession?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        if (currentAccountID !== flowAccountID) {
            addMFABreadcrumb('Flow rejected: account changed during initialization', {scenario: scenarioName, flowAccountID, currentAccountID}, 'warning');
            return;
        }

        addMFABreadcrumb('Flow started', {
            scenario: scenarioName,
            hasPayload: params !== undefined && Object.keys(params).length > 0,
            platform,
            isOffline,
            serverHasAnyCredentials: startCredentialsState.hasServerCredentials,
            hasEverAcceptedSoftPrompt: startCredentialsState.hasEverAcceptedSoftPrompt,
        });
        trackMFAFlowStart({scenario: scenarioName, isOffline, credentialsState: startCredentialsState});

        const scenario = getScenarioConfig(scenarioName);

        send({
            type: 'INIT',
            accountID: flowAccountID,
            scenarioName,
            scenario,
            payload: params && Object.keys(params).length > 0 ? params : undefined,
            hasEverAcceptedSoftPrompt: startCredentialsState.hasEverAcceptedSoftPrompt,
        });
    };

    const closeModal = () => send({type: 'CLOSE_MODAL'});
    const notifyModalClosed = () => send({type: 'MODAL_CLOSED'});
    const approveSoftPrompt = () => send({type: 'SOFT_PROMPT_APPROVED'});
    const submitValidateCode = (validateCode: string) => send({type: 'VALIDATE_CODE_ENTERED', validateCode});
    const resendValidateCode = () => send({type: 'RESEND_VALIDATE_CODE'});
    const notifyValidateCodeChanged = () => send({type: 'VALIDATE_CODE_CHANGED'});

    // There is no cancel-confirmation dialog yet, so every cancel path closes the modal directly.
    const requestCancel = () => send({type: 'CLOSE_MODAL'});
    const hideCancelConfirm = () => send({type: 'CLOSE_MODAL'});
    const confirmCancel = () => send({type: 'CLOSE_MODAL'});

    useSyncMfaModalNavigatorWithHistory(state.modalState, requestCancel);

    const externalApi: MultifactorAuthenticationExternalAPI = {executeScenario};

    const internalApi: MultifactorAuthenticationInternalApi = {
        state,
        closeModal,
        notifyModalClosed,
        approveSoftPrompt,
        submitValidateCode,
        resendValidateCode,
        notifyValidateCodeChanged,
        requestCancel,
        hideCancelConfirm,
        confirmCancel,
    };

    return (
        <MultifactorAuthenticationExternalAPIContext.Provider value={externalApi}>
            <MultifactorAuthenticationInternalApiContext.Provider value={internalApi}>{children}</MultifactorAuthenticationInternalApiContext.Provider>
        </MultifactorAuthenticationExternalAPIContext.Provider>
    );
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export default MultifactorAuthenticationContextProvider;

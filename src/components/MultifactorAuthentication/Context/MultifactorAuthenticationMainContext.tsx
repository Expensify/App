import type {AuthorizeResult, RegisterResult} from '@components/MultifactorAuthentication/biometrics/shared/types';
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

import {requestValidateCodeAction} from '@libs/actions/User';
import {getErrorMessage} from '@libs/ErrorUtils';
import getPlatform from '@libs/getPlatform';
import {isHttpSuccess} from '@libs/MultifactorAuthentication/shared/helpers';
import {createLocalMFAError, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {MultifactorAuthenticationCallbackInput} from '@libs/MultifactorAuthentication/shared/types';
import Navigation from '@libs/Navigation/Navigation';

import {clearLocalMFAPublicKeyList, getDeviceBiometricsOnyxKey, requestAuthorizationChallenge, requestRegistrationChallenge} from '@userActions/MultifactorAuthentication';
import {processRegistration, processScenarioAction} from '@userActions/MultifactorAuthentication/processing';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {DeviceBiometrics} from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import Onyx from 'react-native-onyx';

import {useMultifactorAuthenticationActions} from './MultifactorAuthenticationActionsContext';
import {useMultifactorAuthenticationState} from './MultifactorAuthenticationStateContext';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

type MultifactorAuthenticationContextProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    const {accountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const platform = getPlatform();
    const biometrics = useBiometrics();
    const [hasEverAcceptedSoftPrompt = false] = useOnyx(getDeviceBiometricsOnyxKey(accountID), {selector: hasAcceptedSoftPromptSelector});

    const [snapshot, send] = useInspectedMachine(MFAMachine);
    const state = snapshotToState(snapshot);

    const captureCredentialsState = async (): Promise<CredentialsState> => {
        const hasLocalCredentials = await biometrics.areLocalCredentialsKnownToServer();
        return {
            hasServerCredentials: biometrics.serverKnownCredentialIDs.length > 0,
            hasLocalCredentials,
            hasEverAcceptedSoftPrompt,
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

        const startCredentialsState = await captureCredentialsState();

        addMFABreadcrumb('Flow started', {
            scenario: scenarioName,
            hasPayload: params !== undefined && Object.keys(params).length > 0,
            platform,
            isOffline,
            hasAcceptedSoftPrompt: startCredentialsState.hasEverAcceptedSoftPrompt,
            serverHasAnyCredentials: startCredentialsState.hasServerCredentials,
        });
        trackMFAFlowStart({scenario: scenarioName, isOffline, credentialsState: startCredentialsState});

        const scenario = getScenarioConfig(scenarioName);

        send({type: 'INIT', scenarioName, scenario, payload: params && Object.keys(params).length > 0 ? params : undefined});
    };

    const closeModal = () => send({type: 'CLOSE_MODAL'});
    const notifyModalClosed = () => send({type: 'MODAL_CLOSED'});

    // The cancel-confirmation dialog lands in a later slice; until then every cancel path closes the modal directly.
    const requestCancel = () => send({type: 'CLOSE_MODAL'});
    const hideCancelConfirm = () => send({type: 'CLOSE_MODAL'});
    const confirmCancel = () => send({type: 'CLOSE_MODAL'});

    useSyncMfaModalNavigatorWithHistory(state.modalState, requestCancel);

    const externalApi: MultifactorAuthenticationExternalAPI = {executeScenario};

    const internalApi: MultifactorAuthenticationInternalApi = {
        state,
        closeModal,
        notifyModalClosed,
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

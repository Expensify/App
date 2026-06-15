import React, {useEffect} from 'react';
import type {ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useBiometrics from '@components/MultifactorAuthentication/biometrics/useBiometrics';
import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import {mfaMachine, snapshotToState} from '@components/MultifactorAuthentication/machine';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';
import type {CredentialsState} from '@components/MultifactorAuthentication/observability/trackMFAFlowOutcome';
import trackMFAFlowStart from '@components/MultifactorAuthentication/observability/trackMFAFlowStart';
import useSyncMfaModalNavigatorWithHistory from '@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInspectedMachine from '@hooks/useInspectedMachine';
import useNetwork from '@hooks/useNetwork';
import getPlatform from '@libs/getPlatform';
import {getDeviceBiometricsOnyxKey} from '@userActions/MultifactorAuthentication';
import type {DeviceBiometrics} from '@src/types/onyx';
import MultifactorAuthenticationExternalApiContext from './MultifactorAuthenticationExternalApiContext';
import type {MultifactorAuthenticationExecuteScenarioArgs, MultifactorAuthenticationExternalApi} from './MultifactorAuthenticationExternalApiContext';
import MultifactorAuthenticationInternalApiContext from './MultifactorAuthenticationInternalApiContext';
import type {MultifactorAuthenticationInternalApi} from './MultifactorAuthenticationInternalApiContext';

let deviceBiometricsState: OnyxEntry<DeviceBiometrics>;

type MultifactorAuthenticationContextProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    const {accountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const platform = getPlatform();
    const biometrics = useBiometrics();

    const [snapshot, send] = useInspectedMachine(mfaMachine);
    const state = snapshotToState(snapshot);

    useEffect(() => {
        // Non-reactive read of deviceBiometrics. Using Onyx.connectWithoutView instead of useOnyx
        // to avoid excess re-renders during the fresh registration flow.
        const connection = Onyx.connectWithoutView({
            key: getDeviceBiometricsOnyxKey(accountID),
            callback: (data) => {
                deviceBiometricsState = data;
            },
        });
        return () => Onyx.disconnect(connection);
    }, [accountID]);

    const captureCredentialsState = async (): Promise<CredentialsState> => {
        const hasLocalCredentials = await biometrics.areLocalCredentialsKnownToServer();
        return {
            hasServerCredentials: biometrics.serverKnownCredentialIDs.length > 0,
            hasLocalCredentials,
            hasEverAcceptedSoftPrompt: !!deviceBiometricsState?.hasAcceptedSoftPrompt,
        };
    };

    /**
     * Initiates a multifactor authentication scenario: captures start-of-flow telemetry, then sends
     * INIT. The machine takes over from there - the Provider holds no flow logic.
     */
    const executeScenario = async <T extends MultifactorAuthenticationScenario>(scenarioName: T, ...args: MultifactorAuthenticationExecuteScenarioArgs<T>): Promise<void> => {
        const [params] = args;

        // Perf short-circuit: once a scenario is active the machine ignores INIT, so skip the redundant
        // captureCredentialsState() native call + breadcrumb on the happy path.
        if (state.scenario) {
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

    const externalApi: MultifactorAuthenticationExternalApi = {executeScenario};

    const internalApi: MultifactorAuthenticationInternalApi = {
        state,
        closeModal,
        notifyModalClosed,
        requestCancel,
        hideCancelConfirm,
        confirmCancel,
    };

    return (
        <MultifactorAuthenticationExternalApiContext.Provider value={externalApi}>
            <MultifactorAuthenticationInternalApiContext.Provider value={internalApi}>{children}</MultifactorAuthenticationInternalApiContext.Provider>
        </MultifactorAuthenticationExternalApiContext.Provider>
    );
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export default MultifactorAuthenticationContextProvider;

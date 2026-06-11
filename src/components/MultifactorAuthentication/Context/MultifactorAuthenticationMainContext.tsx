import React, {createContext, useContext, useEffect} from 'react';
import type {ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useBiometrics from '@components/MultifactorAuthentication/biometrics/useBiometrics';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioConfig, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import {mfaMachine, snapshotToState} from '@components/MultifactorAuthentication/machine';
import type {MfaState} from '@components/MultifactorAuthentication/machine';
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

let deviceBiometricsState: OnyxEntry<DeviceBiometrics>;

type ExecuteScenarioParams<T extends MultifactorAuthenticationScenario> = MultifactorAuthenticationScenarioParams<T>;

/**
 * The single typed API exposed by the machine Provider. Apart from executeScenario's start-of-flow
 * telemetry, every method is a thin wrapper over `send(event)` - no flow logic (the behavior IS
 * machine state). `state` is the machine snapshot mapped to the legacy shape plus `modalPhase`, so
 * existing consumers keep reading `state.X`.
 */
type MultifactorAuthenticationApi = {
    /** The current MFA state, derived from the machine snapshot. */
    state: MfaState;

    /** Execute a multifactor authentication scenario. */
    executeScenario: <T extends MultifactorAuthenticationScenario>(scenario: T, params?: ExecuteScenarioParams<T>) => Promise<void>;

    /** Close the modal overlay. */
    closeModal: () => void;

    /** Navigator's report that the close animation fully finished; re-enters idle, wiping the flow data. */
    notifyModalClosed: () => void;

    /** Centralized back-press / backdrop entry. */
    requestCancel: () => void;

    /** Dismiss the cancel-confirmation modal without cancelling the flow. */
    hideCancelConfirm: () => void;

    /** Confirm cancellation. */
    confirmCancel: () => void;
};

const MultifactorAuthenticationContext = createContext<MultifactorAuthenticationApi | undefined>(undefined);

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
    const executeScenario = async <T extends MultifactorAuthenticationScenario>(scenarioName: T, params?: ExecuteScenarioParams<T>): Promise<void> => {
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

        // Each scenario config satisfies MultifactorAuthenticationScenarioConfig at definition; the
        // per-scenario action signatures make the union non-narrowable, so we assert the lookup. Params
        // are already type-guarded by ExecuteScenarioParams<T>.
        const scenario = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenarioName] as MultifactorAuthenticationScenarioConfig;

        send({type: 'INIT', scenarioName, scenario, payload: params && Object.keys(params).length > 0 ? params : undefined});
    };

    const closeModal = () => send({type: 'CLOSE_MODAL'});
    const notifyModalClosed = () => send({type: 'MODAL_CLOSED'});

    // PR-5: the cancel-confirmation dialog lands in PR-11; until then every cancel path closes the modal directly.
    const requestCancel = () => send({type: 'CLOSE_MODAL'});
    const hideCancelConfirm = () => send({type: 'CLOSE_MODAL'});
    const confirmCancel = () => send({type: 'CLOSE_MODAL'});

    useSyncMfaModalNavigatorWithHistory(state.isModalOpen, requestCancel);

    const contextValue: MultifactorAuthenticationApi = {
        state,
        executeScenario,
        closeModal,
        notifyModalClosed,
        requestCancel,
        hideCancelConfirm,
        confirmCancel,
    };

    return <MultifactorAuthenticationContext.Provider value={contextValue}>{children}</MultifactorAuthenticationContext.Provider>;
}

function useMultifactorAuthentication(): MultifactorAuthenticationApi {
    const context = useContext(MultifactorAuthenticationContext);

    if (!context) {
        throw new Error('useMultifactorAuthentication must be used within a MultifactorAuthenticationContextProviders');
    }

    return context;
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export {useMultifactorAuthentication, MultifactorAuthenticationContextProvider};

import React, {createContext, useContext, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useBiometrics from '@components/MultifactorAuthentication/biometrics/useBiometrics';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import {navigate as mfaNavigate} from '@components/MultifactorAuthentication/mfaNavigation';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';
import type {CredentialsState} from '@components/MultifactorAuthentication/observability/trackMFAFlowOutcome';
import trackMFAFlowStart from '@components/MultifactorAuthentication/observability/trackMFAFlowStart';
import useSyncMfaModalNavigatorWithHistory from '@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import getPlatform from '@libs/getPlatform';
import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import Navigation from '@libs/Navigation/Navigation';
import {getDeviceBiometricsOnyxKey} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {DeviceBiometrics} from '@src/types/onyx';
import {useMultifactorAuthenticationActions} from './MultifactorAuthenticationActionsContext';
import {useMultifactorAuthenticationState} from './MultifactorAuthenticationStateContext';

let deviceBiometricsState: OnyxEntry<DeviceBiometrics>;

type ExecuteScenarioParams<T extends MultifactorAuthenticationScenario> = MultifactorAuthenticationScenarioParams<T>;

type MultifactorAuthenticationContextValue = {
    /** Execute a multifactor authentication scenario */
    executeScenario: <T extends MultifactorAuthenticationScenario>(scenario: T, params?: ExecuteScenarioParams<T>) => Promise<void>;

    /**
     * Centralized back-press entry. Decides — based on current MFA state and the
     * route shown by the modal navigator — whether to close the modal directly
     * or surface the cancel-confirmation modal.
     */
    requestCancel: () => void;

    /** Dismiss the cancel-confirmation modal without cancelling the flow. */
    hideCancelConfirm: () => void;

    /** Confirm cancellation — hides the modal and runs cancel(). */
    confirmCancel: () => void;
};

const MultifactorAuthenticationContext = createContext<MultifactorAuthenticationContextValue | undefined>(undefined);

type MultifactorAuthenticationContextProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    const state = useMultifactorAuthenticationState();
    const {dispatch} = useMultifactorAuthenticationActions();

    const biometrics = useBiometrics();
    const {accountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const platform = getPlatform();

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

    const startStateRef = useRef<CredentialsState | undefined>(undefined);

    const captureCredentialsState = async (): Promise<CredentialsState> => {
        const hasLocalCredentials = await biometrics.areLocalCredentialsKnownToServer();
        return {
            hasServerCredentials: biometrics.serverKnownCredentialIDs.length > 0,
            hasLocalCredentials,
            hasEverAcceptedSoftPrompt: !!deviceBiometricsState?.hasAcceptedSoftPrompt,
        };
    };

    /**
     * Initiates a multifactor authentication scenario.
     *
     * INIT opens the modal but the flow is inert - the driving engine was removed pending the
     * state machine migration (#81197).
     */
    const executeScenario = async <T extends MultifactorAuthenticationScenario>(scenario: T, params?: ExecuteScenarioParams<T>): Promise<void> => {
        // The reducer's INIT case is the authoritative double-tap guard; this short-circuit only
        // skips a redundant captureCredentialsState() native call + breadcrumb on the happy path.
        if (state.scenario) {
            return;
        }

        startStateRef.current = await captureCredentialsState();

        const breadcrumbData = {
            scenario,
            hasPayload: params !== undefined && Object.keys(params).length > 0,
            platform,
            isOffline,
            hasAcceptedSoftPrompt: startStateRef.current.hasEverAcceptedSoftPrompt,
            serverHasAnyCredentials: startStateRef.current.hasServerCredentials,
        };

        addMFABreadcrumb('Flow started', breadcrumbData);
        trackMFAFlowStart({
            scenario,
            isOffline,
            credentialsState: startStateRef.current,
        });
        dispatch({
            type: 'INIT',
            payload: {
                scenario,
                payload: params && Object.keys(params).length > 0 ? params : undefined,
            },
        });

        // Scaffold pending the state machine (#81197): the flow engine is gone, so jump straight
        // to the success outcome screen to keep the modal + outcome UI testable. SET_FLOW_COMPLETE
        // lets back-press/backdrop close directly instead of opening the cancel-confirm dialog.
        dispatch({type: 'SET_FLOW_COMPLETE', payload: true});
        Navigation.runAfterTransition(() => mfaNavigate(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS));
    };

    /**
     * Cancel the current authentication flow. The no-scenario/offline path closes the modal directly.
     * The scenario/online path dispatches SET_ERROR, but with the flow engine removed nothing routes
     * it to a failure outcome yet - it stays inert until the state machine lands (#81197).
     */
    const cancel = async () => {
        if (!state.scenario || isOffline) {
            addMFABreadcrumb('Flow cancelled - closing directly', {hasScenario: !!state.scenario, isOffline}, 'warning');
            dispatch({type: 'CLOSE_MODAL'});
            return;
        }

        if (state.scenario.onCancel) {
            const error = await state.scenario.onCancel(state.payload);
            addMFABreadcrumb('Flow cancelled with onCancel', error, 'warning');
            dispatch({type: 'SET_ERROR', payload: error});
            return;
        }

        addMFABreadcrumb('Flow cancelled', {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED}, 'warning');
        dispatch({
            type: 'SET_ERROR',
            payload: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED, 'User cancelled the MFA flow'),
        });
    };

    const requestCancel = () => {
        if (state.isFlowComplete) {
            dispatch({type: 'CLOSE_MODAL'});
            return;
        }
        if (!state.scenario || isOffline) {
            cancel();
            return;
        }
        dispatch({type: 'SET_CANCEL_CONFIRM_VISIBLE', payload: true});
    };

    const hideCancelConfirm = () => dispatch({type: 'SET_CANCEL_CONFIRM_VISIBLE', payload: false});

    const confirmCancel = () => {
        dispatch({type: 'SET_CANCEL_CONFIRM_VISIBLE', payload: false});
        cancel();
    };

    useSyncMfaModalNavigatorWithHistory(state.isModalOpen, requestCancel);

    const contextValue: MultifactorAuthenticationContextValue = {
        executeScenario,
        requestCancel,
        hideCancelConfirm,
        confirmCancel,
    };

    return <MultifactorAuthenticationContext.Provider value={contextValue}>{children}</MultifactorAuthenticationContext.Provider>;
}

function useMultifactorAuthentication(): MultifactorAuthenticationContextValue {
    const context = useContext(MultifactorAuthenticationContext);

    if (!context) {
        throw new Error('useMultifactorAuthentication must be used within a MultifactorAuthenticationContextProviders');
    }

    return context;
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export {useMultifactorAuthentication, MultifactorAuthenticationContextProvider};

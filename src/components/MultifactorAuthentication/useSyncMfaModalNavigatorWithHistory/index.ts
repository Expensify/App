import {useCallback, useEffect, useState} from 'react';
import {BackHandler} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';

type SyncMfaModalNavigatorWithHistoryResult = {
    /** Whether the cancel-confirmation modal triggered by a back press is visible. */
    isCancelConfirmVisible: boolean;
    /** Dismiss the confirmation without cancelling the MFA flow. */
    hideCancelConfirm: () => void;
    /** Confirm cancellation – closes the confirmation modal and triggers the MFA cancel flow. */
    confirmCancel: () => void;
};

function dispatchToggle(isVisible: boolean) {
    Navigation.isNavigationReady().then(() => {
        navigationRef.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MFA_MODAL_NAVIGATOR_WITH_HISTORY,
            payload: {isVisible},
        });
    });
}

function getLastHistoryEntry(): unknown {
    if (!navigationRef.isReady()) {
        return undefined;
    }
    return navigationRef.getRootState()?.history?.at(-1);
}

/**
 * Wires browser/Android back into the MFA modal navigator via a synthetic
 * `CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR` marker on the root history (same
 * pattern as `useSyncSidePanelWithHistory`).
 *
 * Back press does NOT close the modal: the marker is re-pinned (URL stays put)
 * and a confirmation is shown. Confirming runs `cancel`, which removes the
 * marker and truncates the forward stack so a browser forward cannot resurrect
 * the flow.
 *
 * @param cancel Typically `useMultifactorAuthentication().cancel`. Typed
 *   `() => unknown` to accept async callbacks without coercion; not awaited.
 */
function useSyncMfaModalNavigatorWithHistory(isModalOpen: boolean, cancel: () => unknown): SyncMfaModalNavigatorWithHistoryResult {
    const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        dispatchToggle(true);

        const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
            setIsCancelConfirmVisible(true);
            return true;
        });

        // Subscribe directly to the root navigator so setState happens in the
        // subscription callback (per react-hooks/set-state-in-effect guidance).
        // We track the previous tail entry locally to detect marker pops without
        // routing through React state.
        let previousLastEntry = getLastHistoryEntry();
        const unsubscribe = navigationRef.addListener('state', () => {
            const currentLastEntry = getLastHistoryEntry();
            const wasMarkerOnTop = previousLastEntry === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR;
            const isMarkerOnTop = currentLastEntry === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR;
            previousLastEntry = currentLastEntry;

            if (wasMarkerOnTop || isMarkerOnTop) {
                if (wasMarkerOnTop && !isMarkerOnTop) {
                    dispatchToggle(true);
                    setIsCancelConfirmVisible(true);
                }
            }
        });

        return () => {
            backSubscription.remove();
            unsubscribe();
            dispatchToggle(false);
        };
    }, [isModalOpen]);

    const hideCancelConfirm = useCallback(() => setIsCancelConfirmVisible(false), []);
    const confirmCancel = useCallback(() => {
        setIsCancelConfirmVisible(false);
        cancel();
    }, [cancel]);

    return {isCancelConfirmVisible, hideCancelConfirm, confirmCancel};
}

export default useSyncMfaModalNavigatorWithHistory;

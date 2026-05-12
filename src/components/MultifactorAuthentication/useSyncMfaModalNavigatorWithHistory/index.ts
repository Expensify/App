import {useEffect} from 'react';
import {BackHandler} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';

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
 * Back press does NOT close the modal directly — it re-pins the marker (URL
 * stays put) and delegates to `requestCancel`, which decides whether to show
 * the cancel-confirmation modal or close the flow outright based on the
 * current MFA state.
 *
 * Marker lifecycle and back-press subscriptions are split across two effects
 * so re-subscribing on `requestCancel` change does not toggle the history
 * marker off/on.
 *
 * @param isModalOpen Whether the MFA modal is currently mounted.
 * @param requestCancel Called on every back press.
 */
function useSyncMfaModalNavigatorWithHistory(isModalOpen: boolean, requestCancel: () => void): void {
    // Push the history marker while the modal is open; pop it on close. Tied to isModalOpen only so re-renders don't churn it.
    useEffect(() => {
        if (!isModalOpen) {
            return;
        }
        dispatchToggle(true);
        return () => dispatchToggle(false);
    }, [isModalOpen]);

    // Subscribe hardware/browser back to requestCancel. Re-subscribes when requestCancel changes — cheap, leaves the marker untouched.
    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
            requestCancel();
            return true;
        });

        let previousLastEntry = getLastHistoryEntry();
        const unsubscribe = navigationRef.addListener('state', () => {
            const currentLastEntry = getLastHistoryEntry();
            const wasMarkerOnTop = previousLastEntry === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR;
            const isMarkerOnTop = currentLastEntry === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR;
            previousLastEntry = currentLastEntry;

            if (wasMarkerOnTop && !isMarkerOnTop) {
                dispatchToggle(true);
                requestCancel();
            }
        });

        return () => {
            backSubscription.remove();
            unsubscribe();
        };
    }, [isModalOpen, requestCancel]);
}

export default useSyncMfaModalNavigatorWithHistory;

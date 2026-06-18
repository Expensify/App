import getPlatform from '@libs/getPlatform';
import {cancelPendingMfaMarkerReattach, isMfaMarkerStripInProgress, toggleMfaMarker} from '@libs/Navigation/helpers/mfaModalMarkerPreservation';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';

import {useEffect} from 'react';
import {BackHandler} from 'react-native';

function dispatchToggle(isVisible: boolean) {
    Navigation.isNavigationReady().then(() => toggleMfaMarker(isVisible));
}

function getHistory(): readonly unknown[] {
    if (!navigationRef.isReady()) {
        return [];
    }
    return navigationRef.getRootState()?.history ?? [];
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
        return () => {
            // Cancel pending re-attach so it can't re-inject the marker after close.
            cancelPendingMfaMarkerReattach();
            dispatchToggle(false);
        };
    }, [isModalOpen]);

    // Subscribe hardware/browser back to requestCancel. Re-subscribes when requestCancel changes — cheap, leaves the marker untouched.
    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        // BackHandler is Android-only: react-native-web stubs `addEventListener` with a `console.error`, and iOS has no hardware back.
        const backSubscription =
            getPlatform() === CONST.PLATFORM.ANDROID
                ? BackHandler.addEventListener('hardwareBackPress', () => {
                      requestCancel();
                      return true;
                  })
                : null;

        let previousHistory = getHistory();
        const unsubscribe = navigationRef.addListener('state', () => {
            const currentHistory = getHistory();
            // Compare presence anywhere in history, not at the top, so a sibling marker pushed
            // on top of MFA (e.g. side panel) does not spuriously fire requestCancel.
            const wasInHistory = previousHistory.includes(CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR);
            const isInHistory = currentHistory.includes(CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR);
            previousHistory = currentHistory;

            if (wasInHistory && !isInHistory) {
                // Skip when goBack stripped the marker — it re-attaches after the pop.
                if (isMfaMarkerStripInProgress()) {
                    return;
                }
                dispatchToggle(true);
                requestCancel();
            }
        });

        return () => {
            backSubscription?.remove();
            unsubscribe();
        };
    }, [isModalOpen, requestCancel]);
}

export default useSyncMfaModalNavigatorWithHistory;

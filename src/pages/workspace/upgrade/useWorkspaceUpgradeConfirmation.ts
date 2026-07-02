import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import {SUBMIT_FEATURE_IDS} from '@src/CONST';

type UseWorkspaceUpgradeConfirmationParams = {
    policyID: string | undefined;
    isUpgraded: boolean;
    canPerformUpgrade: boolean;
    upgradingFromSubmit: boolean | undefined;
    featureID: string | undefined;
    isPendingUpgrade: boolean | undefined;
    confirmUpgrade: () => void;
};

/**
 * Runs post-upgrade feature confirmation when the user leaves the page.
 * Submit-tier upgrades confirm immediately after the plan upgrade completes because the blur
 * handler skips them to avoid duplicate enables for features UpgradeSubmit already handles on the backend.
 * Other features still confirm on blur when the user navigates away.
 */
function useWorkspaceUpgradeConfirmation({policyID, isUpgraded, canPerformUpgrade, upgradingFromSubmit, featureID, isPendingUpgrade, confirmUpgrade}: UseWorkspaceUpgradeConfirmationParams) {
    const confirmUpgradeRef = useRef(confirmUpgrade);
    const hasConfirmedSubmitUpgradeRef = useRef(false);
    const confirmUpgradeOnBlurRef = useRef({
        isUpgraded,
        canPerformUpgrade,
        upgradingFromSubmit,
        featureID,
        isPendingUpgrade,
    });

    const confirmSubmitUpgradeIfNeeded = useCallback(() => {
        const {
            isUpgraded: currentIsUpgraded,
            canPerformUpgrade: currentCanPerformUpgrade,
            upgradingFromSubmit: currentUpgradingFromSubmit,
            featureID: currentFeatureID,
            isPendingUpgrade: currentIsPendingUpgrade,
        } = confirmUpgradeOnBlurRef.current;

        if (!currentIsUpgraded || currentIsPendingUpgrade || !currentCanPerformUpgrade || !currentUpgradingFromSubmit) {
            return;
        }

        if (!currentFeatureID || !SUBMIT_FEATURE_IDS.has(currentFeatureID)) {
            return;
        }

        if (hasConfirmedSubmitUpgradeRef.current) {
            return;
        }

        hasConfirmedSubmitUpgradeRef.current = true;
        confirmUpgradeRef.current();
    }, []);

    useEffect(() => {
        hasConfirmedSubmitUpgradeRef.current = false;
    }, [policyID]);

    useEffect(() => {
        confirmUpgradeRef.current = confirmUpgrade;
        confirmUpgradeOnBlurRef.current = {
            isUpgraded,
            canPerformUpgrade,
            upgradingFromSubmit,
            featureID,
            isPendingUpgrade,
        };
    });

    useEffect(() => {
        confirmSubmitUpgradeIfNeeded();
    }, [confirmSubmitUpgradeIfNeeded, isUpgraded, isPendingUpgrade, featureID, upgradingFromSubmit]);

    useFocusEffect(
        useCallback(() => {
            confirmSubmitUpgradeIfNeeded();

            return () => {
                const {
                    isUpgraded: wasUpgraded,
                    canPerformUpgrade: couldPerformUpgrade,
                    upgradingFromSubmit: wasUpgradingFromSubmit,
                    featureID: currentFeatureID,
                } = confirmUpgradeOnBlurRef.current;

                if (!wasUpgraded || !couldPerformUpgrade) {
                    return;
                }

                // Submit-tier features are confirmed immediately after upgrade; skip blur to avoid duplicate enables.
                if (wasUpgradingFromSubmit && currentFeatureID && SUBMIT_FEATURE_IDS.has(currentFeatureID)) {
                    return;
                }

                confirmUpgradeRef.current();
            };
        }, [confirmSubmitUpgradeIfNeeded]),
    );
}

export default useWorkspaceUpgradeConfirmation;

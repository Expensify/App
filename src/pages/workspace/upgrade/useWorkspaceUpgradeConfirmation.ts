import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import CONST, {SUBMIT_FEATURE_IDS} from '@src/CONST';

type UseWorkspaceUpgradeConfirmationParams = {
    policyID: string | undefined;
    reportID: string | undefined;
    isUpgraded: boolean;
    canPerformUpgrade: boolean;
    upgradingFromSubmit: boolean | undefined;
    featureID: string | undefined;
    isPendingUpgrade: boolean | undefined;
    confirmUpgrade: () => void;
};

/**
 * Runs post-upgrade feature confirmation when the user leaves the page, except for Submit-tier features
 * where the backend already enables them. For approvalSubmit without a reportID (workflows), also confirms
 * immediately after upgrade completes because the blur handler intentionally skips Submit-tier features.
 */
function useWorkspaceUpgradeConfirmation({
    policyID,
    reportID,
    isUpgraded,
    canPerformUpgrade,
    upgradingFromSubmit,
    featureID,
    isPendingUpgrade,
    confirmUpgrade,
}: UseWorkspaceUpgradeConfirmationParams) {
    const confirmUpgradeRef = useRef(confirmUpgrade);
    const hasConfirmedApprovalSubmitUpgradeRef = useRef(false);
    const confirmUpgradeOnBlurRef = useRef({
        isUpgraded,
        canPerformUpgrade,
        upgradingFromSubmit,
        featureID,
    });

    useEffect(() => {
        hasConfirmedApprovalSubmitUpgradeRef.current = false;
    }, [policyID]);

    useEffect(() => {
        confirmUpgradeRef.current = confirmUpgrade;
        confirmUpgradeOnBlurRef.current = {
            isUpgraded,
            canPerformUpgrade,
            upgradingFromSubmit,
            featureID,
        };
    });

    useFocusEffect(
        useCallback(() => {
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

                // UpgradeSubmit enables Collect-tier features on the backend; skip the redundant client-side enable.
                if (wasUpgradingFromSubmit && currentFeatureID && SUBMIT_FEATURE_IDS.has(currentFeatureID)) {
                    return;
                }

                confirmUpgradeRef.current();
            };
        }, []),
    );

    useEffect(() => {
        if (reportID || !isUpgraded || isPendingUpgrade || featureID !== CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmit.id) {
            return;
        }

        if (hasConfirmedApprovalSubmitUpgradeRef.current) {
            return;
        }

        hasConfirmedApprovalSubmitUpgradeRef.current = true;
        confirmUpgradeRef.current();
    }, [featureID, isPendingUpgrade, isUpgraded, reportID]);
}

export default useWorkspaceUpgradeConfirmation;

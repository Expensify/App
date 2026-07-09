import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import {useMemoizedLazyIllustrations} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useThemeStyles from './useThemeStyles';

type UseCommuterExclusionGuardParams = {
    /** Policy ID to check by default */
    policyID?: string;

    /** Whether the current flow is for a manual distance request */
    isManualDistanceRequest?: boolean;

    /** Whether the current flow is for an odometer distance request */
    isOdometerDistanceRequest?: boolean;
};

type PoliciesWithCommuterExclusions = Record<string, boolean>;

const policiesWithCommuterExclusionsSelector = (policies: OnyxCollection<Policy>): PoliciesWithCommuterExclusions =>
    Object.values(policies ?? {}).reduce<PoliciesWithCommuterExclusions>((acc, policy) => {
        if (policy?.id && policy.commuterExclusions) {
            acc[policy.id] = true;
        }
        return acc;
    }, {});

/**
 * Returns a guard function that blocks manual/odometer distance flows for policies
 * that have commuter exclusions configured. Callers can pass an override policy ID
 * when checking a newly selected workspace before committing it.
 *
 * When a block occurs, it surfaces a modal explaining that only map/GPS distance
 * is supported (because exclusions are computed from the mapped route) and returns
 * true so callers can early return.
 */
function useCommuterExclusionGuard({policyID, isManualDistanceRequest = false, isOdometerDistanceRequest = false}: UseCommuterExclusionGuardParams) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['HouseWithMap']);
    const [policiesWithCommuterExclusions] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesWithCommuterExclusionsSelector});

    return (policyIDToCheck = policyID) => {
        if ((!isManualDistanceRequest && !isOdometerDistanceRequest) || !policyIDToCheck || !policiesWithCommuterExclusions?.[policyIDToCheck]) {
            return false;
        }

        showConfirmModal({
            title: translate('distance.error.mapOrGpsDistanceRequired.title'),
            titleStyles: styles.textHeadline,
            prompt: translate('distance.error.mapOrGpsDistanceRequired.description'),
            promptStyles: styles.textSupporting,
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            image: illustrations.HouseWithMap,
            shouldUseSuccessStyleForConfirm: true,
            shouldFitImageToContainer: true,
            imageStyles: styles.commuterExclusionStaticIllustration,
        });

        return true;
    };
}

export default useCommuterExclusionGuard;

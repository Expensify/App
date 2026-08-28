import {isMapOrGPSRequired} from '@libs/PolicyDistanceRatesUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback} from 'react';

import useConfirmModal from './useConfirmModal';
import {useMemoizedLazyIllustrations} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useThemeStyles from './useThemeStyles';

type UseBlockDistanceRequestParams = {
    /** Policy ID to check by default */
    policyID?: string;

    /** Whether the current flow is for a manual distance request */
    isManualDistanceRequest?: boolean;

    /** Whether the current flow is for an odometer distance request */
    isOdometerDistanceRequest?: boolean;
};

type PoliciesRequiringMapOrGPS = Record<string, boolean>;

const policiesRequiringMapOrGPSSelector = (policies: OnyxCollection<Policy>): PoliciesRequiringMapOrGPS =>
    Object.values(policies ?? {}).reduce<PoliciesRequiringMapOrGPS>((acc, policy) => {
        if (!policy?.id || !isMapOrGPSRequired(policy)) {
            return acc;
        }

        acc[policy.id] = true;
        return acc;
    }, {});

/**
 * Returns a function that blocks manual/odometer distance flows for policies that require GPS or map entry,
 * either through the `requireMapOrGPS` setting or through commuter exclusions. Callers can pass an override
 * policy ID when checking a newly selected workspace before committing it.
 *
 * When a block occurs, it surfaces a modal explaining that only map/GPS distance
 * is supported and returns true so callers can early return.
 */
function useBlockDistanceRequest({policyID, isManualDistanceRequest = false, isOdometerDistanceRequest = false}: UseBlockDistanceRequestParams) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['HouseWithMap']);
    const [policiesRequiringMapOrGPS] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesRequiringMapOrGPSSelector});

    return useCallback(
        (...policyIDsToCheck: [string?]) => {
            const policyIDToCheck = policyIDsToCheck.length > 0 ? policyIDsToCheck[0] : policyID;
            if (!isManualDistanceRequest && !isOdometerDistanceRequest) {
                return false;
            }

            if (!policyIDToCheck || !policiesRequiringMapOrGPS?.[policyIDToCheck]) {
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
        },
        [policyID, isManualDistanceRequest, isOdometerDistanceRequest, policiesRequiringMapOrGPS, showConfirmModal, translate, styles, illustrations.HouseWithMap],
    );
}

export default useBlockDistanceRequest;

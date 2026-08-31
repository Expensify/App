import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {isCommuterExclusionEnabled, isMapOrGPSRequired} from '@libs/PolicyDistanceRatesUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type Policy from '@src/types/onyx/Policy';
import type PrivatePersonalDetails from '@src/types/onyx/PrivatePersonalDetails';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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

    /** Whether the current flow is for any distance request */
    isDistanceRequest?: boolean;
};

type PolicyRequiringMapOrGPS = {
    /** Only set when commuter exclusions are configured, since the method is what decides the home address prompt */
    commuterExclusionMethod?: NonNullable<Policy['commuterExclusions']>['method'];
    name: Policy['name'];
};

type PoliciesRequiringMapOrGPS = Record<string, PolicyRequiringMapOrGPS>;

type BlockDistanceRequestReason = 'mapOrGpsRequired' | 'homeAddressRequired';

// Commuter exclusions are derived from the mapped route, so they require map or GPS on their own. The
// `requireMapOrGPS` setting requires it without any exclusion configured, hence no method for those policies.
const policiesRequiringMapOrGPSSelector = (policies: OnyxCollection<Policy>): PoliciesRequiringMapOrGPS =>
    Object.values(policies ?? {}).reduce<PoliciesRequiringMapOrGPS>((acc, policy) => {
        if (!policy?.id || !isMapOrGPSRequired(policy)) {
            return acc;
        }

        acc[policy.id] = {
            commuterExclusionMethod: isCommuterExclusionEnabled(policy) ? policy.commuterExclusions.method : undefined,
            name: policy.name,
        };
        return acc;
    }, {});

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => !!getCurrentAddress(privatePersonalDetails)?.street?.trim();

/**
 * Returns a function that blocks unsupported distance flows for policies that require GPS or map entry,
 * either through the `requireMapOrGPS` setting or through commuter exclusions. Callers can pass an override
 * policy ID when checking a newly selected workspace before committing it.
 *
 * When a block occurs, it surfaces the relevant modal and returns true so callers
 * can early return.
 */
function useBlockDistanceRequest({policyID, isManualDistanceRequest = false, isOdometerDistanceRequest = false, isDistanceRequest = false}: UseBlockDistanceRequestParams) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['HouseWithMap']);
    const [policiesRequiringMapOrGPS] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesRequiringMapOrGPSSelector});
    const [hasHomeAddress] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: hasHomeAddressSelector});

    const getBlockReason = useCallback(
        (policyIDToCheck: string | undefined): BlockDistanceRequestReason | undefined => {
            if (!policyIDToCheck || !policiesRequiringMapOrGPS?.[policyIDToCheck]) {
                return;
            }

            if (isManualDistanceRequest || isOdometerDistanceRequest) {
                return 'mapOrGpsRequired';
            }

            if (isDistanceRequest && policiesRequiringMapOrGPS[policyIDToCheck].commuterExclusionMethod === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE && !hasHomeAddress) {
                return 'homeAddressRequired';
            }
        },
        [hasHomeAddress, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, policiesRequiringMapOrGPS],
    );

    const showBlockModal = useCallback(
        (reason: BlockDistanceRequestReason, policyIDToCheck: string | undefined) => {
            const baseModalProps = {
                image: illustrations.HouseWithMap,
                titleStyles: styles.textHeadline,
                promptStyles: styles.textSupporting,
                shouldShowCancelButton: false,
                shouldUseSuccessStyleForConfirm: true,
                shouldFitImageToContainer: true,
                imageStyles: styles.commuterExclusionStaticIllustration,
                shouldShowDismissIcon: false,
            };
            if (reason === 'homeAddressRequired') {
                showConfirmModal({
                    ...baseModalProps,
                    title: translate('iou.homeAddressRequired.title'),
                    prompt: translate('iou.homeAddressRequired.prompt', {workspaceName: policyIDToCheck ? (policiesRequiringMapOrGPS?.[policyIDToCheck]?.name ?? '') : ''}),
                    confirmText: translate('iou.homeAddressRequired.cta'),
                }).then(({action: modalAction}) => {
                    if (modalAction !== ModalActions.CONFIRM) {
                        return;
                    }
                    Navigation.navigate(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1));
                });
                return;
            }

            showConfirmModal({
                ...baseModalProps,
                title: translate('distance.error.mapOrGpsDistanceRequired.title'),
                prompt: translate('distance.error.mapOrGpsDistanceRequired.description'),
                confirmText: translate('common.buttonConfirm'),
            });
        },
        [illustrations.HouseWithMap, policiesRequiringMapOrGPS, showConfirmModal, styles, translate],
    );

    const blockDistanceRequestIfNeeded = useCallback(
        (...policyIDsToCheck: [string?]) => {
            const policyIDToCheck = policyIDsToCheck.length > 0 ? policyIDsToCheck[0] : policyID;
            const reason = getBlockReason(policyIDToCheck);
            if (!reason) {
                return false;
            }

            showBlockModal(reason, policyIDToCheck);
            return true;
        },
        [getBlockReason, policyID, showBlockModal],
    );

    return blockDistanceRequestIfNeeded;
}

export default useBlockDistanceRequest;

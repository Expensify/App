import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {isCommuterExclusionEnabled} from '@libs/PolicyDistanceRatesUtils';

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

type UseCommuterExclusionGuardParams = {
    /** Policy ID to check by default */
    policyID?: string;

    /** Whether the current flow is for a manual distance request */
    isManualDistanceRequest?: boolean;

    /** Whether the current flow is for an odometer distance request */
    isOdometerDistanceRequest?: boolean;

    /** Whether the current flow is for any distance request */
    isDistanceRequest?: boolean;
};

type PolicyWithCommuterExclusions = {
    method: NonNullable<Policy['commuterExclusions']>['method'];
    name: Policy['name'];
};

type PoliciesWithCommuterExclusions = Record<string, PolicyWithCommuterExclusions>;

type CommuterExclusionGuardReason = 'mapOrGpsRequired' | 'homeAddressRequired';

const policiesWithCommuterExclusionsSelector = (policies: OnyxCollection<Policy>): PoliciesWithCommuterExclusions =>
    Object.values(policies ?? {}).reduce<PoliciesWithCommuterExclusions>((acc, policy) => {
        if (isCommuterExclusionEnabled(policy)) {
            acc[policy.id] = {
                method: policy.commuterExclusions.method,
                name: policy.name,
            };
        }
        return acc;
    }, {});

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => !!getCurrentAddress(privatePersonalDetails)?.street?.trim();

/**
 * Returns a guard function that blocks unsupported distance flows for policies with
 * commuter exclusions configured. Callers can pass an override policy ID when
 * checking a newly selected workspace before committing it.
 *
 * When a block occurs, it surfaces the relevant modal and returns true so callers
 * can early return.
 */
function useCommuterExclusionGuard({policyID, isManualDistanceRequest = false, isOdometerDistanceRequest = false, isDistanceRequest = false}: UseCommuterExclusionGuardParams) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['HouseWithMap']);
    const [policiesWithCommuterExclusions] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesWithCommuterExclusionsSelector});
    const [hasHomeAddress] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: hasHomeAddressSelector});

    const getGuardReason = useCallback(
        (policyIDToCheck: string | undefined): CommuterExclusionGuardReason | undefined => {
            if (!policyIDToCheck || !policiesWithCommuterExclusions?.[policyIDToCheck]) {
                return;
            }

            if (isManualDistanceRequest || isOdometerDistanceRequest) {
                return 'mapOrGpsRequired';
            }

            if (isDistanceRequest && policiesWithCommuterExclusions[policyIDToCheck].method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE && !hasHomeAddress) {
                return 'homeAddressRequired';
            }
        },
        [hasHomeAddress, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, policiesWithCommuterExclusions],
    );

    const showGuardModal = useCallback(
        (reason: CommuterExclusionGuardReason, policyIDToCheck: string | undefined) => {
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
                    prompt: translate('iou.homeAddressRequired.prompt', {workspaceName: policyIDToCheck ? (policiesWithCommuterExclusions?.[policyIDToCheck]?.name ?? '') : ''}),
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
        [illustrations.HouseWithMap, policiesWithCommuterExclusions, showConfirmModal, styles, translate],
    );

    const blockDistanceRequestIfNeeded = useCallback(
        (...policyIDsToCheck: [string?]) => {
            const policyIDToCheck = policyIDsToCheck.length > 0 ? policyIDsToCheck[0] : policyID;
            const reason = getGuardReason(policyIDToCheck);
            if (!reason) {
                return false;
            }

            showGuardModal(reason, policyIDToCheck);
            return true;
        },
        [getGuardReason, policyID, showGuardModal],
    );

    return blockDistanceRequestIfNeeded;
}

export default useCommuterExclusionGuard;

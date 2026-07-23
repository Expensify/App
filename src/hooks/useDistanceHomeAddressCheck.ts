import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import {useCallback} from 'react';

import useConfirmModal from './useConfirmModal';
import {useMemoizedLazyIllustrations} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseDistanceHomeAddressCheckResult = {
    /**
     * True when the destination workspace uses homeAndOffice commuter exclusions but the current
     * user has no saved home address.
     */
    needsHomeAddressPrompt: boolean;

    /**
     * Show the blocking "Home address is required" modal.
     */
    promptForHomeAddress: () => void;
};

function useDistanceHomeAddressCheck(policy: OnyxEntry<Policy>): UseDistanceHomeAddressCheckResult {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['House']);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    const usesHomeAndOfficeExclusions = policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE;
    const memberHasHomeAddress = (privatePersonalDetails?.addresses ?? []).some((addressEntry) => !!addressEntry?.street?.trim());
    const needsHomeAddressPrompt = usesHomeAndOfficeExclusions && !memberHasHomeAddress;

    const promptForHomeAddress = useCallback(() => {
        showConfirmModal({
            image: illustrations.House,
            title: translate('iou.homeAddressRequired.title'),
            prompt: translate('iou.homeAddressRequired.prompt', {workspaceName: policy?.name ?? ''}),
            confirmText: translate('iou.homeAddressRequired.cta'),
            shouldShowCancelButton: false,
            shouldShowDismissIcon: true,
        }).then(({action: modalAction}) => {
            if (modalAction !== ModalActions.CONFIRM) {
                return;
            }
            Navigation.navigate(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1));
        });
    }, [illustrations.House, policy?.name, showConfirmModal, translate]);

    return {needsHomeAddressPrompt, promptForHomeAddress};
}

export default useDistanceHomeAddressCheck;

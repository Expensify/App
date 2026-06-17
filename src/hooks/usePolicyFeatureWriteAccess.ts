import {canMemberWrite} from '@libs/PolicyUtils';
import type {PolicyFeature} from '@libs/PolicyUtils';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';
import useConfirmModal from './useConfirmModal';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';

function usePolicyFeatureWriteAccess(policy: OnyxInputOrEntry<Policy>, feature: PolicyFeature) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const canWrite = canMemberWrite(policy, currentUserLogin, feature);

    const showReadOnlyModal = () => {
        showConfirmModal({
            title: translate('workspace.common.readOnlyActionTitle'),
            prompt: translate('workspace.common.readOnlyActionPrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const withReadOnlyFallback = (disabledAction?: () => void | Promise<void>) => {
        if (!canWrite) {
            return showReadOnlyModal;
        }

        return disabledAction;
    };

    return {canWrite, showReadOnlyModal, withReadOnlyFallback};
}

export default usePolicyFeatureWriteAccess;

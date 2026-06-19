import {selectRestrictedPrimaryPolicyID} from '@selectors/Domain';
import {isAdminForPolicyByIDSelector} from '@selectors/Policy';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

function useDomainGroupMoveValidation(domainAccountID: number, targetGroupId: string | undefined) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [targetPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectRestrictedPrimaryPolicyID(targetGroupId),
    });

    const [isAdminForTargetPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: isAdminForPolicyByIDSelector(targetPolicyID),
    });

    const showBlockedModal = () => {
        showConfirmModal({
            title: translate('workspace.distanceRates.oopsNotSoFast'),
            prompt: translate('domain.members.error.moveMemberNotPolicyAdmin'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    return {isBlocked: !isAdminForTargetPolicy, showBlockedModal};
}

export default useDomainGroupMoveValidation;

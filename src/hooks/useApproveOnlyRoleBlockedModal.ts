/**
 * Shared modals for approve-only role changes. The backend can refuse the role and list why in
 * `response.data.blockedReasons`, so both the single-member page and bulk actions show the same copy.
 */
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

function useApproveOnlyRoleBlockedModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const showApproveOnlyBlockedModal = (blockedReasons: string[]) => {
        const reasonTranslationKeys: Record<string, TranslationPaths> = {
            [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.HAS_CARD_ON_POLICY]: 'workspace.people.approveOnlyRoleBlockedReasons.hasCardOnPolicy',
            [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.IS_RESTRICTED_BY_DOMAIN_GROUP]: 'workspace.people.approveOnlyRoleBlockedReasons.isRestrictedByDomainGroup',
            [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.IS_DEFAULT_POLICY]: 'workspace.people.approveOnlyRoleBlockedReasons.isDefaultPolicy',
        };
        // Skip reasons outside the known set instead of showing wrong copy for a value the backend added later.
        const reasonLines = blockedReasons.filter((reason) => reason in reasonTranslationKeys).map((reason) => `• ${translate(reasonTranslationKeys[reason])}`);
        showConfirmModal({
            title: translate('workspace.people.approveOnlyRoleBlockedTitle'),
            prompt: [translate('workspace.people.approveOnlyRoleBlockedDescription'), '', ...reasonLines].join('\n'),
            confirmText: translate('workspace.people.approveOnlyRoleBlockedConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const showRoleUpdateErrorModal = () => {
        showConfirmModal({
            title: translate('workspace.people.approveOnlyRoleBlockedTitle'),
            prompt: translate('common.genericErrorMessage'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    return {showApproveOnlyBlockedModal, showRoleUpdateErrorModal};
}

export default useApproveOnlyRoleBlockedModal;

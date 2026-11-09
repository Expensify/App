import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import usePreferredPolicy from './usePreferredPolicy';

/**
 * Flows that create a workspace on the fly (e.g. moving a tracked expense when the user has no workspace) use this to stop
 * members of a domain group that restricts workspace creation, since the server rejects the new workspace for them.
 * Check `isRestrictedPolicyCreation` before creating the workspace, and call `showRestrictedPolicyCreationModal` instead to tell the user why.
 */
function useRestrictedPolicyCreationModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();

    const showRestrictedPolicyCreationModal = () => {
        showConfirmModal({
            title: translate('workspace.upgrade.commonFeatures.createWorkspaceWarning'),
            prompt: translate('workspace.upgrade.commonFeatures.upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    return {isRestrictedPolicyCreation, showRestrictedPolicyCreationModal};
}

export default useRestrictedPolicyCreationModal;

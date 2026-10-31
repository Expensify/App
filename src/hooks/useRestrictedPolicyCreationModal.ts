import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import usePreferredPolicy from './usePreferredPolicy';

/**
 * Flows that create a workspace on the fly (e.g. moving a tracked expense when the user has no workspace) use this to stop
 * members of a domain group that restricts workspace creation, since the server rejects the new workspace for them.
 *
 * Returns a function that shows the "Can't create workspace" modal, or undefined when the user is allowed to create workspaces.
 * Keeping it one value means a flow can't check the restriction and forget to tell the user why it stopped.
 */
function useRestrictedPolicyCreationModal(): (() => void) | undefined {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();

    if (!isRestrictedPolicyCreation) {
        return undefined;
    }

    return () => {
        showConfirmModal({
            title: translate('workspace.upgrade.commonFeatures.createWorkspaceWarning'),
            prompt: translate('workspace.upgrade.commonFeatures.upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };
}

export default useRestrictedPolicyCreationModal;

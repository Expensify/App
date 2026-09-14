import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

/**
 * Controller that owns the RAM_ONLY_UPDATE_AVAILABLE Onyx subscription and shows the update prompt on the global
 * modal stack. It renders nothing itself.
 *
 * It is mounted last in `GlobalModals` on purpose: only the top of the modal stack is rendered, so the controller
 * whose effect runs last is the one whose modal ends up on top, and this prompt has to stay above the screen-share one.
 */
function UpdateAppModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [updateAvailable] = useOnyx(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE);

    // The flag is only ever set to `true` (see `triggerUpdateAvailable`), so nothing hides the prompt again on its own.
    // This ref is what keeps it to one showing, the way the local `isModalOpen` state used to.
    const isPromptShownRef = useRef(false);

    useEffect(() => {
        if (!updateAvailable || isPromptShownRef.current) {
            return;
        }
        isPromptShownRef.current = true;

        // Confirming and cancelling both only closed the modal, so neither branch has anything left to do here.
        showConfirmModal({
            title: translate('baseUpdateAppModal.updateApp'),
            prompt: translate('baseUpdateAppModal.updatePrompt'),
            confirmText: translate('baseUpdateAppModal.updateApp'),
            cancelText: translate('common.cancel'),
        });
    }, [showConfirmModal, translate, updateAvailable]);

    return null;
}

export default UpdateAppModal;

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Owns the RAM_ONLY_UPDATE_AVAILABLE Onyx subscription and shows the update prompt on the global modal stack.
 *
 * Call this from a component that is mounted only after startup: the subscription is what has to be kept out of the
 * ManualAppStartup span, and `useOnyx` has no way to skip subscribing, so deferring the call site is the only lever.
 */
function useUpdateAppPrompt() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [updateAvailable] = useOnyx(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE);

    // The flag is only ever set to `true` (see `triggerUpdateAvailable`), so nothing hides the prompt again on its own
    // and this ref is what keeps it to one showing.
    const isPromptShownRef = useRef(false);

    useEffect(() => {
        if (!updateAvailable || isPromptShownRef.current) {
            return;
        }
        isPromptShownRef.current = true;

        showConfirmModal({
            title: translate('baseUpdateAppModal.updateApp'),
            prompt: translate('baseUpdateAppModal.updatePrompt'),
            confirmText: translate('baseUpdateAppModal.updateApp'),
            cancelText: translate('common.cancel'),
        });
    }, [showConfirmModal, translate, updateAvailable]);
}

export default useUpdateAppPrompt;

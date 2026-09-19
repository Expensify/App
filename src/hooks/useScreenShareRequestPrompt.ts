import {ModalActions} from '@components/Modal/Global/ModalContext';

import {clearScreenShareRequest, joinScreenShare} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Owns the SCREEN_SHARE_REQUEST Onyx subscription and shows the screen-share confirmation prompt on the global modal
 * stack when a GuidesPlus agent requests one.
 *
 * Call this from a component that is mounted only after startup: the subscription is what has to be kept out of the
 * ManualAppStartup span, and `useOnyx` has no way to skip subscribing, so deferring the call site is the only lever.
 */
function useScreenShareRequestPrompt() {
    const {translate} = useLocalize();
    const {showConfirmModal, closeModal} = useConfirmModal();
    const [screenShareRequest] = useOnyx(ONYXKEYS.SCREEN_SHARE_REQUEST);

    // Keeps a re-render from stacking a second prompt on top of the one that is already open. Both branches below clear
    // SCREEN_SHARE_REQUEST, so clearing the key is what makes the next request eligible to show a prompt again.
    const isPromptShownRef = useRef(false);

    // Tracks whether this hook's entry is still on the modal stack, which `isPromptShownRef` cannot answer: it stays
    // true from the moment the prompt is shown until the key is cleared, which is *after* the user has answered and the
    // entry has already been popped. Closing on that would pop whatever unrelated modal is on top by then.
    const isPromptOpenRef = useRef(false);

    // The request is read when the user answers rather than when the prompt is shown, so a request replaced while the
    // prompt is open is still joined with the token that is current.
    const screenShareRequestRef = useRef(screenShareRequest);

    useEffect(() => {
        screenShareRequestRef.current = screenShareRequest;

        if (!screenShareRequest) {
            isPromptShownRef.current = false;

            // The modal stack is imperative, so the entry has to be popped by hand when something other than the two
            // branches below clears the key - most concretely `Onyx.clear()` on logout. Without this the prompt stays
            // up over the signed-out state, and a later request stacks a second prompt that uncovers this stale one
            // again once it is answered.
            if (isPromptOpenRef.current) {
                isPromptOpenRef.current = false;
                closeModal();
            }
            return;
        }

        if (isPromptShownRef.current) {
            return;
        }
        isPromptShownRef.current = true;
        isPromptOpenRef.current = true;

        showConfirmModal({
            title: translate('guides.screenShare'),
            prompt: translate('guides.screenShareRequest'),
            confirmText: translate('common.join'),
            cancelText: translate('common.decline'),
        }).then((result) => {
            // The entry is off the stack by the time this resolves, however it was closed, so nothing below may call
            // `closeModal()` for it again.
            isPromptOpenRef.current = false;

            const request = screenShareRequestRef.current;

            // The key is already gone when the effect above closed this prompt because the request disappeared on its
            // own, so there is nothing left to join and nothing left to clear.
            if (!request) {
                return;
            }

            if (result.action !== ModalActions.CONFIRM) {
                clearScreenShareRequest();
                return;
            }

            // `joinScreenShare` clears SCREEN_SHARE_REQUEST itself.
            joinScreenShare(request.accessToken, request.roomName);
        });
    }, [closeModal, screenShareRequest, showConfirmModal, translate]);
}

export default useScreenShareRequestPrompt;

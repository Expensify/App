import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {clearScreenShareRequest, joinScreenShare} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import {ModalActions} from './Modal/Global/ModalContext';

/**
 * Controller that owns the SCREEN_SHARE_REQUEST Onyx subscription and shows the screen-share confirmation prompt on
 * the global modal stack when a GuidesPlus agent requests one. It renders nothing itself.
 */
function ScreenShareRequestModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [screenShareRequest] = useOnyx(ONYXKEYS.SCREEN_SHARE_REQUEST);

    // Keeps a re-render from stacking a second prompt on top of the one that is already open. Both branches below clear
    // SCREEN_SHARE_REQUEST, so clearing the key is what makes the next request eligible to show a prompt again.
    const isPromptShownRef = useRef(false);

    // The request is read when the user answers rather than when the prompt is shown, so that a request replaced while
    // the prompt is open is still joined with the token that is current, as it was when the modal read it on render.
    const screenShareRequestRef = useRef(screenShareRequest);

    useEffect(() => {
        screenShareRequestRef.current = screenShareRequest;

        if (!screenShareRequest) {
            isPromptShownRef.current = false;
            return;
        }

        if (isPromptShownRef.current) {
            return;
        }
        isPromptShownRef.current = true;

        showConfirmModal({
            title: translate('guides.screenShare'),
            prompt: translate('guides.screenShareRequest'),
            confirmText: translate('common.join'),
            cancelText: translate('common.decline'),
        }).then((result) => {
            const request = screenShareRequestRef.current;

            if (result.action !== ModalActions.CONFIRM || !request) {
                clearScreenShareRequest();
                return;
            }

            // `joinScreenShare` clears SCREEN_SHARE_REQUEST itself.
            joinScreenShare(request.accessToken, request.roomName);
        });
    }, [screenShareRequest, showConfirmModal, translate]);

    return null;
}

export default ScreenShareRequestModal;

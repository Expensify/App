import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearScreenShareRequest, joinScreenShare} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';

/**
 * Component that owns the SCREEN_SHARE_REQUEST Onyx subscription and renders
 * the screen-share confirmation modal when a GuidesPlus agent requests it.
 */
function ScreenShareRequestModal() {
    const {translate} = useLocalize();
    const [screenShareRequest] = useOnyx(ONYXKEYS.SCREEN_SHARE_REQUEST);

    if (!screenShareRequest) {
        return null;
    }

    return (
        <ConfirmModal
            title={translate('guides.screenShare')}
            onConfirm={() => joinScreenShare(screenShareRequest.accessToken, screenShareRequest.roomName)}
            onCancel={clearScreenShareRequest}
            prompt={translate('guides.screenShareRequest')}
            confirmText={translate('common.join')}
            cancelText={translate('common.decline')}
            isVisible
        />
    );
}

export default ScreenShareRequestModal;

import React, {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ConfirmModal from './ConfirmModal';

function FocusModeNotification() {
    const {translate} = useLocalize();
    useEffect(() => {
        User.updateChatPriorityMode(CONST.PRIORITY_MODE.GSD, true);
    }, []);
    return (
        <ConfirmModal
            title={translate('focusModeUpdateModal.title')}
            prompt={translate('focusModeUpdateModal.prompt')}
            confirmText={translate('common.buttonConfirm')}
            onConfirm={User.clearFocusModeNotification}
            shouldShowCancelButton={false}
            isVisible
        />
    );
}

FocusModeNotification.displayName = 'FocusModeNotification';
export default FocusModeNotification;

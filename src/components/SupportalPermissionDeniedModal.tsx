import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearSupportalPermissionDenied} from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';

function SupportalPermissionDeniedModal() {
    const {translate} = useLocalize();
    const [payload] = useOnyx(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED);
    const isVisible = !!payload;

    const title = translate('supportalNoAccess.title');
    const prompt = translate('supportalNoAccess.descriptionWithCommand', payload?.command);

    const close = () => {
        // Clear the flag so it doesn't re-open
        clearSupportalPermissionDenied();
    };

    return (
        <ConfirmModal
            isVisible={isVisible}
            onConfirm={close}
            onCancel={close}
            title={title}
            prompt={prompt}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
        />
    );
}

export default SupportalPermissionDeniedModal;

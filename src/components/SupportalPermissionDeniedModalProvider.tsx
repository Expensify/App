import type React from 'react';
import {useEffect} from 'react';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearSupportalPermissionDenied} from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';

function SupportalPermissionDeniedModalProvider({children}: React.PropsWithChildren) {
    const {translate} = useLocalize();
    const [payload] = useOnyx(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED);
    const isVisible = !!payload;
    const {showConfirmModal} = useConfirmModal();

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        showConfirmModal({
            title: translate('supportalNoAccess.title'),
            prompt: translate('supportalNoAccess.descriptionWithCommand', {command: payload?.command}),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        }).then(() => {
            clearSupportalPermissionDenied();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    return children;
}

export default SupportalPermissionDeniedModalProvider;

import {useEffect, useEffectEvent, useRef} from 'react';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearSupportalPermissionDenied} from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';

function SupportalPermissionDeniedModal() {
    const {translate} = useLocalize();
    const [supportalPermissionDeniedPayload] = useOnyx(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED);
    const {showConfirmModal} = useConfirmModal();
    const isSupportalModalOpenRef = useRef(false);

    const showSupportalPermissionDeniedModal = useEffectEvent((command: string | undefined) => {
        if (isSupportalModalOpenRef.current) {
            return;
        }
        isSupportalModalOpenRef.current = true;
        showConfirmModal({
            title: translate('supportalNoAccess.title'),
            prompt: translate('supportalNoAccess.descriptionWithCommand', command),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        }).then(() => {
            isSupportalModalOpenRef.current = false;
            clearSupportalPermissionDenied();
        });
    });

    useEffect(() => {
        if (!supportalPermissionDeniedPayload) {
            return;
        }
        showSupportalPermissionDeniedModal(supportalPermissionDeniedPayload.command);
    }, [supportalPermissionDeniedPayload]);

    return null;
}

export default SupportalPermissionDeniedModal;

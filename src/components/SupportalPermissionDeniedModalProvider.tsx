import type React from 'react';
import {useCallback, useEffect, useMemo} from 'react';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearSupportalPermissionDenied} from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';

function SupportalPermissionDeniedModalProvider({children}: React.PropsWithChildren) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [payload] = useOnyx(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED, {canBeMissing: true});
    const isVisible = !!payload;

    const title = useMemo(() => translate('supportalNoAccess.title'), [translate]);
    const prompt = useMemo(() => translate('supportalNoAccess.descriptionWithCommand', {command: payload?.command}), [translate, payload?.command]);

    const close = useCallback(() => {
        // Clear the flag so it doesn't re-open
        clearSupportalPermissionDenied();
    }, []);

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        showConfirmModal({
            title,
            prompt,
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        }).then(() => {
            close();
        });
    }, [isVisible, title, prompt, close, showConfirmModal, translate]);

    return children;
}

SupportalPermissionDeniedModalProvider.displayName = 'SupportalPermissionDeniedModalProvider';

export default SupportalPermissionDeniedModalProvider;

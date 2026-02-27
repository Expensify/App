import React, {useCallback, useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearSupportalPermissionDenied} from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';

function SupportalPermissionDeniedModalProvider({children}: React.PropsWithChildren) {
    const {translate} = useLocalize();
    const [payload] = useOnyx(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED, {canBeMissing: true});
    const isVisible = !!payload;

    const title = useMemo(() => translate('supportalNoAccess.title'), [translate]);
    const prompt = useMemo(() => translate('supportalNoAccess.descriptionWithCommand', {command: payload?.command}), [translate, payload?.command]);

    const close = useCallback(() => {
        // Clear the flag so it doesn't re-open
        clearSupportalPermissionDenied();
    }, []);

    return (
        <>
            {children}
            <ConfirmModal
                isVisible={isVisible}
                onConfirm={close}
                onCancel={close}
                title={title}
                prompt={prompt}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </>
    );
}

export default SupportalPermissionDeniedModalProvider;

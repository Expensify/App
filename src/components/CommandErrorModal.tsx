import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {clearCommandError} from '@userActions/CommandError';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useEffectEvent, useRef} from 'react';

/**
 * Shows the backend's rejection message for any API command that opted into user-facing error surfacing through
 * the `SurfaceCommandError` middleware. It is mounted globally because the screen that started the request is
 * usually already dismissed by the time the response arrives.
 */
function CommandErrorModal() {
    const {translate} = useLocalize();
    const [commandError] = useOnyx(ONYXKEYS.RAM_ONLY_COMMAND_ERROR);
    const {showConfirmModal} = useConfirmModal();
    const isModalOpenRef = useRef(false);

    const showCommandErrorModal = useEffectEvent((message: string | undefined) => {
        if (isModalOpenRef.current) {
            return;
        }
        isModalOpenRef.current = true;
        showConfirmModal({
            // The backend message is a complete, self-contained sentence that carries its own lead-in, so a title
            // would only repeat it. Only the generic fallback copy needs one.
            title: message ? undefined : translate('common.headsUp'),
            prompt: message ?? translate('common.genericErrorMessage'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        }).then(() => {
            isModalOpenRef.current = false;
            clearCommandError();
        });
    });

    useEffect(() => {
        if (!commandError) {
            return;
        }
        showCommandErrorModal(commandError.message);
    }, [commandError]);

    return null;
}

export default CommandErrorModal;

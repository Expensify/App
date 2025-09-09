import React, {useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';

function SupportalPermissionDeniedModalProvider({children}: React.PropsWithChildren) {
    const {translate} = useLocalize();
    const [payload] = useOnyx(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED, {canBeMissing: true});
    const [isVisible, setIsVisible] = useState(false);

    const title = 'Invalid Supportal Action';
    const prompt =
        'You do not have the permission to take the requested action while using Supportal. If you think that Success should be able to take this action, please start a conversation in Slack.';

    React.useEffect(() => {
        setIsVisible(!!payload);
    }, [payload]);

    const close = () => {
        setIsVisible(false);
        // Clear the flag so it doesn't re-open
        // We intentionally set to null to keep key present but empty
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.resolve().then(() => window?.Onyx?.set?.(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED, null));
    };

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

SupportalPermissionDeniedModalProvider.displayName = 'SupportalPermissionDeniedModalProvider';

export default SupportalPermissionDeniedModalProvider;

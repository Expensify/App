import {useEffect} from 'react';
import {RESULTS} from 'react-native-permissions';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setHasDeniedContactImportPrompt} from '@libs/actions/ContactPermissions';
import {getContactPermission, requestContactPermission} from '@libs/ContactPermission';
import ONYXKEYS from '@src/ONYXKEYS';
import type ContactPermissionModalProps from './types';

function ContactPermissionModal({onDeny, onGrant, onFocusTextInput}: ContactPermissionModalProps) {
    const [hasDeniedContactImportPrompt] = useOnyx(ONYXKEYS.HAS_DENIED_CONTACT_IMPORT_PROMPT);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['ToddWithPhones']);
    const {showConfirmModal} = useConfirmModal();

    const handleGrantPermission = () => {
        requestContactPermission().then((status) => {
            onFocusTextInput();
            if (status !== RESULTS.GRANTED) {
                return;
            }
            onGrant();
        });
    };

    const handleCloseModal = () => {
        setHasDeniedContactImportPrompt(true);
        onDeny(RESULTS.DENIED);
        onFocusTextInput();
    };

    useEffect(() => {
        if (hasDeniedContactImportPrompt) {
            onFocusTextInput();
            return;
        }
        getContactPermission().then(async (status) => {
            // Permission hasn't been asked yet, show the soft permission modal
            if (status !== RESULTS.DENIED) {
                onFocusTextInput();
                return;
            }

            const result = await showConfirmModal({
                confirmText: translate('common.continue'),
                cancelText: translate('common.noThanks'),
                prompt: translate('contact.importContactsText'),
                promptStyles: [styles.textLabelSupportingEmptyValue, styles.mb4],
                title: translate('contact.importContactsTitle'),
                titleContainerStyles: [styles.mt2, styles.mb0],
                titleStyles: [styles.textHeadline],
                iconSource: illustrations.ToddWithPhones,
                iconFill: false,
                iconWidth: 176,
                iconHeight: 178,
                shouldCenterIcon: true,
                shouldReverseStackedButtons: true,
            });

            if (result?.action === ModalActions.CONFIRM) {
                handleGrantPermission();
            } else {
                handleCloseModal();
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ContactPermissionModal;

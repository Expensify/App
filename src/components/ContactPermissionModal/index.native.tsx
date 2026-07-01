import {useEffect} from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
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
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['ToddWithPhones']);

    useEffect(() => {
        const checkPermissions = async () => {
            if (hasDeniedContactImportPrompt) {
                onFocusTextInput();
                return;
            }

            const status = await getContactPermission();
            // Permission hasn't been asked yet, show the soft permission modal
            if (status !== RESULTS.DENIED) {
                onFocusTextInput();
                return;
            }

            const {action} = await showConfirmModal({
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

            if (action === ModalActions.CONFIRM) {
                InteractionManager.runAfterInteractions(async () => {
                    const permissionStatus = await requestContactPermission();
                    onFocusTextInput();
                    if (permissionStatus === RESULTS.GRANTED) {
                        onGrant();
                    }
                });
            } else {
                setHasDeniedContactImportPrompt(true);
                onDeny(RESULTS.DENIED);
                // Sometimes, the input gains focus when the modal closes, but the keyboard doesn't appear.
                // To fix this, we need to call the focus function after the modal has finished closing.
                InteractionManager.runAfterInteractions(() => {
                    onFocusTextInput();
                });
            }
        };

        checkPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ContactPermissionModal;

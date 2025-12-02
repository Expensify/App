import React, {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import ConfirmModal from '@components/ConfirmModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setHasDeniedContactImportPrompt} from '@libs/actions/ContactPermissions';
import {getContactPermission, requestContactPermission} from '@libs/ContactPermission';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ContactPermissionModalProps} from './types';

function ContactPermissionModal({onDeny, onGrant, onFocusTextInput}: ContactPermissionModalProps) {
    const [hasDeniedContactImportPrompt] = useOnyx(ONYXKEYS.HAS_DENIED_CONTACT_IMPORT_PROMPT, {canBeMissing: true});
    const [isModalVisible, setIsModalVisible] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['ToddWithPhones'] as const);

    useEffect(() => {
        if (hasDeniedContactImportPrompt) {
            onFocusTextInput();
            return;
        }
        getContactPermission().then((status) => {
            // Permission hasn't been asked yet, show the soft permission modal
            if (status !== RESULTS.DENIED) {
                onFocusTextInput();
                return;
            }
            setIsModalVisible(true);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const handleGrantPermission = () => {
        setIsModalVisible(false);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            requestContactPermission().then((status) => {
                onFocusTextInput();
                if (status !== RESULTS.GRANTED) {
                    return;
                }
                onGrant();
            });
        });
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setHasDeniedContactImportPrompt(true);
        onDeny(RESULTS.DENIED);
        // Sometimes, the input gains focus when the modal closes, but the keyboard doesn't appear.
        // To fix this, we need to call the focus function after the modal has finished closing.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            onFocusTextInput();
        });
    };

    if (hasDeniedContactImportPrompt) {
        return;
    }

    return (
        <ConfirmModal
            isVisible={isModalVisible}
            onConfirm={handleGrantPermission}
            onCancel={handleCloseModal}
            onBackdropPress={handleCloseModal}
            confirmText={translate('common.continue')}
            cancelText={translate('common.noThanks')}
            prompt={translate('contact.importContactsText')}
            promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]}
            title={translate('contact.importContactsTitle')}
            titleContainerStyles={[styles.mt2, styles.mb0]}
            titleStyles={[styles.textHeadline]}
            iconSource={illustrations.ToddWithPhones}
            iconFill={false}
            iconWidth={176}
            iconHeight={178}
            shouldCenterIcon
            shouldReverseStackedButtons
        />
    );
}

ContactPermissionModal.displayName = 'ContactPermissionModal';

export default ContactPermissionModal;

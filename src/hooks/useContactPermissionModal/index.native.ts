import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setHasDeniedContactImportPrompt} from '@libs/actions/ContactPermissions';
import {getContactPermission, requestContactPermission} from '@libs/ContactPermission';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useEffectEvent, useRef} from 'react';
import {RESULTS} from 'react-native-permissions';

import type UseContactPermissionModalParams from './types';

function useContactPermissionModal({onDeny, onGrant, onFocusTextInput}: UseContactPermissionModalParams) {
    const [hasDeniedContactImportPrompt, hasDeniedContactImportPromptMetadata] = useOnyx(ONYXKEYS.HAS_DENIED_CONTACT_IMPORT_PROMPT);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['ToddWithPhones']);
    const {showConfirmModal} = useConfirmModal();

    const isMountedRef = useRef(false);

    // illustrations is a placeholder on first load and updates once the real asset loads, but runContactPermissionFlow
    // (called inside a useEffect that doesn't depend on it) can still be mid-flight when that happens, so we read it via ref to get the latest value.
    const illustrationsRef = useRef(illustrations);

    useEffect(() => {
        illustrationsRef.current = illustrations;
    }, [illustrations]);

    const runContactPermissionFlow = useEffectEvent(async () => {
        if (hasDeniedContactImportPrompt) {
            onFocusTextInput();
            return;
        }

        try {
            const status = await getContactPermission();

            if (!isMountedRef.current) {
                return;
            }

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
                iconSource: illustrationsRef.current.ToddWithPhones,
                iconFill: false,
                iconWidth: 176,
                iconHeight: 178,
                shouldCenterIcon: true,
                shouldReverseStackedButtons: true,
            });

            if (!isMountedRef.current) {
                return;
            }

            if (result?.action === ModalActions.CONFIRM) {
                try {
                    const permissionStatus = await requestContactPermission();
                    onFocusTextInput();
                    if (permissionStatus === RESULTS.GRANTED) {
                        onGrant();
                    }
                } catch (error) {
                    Log.warn('[useContactPermissionModal] Failed to request contact permission', {error});
                    onFocusTextInput();
                }
            } else {
                setHasDeniedContactImportPrompt(true);
                onDeny(RESULTS.DENIED);
                onFocusTextInput();
            }
        } catch (error) {
            Log.warn('[useContactPermissionModal] Failed to read contact permission', {error});
            if (!isMountedRef.current) {
                return;
            }
            onFocusTextInput();
        }
    });

    useEffect(() => {
        if (hasDeniedContactImportPromptMetadata.status === 'loading') {
            return;
        }

        isMountedRef.current = true;
        runContactPermissionFlow();

        return () => {
            isMountedRef.current = false;
        };
    }, [hasDeniedContactImportPrompt, hasDeniedContactImportPromptMetadata.status]);
}

export default useContactPermissionModal;

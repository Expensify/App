import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import getPlatform from '@libs/getPlatform';
import {acquireBackgroundInputFocusSuppression} from '@libs/ModalFocusManager';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {ModalProps} from './ModalContext';

import Modal from '..';
import {ModalActions} from './ModalContext';

type MobileSelectionMenuModalWrapperProps = ModalProps &
    WithSentryLabel & {
        testID?: string;

        /** Prevent the background input from regaining focus on iOS when entering selection mode. */
        shouldSkipFocusRestoreOnSelect?: boolean;
    };

// Renders the bottom-docked "Select" menu a row long press opens on narrow layouts, and resolves the caller's promise with CONFIRM when the user picks
// "Select" or CLOSE otherwise. What selecting does is up to the caller, which chains it off that promise.
function MobileSelectionMenuModalWrapper({closeModal, resolveModal, sentryLabel, testID, shouldSkipFocusRestoreOnSelect = false}: MobileSelectionMenuModalWrapperProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['CheckSquare']);
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false});
    const [isVisible, setIsVisible] = useState(true);
    const closeActionRef = useRef<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);
    const releaseBackgroundInputFocusSuppressionRef = useRef<(() => void) | null>(null);
    const [shouldSkipFocusRestore, setShouldSkipFocusRestore] = useState(false);

    useEffect(
        () => () => {
            releaseBackgroundInputFocusSuppressionRef.current?.();
            releaseBackgroundInputFocusSuppressionRef.current = null;
        },
        [],
    );

    // `closeModal` pops whatever sits on top of the stack, so it must only run once for this entry
    const hasClosedRef = useRef(false);

    const handleSelect = () => {
        if (!isVisible) {
            return;
        }

        if (shouldSkipFocusRestoreOnSelect && getPlatform() === CONST.PLATFORM.IOS) {
            releaseBackgroundInputFocusSuppressionRef.current ??= acquireBackgroundInputFocusSuppression();
            setShouldSkipFocusRestore(true);
        }
        closeActionRef.current = ModalActions.CONFIRM;
        setIsVisible(false);

        // Settle the promise right away so the caller turns on selection mode while the menu fades out, instead of after it has hidden
        resolveModal({action: ModalActions.CONFIRM});
    };

    // Remove the menu from the stack only once it has finished hiding (on "Select" the promise was already settled above)
    const handleModalHide = () => {
        if (isVisible || hasClosedRef.current) {
            return;
        }
        hasClosedRef.current = true;
        releaseBackgroundInputFocusSuppressionRef.current?.();
        releaseBackgroundInputFocusSuppressionRef.current = null;
        closeModal({action: closeActionRef.current});
    };

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={() => setIsVisible(false)}
            onModalHide={handleModalHide}
            restoreFocusType={shouldSkipFocusRestore ? CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE : undefined}
            shouldPreventScrollOnFocus
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={bottomSafeAreaPaddingStyle}>
                <MenuItemAction
                    title={translate('common.select')}
                    icon={expensifyIcons.CheckSquare}
                    onPress={handleSelect}
                    sentryLabel={sentryLabel}
                    testID={testID}
                />
            </View>
        </Modal>
    );
}

export default MobileSelectionMenuModalWrapper;
export type {MobileSelectionMenuModalWrapperProps};

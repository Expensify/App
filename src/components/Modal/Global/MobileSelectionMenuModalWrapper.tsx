import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import type {ModalProps} from './ModalContext';

import Modal from '..';
import {ModalActions} from './ModalContext';

type MobileSelectionMenuModalWrapperProps = ModalProps & WithSentryLabel;

// Renders the bottom-docked "Select" menu a row long press opens on narrow layouts, and resolves the caller's promise with CONFIRM when the user picks
// "Select" or CLOSE otherwise. What selecting does is up to the caller, which chains it off that promise.
function MobileSelectionMenuModalWrapper({closeModal, sentryLabel}: MobileSelectionMenuModalWrapperProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['CheckSquare']);
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false});
    const [isVisible, setIsVisible] = useState(true);
    const closeActionRef = useRef<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);

    // `closeModal` pops whatever sits on top of the stack, so it must only run once for this entry
    const hasClosedRef = useRef(false);

    const handleSelect = () => {
        closeActionRef.current = ModalActions.CONFIRM;
        setIsVisible(false);
    };

    const handleModalHide = () => {
        if (isVisible || hasClosedRef.current) {
            return;
        }
        hasClosedRef.current = true;
        closeModal({action: closeActionRef.current});
    };

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={() => setIsVisible(false)}
            onModalHide={handleModalHide}
            shouldPreventScrollOnFocus
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={bottomSafeAreaPaddingStyle}>
                <MenuItemAction
                    title={translate('common.select')}
                    icon={expensifyIcons.CheckSquare}
                    onPress={handleSelect}
                    sentryLabel={sentryLabel}
                />
            </View>
        </Modal>
    );
}

export default MobileSelectionMenuModalWrapper;
export type {MobileSelectionMenuModalWrapperProps};

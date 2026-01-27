import React, {useContext, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import {PopoverContext} from '@components/PopoverProvider';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {onModalDidClose, setCloseModal, willAlertModalBecomeVisible} from '@libs/actions/Modal';
import CONST from '@src/CONST';
import viewRef from '@src/types/utils/viewRef';
import type PopoverWithoutOverlayProps from './types';

const NOOP = () => {};

function PopoverWithoutOverlay({
    anchorPosition = {},
    anchorRef,
    withoutOverlayRef,
    innerContainerStyle = {},
    outerStyle,
    onModalShow = () => {},
    isVisible,
    onClose,
    onModalHide = () => {},
    children,
    shouldDisplayBelowModals = false,
}: PopoverWithoutOverlayProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onOpen, close} = useContext(PopoverContext);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const {modalStyle, modalContainerStyle, shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaPadding, shouldAddBottomSafeAreaPadding} =
        StyleUtils.getModalStyles(
            CONST.MODAL.MODAL_TYPE.POPOVER,
            {
                windowWidth,
                windowHeight,
                isSmallScreenWidth: false,
            },
            anchorPosition,
            innerContainerStyle,
            outerStyle,
            shouldDisplayBelowModals,
        );

    useEffect(() => {
        let removeOnClose: () => void;
        if (isVisible) {
            onModalShow();

            onOpen?.({
                ref: withoutOverlayRef,
                close: onClose ?? NOOP,
                anchorRef,
            });
            removeOnClose = setCloseModal(onClose ?? NOOP);
        } else {
            onModalHide();
            close(anchorRef);
            onModalDidClose();
        }
        willAlertModalBecomeVisible(isVisible, true);

        return () => {
            if (!removeOnClose) {
                return;
            }
            removeOnClose();
        };
        // We want this effect to run strictly ONLY when isVisible prop changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    const modalPaddingStyles = useMemo(
        () =>
            StyleUtils.getModalPaddingStyles({
                shouldAddBottomSafeAreaMargin,
                shouldAddTopSafeAreaMargin,
                shouldAddBottomSafeAreaPadding,
                shouldAddTopSafeAreaPadding,
                modalContainerStyle,
                insets,
            }),
        [StyleUtils, insets, modalContainerStyle, shouldAddBottomSafeAreaMargin, shouldAddBottomSafeAreaPadding, shouldAddTopSafeAreaMargin, shouldAddTopSafeAreaPadding],
    );

    if (!isVisible) {
        return null;
    }

    return (
        <View
            style={modalStyle}
            ref={viewRef(withoutOverlayRef)}
            // Prevent the parent element to capture a click. This is useful when the modal component is put inside a pressable.
            onClick={(e) => e.stopPropagation()}
            dataSet={{dragArea: false}}
        >
            <View
                style={{
                    ...styles.defaultModalContainer,
                    ...modalContainerStyle,
                    ...modalPaddingStyles,
                }}
            >
                <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
            </View>
        </View>
    );
}

export default PopoverWithoutOverlay;

import type {ForwardedRef} from 'react';
import React, {forwardRef, useContext, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import {PopoverContext} from '@components/PopoverProvider';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {onModalDidClose, setCloseModal, willAlertModalBecomeVisible} from '@libs/actions/Modal';
import variables from '@styles/variables';
import viewRef from '@src/types/utils/viewRef';
import type PopoverWithoutOverlayProps from './types';

function PopoverWithoutOverlay(
    {
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
    }: PopoverWithoutOverlayProps,
    ref: ForwardedRef<View>,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onOpen, close} = useContext(PopoverContext);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const {modalStyle, modalContainerStyle, shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaPadding, shouldAddBottomSafeAreaPadding} =
        StyleUtils.getModalStyles(
            'popover',
            {
                windowWidth,
                windowHeight,
                isSmallScreenWidth: false,
            },
            anchorPosition,
            innerContainerStyle,
            outerStyle,
        );

    useEffect(() => {
        let removeOnClose: () => void;
        if (isVisible) {
            onModalShow();
            onOpen?.({
                ref: withoutOverlayRef,
                close: onClose,
                anchorRef,
            });
            removeOnClose = setCloseModal(onClose);
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
            style={[modalStyle, {zIndex: variables.popoverZIndex}]}
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
                ref={ref}
            >
                <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
            </View>
        </View>
    );
}

PopoverWithoutOverlay.displayName = 'PopoverWithoutOverlay';

export default forwardRef(PopoverWithoutOverlay);

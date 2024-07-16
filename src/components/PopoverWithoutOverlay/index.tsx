import type {ForwardedRef} from 'react';
import React, {forwardRef, useContext, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import {PopoverContext} from '@components/PopoverProvider';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import * as Modal from '@userActions/Modal';
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
            removeOnClose = Modal.setCloseModal(onClose);
        } else {
            onModalHide();
            close(anchorRef);
            Modal.onModalDidClose();
        }
        Modal.willAlertModalBecomeVisible(isVisible, true);

        return () => {
            if (!removeOnClose) {
                return;
            }
            removeOnClose();
        };
        // We want this effect to run strictly ONLY when isVisible prop changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isVisible]);

    const {
        paddingTop: safeAreaPaddingTop,
        paddingBottom: safeAreaPaddingBottom,
        paddingLeft: safeAreaPaddingLeft,
        paddingRight: safeAreaPaddingRight,
    } = useMemo(() => StyleUtils.getSafeAreaPadding(insets), [StyleUtils, insets]);

    const modalPaddingStyles = useMemo(
        () =>
            StyleUtils.getModalPaddingStyles({
                safeAreaPaddingTop,
                safeAreaPaddingBottom,
                safeAreaPaddingLeft,
                safeAreaPaddingRight,
                shouldAddBottomSafeAreaMargin,
                shouldAddTopSafeAreaMargin,
                shouldAddBottomSafeAreaPadding,
                shouldAddTopSafeAreaPadding,
                modalContainerStyleMarginTop: modalContainerStyle.marginTop,
                modalContainerStyleMarginBottom: modalContainerStyle.marginBottom,
                modalContainerStylePaddingTop: modalContainerStyle.paddingTop,
                modalContainerStylePaddingBottom: modalContainerStyle.paddingBottom,
                insets,
            }),
        [
            StyleUtils,
            insets,
            modalContainerStyle.marginBottom,
            modalContainerStyle.marginTop,
            modalContainerStyle.paddingBottom,
            modalContainerStyle.paddingTop,
            safeAreaPaddingBottom,
            safeAreaPaddingLeft,
            safeAreaPaddingRight,
            safeAreaPaddingTop,
            shouldAddBottomSafeAreaMargin,
            shouldAddBottomSafeAreaPadding,
            shouldAddTopSafeAreaMargin,
            shouldAddTopSafeAreaPadding,
        ],
    );

    if (!isVisible) {
        return null;
    }

    return (
        <View
            style={[modalStyle, {zIndex: variables.popoverzIndex}]}
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

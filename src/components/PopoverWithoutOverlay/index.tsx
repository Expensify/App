import type {ForwardedRef} from 'react';
import React, {forwardRef, useContext, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import {ModalBusinessTypeContext} from '@components/Modal/ModalBusinessTypeProvider';
import ModalContent from '@components/Modal/ModalContent';
import {PopoverContext} from '@components/PopoverProvider';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
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
        shouldClearFocusWithType,
        restoreFocusType,
        children,
    }: PopoverWithoutOverlayProps,
    ref: ForwardedRef<View>,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onOpen, close} = useContext(PopoverContext);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const modalId = useMemo(() => ComposerFocusManager.getId(), []);
    const insets = useSafeAreaInsets();
    const {businessType} = useContext(ModalBusinessTypeContext);
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
            ComposerFocusManager.saveFocusState(modalId, businessType, shouldClearFocusWithType, withoutOverlayRef.current);
            ComposerFocusManager.resetReadyToFocus(modalId);
        } else {
            onModalHide();
            close(anchorRef);
            Modal.onModalDidClose();
        }
        Modal.willAlertModalBecomeVisible(isVisible);

        return () => {
            if (!removeOnClose) {
                return;
            }
            removeOnClose();
        };
        // We want this effect to run strictly ONLY when isVisible prop changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const restoreFocusTypeRef = useRef<PopoverWithoutOverlayProps['restoreFocusType']>();
    restoreFocusTypeRef.current = restoreFocusType;
    const handleDismissContent = () => {
        ComposerFocusManager.tryRestoreFocusAfterClosedCompletely(modalId, businessType, restoreFocusTypeRef.current);

        // On the web platform, because there is no overlay, modal can be closed and opened instantly and randomly,
        // this will cause the input box to gain and lose focus instantly while the subsequent modal is opened.
        // The RESTORE_FOCUS_TYPE cannot address this randomness case, so we have to delay the refocusing here.
        setTimeout(() => ComposerFocusManager.setReadyToFocus(modalId), CONST.ANIMATION_IN_TIMING);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <View
            style={[modalStyle, {zIndex: 1}]}
            ref={viewRef(withoutOverlayRef)}
        >
            <ModalContent onDismiss={handleDismissContent}>
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
            </ModalContent>
        </View>
    );
}

PopoverWithoutOverlay.displayName = 'PopoverWithoutOverlay';

export default forwardRef(PopoverWithoutOverlay);

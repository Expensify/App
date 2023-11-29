import React, {ForwardedRef} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PopoverContext} from '@components/PopoverProvider';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getModalStyles from '@styles/getModalStyles';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Modal from '@userActions/Modal';
import PopoverProps from './types';

function Popover(
    {anchorPosition = {}, anchorRef, withoutOverlayRef, innerContainerStyle = {}, outerStyle, onModalShow = () => {}, isVisible, onClose, onModalHide = () => {}, children}: PopoverProps,
    ref: ForwardedRef<View>,
) {
    const styles = useThemeStyles();
    const {onOpen, close} = React.useContext(PopoverContext);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const {modalStyle, modalContainerStyle, shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaPadding, shouldAddBottomSafeAreaPadding} = getModalStyles(
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

    React.useEffect(() => {
        let removeOnClose: () => void;
        if (isVisible && anchorRef && onOpen) {
            onModalShow();
            onOpen({
                ref: withoutOverlayRef,
                close: onClose,
                anchorRef,
            });
            removeOnClose = Modal.setCloseModal(() => onClose(anchorRef));
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

    if (!isVisible) {
        return null;
    }

    const {
        paddingTop: safeAreaPaddingTop,
        paddingBottom: safeAreaPaddingBottom,
        paddingLeft: safeAreaPaddingLeft,
        paddingRight: safeAreaPaddingRight,
    } = StyleUtils.getSafeAreaPadding(insets);

    const modalPaddingStyles = StyleUtils.getModalPaddingStyles({
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
    });

    return (
        <View
            style={[modalStyle, {zIndex: 1}]}
            ref={withoutOverlayRef}
        >
            <View
                style={{
                    ...styles.defaultModalContainer,
                    ...modalContainerStyle,
                    ...modalPaddingStyles,
                }}
                ref={ref}
            >
                {children}
            </View>
        </View>
    );
}

Popover.displayName = 'Popover';

export default React.forwardRef(Popover);

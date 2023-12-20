import React, {useMemo} from 'react';
import {View} from 'react-native';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import {defaultProps, propTypes} from '@components/Popover/popoverPropTypes';
import {PopoverContext} from '@components/PopoverProvider';
import withWindowDimensions from '@components/withWindowDimensions';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Modal from '@userActions/Modal';

function Popover(props) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onOpen, close} = React.useContext(PopoverContext);
    const insets = useSafeAreaInsets();
    const {modalStyle, modalContainerStyle, shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaPadding, shouldAddBottomSafeAreaPadding} =
        StyleUtils.getModalStyles(
            'popover',
            {
                windowWidth: props.windowWidth,
                windowHeight: props.windowHeight,
                isSmallScreenWidth: false,
            },
            props.anchorPosition,
            props.innerContainerStyle,
            props.outerStyle,
        );

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

    React.useEffect(() => {
        let removeOnClose;
        if (props.isVisible) {
            props.onModalShow();
            onOpen({
                ref: props.withoutOverlayRef,
                close: props.onClose,
                anchorRef: props.anchorRef,
            });
            removeOnClose = Modal.setCloseModal(() => props.onClose(props.anchorRef));
        } else {
            props.onModalHide();
            close(props.anchorRef);
            Modal.onModalDidClose();
        }
        Modal.willAlertModalBecomeVisible(props.isVisible);

        return () => {
            if (!removeOnClose) {
                return;
            }
            removeOnClose();
        };
        // We want this effect to run strictly ONLY when isVisible prop changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isVisible]);

    if (!props.isVisible) {
        return null;
    }

    return (
        <View
            style={[modalStyle, {zIndex: 1}]}
            ref={props.withoutOverlayRef}
        >
            <View
                style={{
                    ...styles.defaultModalContainer,
                    ...modalContainerStyle,
                    ...modalPaddingStyles,
                }}
                ref={props.forwardedRef}
            >
                <ColorSchemeWrapper>{props.children}</ColorSchemeWrapper>
            </View>
        </View>
    );
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);

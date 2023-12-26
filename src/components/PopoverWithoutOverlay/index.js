import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import {isFunction, isObject} from 'underscore';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import ModalContent from '@components/Modal/ModalContent';
import {defaultProps, propTypes} from '@components/Popover/popoverPropTypes';
import {PopoverContext} from '@components/PopoverProvider';
import withWindowDimensions from '@components/withWindowDimensions';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';

function Popover(props) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const modalId = useMemo(() => ComposerFocusManager.getId(), []);
    const containerRef = useRef();
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
            ComposerFocusManager.saveFocusState(modalId, containerRef.current);
            ComposerFocusManager.resetReadyToFocus(modalId);
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

    const restoreFocusTypeRef = useRef();
    restoreFocusTypeRef.current = props.restoreFocusType;
    const handleDismissContent = () => {
        ComposerFocusManager.tryRestoreFocusAfterClosedCompletely(modalId, restoreFocusTypeRef.current);

        // On the web platform, because there is no overlay, modal can be closed and opened instantly and randomly,
        // this will cause the input box to gain and lose focus instantly while the subsequent modal is opened.
        // The RESTORE_FOCUS_TYPE cannot address this randomness case, so we have to delay the refocusing here.
        setTimeout(() => ComposerFocusManager.setReadyToFocus(modalId), CONST.ANIMATION_IN_TIMING);
    };

    if (!props.isVisible) {
        return null;
    }

    return (
        <View
            style={[modalStyle, {zIndex: 1}]}
            ref={(el) => {
                containerRef.current = el;
                if (isFunction(props.withoutOverlayRef)) {
                    props.withoutOverlayRef(el);
                } else if (isObject(props.withoutOverlayRef)) {
                    // eslint-disable-next-line no-param-reassign
                    props.withoutOverlayRef.current = el;
                }
            }}
        >
            <ModalContent onDismiss={handleDismissContent}>
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
            </ModalContent>
        </View>
    );
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);

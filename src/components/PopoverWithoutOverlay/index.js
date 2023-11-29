import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {isFunction, isObject} from 'underscore';
import ModalContent from '@components/Modal/ModalContent';
import {defaultProps, propTypes} from '@components/Popover/popoverPropTypes';
import {PopoverContext} from '@components/PopoverProvider';
import withWindowDimensions from '@components/withWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import getModalStyles from '@styles/getModalStyles';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Modal from '@userActions/Modal';

function Popover(props) {
    const styles = useThemeStyles();
    const modalId = useMemo(() => ComposerFocusManager.getId(), []);
    const containerRef = useRef();
    const {onOpen, close} = React.useContext(PopoverContext);
    const {modalStyle, modalContainerStyle, shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaPadding, shouldAddBottomSafeAreaPadding} = getModalStyles(
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
        // PopoverWithMeasuredContent delays the mounting of this popover, so here we also need to defer the restoration.
        // In a follow-up PR, we can also consider how to improve the former.
        setImmediate(() => ComposerFocusManager.setReadyToFocus(modalId));
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
            <SafeAreaInsetsContext.Consumer>
                {(insets) => {
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
                        <ModalContent onDismiss={handleDismissContent}>
                            <View
                                style={{
                                    ...styles.defaultModalContainer,
                                    ...modalContainerStyle,
                                    ...modalPaddingStyles,
                                }}
                                ref={props.forwardedRef}
                            >
                                {props.children}
                            </View>
                        </ModalContent>
                    );
                }}
            </SafeAreaInsetsContext.Consumer>
        </View>
    );
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);

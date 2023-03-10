import React from 'react';
import {Pressable, View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import * as Modal from '../../libs/actions/Modal';
import {propTypes, defaultProps} from './popoverPropTypes';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getModalStyles from '../../styles/getModalStyles';
import withWindowDimensions from '../withWindowDimensions';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
const Popover = (props) => {
    const ref = React.useRef(null);

    const {
        modalStyle,
        modalContainerStyle,
        shouldAddTopSafeAreaMargin,
        shouldAddBottomSafeAreaMargin,
        shouldAddTopSafeAreaPadding,
        shouldAddBottomSafeAreaPadding,
    } = getModalStyles(
        'popover',
        {
            windowWidth: props.windowWidth,
            windowHeight: props.windowHeight,
            isSmallScreenWidth: props.isSmallScreenWidth,
        },
        props.anchorPosition,
        props.innerContainerStyle,
        props.outerStyle,
    );

    React.useEffect(() => {
        const listener = (e) => {
            if (!ref.current || ref.current.contains(e.target)) {
                return;
            }
            props.onClose();
        };
        document.addEventListener('click', listener, true);
        return () => {
            document.removeEventListener('click', listener, true);
        };
    }, []);

    React.useEffect(() => {
        const listener = (e) => {
            if (e.key !== 'Escape') {
                return;
            }
            props.onClose();
        };
        document.addEventListener('keydown', listener);
        return () => {
            document.removeEventListener('keydown', listener);
        };
    }, []);

    React.useEffect(() => {
        const listener = () => {
            if (document.hasFocus()) {
                return;
            }
            props.onClose();
        };
        document.addEventListener('visibilitychange', listener);
        return () => {
            document.removeEventListener('visibilitychange', listener);
        };
    }, []);

    React.useEffect(() => {
        const listener = () => {
            props.onClose();
        };
        document.addEventListener('contextmenu', listener);
        return () => {
            document.removeEventListener('contextmenu', listener);
        };
    }, []);

    React.useEffect(() => {
        Modal.setCloseModal(props.onClose);

        return () => {
            Modal.setCloseModal(null);
        };
    }, []);

    React.useEffect(() => {
        if (props.isVisible) {
            props.onModalShow();
        } else {
            props.onModalHide();
        }
        Modal.willAlertModalBecomeVisible(props.isVisible);
        Modal.setCloseModal(props.isVisible ? props.onClose : null);
    }, [props.isVisible]);

    return props.isVisible ? (
        <Pressable style={[modalStyle, {zIndex: 1}]} ref={ref}>
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
                    });
                    return (
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
                    );
                }}
            </SafeAreaInsetsContext.Consumer>
        </Pressable>
    ) : null;
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);

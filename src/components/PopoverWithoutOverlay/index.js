import React from 'react';
import {View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {PopoverContext} from '../PopoverProvider';
import * as Modal from '../../libs/actions/Modal';
import {propTypes, defaultProps} from '../Popover/popoverPropTypes';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getModalStyles from '../../styles/getModalStyles';
import withWindowDimensions from '../withWindowDimensions';

function Popover(props) {
    const ref = React.useRef(null);
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
        if (props.isVisible) {
            props.onModalShow();
            onOpen({
                ref,
                close: props.onClose,
                anchorRef: props.anchorRef,
            });
        } else {
            props.onModalHide();
            close(props.anchorRef);
        }
        Modal.willAlertModalBecomeVisible(props.isVisible);
        Modal.setCloseModal(props.isVisible ? () => props.onClose(props.anchorRef) : null);

        // We want this effect to run strictly ONLY when isVisible prop changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isVisible]);

    if (!props.isVisible) {
        return null;
    }

    return (
        <View
            style={[modalStyle, {zIndex: 1}]}
            ref={ref}
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
        </View>
    );
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);

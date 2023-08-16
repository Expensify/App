import React, {useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Pressable} from 'react-native';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';
import StatusBar from '../../libs/StatusBar';
import CONST from '../../CONST';
import styles from '../../styles/styles';

function Modal(props) {
    const [previousStatusBarColor, setPreviousStatusBarColor] = useState();

    const setStatusBarColor = (color = themeColors.appBG) => {
        if (!props.fullscreen) {
            return;
        }

        StatusBar.setBackgroundColor(color);
    };

    const hideModal = () => {
        setStatusBarColor(previousStatusBarColor);
        props.onModalHide();
    };

    const showModal = () => {
        const statusBarColor = StatusBar.getBackgroundColor();
        const isFullScreenModal =
            props.type === CONST.MODAL.MODAL_TYPE.CENTERED || props.type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE || props.type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED;
        setPreviousStatusBarColor(statusBarColor);
        // If it is a full screen modal then match it with appBG, otherwise we use the backdrop color
        setStatusBarColor(isFullScreenModal ? themeColors.appBG : StyleUtils.getThemeBackgroundColor(statusBarColor));
        props.onModalShow();
    };

    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onModalHide={hideModal}
            onModalShow={showModal}
            avoidKeyboard={false}
            coverScreen={false}
            customBackdrop={(onBackdropPress) => (
                <Pressable
                    onPress={onBackdropPress}
                    style={styles.modalBackdropWeb}
                    accessibilityLabel="backdrop"
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.ADJUSTABLE}
                />
            )}
        >
            {props.children}
        </BaseModal>
    );
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);

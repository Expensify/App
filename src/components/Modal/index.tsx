import React, {useState} from 'react';
import withWindowDimensions from '@components/withWindowDimensions';
import StatusBar from '@libs/StatusBar';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import BaseModal from './BaseModal';
import BaseModalProps from './types';

function Modal({fullscreen, onModalHide, type, onModalShow, children, ...rest}: BaseModalProps) {
    const [previousStatusBarColor, setPreviousStatusBarColor] = useState<string>();

    const setStatusBarColor = (color = themeColors.appBG) => {
        if (!fullscreen) {
            return;
        }

        StatusBar.setBackgroundColor(color);
    };

    const hideModal = () => {
        setStatusBarColor(previousStatusBarColor);
        onModalHide();
    };

    const showModal = () => {
        const statusBarColor = StatusBar.getBackgroundColor();

        const isFullScreenModal = type === CONST.MODAL.MODAL_TYPE.CENTERED || type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE || type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED;

        if (statusBarColor) {
            setPreviousStatusBarColor(statusBarColor);
            // If it is a full screen modal then match it with appBG, otherwise we use the backdrop color
            setStatusBarColor(isFullScreenModal ? themeColors.appBG : StyleUtils.getThemeBackgroundColor(statusBarColor));
        }

        onModalShow?.();
    };

    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onModalHide={hideModal}
            onModalShow={showModal}
            avoidKeyboard={false}
            fullscreen={fullscreen}
            type={type}
        >
            {children}
        </BaseModal>
    );
}

Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);

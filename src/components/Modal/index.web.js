import React from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';

const Modal = (props) => {
    const setStatusBarColor = (color = themeColors.appBG) => {
        if (!props.fullscreen) {
            return;
        }

        // Change the color of the status bar to align with the modal's backdrop (refer to https://github.com/Expensify/App/issues/12156).
        document.querySelector('meta[name=theme-color]').content = color;
    };

    const hideModal = () => {
        setStatusBarColor();
        props.onModalHide();
    };

    const showModal = () => {
        setStatusBarColor(StyleUtils.getThemeBackgroundColor());
        props.onModalShow();
    };

    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onModalHide={hideModal}
            onModalShow={showModal}
        >
            {props.children}
        </BaseModal>
    );
};

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);

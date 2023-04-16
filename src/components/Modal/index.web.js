import React, {useCallback, useEffect, useRef} from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';

const Modal = (props) => {
    const baseModalRef = useRef();
    const isVisible = props.isVisible;
    const targetToIgnore = props.targetToIgnore;
    const onClose = props.onClose;
    const shouldCloseOnOutsideClick = props.shouldCloseOnOutsideClick;

    const closeOnOutsideClick = useCallback((event) => {
        if (!baseModalRef.current
            || baseModalRef.current.contains(event.target)
            || (targetToIgnore && targetToIgnore.contains(event.target))) {
            return;
        }

        onClose();
    }, [targetToIgnore, onClose]);

    useEffect(() => {
        if (!shouldCloseOnOutsideClick || !isVisible) {
            return;
        }
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
        };
    }, [isVisible, shouldCloseOnOutsideClick, closeOnOutsideClick]);

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
            ref={baseModalRef}
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

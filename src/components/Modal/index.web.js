import React from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';
import * as StyleUtils from '../../styles/StyleUtils';

const Modal = props => (
    <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        onModalHide={() => {
            if (props.fullscreen) {
                // With the modal hidden, we can revert to the default status bar color (refer to https://github.com/Expensify/App/issues/12156).
                document.querySelector('meta[name=theme-color]').content = '';
            }

            props.onModalHide();
        }}
        onModalShow={() => {
            if (props.fullscreen) {
                // The color of the status bar should align with the modal's backdrop (refer to https://github.com/Expensify/App/issues/12156).
                document.querySelector('meta[name=theme-color]').content = StyleUtils.getThemeBackgroundColor();
            }

            props.onModalShow();
        }}
    >
        {props.children}
    </BaseModal>
);

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);

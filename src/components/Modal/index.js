import React from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import modalPropTypes from './ModalPropTypes';

const defaultProps = {
    type: '',
};

const Modal = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseModal {...props}>
        {props.children}
    </BaseModal>
);

Modal.propTypes = modalPropTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);

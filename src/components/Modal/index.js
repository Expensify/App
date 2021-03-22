import React from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './ModalPropTypes';

const Modal = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseModal {...props}>
        {props.children}
    </BaseModal>
);

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);

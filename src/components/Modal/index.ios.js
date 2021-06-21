import React from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './ModalPropTypes';

const Modal = props => (
    <BaseModal
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {props.children}
    </BaseModal>
);

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);

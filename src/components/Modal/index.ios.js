import React from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './ModalPropTypes';

// Only want to use <SafeAreaView> on iOS. Avoids ScrollBar in the middle of the modal.
// https://github.com/facebook/react-native/issues/26610
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

import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Modal from './Modal';
import Header from './Header';
import styles from '../styles/styles';

const propTypes = {
    // Title for modal header
    title: PropTypes.string.isRequired,

    // Callback to fire on request to close modal
    onClose: PropTypes.func.isRequired,

    // Child elements to render after the header
    children: PropTypes.node.isRequired,
};

const ModalWithHeader = props => (
    <Modal
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        <View style={[styles.modalViewContainer]}>
            <Header
                title={props.title}
                onCloseButtonPress={props.onClose}
            />
            {props.children}
        </View>
    </Modal>
);

ModalWithHeader.propTypes = propTypes;
ModalWithHeader.displayName = 'ModalWithHeader';
export default ModalWithHeader;

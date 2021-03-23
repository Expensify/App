import React from 'react';
import {
    TouchableOpacity, Text, View,
} from 'react-native';
import PropTypes from 'prop-types';
import Header from './Header';
import Modal from './Modal';
import styles from '../styles/styles';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    /** Title of the modal */
    title: PropTypes.string.isRequired,

    /** A callback to call when the form has been submitted */
    onConfirm: PropTypes.func.isRequired,

    /** A callback to call when the form has been closed */
    onCancel: PropTypes.func.isRequired,

    /** Modal visibility */
    isVisible: PropTypes.bool.isRequired,

    /** Confirm button text */
    confirmText: PropTypes.string,

    /** Cancel button text */
    cancelText: PropTypes.string,

    /** Modal content text */
    prompt: PropTypes.string,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    confirmText: 'Yes',
    cancelText: 'No',
    prompt: '',
};

const ConfirmModal = props => (
    <Modal
        onSubmit={props.onConfirm}
        onClose={props.onCancel}
        isVisible={props.isVisible}
        type={props.isSmallScreenWidth
            ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED
            : CONST.MODAL.MODAL_TYPE.CONFIRM}
    >
        <View style={styles.m5}>
            <View style={[styles.flexRow, styles.mb4]}>
                <Header title={props.title} />
            </View>

            <Text style={styles.textP}>
                {props.prompt}
            </Text>

            <TouchableOpacity
                style={[styles.button, styles.buttonSuccess, styles.mt4]}
                onPress={props.onConfirm}
            >
                <Text
                    style={[
                        styles.buttonText,
                        styles.buttonSuccessText,
                    ]}
                >
                    {props.confirmText}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.mt3]}
                onPress={props.onCancel}
            >
                <Text style={styles.buttonText}>
                    {props.cancelText}
                </Text>
            </TouchableOpacity>
        </View>
    </Modal>
);

ConfirmModal.propTypes = propTypes;
ConfirmModal.defaultProps = defaultProps;
ConfirmModal.displayName = 'ConfirmModal';
export default withWindowDimensions(ConfirmModal);

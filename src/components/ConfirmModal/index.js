import React from 'react';
import {
    TouchableOpacity, Text, View,
} from 'react-native';
import PropTypes from 'prop-types';
import Header from '../Header';
import Modal from '../Modal';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import withWindowDimensions from '../withWindowDimensions';

const propTypes = {
    /** Title of the modal */
    title: PropTypes.string.isRequired,

    /** A callback to call when the form has been submitted */
    onConfirm: PropTypes.func.isRequired,

    /** A callback to call when the form has been closed */
    onCancel: PropTypes.func.isRequired,

    /** If the screen is small */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** Modal visibility */
    isVisible: PropTypes.bool.isRequired,

    /** Confirm button text */
    confirmText: PropTypes.string,

    /** Cancel button text */
    cancelText: PropTypes.string,

    /** Modal content text */
    prompt: PropTypes.string,
};

const defaultProps = {
    confirmText: 'Yes',
    cancelText: 'No',
    prompt: '',
};

const ConfirmModal = ({
    title, onConfirm, onCancel, confirmText, cancelText, prompt, isSmallScreenWidth, isVisible,
}) => {
    const modalType = isSmallScreenWidth
        ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM;

    return (
        <>
            <Modal
                onSubmit={onConfirm}
                onClose={onCancel}
                isVisible={isVisible}
                type={modalType}
            >
                <View style={styles.m5}>
                    <View style={styles.flexRow}>
                        <Header title={title} />
                    </View>

                    <Text style={[styles.textLabel, styles.mt4]}>
                        {prompt}
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonSuccess, styles.mt4]}
                        onPress={onConfirm}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                styles.buttonSuccessText,
                                styles.buttonConfirmText,
                            ]}
                        >
                            {confirmText}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.mt3]}
                        onPress={onCancel}
                    >
                        <Text style={styles.buttonText}>
                            {cancelText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
};

ConfirmModal.propTypes = propTypes;
ConfirmModal.defaultProps = defaultProps;
export default withWindowDimensions(ConfirmModal);

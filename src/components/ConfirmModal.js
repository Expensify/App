import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import ConfirmContent from './ConfirmContent';

const propTypes = {
    /** Title of the modal */
    title: PropTypes.string,

    /** A callback to call when the form has been submitted */
    onConfirm: PropTypes.func.isRequired,

    /** A callback to call when the form has been closed */
    onCancel: PropTypes.func,

    /** Modal visibility */
    isVisible: PropTypes.bool.isRequired,

    /** Confirm button text */
    confirmText: PropTypes.string,

    /** Cancel button text */
    cancelText: PropTypes.string,

    /** Modal content text/element */
    prompt: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** Whether we should use the success button color */
    success: PropTypes.bool,

    /** Is the action destructive */
    danger: PropTypes.bool,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: PropTypes.bool,

    /** Callback method fired when the modal is hidden */
    onModalHide: PropTypes.func,

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    confirmText: '',
    cancelText: '',
    prompt: '',
    success: true,
    danger: false,
    onCancel: () => {},
    shouldShowCancelButton: true,
    shouldSetModalVisibility: true,
    title: '',
    onModalHide: () => {},
};

const ConfirmModal = props => (
    <Modal
        onSubmit={props.onConfirm}
        onClose={props.onCancel}
        isVisible={props.isVisible}
        shouldSetModalVisibility={props.shouldSetModalVisibility}
        onModalHide={props.onModalHide}
        type={props.isSmallScreenWidth
            ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED
            : CONST.MODAL.MODAL_TYPE.CONFIRM}
    >
        <ConfirmContent
            title={props.title}

            /* Disable onConfirm function if the modal is being dismissed, otherwise the confirmation
            function can be triggered multiple times if the user clicks on the button multiple times. */
            onConfirm={() => (props.isVisible ? props.onConfirm() : null)}
            onCancel={props.onCancel}
            confirmText={props.confirmText}
            cancelText={props.cancelText}
            prompt={props.prompt}
            success={props.success}
            danger={props.danger}
            shouldShowCancelButton={props.shouldShowCancelButton}
        />
    </Modal>
);

ConfirmModal.propTypes = propTypes;
ConfirmModal.defaultProps = defaultProps;
ConfirmModal.displayName = 'ConfirmModal';
export default withWindowDimensions(ConfirmModal);

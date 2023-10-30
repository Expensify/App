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

    /** Whether we should disable the confirm button when offline */
    shouldDisableConfirmButtonWhenOffline: PropTypes.bool,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: PropTypes.bool,

    /** Callback method fired when the modal is hidden */
    onModalHide: PropTypes.func,

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility: PropTypes.bool,

    /** Icon to display above the title */
    iconSource: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Styles for title */
    // eslint-disable-next-line react/forbid-prop-types
    titleStyles: PropTypes.arrayOf(PropTypes.object),

    /** Styles for prompt */
    // eslint-disable-next-line react/forbid-prop-types
    promptStyles: PropTypes.arrayOf(PropTypes.object),

    /** Styles for icon */
    // eslint-disable-next-line react/forbid-prop-types
    iconAdditionalStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether to center the icon / text content */
    shouldCenterContent: PropTypes.bool,

    /** Whether to stack the buttons */
    shouldStackButtons: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    confirmText: '',
    cancelText: '',
    prompt: '',
    success: true,
    danger: false,
    onCancel: () => {},
    shouldDisableConfirmButtonWhenOffline: false,
    shouldShowCancelButton: true,
    shouldSetModalVisibility: true,
    title: '',
    iconSource: null,
    onModalHide: () => {},
    titleStyles: [],
    iconAdditionalStyles: [],
    promptStyles: [],
    shouldCenterContent: false,
    shouldStackButtons: true,
};

function ConfirmModal(props) {
    return (
        <Modal
            onSubmit={props.onConfirm}
            onClose={props.onCancel}
            isVisible={props.isVisible}
            shouldSetModalVisibility={props.shouldSetModalVisibility}
            onModalHide={props.onModalHide}
            type={props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
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
                shouldDisableConfirmButtonWhenOffline={props.shouldDisableConfirmButtonWhenOffline}
                shouldShowCancelButton={props.shouldShowCancelButton}
                shouldCenterContent={props.shouldCenterContent}
                iconSource={props.iconSource}
                iconAdditionalStyles={props.iconAdditionalStyles}
                titleStyles={props.titleStyles}
                promptStyles={props.promptStyles}
                shouldStackButtons={props.shouldStackButtons}
            />
        </Modal>
    );
}

ConfirmModal.propTypes = propTypes;
ConfirmModal.defaultProps = defaultProps;
ConfirmModal.displayName = 'ConfirmModal';
export default withWindowDimensions(ConfirmModal);

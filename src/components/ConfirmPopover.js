import React from 'react';
import PropTypes from 'prop-types';
import Popover from './Popover';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import ConfirmView from './ConfirmView';

const propTypes = {
    /** Title of the modal */
    title: PropTypes.string.isRequired,

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

    /** Is the action destructive */
    danger: PropTypes.bool,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: PropTypes.bool,

    /** Modal content text/element */
    prompt: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** Where the popover should be positioned */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    /** Styles for view */
    viewStyles: PropTypes.arrayOf(PropTypes.object),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    confirmText: '',
    cancelText: '',
    danger: false,
    onCancel: () => {},
    shouldShowCancelButton: true,
    prompt: '',
    viewStyles: [],
};

const ConfirmPopover = props => (
    <Popover
        onSubmit={props.onConfirm}
        onClose={props.onCancel}
        isVisible={props.isVisible}
        anchorPosition={props.anchorPosition}
    >
        <ConfirmView
            viewStyles={props.viewStyles}
            title={props.title}
            prompt={props.prompt}
            confirmText={props.confirmText}
            cancelText={props.cancelText}
            danger={props.danger}
            shouldShowCancelButton={props.shouldShowCancelButton}
            onConfirm={props.onConfirm}
            onCancel={props.onCancel}
            onClose={props.onCancel}
        />
    </Popover>
);

ConfirmPopover.propTypes = propTypes;
ConfirmPopover.defaultProps = defaultProps;
ConfirmPopover.displayName = 'ConfirmPopover';
export default withWindowDimensions(ConfirmPopover);

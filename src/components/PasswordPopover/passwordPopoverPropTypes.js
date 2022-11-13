import PropTypes from 'prop-types';

const propTypes = {
    /** Is the popover currently showing? */
    isVisible: PropTypes.bool.isRequired,

    /** Function that gets called when the user closes the modal */
    onClose: PropTypes.func.isRequired,

    /** Where the popover should be placed */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    /** Function that gets called when the user clicks the delete / make default button */
    onSubmit: PropTypes.func,

    /** The text that should be displayed in the submit button */
    submitButtonText: PropTypes.string,
};

const defaultProps = {
    onSubmit: () => {},
    submitButtonText: '',
};

export {propTypes, defaultProps};

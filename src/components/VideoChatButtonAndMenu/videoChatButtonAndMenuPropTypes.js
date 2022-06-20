import PropTypes from 'prop-types';

const propTypes = {
    /** If this is the Concierge chat, we'll open the modal for requesting a setup call instead of showing popover menu */
    isConcierge: PropTypes.bool,
};

const defaultProps = {
    isConcierge: false,
};

export {propTypes, defaultProps};

import PropTypes from 'prop-types';

const propTypes = {
    /** If this is the Concierge chat, we'll open the modal for requesting a setup call instead of showing popover menu */
    isConcierge: PropTypes.bool,

    /** URL to the assigned guide's appointment booking calendar */
    guideCalendarLink: PropTypes.string,
};

const defaultProps = {
    isConcierge: false,
    guideCalendarLink: null,
};

export {propTypes, defaultProps};

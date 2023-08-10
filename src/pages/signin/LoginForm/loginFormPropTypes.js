import PropTypes from 'prop-types';

const propTypes = {
    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit: PropTypes.bool,

    /** Should the component be visible? */
    isVisible: PropTypes.bool.isRequired,

    /** Function used to scroll to the top of the page */    
    scrollPageToTop: PropTypes.func,
};

const defaultProps = {
    blurOnSubmit: false,
};

export {propTypes, defaultProps};

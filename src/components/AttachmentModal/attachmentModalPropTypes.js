import PropTypes from 'prop-types';

export default {
    // Title of Modal
    title: PropTypes.string.isRequired,

    // Optional image or PDF source URL
    sourceURL: PropTypes.string,

    // Function as a child
    children: PropTypes.func.isRequired,

    // Do the urls require an authToken?
    isAuthTokenRequired: PropTypes.bool.isRequired,
};

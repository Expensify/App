import PropTypes from 'prop-types';

export default {
    // Title of Modal
    title: PropTypes.string.isRequired,

    // Optional image or PDF source URL
    sourceURL: PropTypes.string.sourceURL,

    // Function as a child
    children: PropTypes.func.isRequired,
};

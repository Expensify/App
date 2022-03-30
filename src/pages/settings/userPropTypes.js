import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** error associated with adding a secondary login */
    error: PropTypes.string,

    /** Whether or not the user is on a public domain email account or not */
    isFromPublicDomain: PropTypes.bool,

    /** Whether the form is being submitted */
    loading: PropTypes.bool,
});

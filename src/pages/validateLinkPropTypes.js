import PropTypes from 'prop-types';

export default PropTypes.shape({
    // The name of the route
    name: PropTypes.string,

    // Unique key associated with the route
    key: PropTypes.string,

    // Each parameter passed via the URL
    params: PropTypes.shape({
        // AccountID associated with the validation link
        accountID: PropTypes.string,

        // Validation code associated with the validation link
        validateCode: PropTypes.string,
    }),
});

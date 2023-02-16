import PropTypes from 'prop-types';

const propTypes = PropTypes.shape({
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

const defaultProps = {
    params: {},
};

export {
    propTypes,
    defaultProps,
};

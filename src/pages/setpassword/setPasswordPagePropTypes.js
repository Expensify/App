import PropTypes from 'prop-types';

export default {
    propTypes: PropTypes.shape({
        /* Onyx Props */

        // The details about the account that the user is signing in with
        account: PropTypes.shape({
            // An error message to display to the user
            error: PropTypes.string,

            // Whether or not a sign on form is loading (being submitted)
            loading: PropTypes.bool,
        }),

        // The credentials of the logged in person
        credentials: PropTypes.shape({
            // The email the user logged in with
            login: PropTypes.string,

            // The password used to log in the user
            password: PropTypes.string,
        }),

        route: PropTypes.shape({
            params: PropTypes.shape({
                validateCode: PropTypes.string,
            }),
        }),
    }),
    defaultProps: {
        account: {},
        credentials: {},
        route: {
            params: {},
        },
    },
};

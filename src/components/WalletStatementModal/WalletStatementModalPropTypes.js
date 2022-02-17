import PropTypes from 'prop-types';

const walletStatementPropTypes = {
    /* Onyx Props */
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({

        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    /** URL for oldDot (expensify.com) statements page to display */
    statementPageURL: PropTypes.string,
};

const walletStatementDefaultProps = {
    session: {
        authToken: null,
    },
};

export {
    walletStatementPropTypes,
    walletStatementDefaultProps,
};

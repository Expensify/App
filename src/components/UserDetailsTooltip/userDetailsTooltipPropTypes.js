import PropTypes from 'prop-types';

const propTypes = {
    /** User's Account Id */
    accountID: PropTypes.string.isRequired,
    /** Fallback User Details object used if no accountID */
    fallbackUserDetails: PropTypes.shape({
        /** Avatar URL */
        avatar: PropTypes.string,
        /** Display Name */
        displayName: PropTypes.string,
        /** Login */
        login: PropTypes.string,
    }),
    /** Component that displays the tooltip */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    accountID: '',
    fallbackUserDetails: {displayName: '', login: '', avatar: ''},
};

export {propTypes, defaultProps};

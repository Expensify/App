import PropTypes from 'prop-types';
import avatarPropTypes from '@components/avatarPropTypes';
import personalDetailsPropType from '@pages/personalDetailsPropType';

const propTypes = {
    /** User's Account ID */
    accountID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    /** Fallback User Details object used if no accountID */
    fallbackUserDetails: PropTypes.shape({
        /** Avatar URL */
        avatar: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        /** Display Name */
        displayName: PropTypes.string,
        /** Login */
        login: PropTypes.string,
        /** Whether this is a Workspace Avatar or User Avatar */
        type: PropTypes.string,
    }),
    /** Optionally, pass in the icon instead of calculating it. If defined, will take precedence. */
    icon: avatarPropTypes,
    /** Component that displays the tooltip */
    children: PropTypes.node.isRequired,
    /** List of personalDetails (keyed by accountID)  */
    personalDetailsList: PropTypes.objectOf(personalDetailsPropType),

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID: PropTypes.number,

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
     A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
};

const defaultProps = {
    accountID: '',
    fallbackUserDetails: {displayName: '', login: '', avatar: '', type: ''},
    personalDetailsList: {},
    delegateAccountID: 0,
    icon: undefined,
    shiftHorizontal: 0,
};

export {propTypes, defaultProps};

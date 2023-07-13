import _ from 'underscore';
import PropTypes from 'prop-types';
import CONST from '../CONST';

export default PropTypes.shape({
    /** The ID of the policy */
    id: PropTypes.string,

    /** The name of the policy */
    name: PropTypes.string,

    /** The current user's role in the policy */
    role: PropTypes.oneOf(_.values(CONST.POLICY.ROLE)),

    /** The policy type */
    type: PropTypes.oneOf(_.values(CONST.POLICY.TYPE)),

    /** The email of the policy owner */
    owner: PropTypes.string,

    /** The output currency for the policy */
    outputCurrency: PropTypes.string,

    /** The URL for the policy avatar */
    avatar: PropTypes.string,

    /** Errors on the policy keyed by microtime */
    errors: PropTypes.objectOf(PropTypes.string),

    /**
     * Error objects keyed by field name containing errors keyed by microtime
     * E.x
     * {
     *     name: {
     *        [DateUtils.getMicroseconds()]: 'Sorry, there was an unexpected problem updating your workspace name.',
     *     }
     * }
     */
    errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
});

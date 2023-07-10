import PropTypes from 'prop-types';

const propTypes = {
    /** Children to wrap with Tooltip. */
    children: PropTypes.node.isRequired,
};

/**
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
const UserDetailsTooltip = (props) => props.children;

UserDetailsTooltip.propTypes = propTypes;
UserDetailsTooltip.displayName = 'UserDetailsTooltip';

export default UserDetailsTooltip;

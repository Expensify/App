import PropTypes from 'prop-types';

const propTypes = {
    /** Children to wrap with Tooltip. */
    children: PropTypes.node.isRequired,
};

/**
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
function BaseUserDetailsTooltip(props) {
    return props.children;
}

BaseUserDetailsTooltip.propTypes = propTypes;
BaseUserDetailsTooltip.displayName = 'BaseUserDetailsTooltip';

export default BaseUserDetailsTooltip;

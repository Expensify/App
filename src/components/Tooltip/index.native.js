import PropTypes from 'prop-types';

// We can't use the common component for the Tooltip as Web implementation uses DOM specific method to
// render the View which is not present on the Mobile.
const propTypes = {
    /** Children to wrap with Tooltip. */
    children: PropTypes.node.isRequired,
};

/**
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
const Tooltip = props => (
    props.children
);

Tooltip.propTypes = propTypes;
Tooltip.displayName = 'Tooltip';

export default Tooltip;

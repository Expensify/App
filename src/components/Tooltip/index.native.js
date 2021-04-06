import PropTypes from 'prop-types';

// We can't use the common component for the Tooltip as Web implementation uses DOM specific method to
// render the View which is not present on the Mobile.
const propTypes = {
    children: PropTypes.element,
};

/**
 * There is no native support for the Hover on the Mobile platform so we just return the enclosing childrens
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
const Tooltip = props => props.children;

Tooltip.propTypes = propTypes;
Tooltip.displayName = 'Tooltip';
export default Tooltip;

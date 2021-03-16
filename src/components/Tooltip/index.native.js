// We can't use the common component for the Tooltip as Web implementation uses DOM specific method to
// render the View which is not present on the Mobile.
import {propTypes, defaultProps} from './TooltipPropTypes';

/**
 * There is no native support for the Hover on the Mobile platform so we just return the enclosing childrens
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
const Tooltip = props => props.children;

Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;
Tooltip.displayName = 'Tooltip';
export default Tooltip;

import {propTypes, defaultProps} from './TooltipPropTypes';

const Tooltip = props => props.children;

Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;
Tooltip.displayName = 'Tooltip';
export default Tooltip;

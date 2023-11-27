// We can't use the common component for the Tooltip as Web implementation uses DOM specific method to
import TooltipProps from '@components/Tooltip/types';

function Tooltip({children}: TooltipProps) {
    return children;
}

Tooltip.displayName = 'Tooltip';

export default Tooltip;

// We can't use the common component for the Tooltip as Web implementation uses DOM specific method to
import {ReactNode} from 'react';

// render the View which is not present on the Mobile.
type TooltipProps = {
    children: ReactNode;
};
function Tooltip({children}: TooltipProps) {
    return children;
}

Tooltip.displayName = 'Tooltip';

export default Tooltip;

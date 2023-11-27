// We can't use the common component for the Tooltip as Web implementation uses DOM specific method to
import ChildrenProps from '@src/types/utils/ChildrenProps';

function Tooltip({children}: ChildrenProps) {
    return children;
}

Tooltip.displayName = 'Tooltip';

export default Tooltip;

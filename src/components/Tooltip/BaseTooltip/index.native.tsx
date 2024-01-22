import {forwardRef} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

// We can't use the common component for the Tooltip as Web implementation uses DOM specific method
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Tooltip({children}: ChildrenProps, ref: unknown) {
    return children;
}

Tooltip.displayName = 'Tooltip';

export default forwardRef(Tooltip);

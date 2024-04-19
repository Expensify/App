import {forwardRef} from 'react';
import type {HoverableTooltipProps} from '@components/Tooltip/types';

// We can't use the common component for the Hoverable Tooltip as Web implementation uses DOM specific method
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HoverableTooltip({children}: HoverableTooltipProps, ref: unknown) {
    return children;
}

HoverableTooltip.displayName = 'HoverableTooltip';

export default forwardRef(HoverableTooltip);

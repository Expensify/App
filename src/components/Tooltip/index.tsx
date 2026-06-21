import React from 'react';
import BaseTooltip from './BaseTooltip';
import type {TooltipExtendedProps} from './types';

function Tooltip({shouldRender = true, children, ...props}: TooltipExtendedProps) {
    return (
        <BaseTooltip
            {...props}
            shouldRender={shouldRender}
        >
            {children}
        </BaseTooltip>
    );
}

export default Tooltip;

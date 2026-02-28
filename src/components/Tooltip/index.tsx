import React from 'react';
import BaseTooltip from './BaseTooltip';
import type {TooltipExtendedProps} from './types';

function Tooltip({shouldRender = true, children, ...props}: TooltipExtendedProps) {
    if (!shouldRender) {
        return children;
    }

    return (
        <BaseTooltip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </BaseTooltip>
    );
}

export default Tooltip;

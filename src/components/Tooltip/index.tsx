import React from 'react';
import EducationalTooltip from './EducationalTooltip';
import HoverableTooltip from './HoverableTooltip';
import type {TooltipExtendedProps} from './types';

function Tooltip({shouldRender = true, shouldRenderWithoutHover, children, ...props}: TooltipExtendedProps) {
    if (!shouldRender) {
        return children;
    }

    if (shouldRenderWithoutHover) {
        return (
            <EducationalTooltip
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                {children}
            </EducationalTooltip>
        );
    }

    return (
        <HoverableTooltip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </HoverableTooltip>
    );
}

Tooltip.displayName = 'Tooltip';

export default Tooltip;

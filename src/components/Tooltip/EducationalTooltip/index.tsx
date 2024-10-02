import React from 'react';
import type {TooltipExtendedProps} from '@components/Tooltip/types';
import BaseEducationalTooltip from './BaseEducationalTooltip';

function EducationalTooltip({children, shouldRender = false, ...props}: TooltipExtendedProps) {
    if (!shouldRender) {
        return children;
    }

    return (
        <BaseEducationalTooltip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </BaseEducationalTooltip>
    );
}

EducationalTooltip.displayName = 'EducationalTooltip';

export default EducationalTooltip;

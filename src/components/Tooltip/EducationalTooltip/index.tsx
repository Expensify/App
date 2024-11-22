import React from 'react';
import type {TooltipExtendedProps} from '@components/Tooltip/types';
import BaseEducationalTooltip from './BaseEducationalTooltip';

function EducationalTooltip({children, ...props}: TooltipExtendedProps) {
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

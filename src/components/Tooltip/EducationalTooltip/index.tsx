import type {TooltipExtendedProps} from '@components/Tooltip/types';

import React from 'react';

import BaseEducationalTooltip from './BaseEducationalTooltip';

function EducationalTooltip({children, ...props}: TooltipExtendedProps) {
    const {shouldRender} = props;

    if (!shouldRender) {
        return children;
    }

    return <BaseEducationalTooltip {...props}>{children}</BaseEducationalTooltip>;
}

export default EducationalTooltip;

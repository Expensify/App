import React from 'react';

import type {TooltipExtendedProps} from './types';

import BaseTooltip from './BaseTooltip';

function Tooltip({shouldRender = true, children, ...props}: TooltipExtendedProps) {
    if (!shouldRender) {
        return children;
    }

    return <BaseTooltip {...props}>{children}</BaseTooltip>;
}

export default Tooltip;

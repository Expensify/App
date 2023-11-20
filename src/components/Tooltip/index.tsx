import React from 'react';
import BaseTooltip from './BaseTooltip';
import {TooltipProps} from './types';

type Props = TooltipProps & {
    shouldRender?: boolean;
};

function Tooltip({shouldRender = true, children, ...props}: Props) {
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

Tooltip.displayName = 'Tooltip';

export default Tooltip;

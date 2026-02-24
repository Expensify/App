import React from 'react';

type TTooltipRef = {
    hideTooltip: () => void;
};

const tooltipRef = React.createRef<TTooltipRef>();

const TooltipRefManager = {
    ref: tooltipRef,
    hideTooltip: () => {
        tooltipRef.current?.hideTooltip();
    },
};

export default TooltipRefManager;

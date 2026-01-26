import type {BoundsObserver} from '@react-ng/bounds-observer';
import React, {useContext, useMemo, useRef} from 'react';
import {PopoverContext} from '@components/PopoverProvider';
import BaseTooltip from './BaseTooltip';
import type {TooltipExtendedProps} from './types';

function PopoverAnchorTooltip({shouldRender = true, children, ...props}: TooltipExtendedProps) {
    const {isOpen, popoverAnchor} = useContext(PopoverContext);
    const tooltipRef = useRef<BoundsObserver>(null);

    const isPopoverRelatedToTooltipOpen = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const tooltipNode = (tooltipRef.current?.['_childNode'] as Node | undefined) ?? null;

        if (isOpen && popoverAnchor && tooltipNode && ((popoverAnchor instanceof Node && tooltipNode.contains(popoverAnchor)) || tooltipNode === popoverAnchor)) {
            return true;
        }

        return false;
    }, [isOpen, popoverAnchor]);

    if (!shouldRender || isPopoverRelatedToTooltipOpen) {
        return children;
    }

    return (
        <BaseTooltip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={tooltipRef}
        >
            {children}
        </BaseTooltip>
    );
}

export default PopoverAnchorTooltip;

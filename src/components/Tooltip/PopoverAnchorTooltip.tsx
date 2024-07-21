import type {BoundsObserver} from '@react-ng/bounds-observer';
import React, {useContext, useMemo, useRef} from 'react';
import {PopoverContext} from '@components/PopoverProvider';
import BaseTooltip from './BaseTooltip';
import type {TooltipExtendedProps} from './types';

function PopoverAnchorTooltip({shouldRender = true, children, ...props}: TooltipExtendedProps) {
    const {isOpen, popover} = useContext(PopoverContext);
    const tooltipRef = useRef<BoundsObserver>(null);

    const isPopoverRelatedToTooltipOpen = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const tooltipNode = (tooltipRef.current?.['_childNode'] as Node | undefined) ?? null;

        if (
            isOpen &&
            popover?.anchorRef?.current &&
            tooltipNode &&
            ((popover.anchorRef.current instanceof Node && tooltipNode.contains(popover.anchorRef.current)) || tooltipNode === popover.anchorRef.current)
        ) {
            return true;
        }

        return false;
    }, [isOpen, popover]);

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

PopoverAnchorTooltip.displayName = 'PopoverAnchorTooltip';

export default PopoverAnchorTooltip;

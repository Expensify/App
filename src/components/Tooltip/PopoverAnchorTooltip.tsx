import {usePopoverState} from '@components/PopoverProvider';

import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {BoundsObserver} from '@react-ng/bounds-observer';

import React, {useMemo, useRef} from 'react';

import type {TooltipExtendedProps} from './types';

import BaseTooltip from './BaseTooltip';

function isDOMNode(value: unknown): value is {nodeType: number} {
    return typeof value === 'object' && value !== null && 'nodeType' in value && typeof value.nodeType === 'number';
}

function PopoverAnchorTooltip({shouldRender = true, children, ...props}: TooltipExtendedProps) {
    const {isOpen, popoverAnchor} = usePopoverState();
    const tooltipRef = useRef<BoundsObserver>(null);

    const isPopoverRelatedToTooltipOpen = useMemo(() => {
        const tooltipNode: unknown = tooltipRef.current ? Reflect.get(tooltipRef.current, '_childNode') : null;

        if (
            isOpen &&
            popoverAnchor &&
            ((isDOMNode(popoverAnchor) && ObjectUtils.hasMethod(tooltipNode, 'contains') && tooltipNode.contains(popoverAnchor)) || tooltipNode === popoverAnchor)
        ) {
            return true;
        }

        return false;
    }, [isOpen, popoverAnchor]);

    if (!shouldRender || isPopoverRelatedToTooltipOpen) {
        return children;
    }

    return (
        <BaseTooltip
            {...props}
            ref={tooltipRef}
        >
            {children}
        </BaseTooltip>
    );
}

export default PopoverAnchorTooltip;

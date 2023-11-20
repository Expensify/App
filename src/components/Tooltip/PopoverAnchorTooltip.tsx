import React, {useContext, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {PopoverContext} from '@components/PopoverProvider';
import BaseTooltip from './BaseTooltip';
import {TooltipProps} from './types';

type Props = TooltipProps & {
    /** Whether the actual Tooltip should be rendered. If false, it's just going to return the children */
    shouldRender: boolean;
};
function PopoverAnchorTooltip({shouldRender = true, children, ...props}: Props) {
    const {isOpen, popover} = useContext(PopoverContext);
    const tooltipRef = useRef<View>(null);

    const isPopoverRelatedToTooltipOpen = useMemo(() => {
        // eslint-disable-next-line
        const tooltipNode = tooltipRef.current ? tooltipRef.current._childNode : null;
        if (isOpen && popover?.anchorRef?.current && tooltipNode && (tooltipNode.contains(popover.anchorRef.current) || tooltipNode === popover.anchorRef.current)) {
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
            tooltipRef={tooltipRef}
        >
            {children}
        </BaseTooltip>
    );
}

PopoverAnchorTooltip.displayName = 'PopoverAnchorTooltip';

export default PopoverAnchorTooltip;

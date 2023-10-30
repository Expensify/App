import PropTypes from 'prop-types';
import React, {useContext, useMemo, useRef} from 'react';
import {PopoverContext} from '@components/PopoverProvider';
import BaseTooltip from './BaseTooltip';
import {defaultProps as tooltipDefaultProps, propTypes as tooltipPropTypes} from './tooltipPropTypes';

const propTypes = {
    ...tooltipPropTypes,

    /** Whether the actual Tooltip should be rendered. If false, it's just going to return the children */
    shouldRender: PropTypes.bool,
};

const defaultProps = {
    ...tooltipDefaultProps,
    shouldRender: true,
};

function PopoverAnchorTooltip({shouldRender, children, ...props}) {
    const {isOpen, popover} = useContext(PopoverContext);
    const tooltipRef = useRef(null);

    const isPopoverRelatedToTooltipOpen = useMemo(() => {
        // eslint-disable-next-line
        const tooltipNode = tooltipRef.current ? tooltipRef.current._childNode : null;
        if (
            isOpen &&
            popover &&
            popover.anchorRef &&
            popover.anchorRef.current &&
            tooltipNode &&
            (tooltipNode.contains(popover.anchorRef.current) || tooltipNode === popover.anchorRef.current)
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
            tooltipRef={tooltipRef}
        >
            {children}
        </BaseTooltip>
    );
}

PopoverAnchorTooltip.displayName = 'PopoverAnchorTooltip';
PopoverAnchorTooltip.propTypes = propTypes;
PopoverAnchorTooltip.defaultProps = defaultProps;

export default PopoverAnchorTooltip;

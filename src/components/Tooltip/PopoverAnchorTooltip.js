import React, {useContext, useRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {propTypes as tooltipPropTypes, defaultProps as tooltipDefaultProps} from './tooltipPropTypes';
import BaseTooltip from './BaseTooltip';
import {PopoverContext} from '../PopoverProvider';

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

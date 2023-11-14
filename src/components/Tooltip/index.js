import PropTypes from 'prop-types';
import React from 'react';
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

function Tooltip({shouldRender = true, children, ...props}) {
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
Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;

export default Tooltip;

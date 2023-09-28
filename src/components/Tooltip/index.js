import React from 'react';
import PropTypes from 'prop-types';
import {propTypes as tooltipPropTypes, defaultProps as tooltipDefaultProps} from './tooltipPropTypes';
import BaseTooltip from './BaseTooltip';

const propTypes = {
    ...tooltipPropTypes,
    shouldRender: PropTypes.bool,
};

const defaultProps = {
    ...tooltipDefaultProps,
    shouldRender: true,
};

function Tooltip({shouldRender, children, ...props}) {
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

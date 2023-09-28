import React from 'react';
import PropTypes from 'prop-types';
import * as tooltipPropTypes from './tooltipPropTypes';
import BaseTooltip from './BaseTooltip';

const propTypes = {
    ...tooltipPropTypes.propTypes,
    shouldRender: PropTypes.bool,
};

const defaultProps = {
    ...tooltipPropTypes.defaultProps,
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

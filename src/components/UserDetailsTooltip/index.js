import PropTypes from 'prop-types';
import React from 'react';
import BaseUserDetailsTooltip from './BaseUserDetailsTooltip';
import {defaultProps as userDetailsTooltipDefaultProps, propTypes as userDetailsTooltipPropTypes} from './userDetailsTooltipPropTypes';

const propTypes = {
    ...userDetailsTooltipPropTypes,

    /** Whether the actual UserDetailsTooltip should be rendered. If false, it's just going to return the children */
    shouldRender: PropTypes.bool,
};

const defaultProps = {
    ...userDetailsTooltipDefaultProps,
    shouldRender: true,
};

function UserDetailsTooltip({shouldRender = true, children, ...props}) {
    if (!shouldRender) {
        return children;
    }

    return (
        <BaseUserDetailsTooltip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </BaseUserDetailsTooltip>
    );
}

UserDetailsTooltip.displayName = 'UserDetailsTooltip';
UserDetailsTooltip.propTypes = propTypes;
UserDetailsTooltip.defaultProps = defaultProps;

export default UserDetailsTooltip;

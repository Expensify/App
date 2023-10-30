import React from 'react';
import PropTypes from 'prop-types';
import {propTypes as userDetailsTooltipPropTypes, defaultProps as userDetailsTooltipDefaultProps} from './userDetailsTooltipPropTypes';
import BaseUserDetailsTooltip from './BaseUserDetailsTooltip';

const propTypes = {
    ...userDetailsTooltipPropTypes,

    /** Whether the actual UserDetailsTooltip should be rendered. If false, it's just going to return the children */
    shouldRender: PropTypes.bool,
};

const defaultProps = {
    ...userDetailsTooltipDefaultProps,
    shouldRender: true,
};

function UserDetailsTooltip({shouldRender, children, ...props}) {
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

import React from 'react';
import BaseUserDetailsTooltip from './BaseUserDetailsTooltip/index.native';
import UserDetailsTooltipProps from './types';

function UserDetailsTooltip({shouldRender = true, children, ...props}: UserDetailsTooltipProps) {
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

export default UserDetailsTooltip;

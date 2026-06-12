import React from 'react';
import BaseUserDetailsTooltip from './BaseUserDetailsTooltip';
import type UserDetailsTooltipProps from './types';

function UserDetailsTooltip({shouldRender = true, children, ...props}: UserDetailsTooltipProps) {
    if (!shouldRender) {
        return children;
    }

    return <BaseUserDetailsTooltip {...props}>{children}</BaseUserDetailsTooltip>;
}

export default UserDetailsTooltip;

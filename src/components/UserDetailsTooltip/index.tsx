import React from 'react';

import type UserDetailsTooltipProps from './types';

import BaseUserDetailsTooltip from './BaseUserDetailsTooltip';

function UserDetailsTooltip({shouldRender = true, children, ...props}: UserDetailsTooltipProps) {
    if (!shouldRender) {
        return children;
    }

    return <BaseUserDetailsTooltip {...props}>{children}</BaseUserDetailsTooltip>;
}

export default UserDetailsTooltip;

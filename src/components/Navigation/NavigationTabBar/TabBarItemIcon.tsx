/** The glyph of a tab bar item, colored for its state, with the status dot of its destination. */
import IconWithStatusIndicator from '@components/Navigation/IconWithStatusIndicator';
import StatusIndicator from '@components/Navigation/StatusIndicator';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';

import getTabIconFill from './getTabIconFill';

type TabBarItemIconProps = {
    icon: IconAsset;
    isSelected: boolean;
    isHovered?: boolean;
    statusIndicatorColor?: string;
};

function TabBarItemIcon({icon, isSelected, isHovered = false, statusIndicatorColor}: TabBarItemIconProps) {
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <IconWithStatusIndicator
            src={icon}
            fill={getTabIconFill(isSelected, isHovered, theme)}
            size={shouldUseNarrowLayout ? variables.iconFloatingTabBar : variables.iconBottomBar}
        >
            {!!statusIndicatorColor && (
                <StatusIndicator
                    color={statusIndicatorColor}
                    borderColor={isHovered ? theme.sidebarHover : undefined}
                />
            )}
        </IconWithStatusIndicator>
    );
}

export default TabBarItemIcon;

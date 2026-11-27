import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';

import TabBarItemIcon from './TabBarItemIcon';
import TabBarItemLayout from './TabBarItemLayout';

type TabBarItemProps = {
    icon: IconAsset;
    label: string;
    isSelected: boolean;
    isHovered?: boolean;
    statusIndicatorColor?: string;
    numberOfLines?: number;
};

function TabBarItem({icon, label, isSelected, isHovered = false, statusIndicatorColor, numberOfLines = 2}: TabBarItemProps) {
    return (
        <TabBarItemLayout
            icon={
                <TabBarItemIcon
                    icon={icon}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    statusIndicatorColor={statusIndicatorColor}
                />
            }
            label={label}
            isSelected={isSelected}
            numberOfLines={numberOfLines}
        />
    );
}

export default TabBarItem;

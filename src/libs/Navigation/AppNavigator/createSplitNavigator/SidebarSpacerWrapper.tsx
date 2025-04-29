import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

type SidebarSpacerWrapperProps = {
    children?: ReactNode;
};

function SidebarSpacerWrapper({children}: SidebarSpacerWrapperProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {canUseLeftHandBar} = usePermissions();

    return <View style={canUseLeftHandBar ? styles.rootNavigatorContainerWithLHBStyles(shouldUseNarrowLayout) : styles.rootNavigatorContainerStyles(shouldUseNarrowLayout)}>{children}</View>;
}

SidebarSpacerWrapper.displayName = 'SidebarSpacerWrapper';

export default SidebarSpacerWrapper;

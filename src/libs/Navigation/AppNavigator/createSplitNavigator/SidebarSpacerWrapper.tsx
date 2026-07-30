import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type SidebarSpacerWrapperProps = {
    children?: ReactNode;
};

function SidebarSpacerWrapper({children}: SidebarSpacerWrapperProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout)}>{children}</View>;
}

export default SidebarSpacerWrapper;

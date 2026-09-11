import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type SidebarSpacerWrapperProps = {
    children?: ReactNode;
    shouldUseNarrowLayout: boolean;
};

function SidebarSpacerWrapper({children, shouldUseNarrowLayout}: SidebarSpacerWrapperProps) {
    const styles = useThemeStyles();

    return <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout)}>{children}</View>;
}

export default SidebarSpacerWrapper;

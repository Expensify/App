import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type SidebarSpacerWrapperProps = {
    children?: ReactNode;
};

function SidebarSpacerWrapper({children}: SidebarSpacerWrapperProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isExtraLargeScreenWidth} = useResponsiveLayout();
    const [sidePane] = useOnyx(ONYXKEYS.NVP_SIDE_PANE);
    const shouldShowSidePane = isExtraLargeScreenWidth && !!sidePane?.open;

    return <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout, shouldShowSidePane)}>{children}</View>;
}

SidebarSpacerWrapper.displayName = 'SidebarSpacerWrapper';

export default SidebarSpacerWrapper;

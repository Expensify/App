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
    const [sidePanel] = useOnyx(ONYXKEYS.NVP_SIDE_PANEL);
    const shouldShowHelpPanel = isExtraLargeScreenWidth && !!sidePanel?.open;

    return <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout, shouldShowHelpPanel)}>{children}</View>;
}

SidebarSpacerWrapper.displayName = 'SidebarSpacerWrapper';

export default SidebarSpacerWrapper;

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import getSplitNavigatorSidebarWidth from '@libs/Navigation/AppNavigator/getSplitNavigatorSidebarWidth';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';
import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type SidebarSpacerWrapperProps = {
    children?: ReactNode;

    /** Injected by the split navigator as a NavigationContentWrapper, never passed by hand. When undefined the default sidebar width is used. */
    state?: PlatformStackNavigationState<ParamListBase>;
};

function SidebarSpacerWrapper({children, state}: SidebarSpacerWrapperProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // The sidebar screen is the first route in a split navigator, and its width sets the central pane offset.
    const sidebarWidth = getSplitNavigatorSidebarWidth(state?.routes.at(0)?.name);

    return <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout, sidebarWidth)}>{children}</View>;
}

export default SidebarSpacerWrapper;

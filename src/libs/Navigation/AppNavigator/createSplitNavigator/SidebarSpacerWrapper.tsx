import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import variables from '@styles/variables';

import SCREENS from '@src/SCREENS';

import type {ParamListBase} from '@react-navigation/native';
import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type SidebarSpacerWrapperProps = {
    children?: ReactNode;
    state?: PlatformStackNavigationState<ParamListBase>;
};

function SidebarSpacerWrapper({children, state}: SidebarSpacerWrapperProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // The sidebar screen is the first route in a split navigator, so its width sets the central pane offset.
    const sidebarWidth = state?.routes.at(0)?.name === SCREENS.INBOX ? variables.inboxSideBarWidth : variables.sideBarWithLHBWidth;

    return <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout, sidebarWidth)}>{children}</View>;
}

export default SidebarSpacerWrapper;

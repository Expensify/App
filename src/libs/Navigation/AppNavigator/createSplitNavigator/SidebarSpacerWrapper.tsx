import type {ReactNode} from 'react';
import React, {createContext, useContext} from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

const SidebarWidthContext = createContext<number>(variables.sideBarWithLHBWidth);

type SidebarSpacerWrapperProps = {
    children?: ReactNode;
};

function SidebarSpacerWrapper({children}: SidebarSpacerWrapperProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const sidebarWidth = useContext(SidebarWidthContext);

    return <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout, sidebarWidth)}>{children}</View>;
}

export {SidebarWidthContext};
export default SidebarSpacerWrapper;

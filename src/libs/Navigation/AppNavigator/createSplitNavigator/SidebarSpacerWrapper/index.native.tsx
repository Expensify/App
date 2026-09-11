import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type SidebarSpacerWrapperProps = {
    children?: ReactNode;
};

function SidebarSpacerWrapper({children}: SidebarSpacerWrapperProps) {
    const styles = useThemeStyles();

    return <View style={styles.flex1}>{children}</View>;
}

export default SidebarSpacerWrapper;

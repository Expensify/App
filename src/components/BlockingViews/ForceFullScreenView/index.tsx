import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type ForceFullScreenViewProps from './types';

function ForceFullScreenView({children, forceFullPage = false}: ForceFullScreenViewProps) {
    const styles = useThemeStyles();

    if (forceFullPage) {
        return <View style={forceFullPage && styles.forcedBlockingViewContainer}>{children}</View>;
    }

    return children;
}

ForceFullScreenView.displayName = 'ForceFullScreenViewProps';

export default ForceFullScreenView;

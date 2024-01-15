import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type ForceFullScreenViewProps from './types';

function ForceFullScreenView({children, forceFullScreen = false}: ForceFullScreenViewProps) {
    const styles = useThemeStyles();

    if (forceFullScreen) {
        return <View style={forceFullScreen && styles.forcedBlockingViewContainer}>{children}</View>;
    }

    return children;
}

ForceFullScreenView.displayName = 'ForceFullScreenView';

export default ForceFullScreenView;

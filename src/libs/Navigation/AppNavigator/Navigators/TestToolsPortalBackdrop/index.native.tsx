import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';
import {StyleSheet, View} from 'react-native';

/** The native Overlay is empty, and the root modal dim sits under the required-2FA screen once this frame is portaled. */
function TestToolsPortalBackdrop() {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    return (
        <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, variables.overlayOpacity)]}
            testID="test-tools-portal-backdrop"
        />
    );
}

export default TestToolsPortalBackdrop;

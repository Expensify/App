import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/** Material's bar shares the screen's background, so a shadow along its top edge marks where the content ends. */
function NativeTabBarShadow() {
    const styles = useThemeStyles();
    const {bottom: bottomInset} = useSafeAreaInsets();

    return (
        <View
            style={styles.androidNativeTabBarShadow(bottomInset)}
            pointerEvents="none"
        />
    );
}

export default NativeTabBarShadow;

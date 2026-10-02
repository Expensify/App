import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

/** Material's bar shares the screen's background, so a shadow along its top edge marks where the content ends. */
function NativeTabBarShadow() {
    const styles = useThemeStyles();
    const {bottom: bottomInset} = useSafeAreaInsets();

    return (
        <Animated.View
            entering={FadeIn.duration(CONST.MODAL.ANIMATION_TIMING.FAB_IN)}
            exiting={FadeOut.duration(CONST.MODAL.ANIMATION_TIMING.FAB_OUT)}
            style={styles.androidNativeTabBarShadow(bottomInset)}
            pointerEvents="none"
        />
    );
}

export default NativeTabBarShadow;

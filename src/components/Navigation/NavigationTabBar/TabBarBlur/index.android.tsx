import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import {BlurView} from 'expo-blur';
import React from 'react';

import {useTabBarBlurTarget} from './TabBarBlurTargetContext';

/**
 * Blurs whatever the floating tab bar covers, so the bar reads as a glass capsule the way UIKit draws it on iOS.
 * Android has no backdrop filter of its own, so the blur comes from a native view that samples the focused tab
 * scene. Until a scene registers itself there is nothing to sample, and the view paints only its tint. The tints
 * are expo-blur's white and dark grey materials, which give the milky wash UIKit's glass lays over what it blurs.
 */
function TabBarBlur() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const blurTarget = useTabBarBlurTarget();

    return (
        <BlurView
            intensity={variables.floatingTabBarBlurIntensity}
            blurReductionFactor={variables.floatingTabBarBlurReductionFactor}
            blurMethod={blurTarget ? 'dimezisBlurViewSdk31Plus' : 'none'}
            blurTarget={blurTarget ?? undefined}
            tint={theme.colorScheme === CONST.COLOR_SCHEME.DARK ? 'systemThinMaterialDark' : 'systemChromeMaterialLight'}
            style={styles.navigationTabBarBlur}
        />
    );
}

export default TabBarBlur;

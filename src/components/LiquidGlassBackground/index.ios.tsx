import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

import {GlassView, isLiquidGlassAvailable} from 'expo-glass-effect';
import React from 'react';
import {StyleSheet} from 'react-native';

import type LiquidGlassBackgroundProps from './types';

/** iOS 26 draws its bars and buttons on liquid glass, so the app's buttons over them can be made of the same material. */
const isLiquidGlassSupported = isLiquidGlassAvailable();

/** Liquid glass filling its parent, drawn behind the parent's content. */
function LiquidGlassBackground({tintColor, tintOpacity = 1, style}: LiquidGlassBackgroundProps) {
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    if (!isLiquidGlassSupported) {
        return null;
    }

    const glassTintColor = tintColor ? StyleUtils.getBackgroundColorWithOpacityStyle(tintColor, tintOpacity).backgroundColor : undefined;

    return (
        <GlassView
            style={[StyleSheet.absoluteFill, style]}
            glassEffectStyle="regular"
            tintColor={glassTintColor}
            // Without it the glass follows the system appearance, which differs from the app's theme when the user picked one.
            colorScheme={theme.colorScheme}
            isInteractive
        />
    );
}

export default LiquidGlassBackground;
export {isLiquidGlassSupported};

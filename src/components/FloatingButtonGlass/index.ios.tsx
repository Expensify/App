import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import {GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable} from 'expo-glass-effect';
import React from 'react';
import {StyleSheet} from 'react-native';

import type FloatingButtonGlassProps from './types';

/**
 * iOS 26 draws liquid glass, so the floating buttons over the native tab bar are made of the same material as the bar.
 * Some iOS 26 builds ship without the glass effect API and crash on GlassView, so those keep the solid buttons.
 */
const isFloatingButtonGlassAvailable = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

/** The liquid glass a floating button is drawn with in place of its solid fill, tinted with the button's color. */
function FloatingButtonGlass({tintColor, tintOpacity = variables.floatingButtonGlassTintOpacity}: FloatingButtonGlassProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    if (!isFloatingButtonGlassAvailable) {
        return null;
    }

    const {backgroundColor: glassTintColor} = StyleUtils.getBackgroundColorWithOpacityStyle(tintColor, tintOpacity);

    return (
        <GlassView
            style={[StyleSheet.absoluteFill, styles.floatingButtonGlass]}
            glassEffectStyle="regular"
            tintColor={glassTintColor}
            // Follow the app theme, not the system appearance, so the glass matches the UI when the two differ.
            colorScheme={theme.colorScheme}
            isInteractive
        />
    );
}

export default FloatingButtonGlass;
export {isFloatingButtonGlassAvailable};

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import {GlassView, isLiquidGlassAvailable} from 'expo-glass-effect';
import React from 'react';
import {StyleSheet} from 'react-native';

import type FloatingButtonGlassProps from './types';

/** iOS 26 draws liquid glass, so the floating buttons over the native tab bar are made of the same material as the bar. */
const isFloatingButtonGlassAvailable = isLiquidGlassAvailable();

/** The liquid glass a floating button is drawn with in place of its solid fill, tinted with the button's color. */
function FloatingButtonGlass({tintColor, tintOpacity = variables.floatingButtonGlassTintOpacity}: FloatingButtonGlassProps) {
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
            isInteractive
        />
    );
}

export default FloatingButtonGlass;
export {isFloatingButtonGlassAvailable};

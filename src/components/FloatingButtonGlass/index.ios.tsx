import useThemeStyles from '@hooks/useThemeStyles';

import {GlassView, isLiquidGlassAvailable} from 'expo-glass-effect';
import React from 'react';
import {StyleSheet, View} from 'react-native';

import type FloatingButtonGlassProps from './types';

/** iOS 26 draws liquid glass, so the floating buttons over the native tab bar are made of the same material as the bar. */
const isFloatingButtonGlassAvailable = isLiquidGlassAvailable();

/** The liquid glass a floating button is drawn with in place of its solid fill. */
function FloatingButtonGlass({centerColor}: FloatingButtonGlassProps) {
    const styles = useThemeStyles();

    if (!isFloatingButtonGlassAvailable) {
        return null;
    }

    return (
        <>
            <GlassView
                style={[StyleSheet.absoluteFill, styles.floatingButtonGlass]}
                glassEffectStyle="regular"
                isInteractive
            />
            {!!centerColor && (
                <View
                    style={[StyleSheet.absoluteFill, styles.floatingButtonGlassCenter, {backgroundColor: centerColor}]}
                    pointerEvents="none"
                />
            )}
        </>
    );
}

export default FloatingButtonGlass;
export {isFloatingButtonGlassAvailable};

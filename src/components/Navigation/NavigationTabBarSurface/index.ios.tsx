import useThemePreference from '@hooks/useThemePreference';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import {GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable} from 'expo-glass-effect';
import React from 'react';

import type NavigationTabBarSurfaceProps from './types';

import BaseNavigationTabBarSurface from './BaseNavigationTabBarSurface';

const DARK_THEME_PREFERENCES = new Set<string>([CONST.THEME.DARK, CONST.THEME.DARK_CONTRAST]);

/**
 * Liquid glass capsule behind the narrow tab bar. The material arrives with iOS 26, and some of its betas ship
 * without the runtime API, so both checks have to pass before the glass view replaces the translucent surface.
 */
function NavigationTabBarSurface({children, style, testID}: NavigationTabBarSurfaceProps) {
    const styles = useThemeStyles();
    const themePreference = useThemePreference();

    if (!isLiquidGlassAvailable() || !isGlassEffectAPIAvailable()) {
        return (
            <BaseNavigationTabBarSurface
                style={style}
                testID={testID}
            >
                {children}
            </BaseNavigationTabBarSurface>
        );
    }

    return (
        <GlassView
            style={[style, styles.bgTransparent]}
            glassEffectStyle="regular"
            // The app carries its own theme switch, so the material follows that instead of the system appearance.
            colorScheme={DARK_THEME_PREFERENCES.has(themePreference) ? 'dark' : 'light'}
            testID={testID}
        >
            {children}
        </GlassView>
    );
}

export default NavigationTabBarSurface;

import React, {useEffect} from 'react';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import useTheme from '@styles/themes/useTheme';
import useThemePreference from '@styles/themes/useThemePreference';
import CONST from '@src/CONST';

function CustomStatusBar() {
    const preferredTheme = useThemePreference();
    const theme = useTheme();

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            // Set the status bar colour depending on the current route.
            // If we don't have any colour defined for a route, fall back to
            // appBG color.
            const currentRoute = navigationRef.getCurrentRoute();
            let currentScreenBackgroundColor = theme.appBG;
            if (currentRoute && 'name' in currentRoute && currentRoute.name in theme.PAGE_BACKGROUND_COLORS) {
                currentScreenBackgroundColor = theme.PAGE_BACKGROUND_COLORS[currentRoute.name];
            }
            StatusBar.setBarStyle(preferredTheme === CONST.THEMES.LIGHT ? 'dark-content' : 'light-content', true);
            StatusBar.setBackgroundColor(currentScreenBackgroundColor);
        });
    }, [preferredTheme, theme.PAGE_BACKGROUND_COLORS, theme.appBG]);
    return <StatusBar />;
}

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;

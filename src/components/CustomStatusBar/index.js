import React, {useEffect, useMemo} from 'react';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import useTheme from '@styles/themes/useTheme';

function CustomStatusBar() {
    const theme = useTheme();
    const statusBarContentTheme = useMemo(() => (theme.statusBarContentTheme === 'light' ? 'light-content' : 'dark-content'), [theme.statusBarContentTheme]);

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
            StatusBar.setBarStyle(statusBarContentTheme, true);
            StatusBar.setBackgroundColor(currentScreenBackgroundColor);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme.PAGE_BACKGROUND_COLORS, theme.appBG]);

    useEffect(() => {
        StatusBar.setBarStyle(statusBarContentTheme, true);
    }, [statusBarContentTheme]);

    return <StatusBar />;
}

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;

import React, {useEffect} from 'react';
import StatusBar from '../../libs/StatusBar';
import Navigation, {navigationRef} from '../../libs/Navigation/Navigation';
import themeColors from '../../styles/themes/default';

function CustomStatusBar() {
    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            // Set the status bar colour depending on the current route.
            // If we don't have any colour defined for a route, fall back to
            // appBG color.
            const currentRoute = navigationRef.getCurrentRoute();
            let currentScreenBackgroundColor = themeColors.appBG;
            if (currentRoute && 'name' in currentRoute && currentRoute.name in themeColors.PAGE_BACKGROUND_COLORS) {
                currentScreenBackgroundColor = themeColors.PAGE_BACKGROUND_COLORS[currentRoute.name];
            }
            StatusBar.setBarStyle('light-content', true);
            StatusBar.setBackgroundColor(currentScreenBackgroundColor);
        });
    }, []);
    return <StatusBar />;
}

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;

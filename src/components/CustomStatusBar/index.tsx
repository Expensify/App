import React, {useEffect} from 'react';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import themeColors from '@styles/themes/default';
import type CustomStatusBarType from './types';

// eslint-disable-next-line react/function-component-definition
const CustomStatusBar: CustomStatusBarType = () => {
    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            // Set the status bar colour depending on the current route.
            // If we don't have any colour defined for a route, fall back to
            // appBG color.
            const currentRoute = navigationRef.getCurrentRoute();
            let currentScreenBackgroundColor = themeColors.appBG;

            if (currentRoute?.name && currentRoute?.name in themeColors.PAGE_BACKGROUND_COLORS) {
                currentScreenBackgroundColor = themeColors.PAGE_BACKGROUND_COLORS[currentRoute?.name as keyof typeof themeColors.PAGE_BACKGROUND_COLORS];
            }
            StatusBar.setBarStyle('light-content', true);
            StatusBar.setBackgroundColor(currentScreenBackgroundColor);
        });
    }, []);
    return <StatusBar />;
};

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;

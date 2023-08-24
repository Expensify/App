import React, {useEffect} from 'react';
import StatusBar from '../../libs/StatusBar';
import Navigation, {navigationRef} from '../../libs/Navigation/Navigation';
import themeColors from '../../styles/themes/default';

function CustomStatusBar() {
    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            const currentRoute = navigationRef.getCurrentRoute();
            const currentScreenBackgroundColor = themeColors.PAGE_BACKGROUND_COLORS[currentRoute.name] || themeColors.appBG;    
            StatusBar.setBarStyle('light-content', true);
            StatusBar.setBackgroundColor(currentScreenBackgroundColor);    
        });
    }, []);
    return <StatusBar />;
}

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;

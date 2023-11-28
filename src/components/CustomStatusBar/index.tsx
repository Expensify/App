import React, {useContext, useEffect} from 'react';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import useTheme from '@styles/themes/useTheme';
import CustomStatusBarContext from './CustomStatusBarContext';

type CustomStatusBarProps = {
    isNested: boolean;
};

function CustomStatusBar({isNested = false}: CustomStatusBarProps): React.ReactElement | null {
    const {isRootStatusBarDisabled, disableRootStatusBar} = useContext(CustomStatusBarContext);
    const theme = useTheme();

    const isDisabled = !isNested && isRootStatusBarDisabled;

    useEffect(() => {
        if (isNested) {
            disableRootStatusBar(true);
        }

        return () => disableRootStatusBar(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isDisabled) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            // Set the status bar colour depending on the current route.
            // If we don't have any colour defined for a route, fall back to
            // appBG color.
            const currentRoute = navigationRef.getCurrentRoute();
            let currentScreenBackgroundColor = theme.appBG;
            let statusBarStyle = theme.statusBarStyle;
            if (currentRoute && 'name' in currentRoute && currentRoute.name in theme.PAGE_THEMES) {
                const screenTheme = theme.PAGE_THEMES[currentRoute.name];
                currentScreenBackgroundColor = screenTheme.backgroundColor;
                statusBarStyle = screenTheme.statusBarStyle;
            }

            StatusBar.setBarStyle(statusBarStyle, false);
            StatusBar.setBackgroundColor(currentScreenBackgroundColor, false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme.PAGE_THEMES, theme.appBG]);

    useEffect(() => {
        StatusBar.setBarStyle(theme.statusBarStyle, true);
    }, [theme.statusBarStyle]);

    if (isDisabled) {
        return null;
    }

    return <StatusBar />;
}

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;

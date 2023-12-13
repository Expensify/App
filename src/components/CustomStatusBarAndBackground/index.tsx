import React, {useCallback, useContext, useEffect} from 'react';
import {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import useTheme from '@styles/themes/useTheme';
import CustomStatusBarContext from './CustomStatusBarContext';
import updateGlobalBackgroundColor from './updateGlobalBackgroundColor';
import updateStatusBarAppearance from './updateStatusBarAppearance';

type CustomStatusBarAndBackgroundProps = {
    isNested: boolean;
};

function CustomStatusBarAndBackground({isNested = false}: CustomStatusBarAndBackgroundProps) {
    const {isRootStatusBarDisabled, disableRootStatusBar} = useContext(CustomStatusBarContext);
    const theme = useTheme();

    const isDisabled = !isNested && isRootStatusBarDisabled;

    useEffect(() => {
        if (isDisabled) {
            return;
        }

        updateGlobalBackgroundColor(theme);
    }, [isDisabled, theme]);

    useEffect(() => {
        if (isNested) {
            disableRootStatusBar(true);
        }

        return () => {
            if (!isNested) {
                return;
            }
            disableRootStatusBar(false);
        };
    }, [disableRootStatusBar, isNested]);

    const updateStatusBarStyle = useCallback(() => {
        if (isDisabled) {
            return;
        }

        // Set the status bar colour depending on the current route.
        // If we don't have any colour defined for a route, fall back to
        // appBG color.
        let currentRoute: ReturnType<typeof navigationRef.getCurrentRoute> | undefined;
        if (navigationRef.isReady()) {
            currentRoute = navigationRef.getCurrentRoute();
        }

        let currentScreenBackgroundColor = theme.appBG;
        let statusBarStyle = theme.statusBarStyle;
        if (currentRoute && 'name' in currentRoute && currentRoute.name in theme.PAGE_THEMES) {
            const screenTheme = theme.PAGE_THEMES[currentRoute.name];
            currentScreenBackgroundColor = screenTheme.backgroundColor;
            statusBarStyle = screenTheme.statusBarStyle;
        }

        updateStatusBarAppearance({backgroundColor: currentScreenBackgroundColor, statusBarStyle});
    }, [isDisabled, theme.PAGE_THEMES, theme.appBG, theme.statusBarStyle]);

    useEffect(() => {
        navigationRef.addListener('state', updateStatusBarStyle);

        return () => navigationRef.removeListener('state', updateStatusBarStyle);
    }, [updateStatusBarStyle]);

    useEffect(() => {
        if (isDisabled) {
            return;
        }

        updateStatusBarStyle();
    }, [isDisabled, theme.statusBarStyle, updateStatusBarStyle]);

    if (isDisabled) {
        return null;
    }

    return <StatusBar />;
}

CustomStatusBarAndBackground.displayName = 'CustomStatusBar';

export default CustomStatusBarAndBackground;

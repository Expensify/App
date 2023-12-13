import React, {useCallback, useContext, useEffect} from 'react';
import useTheme from '@hooks/useTheme';
import {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import CustomStatusBarAndBackgroundContext from './CustomStatusBarAndBackgroundContext';
import updateGlobalBackgroundColor from './updateGlobalBackgroundColor';
import updateStatusBarAppearance from './updateStatusBarAppearance';

type CustomStatusBarAndBackgroundProps = {
    /** Whether the CustomStatusBar is nested within another CustomStatusBar.
     *  A nested CustomStatusBar will disable the "root" CustomStatusBar. */
    isNested: boolean;
};

function CustomStatusBarAndBackground({isNested = false}: CustomStatusBarAndBackgroundProps) {
    const {isRootStatusBarDisabled, disableRootStatusBar} = useContext(CustomStatusBarAndBackgroundContext);
    const theme = useTheme();
    const [statusBarStyle, setStatusBarStyle] = React.useState(theme.statusBarStyle);

    const isDisabled = !isNested && isRootStatusBarDisabled;

    // Disable the root status bar when a nested status bar is rendered
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
        let newStatusBarStyle = theme.statusBarStyle;
        if (currentRoute && 'name' in currentRoute && currentRoute.name in theme.PAGE_THEMES) {
            const screenTheme = theme.PAGE_THEMES[currentRoute.name];
            currentScreenBackgroundColor = screenTheme.backgroundColor;
            newStatusBarStyle = screenTheme.statusBarStyle;
        }

        // Don't update the status bar style if it's the same as the current one, to prevent flashing.
        if (newStatusBarStyle === statusBarStyle) {
            updateStatusBarAppearance({backgroundColor: currentScreenBackgroundColor});
        } else {
            updateStatusBarAppearance({backgroundColor: currentScreenBackgroundColor, statusBarStyle: newStatusBarStyle});
            setStatusBarStyle(newStatusBarStyle);
        }
    }, [isDisabled, statusBarStyle, theme.PAGE_THEMES, theme.appBG, theme.statusBarStyle]);

    // Update the status bar style everytime the navigation state changes
    useEffect(() => {
        navigationRef.addListener('state', updateStatusBarStyle);
        return () => navigationRef.removeListener('state', updateStatusBarStyle);
    }, [updateStatusBarStyle]);

    // Update the status bar style everytime the theme changes
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        updateStatusBarStyle();
    }, [isDisabled, theme.statusBarStyle, updateStatusBarStyle]);

    // Update the global background (on web) everytime the theme changes.
    // The background of the html element needs to be updated, otherwise you will see a big contrast when resizing the window or when the keyboard is open on iOS web.
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        updateGlobalBackgroundColor(theme);
    }, [isDisabled, theme]);

    if (isDisabled) {
        return null;
    }

    return <StatusBar />;
}

CustomStatusBarAndBackground.displayName = 'CustomStatusBarAndBackground';

export default CustomStatusBarAndBackground;

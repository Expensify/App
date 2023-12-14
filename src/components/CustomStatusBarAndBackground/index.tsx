import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
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
    const [statusBarStyle, setStatusBarStyle] = useState(theme.statusBarStyle);

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

    const listenerCount = useRef(0);
    const updateStatusBarStyle = useCallback(
        (listenerId?: number) => {
            // Check if this function is either called through the current navigation listener or the general useEffect which listens for theme changes.
            if (listenerId !== undefined && listenerId !== listenerCount.current) {
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
        },
        [statusBarStyle, theme.PAGE_THEMES, theme.appBG, theme.statusBarStyle],
    );

    // Add navigation state listeners to update the status bar every time the route changes
    // We have to pass a count as the listener id, because "react-navigation" somehow doesn't remove listeners properyl
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        const listenerId = ++listenerCount.current;
        const listener = () => updateStatusBarStyle(listenerId);

        navigationRef.addListener('state', listener);
        return () => navigationRef.removeListener('state', listener);
    }, [isDisabled, theme.appBG, updateStatusBarStyle]);

    // Update the status bar style everytime the theme changes
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        updateStatusBarStyle();
    }, [isDisabled, theme, updateStatusBarStyle]);

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

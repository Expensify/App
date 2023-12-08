import {EventListenerCallback, NavigationContainerEventMap} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect} from 'react';
import useTheme from '@hooks/useTheme';
import {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import CustomStatusBarContext from './CustomStatusBarContext';
import updateStatusBarAppearance from './updateStatusBarAppearance';

type CustomStatusBarProps = {
    /** Whether the CustomStatusBar is nested within another CustomStatusBar.
     *  A nested CustomStatusBar will disable the "root" CustomStatusBar. */
    isNested: boolean;
};

// eslint-disable-next-line react/function-component-definition
function CustomStatusBar({isNested = false}: CustomStatusBarProps) {
    const {isRootStatusBarDisabled, disableRootStatusBar} = useContext(CustomStatusBarContext);
    const theme = useTheme();

    const isDisabled = !isNested && isRootStatusBarDisabled;

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

    const updateStatusBarStyle = useCallback<EventListenerCallback<NavigationContainerEventMap, 'state'>>(() => {
        if (isDisabled) {
            return;
        }

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

        updateStatusBarAppearance({statusBarStyle: theme.statusBarStyle});
    }, [isDisabled, theme.statusBarStyle]);

    if (isDisabled) {
        return null;
    }

    return <StatusBar />;
}

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;

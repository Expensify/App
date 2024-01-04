import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {interpolateColor, runOnJS, useAnimatedReaction, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
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

    const prevStatusBarBackgroundColor = useRef(theme.appBG);
    const statusBarBackgroundColor = useRef(theme.appBG);
    const statusBarAnimation = useSharedValue(0);

    useAnimatedReaction(
        () => statusBarAnimation.value,
        (current, previous) => {
            // Do not run if either of the animated value is null
            // or previous animated value is greater than or equal to the current one
            if (previous === null || current === null || current <= previous) {
                return;
            }
            const backgroundColor = interpolateColor(statusBarAnimation.value, [0, 1], [prevStatusBarBackgroundColor.current, statusBarBackgroundColor.current]);
            runOnJS(updateStatusBarAppearance)({backgroundColor});
        },
    );

    const listenerCount = useRef(0);

    // Updates the status bar style and background color depending on the current route and theme
    // This callback is triggered everytime the route changes or the theme changes
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

            let newStatusBarStyle = theme.statusBarStyle;
            let currentScreenBackgroundColor = theme.appBG;
            if (currentRoute && 'name' in currentRoute && currentRoute.name in theme.PAGE_THEMES) {
                const pageTheme = theme.PAGE_THEMES[currentRoute.name];

                newStatusBarStyle = pageTheme.statusBarStyle;

                const backgroundColorFromRoute =
                    currentRoute?.params && 'backgroundColor' in currentRoute.params && typeof currentRoute.params.backgroundColor === 'string' && currentRoute.params.backgroundColor;

                // It's possible for backgroundColorFromRoute to be empty string, so we must use "||" to fallback to backgroundColorFallback.
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                currentScreenBackgroundColor = backgroundColorFromRoute || pageTheme.backgroundColor;
            }

            prevStatusBarBackgroundColor.current = statusBarBackgroundColor.current;
            statusBarBackgroundColor.current = currentScreenBackgroundColor;

            if (currentScreenBackgroundColor !== theme.appBG || prevStatusBarBackgroundColor.current !== theme.appBG) {
                statusBarAnimation.value = 0;
                statusBarAnimation.value = withDelay(300, withTiming(1));
            }

            // Don't update the status bar style if it's the same as the current one, to prevent flashing.
            if (newStatusBarStyle !== statusBarStyle) {
                updateStatusBarAppearance({statusBarStyle: newStatusBarStyle});
                setStatusBarStyle(newStatusBarStyle);
            }
        },
        [statusBarAnimation, statusBarStyle, theme.PAGE_THEMES, theme.appBG, theme.statusBarStyle],
    );

    // Add navigation state listeners to update the status bar every time the route changes
    // We have to pass a count as the listener id, because "react-navigation" somehow doesn't remove listeners properly
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        const listenerId = ++listenerCount.current;
        const listener = () => updateStatusBarStyle(listenerId);

        navigationRef.addListener('state', listener);
        return () => navigationRef.removeListener('state', listener);
    }, [isDisabled, theme.appBG, updateStatusBarStyle]);

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

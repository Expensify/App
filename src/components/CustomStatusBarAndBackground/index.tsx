import {isClosingReactNativeAppSelector} from '@selectors/HybridApp';
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {interpolateColor, useAnimatedReaction, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import type {StatusBarStyle} from '@styles/index';
import ONYXKEYS from '@src/ONYXKEYS';
import CustomStatusBarAndBackgroundContext from './CustomStatusBarAndBackgroundContext';
import updateGlobalBackgroundColor from './updateGlobalBackgroundColor';
import updateStatusBarAppearance from './updateStatusBarAppearance';

type CustomStatusBarAndBackgroundProps = {
    /** Whether the CustomStatusBar is nested within another CustomStatusBar.
     *  A nested CustomStatusBar will disable the "root" CustomStatusBar. */
    isNested?: boolean;
};

function CustomStatusBarAndBackground({isNested = false}: CustomStatusBarAndBackgroundProps) {
    const {isRootStatusBarEnabled, setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);
    const theme = useTheme();
    const [statusBarStyle, setStatusBarStyle] = useState<StatusBarStyle>();
    const [closingReactNativeApp = false] = useOnyx(ONYXKEYS.HYBRID_APP, {selector: isClosingReactNativeAppSelector, canBeMissing: true});

    // Include `closingReactNativeApp` to disable the StatusBar when switching from HybridApp to OldDot,
    // preventing unexpected status bar blinking during the transition
    const isDisabled = (!isNested && !isRootStatusBarEnabled) || closingReactNativeApp;

    // Disable the root status bar when a nested status bar is rendered
    useEffect(() => {
        if (isNested) {
            setRootStatusBarEnabled(false);
        }

        return () => {
            if (!isNested) {
                return;
            }
            setRootStatusBarEnabled(true);
        };
    }, [isNested, setRootStatusBarEnabled]);

    const didForceUpdateStatusBarRef = useRef(false);
    const prevIsRootStatusBarEnabled = usePrevious(isRootStatusBarEnabled);
    // The prev and current status bar background color refs are initialized with the splash screen background color so the status bar color is changed from the splash screen color to the expected color at least once on first render - https://github.com/Expensify/App/issues/34154
    const prevStatusBarBackgroundColor = useSharedValue(theme.splashBG);
    const statusBarBackgroundColor = useSharedValue(theme.splashBG);
    const statusBarAnimation = useSharedValue(0);

    useAnimatedReaction(
        () => statusBarAnimation.get(),
        (current, previous) => {
            // Do not run if either of the animated value is null
            // or previous animated value is greater than or equal to the current one
            if (previous === null || current === null || current <= previous) {
                return;
            }
            const backgroundColor = interpolateColor(statusBarAnimation.get(), [0, 1], [prevStatusBarBackgroundColor.get(), statusBarBackgroundColor.get()]);
            scheduleOnRN(updateStatusBarAppearance, {backgroundColor});
        },
    );

    const listenerCount = useRef(0);

    // Updates the status bar style and background color depending on the current route and theme
    // This callback is triggered every time the route changes or the theme changes
    const updateStatusBarStyle = useCallback(
        (listenerID?: number) => {
            // Check if this function is either called through the current navigation listener
            // react-navigation library has a bug internally, where it can't keep track of the listeners, therefore, sometimes when the useEffect would re-render and we run navigationRef.removeListener the listener isn't removed and we end up with two or more listeners.
            // https://github.com/Expensify/App/issues/34154#issuecomment-1898519399
            if (listenerID !== undefined && listenerID !== listenerCount.current) {
                return;
            }

            // Set the status bar color depending on the current route.
            // If we don't have any color defined for a route, fall back to
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
                    currentRoute?.params &&
                    typeof currentRoute?.params === 'object' &&
                    'backgroundColor' in currentRoute.params &&
                    typeof currentRoute.params.backgroundColor === 'string' &&
                    currentRoute.params.backgroundColor;

                // It's possible for backgroundColorFromRoute to be empty string, so we must use "||" to fallback to backgroundColorFallback.
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                currentScreenBackgroundColor = backgroundColorFromRoute || pageTheme.backgroundColor;
            }

            prevStatusBarBackgroundColor.set(statusBarBackgroundColor.get());
            statusBarBackgroundColor.set(currentScreenBackgroundColor);

            const callUpdateStatusBarAppearance = () => {
                updateStatusBarAppearance({statusBarStyle: newStatusBarStyle});
                setStatusBarStyle(newStatusBarStyle);
            };

            const callUpdateStatusBarBackgroundColor = () => {
                statusBarAnimation.set(0);
                statusBarAnimation.set(withDelay(300, withTiming(1)));
            };

            // Don't update the status bar style if it's the same as the current one, to prevent flashing.
            // Force update if the root status bar is back on active or it won't overwrite the nested status bar style
            if (!didForceUpdateStatusBarRef.current && !prevIsRootStatusBarEnabled && isRootStatusBarEnabled) {
                callUpdateStatusBarAppearance();
                callUpdateStatusBarBackgroundColor();

                if (!prevIsRootStatusBarEnabled && isRootStatusBarEnabled) {
                    didForceUpdateStatusBarRef.current = true;
                }
                return;
            }

            if (newStatusBarStyle !== statusBarStyle) {
                callUpdateStatusBarAppearance();
            }

            if (currentScreenBackgroundColor !== theme.appBG || prevStatusBarBackgroundColor.get() !== theme.appBG) {
                callUpdateStatusBarBackgroundColor();
            }
        },
        [
            theme.statusBarStyle,
            theme.appBG,
            theme.PAGE_THEMES,
            prevStatusBarBackgroundColor,
            statusBarBackgroundColor,
            prevIsRootStatusBarEnabled,
            isRootStatusBarEnabled,
            statusBarStyle,
            statusBarAnimation,
        ],
    );

    useEffect(() => {
        didForceUpdateStatusBarRef.current = false;
    }, [isRootStatusBarEnabled]);

    useEffect(() => {
        if (isDisabled) {
            return;
        }

        // Update status bar when theme changes
        updateStatusBarStyle();

        // Add navigation state listeners to update the status bar every time the route changes
        // We have to pass a count as the listener id, because "react-navigation" somehow doesn't remove listeners properly
        const listenerID = ++listenerCount.current;
        const listener = () => updateStatusBarStyle(listenerID);

        navigationRef.addListener('state', listener);
        return () => navigationRef.removeListener('state', listener);
    }, [isDisabled, updateStatusBarStyle]);

    // Update the global background and status bar style (on web) every time the theme changes.
    // The background of the html element needs to be updated, otherwise you will see a big contrast when resizing the window or when the keyboard is open on iOS web.
    // The status bar style needs to be updated when the user changes the theme, otherwise, the status bar will not change its color (mWeb iOS).
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        updateGlobalBackgroundColor(theme);
        updateStatusBarStyle();
    }, [isDisabled, theme, updateStatusBarStyle]);

    if (isDisabled) {
        return null;
    }

    return <StatusBar />;
}

export default CustomStatusBarAndBackground;

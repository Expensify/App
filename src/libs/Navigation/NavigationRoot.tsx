import {DefaultTheme, getPathFromState, NavigationContainer, NavigationState} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {ColorValue} from 'react-native';
import {interpolateColor, runOnJS, useAnimatedReaction, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useFlipper from '@hooks/useFlipper';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import StatusBar from '@libs/StatusBar';
import themeColors from '@styles/themes/default';
import AppNavigator from './AppNavigator';
import linkingConfig from './linkingConfig';
import Navigation, {navigationRef} from './Navigation';

// https://reactnavigation.org/docs/themes
const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: themeColors.appBG,
    },
};

type NavigationRootProps = {
    /** Whether the current user is logged in with an authToken */
    authenticated: boolean;

    /** Fired when react-navigation is ready */
    onReady: () => void;
};

/**
 * Intercept navigation state changes and log it
 */
function parseAndLogRoute(state: NavigationState) {
    if (!state) {
        return;
    }

    const currentPath = getPathFromState(state, linkingConfig.config);

    // Don't log the route transitions from OldDot because they contain authTokens
    if (currentPath.includes('/transition')) {
        Log.info('Navigating from transition link from OldDot using short lived authToken');
    } else {
        Log.info('Navigating to route', false, {path: currentPath});
    }

    Navigation.setIsNavigationReady();
}

function NavigationRoot({authenticated, onReady}: NavigationRootProps) {
    useFlipper(navigationRef);
    const firstRenderRef = useRef(true);

    const currentReportIDValue = useCurrentReportID();
    const {isSmallScreenWidth} = useWindowDimensions();

    useEffect(() => {
        if (firstRenderRef.current) {
            // we don't want to make the report back button go back to LHN if the user
            // started on the small screen so we don't set it on the first render
            // making it only work on consecutive changes of the screen size
            firstRenderRef.current = false;
            return;
        }
        if (!isSmallScreenWidth) {
            return;
        }
        Navigation.setShouldPopAllStateOnUP();
    }, [isSmallScreenWidth]);

    useEffect(() => {
        if (!navigationRef.isReady() || !authenticated) {
            return;
        }
        // We need to force state rehydration so the CustomRouter can add the CentralPaneNavigator route if necessary.
        navigationRef.resetRoot(navigationRef.getRootState());
    }, [isSmallScreenWidth, authenticated]);

    const prevStatusBarBackgroundColor = useRef(themeColors.appBG);
    const statusBarBackgroundColor = useRef(themeColors.appBG);
    const statusBarAnimation = useSharedValue(0);

    const updateStatusBarBackgroundColor = (color: ColorValue) => StatusBar.setBackgroundColor(color);
    useAnimatedReaction(
        () => statusBarAnimation.value,
        (current, previous) => {
            // Do not run if either of the animated value is null
            // or previous animated value is greater than or equal to the current one
            if (previous === null || current === null || current <= previous) {
                return;
            }
            const color = interpolateColor(statusBarAnimation.value, [0, 1], [prevStatusBarBackgroundColor.current, statusBarBackgroundColor.current]);
            runOnJS(updateStatusBarBackgroundColor)(color);
        },
    );

    const animateStatusBarBackgroundColor = () => {
        const currentRoute = navigationRef.getCurrentRoute();

        const backgroundColorFromRoute =
            currentRoute?.params && 'backgroundColor' in currentRoute.params && typeof currentRoute.params.backgroundColor === 'string' && currentRoute.params.backgroundColor;
        const backgroundColorFallback = themeColors.PAGE_BACKGROUND_COLORS[currentRoute?.name as keyof typeof themeColors.PAGE_BACKGROUND_COLORS] || themeColors.appBG;

        // It's possible for backgroundColorFromRoute to be empty string, so we must use "||" to fallback to backgroundColorFallback.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const currentScreenBackgroundColor = backgroundColorFromRoute || backgroundColorFallback;

        prevStatusBarBackgroundColor.current = statusBarBackgroundColor.current;
        statusBarBackgroundColor.current = currentScreenBackgroundColor;

        if (currentScreenBackgroundColor === themeColors.appBG && prevStatusBarBackgroundColor.current === themeColors.appBG) {
            return;
        }

        statusBarAnimation.value = 0;
        statusBarAnimation.value = withDelay(300, withTiming(1));
    };

    const handleStateChange = (state: NavigationState | undefined) => {
        if (!state) {
            return;
        }

        // Performance optimization to avoid context consumers to delay first render
        setTimeout(() => {
            currentReportIDValue?.updateCurrentReportID(state);
        }, 0);
        parseAndLogRoute(state);
        animateStatusBarBackgroundColor();
    };

    return (
        <NavigationContainer
            onStateChange={handleStateChange}
            onReady={onReady}
            theme={navigationTheme}
            ref={navigationRef}
            linking={linkingConfig}
            documentTitle={{
                enabled: false,
            }}
        >
            <AppNavigator authenticated={authenticated} />
        </NavigationContainer>
    );
}

NavigationRoot.displayName = 'NavigationRoot';

export default NavigationRoot;

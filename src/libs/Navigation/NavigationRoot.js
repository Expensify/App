import {DefaultTheme, getPathFromState, NavigationContainer} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {Easing, interpolateColor, runOnJS, useAnimatedReaction, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useFlipper from '@hooks/useFlipper';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import StatusBar from '@libs/StatusBar';
import {SidebarNavigationContext} from '@pages/home/sidebar/SidebarNavigationContext';
import useTheme from '@styles/themes/useTheme';
import AppNavigator from './AppNavigator';
import linkingConfig from './linkingConfig';
import Navigation, {navigationRef} from './Navigation';

const propTypes = {
    /** Whether the current user is logged in with an authToken */
    authenticated: PropTypes.bool.isRequired,

    /** Fired when react-navigation is ready */
    onReady: PropTypes.func.isRequired,
};

/**
 * Intercept navigation state changes and log it
 * @param {NavigationState} state
 */
function parseAndLogRoute(state) {
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

function NavigationRoot(props) {
    const theme = useTheme();

    // https://reactnavigation.org/docs/themes
    const navigationTheme = useMemo(
        () => ({
            ...DefaultTheme,
            colors: {
                ...DefaultTheme.colors,
                background: theme.appBG,
            },
        }),
        [theme.appBG],
    );

    useFlipper(navigationRef);
    const firstRenderRef = useRef(true);
    const globalNavigation = useContext(SidebarNavigationContext);

    const {updateCurrentReportID} = useCurrentReportID();
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
        if (!navigationRef.isReady() || !props.authenticated) {
            return;
        }
        // We need to force state rehydration so the CustomRouter can add the CentralPaneNavigator route if necessary.
        navigationRef.resetRoot(navigationRef.getRootState());
    }, [isSmallScreenWidth, props.authenticated]);

    const prevStatusBarBackgroundColor = useRef(theme.appBG);
    const statusBarBackgroundColor = useRef(theme.appBG);
    const statusBarAnimation = useSharedValue(0);

    const updateStatusBarBackgroundColor = useCallback((color) => StatusBar.setBackgroundColor(color), []);
    useAnimatedReaction(
        () => statusBarAnimation.value,
        (current, previous) => {
            // Do not run if either of the animated value is null
            // or previous animated value is greater than or equal to the current one
            if ([current, previous].includes(null) || current <= previous) {
                return;
            }
            const color = interpolateColor(statusBarAnimation.value, [0, 1], [prevStatusBarBackgroundColor.current, statusBarBackgroundColor.current]);
            runOnJS(updateStatusBarBackgroundColor)(color);
        },
    );

    const animateStatusBarBackgroundColor = useCallback(() => {
        const currentRoute = navigationRef.getCurrentRoute();
        const currentScreenBackgroundColor = (currentRoute.params && currentRoute.params.backgroundColor) || theme.PAGE_BACKGROUND_COLORS[currentRoute.name] || theme.appBG;

        prevStatusBarBackgroundColor.current = statusBarBackgroundColor.current;
        statusBarBackgroundColor.current = currentScreenBackgroundColor;

        if (currentScreenBackgroundColor === theme.appBG && prevStatusBarBackgroundColor.current === theme.appBG) {
            return;
        }

        statusBarAnimation.value = 0;
        statusBarAnimation.value = withDelay(
            300,
            withTiming(1, {
                duration: 300,
                easing: Easing.in,
            }),
        );
    }, [statusBarAnimation, theme.PAGE_BACKGROUND_COLORS, theme.appBG]);

    const handleStateChange = useCallback(
        (state) => {
            if (!state) {
                return;
            }
            // Performance optimization to avoid context consumers to delay first render
            setTimeout(() => {
                updateCurrentReportID(state);
            }, 0);
            parseAndLogRoute(state);
            animateStatusBarBackgroundColor();

            // Update the global navigation to show the correct selected menu items.
            globalNavigation.updateFromNavigationState(state);
        },
        [animateStatusBarBackgroundColor, globalNavigation, updateCurrentReportID],
    );

    return (
        <NavigationContainer
            onStateChange={handleStateChange}
            onReady={props.onReady}
            theme={navigationTheme}
            ref={navigationRef}
            linking={linkingConfig}
            documentTitle={{
                enabled: false,
            }}
        >
            <AppNavigator authenticated={props.authenticated} />
        </NavigationContainer>
    );
}

NavigationRoot.displayName = 'NavigationRoot';
NavigationRoot.propTypes = propTypes;
export default NavigationRoot;

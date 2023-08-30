import React, {useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import {NavigationContainer, DefaultTheme, getPathFromState} from '@react-navigation/native';
import {useFlipper} from '@react-navigation/devtools';
import {useSharedValue, useAnimatedReaction, interpolateColor, withTiming, withDelay, Easing, runOnJS} from 'react-native-reanimated';
import Navigation, {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import themeColors from '../../styles/themes/default';
import Log from '../Log';
import StatusBar from '../StatusBar';
import useCurrentReportID from '../../hooks/useCurrentReportID';
import useWindowDimensions from '../../hooks/useWindowDimensions';

// https://reactnavigation.org/docs/themes
const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: themeColors.appBG,
    },
};

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
    useFlipper(navigationRef);
    const navigationStateRef = useRef(undefined);
    const firstRenderRef = useRef(true);

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

    const prevStatusBarBackgroundColor = useRef(themeColors.appBG);
    const statusBarBackgroundColor = useRef(themeColors.appBG);
    const statusBarAnimation = useSharedValue(0);

    const updateStatusBarBackgroundColor = (color) => StatusBar.setBackgroundColor(color);
    useAnimatedReaction(
        () => statusBarAnimation.value,
        () => {
            const color = interpolateColor(statusBarAnimation.value, [0, 1], [prevStatusBarBackgroundColor.current, statusBarBackgroundColor.current]);
            runOnJS(updateStatusBarBackgroundColor)(color);
        },
    );

    const animateStatusBarBackgroundColor = () => {
        const currentRoute = navigationRef.getCurrentRoute();
        const currentScreenBackgroundColor = themeColors.PAGE_BACKGROUND_COLORS[currentRoute.name] || themeColors.appBG;

        prevStatusBarBackgroundColor.current = statusBarBackgroundColor.current;
        statusBarBackgroundColor.current = currentScreenBackgroundColor;
        if (prevStatusBarBackgroundColor.current === statusBarBackgroundColor.current) {
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
    };

    const updateSavedNavigationStateAndLogRoute = (state) => {
        if (!state) {
            return;
        }
        navigationStateRef.current = state;
        updateCurrentReportID(state);
        parseAndLogRoute(state);
        animateStatusBarBackgroundColor();
    };

    return (
        <NavigationContainer
            key={isSmallScreenWidth ? 'small' : 'big'}
            onStateChange={updateSavedNavigationStateAndLogRoute}
            initialState={navigationStateRef.current}
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

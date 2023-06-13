import React, {useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import {NavigationContainer, DefaultTheme, getPathFromState} from '@react-navigation/native';
import {useFlipper} from '@react-navigation/devtools';
import {Animated, Easing} from 'react-native';
import Navigation, {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import themeColors from '../../styles/themes/default';
import Log from '../Log';
import withCurrentReportId, {withCurrentReportIdPropTypes} from '../../components/withCurrentReportId';
import StatusBar from '../StatusBar';
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

    ...withCurrentReportIdPropTypes,
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

const NavigationRoot = (props) => {
    const {isSmallScreenWidth} = useWindowDimensions();
    useFlipper(navigationRef);
    const navigationStateRef = useRef(undefined);

    const prevStatusBarBackgroundColor = useRef(themeColors.appBG);
    const statusBarBackgroundColor = useRef(themeColors.appBG);
    const statusBarAnimation = useRef(new Animated.Value(0));

    useEffect(() => {
        const animation = statusBarAnimation.current;
        animation.addListener(() => {
            const colorObj = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [prevStatusBarBackgroundColor.current, statusBarBackgroundColor.current],
            });
            // eslint-disable-next-line no-underscore-dangle
            StatusBar.setBackgroundColor(colorObj.__getValue());
        });
        return () => animation.removeAllListeners();
    }, []);

    const animateStatusBarBackgroundColor = () => {
        const currentRoute = navigationRef.getCurrentRoute();
        const currentScreenBackgroundColor = themeColors.PAGE_BACKGROUND_COLORS[currentRoute.name] || themeColors.appBG;

        prevStatusBarBackgroundColor.current = statusBarBackgroundColor.current;
        statusBarBackgroundColor.current = currentScreenBackgroundColor;
        if (prevStatusBarBackgroundColor.current === statusBarBackgroundColor.current) {
            return;
        }

        statusBarAnimation.current.setValue(0);
        Animated.timing(statusBarAnimation.current, {
            toValue: 1,
            duration: 300,
            delay: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const updateSavedNavigationStateAndLogRoute = (state) => {
        navigationStateRef.current = state;
        props.updateCurrentReportId(state);
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
};

NavigationRoot.displayName = 'NavigationRoot';
NavigationRoot.propTypes = propTypes;
export default withCurrentReportId(NavigationRoot);

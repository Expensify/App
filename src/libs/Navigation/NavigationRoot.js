import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {NavigationContainer, DefaultTheme, getPathFromState} from '@react-navigation/native';
import {useFlipper} from '@react-navigation/devtools';
import Reanimated, {useAnimatedStyle} from 'react-native-reanimated';
import ThemeContext from '../../styles/themes/ThemeContext';
import Navigation, {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import styles from '../../styles/styles';
import Log from '../Log';

// https://reactnavigation.org/docs/themes
const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,

        // background: themeColors.appBG,
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

const NavigationRoot = (props) => {
    useFlipper(navigationRef);

    const themeContext = useContext(ThemeContext);

    if (themeContext == null) { throw new Error('You forgot to wrap this component with <ThemeContext.Provider />'); }

    const animatedBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: themeContext.appBG.value,
    }));

    return (
        <NavigationContainer
            fallback={(
                <FullScreenLoadingIndicator
                    style={styles.navigatorFullScreenLoading}
                />
            )}
            onStateChange={parseAndLogRoute}
            onReady={props.onReady}
            theme={navigationTheme}
            ref={navigationRef}
            linking={linkingConfig}
            documentTitle={{
                enabled: false,
            }}
        >
            <Reanimated.View style={animatedBackgroundStyle}>
                <AppNavigator authenticated={props.authenticated} />
            </Reanimated.View>
        </NavigationContainer>
    );
};

NavigationRoot.displayName = 'NavigationRoot';
NavigationRoot.propTypes = propTypes;
export default NavigationRoot;

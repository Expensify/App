import React from 'react';
import PropTypes from 'prop-types';
import {NavigationContainer, DefaultTheme, getPathFromState} from '@react-navigation/native';
import {useFlipper} from '@react-navigation/devtools';
import Navigation, {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import UnreadIndicatorUpdater from '../UnreadIndicatorUpdater';
import Log from '../Log';

// https://reactnavigation.org/docs/themes
const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: themeColors.highlightBG,
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

    UnreadIndicatorUpdater.throttledUpdatePageTitleAndUnreadCount();
    Navigation.setIsNavigationReady();
}

const NavigationRoot = (props) => {
    useFlipper(navigationRef);
    return (
        <NavigationContainer
            fallback={(
                <FullScreenLoadingIndicator
                    logDetail={{name: 'Navigation Fallback Loader', authenticated: props.authenticated}}
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
            <AppNavigator authenticated={props.authenticated} />
        </NavigationContainer>
    );
};

NavigationRoot.displayName = 'NavigationRoot';
NavigationRoot.propTypes = propTypes;
export default NavigationRoot;

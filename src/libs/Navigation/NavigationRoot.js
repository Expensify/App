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
import DomUtils from '../DomUtils';
import Log from '../Log';

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
        console.trace();
        Log.info('Navigating to route', false, {path: currentPath});
    }

    // Clicking a button that does navigation will stay active even if it's out of view
    // and it's tooltip will stay visible.
    // We blur the element manually to fix that (especially for Safari).
    // More info: https://github.com/Expensify/App/issues/13146
    DomUtils.blurActiveElement();

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

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NavigationContainer, DefaultTheme, getPathFromState} from '@react-navigation/native';
import Navigation, {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import UnreadIndicatorUpdater from '../UnreadIndicatorUpdater';
import Log from '../Log';

// https://reactnavigation.org/docs/themes
const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: colors.gray1,
    },
};

const propTypes = {
    /** Whether the current user is logged in with an authToken */
    authenticated: PropTypes.bool.isRequired,

    /** Fired when react-navigation is ready */
    onReady: PropTypes.func.isRequired,
};

class NavigationRoot extends Component {
    /**
     * Intercept navigation state changes and log it
     * @param {NavigationState} state
     */
    parseAndLogRoute(state) {
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

    render() {
        return (
            <NavigationContainer
                fallback={(
                    <FullScreenLoadingIndicator
                        logDetail={{name: 'Navigation Fallback Loader', authenticated: this.props.authenticated}}
                        style={styles.navigatorFullScreenLoading}
                    />
                )}
                onStateChange={this.parseAndLogRoute}
                onReady={this.props.onReady}
                theme={navigationTheme}
                ref={navigationRef}
                linking={linkingConfig}
                documentTitle={{
                    enabled: false,
                }}
            >
                <AppNavigator authenticated={this.props.authenticated} />
            </NavigationContainer>
        );
    }
}

NavigationRoot.propTypes = propTypes;
export default NavigationRoot;

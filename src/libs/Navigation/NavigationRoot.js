import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import * as Navigation from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import colors from '../../styles/colors';
import styles from '../../styles/styles';

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
    render() {
        return (
            <NavigationContainer
                fallback={(
                    <FullScreenLoadingIndicator
                        logDetail={{name: 'Navigation Fallback Loader', authenticated: this.props.authenticated}}
                        style={styles.navigatorFullScreenLoading}
                    />
                )}
                onStateChange={this.parseAndStoreRoute}
                onReady={this.props.onReady}
                theme={navigationTheme}
                ref={Navigation.navigationRef}
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

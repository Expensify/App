import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getPathFromState, NavigationContainer} from '@react-navigation/native';
import Navigation, {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import {setCurrentURL} from '../actions/App';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import Log from '../Log';

const propTypes = {
    /** Whether the current user is logged in with an authToken */
    authenticated: PropTypes.bool.isRequired,
};

class NavigationRoot extends Component {
    constructor(props) {
        super(props);

        this.parseAndStoreRoute = this.parseAndStoreRoute.bind(this);
    }

    /**
     * Intercept state changes and perform different logic
     * @param {NavigationState} state
     */
    parseAndStoreRoute(state) {
        if (!state) {
            return;
        }

        const path = getPathFromState(state, linkingConfig.config);
        Log.info('Navigating to route', false, {path});
        setCurrentURL(path);
    }

    render() {
        return (
            <NavigationContainer
                fallback={<FullScreenLoadingIndicator visible />}
                onReady={Navigation.goToInitialRoute}
                onStateChange={this.parseAndStoreRoute}
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

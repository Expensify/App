import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {NavigationContainer, DefaultTheme, getPathFromState} from '@react-navigation/native';
import {useFlipper} from '@react-navigation/devtools';
import Navigation, {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import themeColors from '../../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import Log from '../Log';
import withCurrentReportId, {withCurrentReportIdPropTypes} from '../../components/withCurrentReportId';
import compose from '../compose';

// https://reactnavigation.org/docs/themes
const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: themeColors.appBG,
    },
};

const propTypes = {
    ...windowDimensionsPropTypes,

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

function NavigationRoot(props) {
    useFlipper(navigationRef);
    const navigationStateRef = useRef(undefined);

    const updateSavedNavigationStateAndLogRoute = (state) => {
        if (!state) {
            return;
        }
        navigationStateRef.current = state;
        props.updateCurrentReportId(state);
        parseAndLogRoute(state);
    };

    return (
        <NavigationContainer
            key={props.isSmallScreenWidth ? 'small' : 'big'}
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
export default compose(withWindowDimensions, withCurrentReportId)(NavigationRoot);

import PropTypes from 'prop-types';
import React, {useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import InitialUrlContext from '@src/InitialUrlContext';

const propTypes = {
    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,
};

function AppNavigator(props) {
    const initUrl = useContext(InitialUrlContext);

    useEffect(() => {
        if (!NativeModules.ReactNativeModule) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(initUrl);
        });
    }, [initUrl]);

    if (props.authenticated) {
        const AuthScreens = require('./AuthScreens').default;

        // These are the protected screens and only accessible when an authToken is present
        return <AuthScreens />;
    }
    const PublicScreens = require('./PublicScreens').default;
    return <PublicScreens />;
}

AppNavigator.propTypes = propTypes;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;

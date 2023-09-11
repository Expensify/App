import React from 'react';
import PropTypes from 'prop-types';
import {useFocusEffect} from '@react-navigation/native';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** The exact route name used to get to this screen */
        name: PropTypes.string.isRequired,
    }).isRequired,
};

/*
 * This is a "utility page", that used to call specific actions depending on the
 * route that led the user here. Now, it's just used to route the user home so we
 * don't show them a "Hmm... It's not here" message (which looks broken).
 */
function DemoSetupPage() {
    useFocusEffect(() => {
        Navigation.isNavigationReady().then(() => {
            Navigation.goBack(ROUTES.HOME);
        });
    });

    return <FullScreenLoadingIndicator />;
}

DemoSetupPage.propTypes = propTypes;
DemoSetupPage.displayName = 'DemoSetupPage';

export default DemoSetupPage;

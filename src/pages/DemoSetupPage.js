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
 * This is a "utility page", that does this:
 *     - Looks at the current route
 *     - Determines if there's a demo command we need to call
 *     - If not, routes back to home
 */
function DemoSetupPage(props) {
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

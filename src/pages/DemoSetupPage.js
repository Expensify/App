import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {useFocusEffect} from '@react-navigation/native';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import CONST from '../CONST';
import * as DemoActions from '../libs/actions/DemoActions';

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
function DemoSetupPage(props) {
    useFocusEffect(
        useCallback(() => {
            if (props.route.name === CONST.DEMO_PAGES.MONEY2020) {
                DemoActions.runMoney2020Demo();
            } else {
                Navigation.goBack(ROUTES.HOME);
            }
        }, [props.route.name]),
    );

    return <FullScreenLoadingIndicator />;
}

DemoSetupPage.propTypes = propTypes;
DemoSetupPage.displayName = 'DemoSetupPage';

export default DemoSetupPage;

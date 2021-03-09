import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from '../../libs/Router';
import InitialPage from './InitialPage';
import ProfilePage from './ProfilePage';
import PreferencesPage from './PreferencesPage';
import PasswordPage from './PasswordPage';
import PaymentsPage from './PaymentsPage';
import ROUTES from '../../ROUTES';

const propTypes = {
    match: PropTypes.shape({
        // Current Url
        url: PropTypes.string,
    }).isRequired,
};

const subsettings = {
    default: {
        title: 'Settings',
        Component: InitialPage,
    },
    [ROUTES.SETTINGS_PROFILE]: {
        title: 'Profile',
        Component: ProfilePage,
    },
    [ROUTES.SETTINGS_PREFERENCES]: {
        title: 'Preferences',
        Component: PreferencesPage,
    },
    [ROUTES.SETTINGS_PASSWORD]: {
        title: 'Change Password',
        Component: PasswordPage,
    },
    [ROUTES.SETTINGS_PAYMENTS]: {
        title: 'Payments',
        Component: PaymentsPage,
    },
};

const SettingsPage = (props) => {
    const route = props.match.url;
    let {Component} = subsettings.default;

    if (subsettings[route]) {
        Component = subsettings[route].Component;
    }

    return <Component />;
};

SettingsPage.propTypes = propTypes;
SettingsPage.displayName = 'SettingsPage';

export default withRouter(SettingsPage);

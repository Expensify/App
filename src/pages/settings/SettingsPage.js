import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from '../../libs/Router';
import InitialPage from './InitialPage';
import ProfilePage from './ProfilePage';
import PreferencesPage from './PreferencesPage';
import PasswordPage from './PasswordPage';
import PaymentsPage from './PaymentsPage';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            // route passed via route /settings/:route
            route: PropTypes.string,
        }),
    }).isRequired,
};

const subsettings = {
    default: {
        title: 'Settings',
        Component: InitialPage,
    },
    profile: {
        title: 'Profile',
        Component: ProfilePage,
    },
    preferences: {
        title: 'Preferences',
        Component: PreferencesPage,
    },
    password: {
        title: 'Change Password',
        Component: PasswordPage,
    },
    payments: {
        title: 'Payments',
        Component: PaymentsPage,
    },
};

const SettingsPage = (props) => {
    const route = props.match.params.route;
    let {Component} = subsettings.default;

    if (subsettings[route]) {
        Component = subsettings[route].Component;
    }

    return <Component />;
};

SettingsPage.propTypes = propTypes;
SettingsPage.displayName = 'SettingsPage';

export default withRouter(SettingsPage);

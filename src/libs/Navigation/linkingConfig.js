import ROUTES from '../../ROUTES';

export default {
    prefixes: ['expensify-cash://', 'https://expensify.cash', 'https://www.expensify.cash', 'http://localhost'],
    config: {
        screens: {
            Home: {
                path: '',
                initialRouteName: 'Report',
                screens: {
                    // Report route
                    Report: ROUTES.REPORT_WITH_ID,
                },
            },

            // Public Routes
            SignIn: ROUTES.SIGNIN,
            SetPassword: ROUTES.SET_PASSWORD_WITH_VALIDATE_CODE,

            // Modal Screens
            Settings: {
                path: ROUTES.SETTINGS,
                initialRouteName: 'Settings_Root',
                screens: {
                    Settings_Root: {
                        path: '',
                    },
                    Settings_Preferences: {
                        path: ROUTES.SETTINGS_PREFERENCES,
                        exact: true,
                    },
                    Settings_Password: {
                        path: ROUTES.SETTINGS_PASSWORD,
                        exact: true,
                    },
                    Settings_Payments: {
                        path: ROUTES.SETTINGS_PAYMENTS,
                        exact: true,
                    },
                    Settings_Profile: {
                        path: ROUTES.SETTINGS_PROFILE,
                        exact: true,
                    },
                },
            },
            NewGroup: {
                path: ROUTES.NEW_GROUP,
                initialRouteName: 'NewGroup_Root',
                screens: {
                    NewGroup_Root: '',
                },
            },
            NewChat: {
                path: ROUTES.NEW_CHAT,
                initialRouteName: 'NewChat_Root',
                screens: {
                    NewChat_Root: '',
                },
            },
            Search: {
                path: ROUTES.SEARCH,
                initialRouteName: 'Search_Root',
                screens: {
                    Search_Root: '',
                },
            },
            Details: {
                initialRouteName: 'Details_Root',
                screens: {
                    Details_Root: ROUTES.DETAILS_WITH_LOGIN,
                },
            },
            IOU_Request: {
                path: ROUTES.IOU_REQUEST,
                initialRouteName: 'IOU_Request_Root',
                screens: {
                    IOU_Request_Root: '',
                },
            },
            IOU_Bill: {
                path: ROUTES.IOU_BILL,
                initialRouteName: 'IOU_Bill_Root',
                screens: {
                    IOU_Bill_Root: '',
                },
            },
        },
    },
};

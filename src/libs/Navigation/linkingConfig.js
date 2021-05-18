import ROUTES from '../../ROUTES';
import SCREENS from '../../SCREENS';

export default {
    prefixes: [
        'expensify-cash://',
        'https://expensify.cash',
        'https://www.expensify.cash',
        'https://staging.expensify.cash',
        'http://localhost',
    ],
    config: {
        initialRouteName: SCREENS.HOME,
        screens: {
            [SCREENS.HOME]: {
                path: ROUTES.HOME,
                initialRouteName: SCREENS.REPORT,
                screens: {
                    // Report route
                    [SCREENS.REPORT]: ROUTES.REPORT_WITH_ID,
                    [SCREENS.LOADING]: ROUTES.REPORT,
                },
            },

            // Public Routes
            SetPassword: ROUTES.SET_PASSWORD_WITH_VALIDATE_CODE,
            ValidateLogin: ROUTES.VALIDATE_LOGIN_WITH_VALIDATE_CODE,

            // Modal Screens
            Settings: {
                screens: {
                    Settings_Root: {
                        path: ROUTES.SETTINGS,
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
                    Settings_Add_Secondary_Login: {
                        path: ROUTES.SETTINGS_ADD_LOGIN,
                    },
                },
            },
            NewGroup: {
                screens: {
                    NewGroup_Root: ROUTES.NEW_GROUP,
                },
            },
            NewChat: {
                screens: {
                    NewChat_Root: ROUTES.NEW_CHAT,
                },
            },
            Search: {
                screens: {
                    Search_Root: ROUTES.SEARCH,
                },
            },
            Details: {
                screens: {
                    Details_Root: ROUTES.DETAILS_WITH_LOGIN,
                },
            },
            Participants: {
                screens: {
                    ReportParticipants_Root: ROUTES.REPORT_PARTICIPANTS,
                    ReportParticipants_Details: ROUTES.REPORT_PARTICIPANT,
                },
            },
            IOU_Request: {
                screens: {
                    IOU_Request_Root: ROUTES.IOU_REQUEST,
                },
            },
            IOU_Bill: {
                screens: {
                    IOU_Bill_Root: ROUTES.IOU_BILL,
                },
            },
            AddBankAccount: {
                screens: {
                    AddBankAccount_Root: ROUTES.ADD_BANK_ACCOUNT,
                },
            },
        },
    },
};

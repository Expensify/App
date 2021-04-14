import {getStateFromPath} from '@react-navigation/native';
import ROUTES from '../../ROUTES';
import {addLeadingForwardSlash} from '../Url';

export default {
    prefixes: [
        'expensify-cash://',
        'https://expensify.cash',
        'https://www.expensify.cash',
        'https://staging.expensify.cash',
        'http://localhost',
    ],
    getStateFromPath: (path, options) => {
        const state = getStateFromPath(path, options);

        // If we land on a deep link that is not the Home or Report route we will must push a Home route to the bottom
        // of the stack so that we don't end up with a white background and nowhere to navigate back from.
        if (path !== addLeadingForwardSlash(ROUTES.HOME)
            && !path.startsWith(addLeadingForwardSlash(ROUTES.REPORT))
        ) {
            state.routes.unshift({name: 'Home', params: undefined});
            return state;
        }

        return state;
    },
    config: {
        screens: {
            Home: {
                path: ROUTES.HOME,
                initialRouteName: 'Report',
                screens: {
                    // Report route
                    Report: ROUTES.REPORT_WITH_ID,
                },
            },

            // Public Routes
            SignIn: ROUTES.SIGNIN,
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
                    Settings_Add_Seconday_Login: {
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
        },
    },
};

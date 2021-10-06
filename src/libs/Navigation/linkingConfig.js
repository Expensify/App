import ROUTES from '../../ROUTES';
import SCREENS from '../../SCREENS';
import CONST from '../../CONST';

export default {
    prefixes: [
        'new-expensify://',
        'expensify-cash://', // DEPRECATED
        'https://www.expensify.cash',
        'https://staging.expensify.cash',
        'http://localhost',
        CONST.NEW_EXPENSIFY_URL,
        CONST.STAGING_NEW_EXPENSIFY_URL,
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

            // Main Routes
            SetPassword: ROUTES.SET_PASSWORD_WITH_VALIDATE_CODE,
            ValidateLogin: ROUTES.VALIDATE_LOGIN_WITH_VALIDATE_CODE,
            [SCREENS.LOGIN_WITH_VALIDATE_CODE_NEW_WORKSPACE]: ROUTES.LOGIN_WITH_VALIDATE_CODE_NEW_WORKSPACE,
            [SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_NEW_WORKSPACE]: ROUTES.LOGIN_WITH_VALIDATE_CODE_2FA_NEW_WORKSPACE,
            [SCREENS.LOGIN_WITH_VALIDATE_CODE_WORKSPACE_CARD]: ROUTES.LOGIN_WITH_VALIDATE_CODE_WORKSPACE_CARD,
            [SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_WORKSPACE_CARD]: ROUTES.LOGIN_WITH_VALIDATE_CODE_2FA_WORKSPACE_CARD,
            [SCREENS.LOG_IN_WITH_SHORT_LIVED_TOKEN]: ROUTES.LOGIN_WITH_SHORT_LIVED_TOKEN,
            WorkspaceNew: ROUTES.WORKSPACE_NEW,

            // Modal Screens
            Workspace: {
                screens: {
                    Workspace_Initial: {
                        path: ROUTES.WORKSPACE_INITIAL,
                        exact: true,
                    },
                    Workspace_Settings: {
                        path: ROUTES.WORKSPACE_SETTINGS,
                        exact: true,
                    },
                    Workspace_Card: {
                        path: ROUTES.WORKSPACE_CARD,
                        exact: true,
                    },
                    Workspace_Reimburse: {
                        path: ROUTES.WORKSPACE_REIMBURSE,
                        exact: true,
                    },
                    Workspace_Bills: {
                        path: ROUTES.WORKSPACE_BILLS,
                        exact: true,
                    },
                    Workspace_Invoices: {
                        path: ROUTES.WORKSPACE_INVOICES,
                        exact: true,
                    },
                    Workspace_Travel: {
                        path: ROUTES.WORKSPACE_TRAVEL,
                        exact: true,
                    },
                    Workspace_Members: {
                        path: ROUTES.WORKSPACE_MEMBERS,
                        exact: true,
                    },
                    Workspace_BankAccount: {
                        path: ROUTES.BANK_ACCOUNT,
                        exact: true,
                    },
                },
            },
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
                    Settings_Add_Paypal_Me: {
                        path: ROUTES.SETTINGS_ADD_PAYPAL_ME,
                        exact: true,
                    },
                    Settings_Add_Debit_Card: {
                        path: ROUTES.SETTINGS_ADD_DEBIT_CARD,
                        exact: true,
                    },
                    Settings_Profile: {
                        path: ROUTES.SETTINGS_PROFILE,
                        exact: true,
                    },
                    Settings_About: {
                        path: ROUTES.SETTINGS_ABOUT,
                        exact: true,
                    },
                    Settings_App_Download_Links: {
                        path: ROUTES.SETTINGS_APP_DOWNLOAD_LINKS,
                        exact: true,
                    },
                    Settings_Add_Secondary_Login: {
                        path: ROUTES.SETTINGS_ADD_LOGIN,
                    },
                },
            },
            Report_Details: {
                screens: {
                    Report_Details_Root: ROUTES.REPORT_WITH_ID_DETAILS,
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
                    Details_Root: ROUTES.DETAILS,
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
                    IOU_Request_Root: ROUTES.IOU_REQUEST_WITH_REPORT_ID,
                    IOU_Request_Currency: ROUTES.IOU_REQUEST_CURRENCY,
                },
            },
            IOU_Bill: {
                screens: {
                    IOU_Bill_Root: ROUTES.IOU_BILL_WITH_REPORT_ID,
                    IOU_Bill_Currency: ROUTES.IOU_BILL_CURRENCY,
                },
            },
            IOU_Send: {
                screens: {
                    IOU_Send_Root: ROUTES.IOU_SEND_WITH_REPORT_ID,
                    IOU_Send_Currency: ROUTES.IOU_SEND_CURRENCY,
                },
            },
            IOU_Details: {
                screens: {
                    IOU_Details_Root: ROUTES.IOU_DETAILS_WITH_IOU_REPORT_ID,
                },
            },
            AddPersonalBankAccount: {
                screens: {
                    AddPersonalBankAccount_Root: ROUTES.BANK_ACCOUNT_PERSONAL,
                },
            },
            EnablePayments: {
                screens: {
                    EnablePayments_Root: ROUTES.ENABLE_PAYMENTS,
                },
            },
            WorkspaceInvite: {
                screens: {
                    WorkspaceInvite_Root: ROUTES.WORKSPACE_INVITE,
                },
            },
            RequestCall: {
                screens: {
                    RequestCall_Root: ROUTES.REQUEST_CALL,
                },
            },
        },
    },
};

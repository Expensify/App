import ROUTES from '../../ROUTES';
import SCREENS from '../../SCREENS';
import CONST from '../../CONST';
import NAVIGATORS from '../../NAVIGATORS';

export default {
    prefixes: ['new-expensify://', 'https://www.expensify.cash', 'https://staging.expensify.cash', 'http://localhost', CONST.NEW_EXPENSIFY_URL, CONST.STAGING_NEW_EXPENSIFY_URL],
    config: {
        initialRouteName: SCREENS.HOME,
        screens: {
            // Main Routes
            ValidateLogin: ROUTES.VALIDATE_LOGIN,
            UnlinkLogin: ROUTES.UNLINK_LOGIN,
            [SCREENS.TRANSITION_BETWEEN_APPS]: ROUTES.TRANSITION_BETWEEN_APPS,
            Concierge: ROUTES.CONCIERGE,
            AppleSignInDesktop: ROUTES.APPLE_SIGN_IN,
            GoogleSignInDesktop: ROUTES.GOOGLE_SIGN_IN,
            DesktopSignInRedirect: ROUTES.DESKTOP_SIGN_IN_REDIRECT,
            [SCREENS.REPORT_ATTACHMENTS]: ROUTES.REPORT_ATTACHMENTS,

            // Sidebar
            [SCREENS.HOME]: {
                path: ROUTES.HOME,
            },

            [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]: {
                screens: {
                    [SCREENS.REPORT]: ROUTES.REPORT_WITH_ID,
                    [CONST.DEMO_PAGES.SAASTR]: ROUTES.SAASTR,
                    [CONST.DEMO_PAGES.SBE]: ROUTES.SBE,
                },
            },
            [NAVIGATORS.FULL_SCREEN_NAVIGATOR]: {
                screens: {
                    [SCREENS.NOT_FOUND]: '*',
                },
            },

            [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: {
                screens: {
                    Settings: {
                        screens: {
                            Settings_Root: {
                                path: ROUTES.SETTINGS,
                            },
                            [SCREENS.SETTINGS.WORKSPACES]: {
                                path: ROUTES.SETTINGS_WORKSPACES,
                                exact: true,
                            },
                            [SCREENS.SETTINGS.PREFERENCES]: {
                                path: ROUTES.SETTINGS_PREFERENCES,
                                exact: true,
                            },
                            Settings_Preferences_PriorityMode: {
                                path: ROUTES.SETTINGS_PRIORITY_MODE,
                                exact: true,
                            },
                            Settings_Preferences_Language: {
                                path: ROUTES.SETTINGS_LANGUAGE,
                                exact: true,
                            },
                            Settings_Preferences_Theme: {
                                path: ROUTES.SETTINGS_THEME,
                                exact: true,
                            },
                            Settings_Close: {
                                path: ROUTES.SETTINGS_CLOSE,
                                exact: true,
                            },
                            Settings_Security: {
                                path: ROUTES.SETTINGS_SECURITY,
                                exact: true,
                            },
                            Settings_Wallet: {
                                path: ROUTES.SETTINGS_WALLET,
                                exact: true,
                            },
                            Settings_Wallet_EnablePayments: {
                                path: ROUTES.SETTINGS_ENABLE_PAYMENTS,
                                exact: true,
                            },
                            Settings_Wallet_Transfer_Balance: {
                                path: ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE,
                                exact: true,
                            },
                            Settings_Wallet_Choose_Transfer_Account: {
                                path: ROUTES.SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT,
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
                            Settings_Add_Bank_Account: {
                                path: ROUTES.SETTINGS_ADD_BANK_ACCOUNT,
                                exact: true,
                            },
                            Settings_Profile: {
                                path: ROUTES.SETTINGS_PROFILE,
                                exact: true,
                            },
                            Settings_Pronouns: {
                                path: ROUTES.SETTINGS_PRONOUNS,
                                exact: true,
                            },
                            Settings_Display_Name: {
                                path: ROUTES.SETTINGS_DISPLAY_NAME,
                                exact: true,
                            },
                            Settings_Timezone: {
                                path: ROUTES.SETTINGS_TIMEZONE,
                                exact: true,
                            },
                            Settings_Timezone_Select: {
                                path: ROUTES.SETTINGS_TIMEZONE_SELECT,
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
                            Settings_ContactMethods: {
                                path: ROUTES.SETTINGS_CONTACT_METHODS,
                                exact: true,
                            },
                            Settings_ContactMethodDetails: {
                                path: ROUTES.SETTINGS_CONTACT_METHOD_DETAILS,
                            },
                            Settings_Lounge_Access: {
                                path: ROUTES.SETTINGS_LOUNGE_ACCESS,
                            },
                            Settings_NewContactMethod: {
                                path: ROUTES.SETTINGS_NEW_CONTACT_METHOD,
                                exact: true,
                            },
                            Settings_PersonalDetails_Initial: {
                                path: ROUTES.SETTINGS_PERSONAL_DETAILS,
                                exact: true,
                            },
                            Settings_PersonalDetails_LegalName: {
                                path: ROUTES.SETTINGS_PERSONAL_DETAILS_LEGAL_NAME,
                                exact: true,
                            },
                            Settings_PersonalDetails_DateOfBirth: {
                                path: ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH,
                                exact: true,
                            },
                            Settings_PersonalDetails_Address: {
                                path: ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS,
                                exact: true,
                            },
                            Settings_TwoFactorAuth: {
                                path: ROUTES.SETTINGS_2FA,
                                exact: true,
                            },
                            Settings_Share_Code: {
                                path: ROUTES.SETTINGS_SHARE_CODE,
                                exact: true,
                            },
                            Settings_Status: {
                                path: ROUTES.SETTINGS_STATUS,
                                exact: true,
                            },
                            Settings_Status_Set: {
                                path: ROUTES.SETTINGS_STATUS_SET,
                                exact: true,
                            },
                            Workspace_Initial: {
                                path: ROUTES.WORKSPACE_INITIAL,
                            },
                            Workspace_Settings: {
                                path: ROUTES.WORKSPACE_SETTINGS,
                            },
                            Workspace_Card: {
                                path: ROUTES.WORKSPACE_CARD,
                            },
                            Workspace_Reimburse: {
                                path: ROUTES.WORKSPACE_REIMBURSE,
                            },
                            Workspace_RateAndUnit: {
                                path: ROUTES.WORKSPACE_RATE_AND_UNIT,
                            },
                            Workspace_Bills: {
                                path: ROUTES.WORKSPACE_BILLS,
                            },
                            Workspace_Invoices: {
                                path: ROUTES.WORKSPACE_INVOICES,
                            },
                            Workspace_Travel: {
                                path: ROUTES.WORKSPACE_TRAVEL,
                            },
                            Workspace_Members: {
                                path: ROUTES.WORKSPACE_MEMBERS,
                            },
                            Workspace_Invite: {
                                path: ROUTES.WORKSPACE_INVITE,
                            },
                            Workspace_Invite_Message: {
                                path: ROUTES.WORKSPACE_INVITE_MESSAGE,
                            },
                            Workspace_NewRoom: {
                                path: ROUTES.WORKSPACE_NEW_ROOM,
                            },
                            ReimbursementAccount: {
                                path: ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN,
                                exact: true,
                            },
                            GetAssistance: {
                                path: ROUTES.GET_ASSISTANCE,
                            },
                        },
                    },
                    Report_Details: {
                        screens: {
                            Report_Details_Root: ROUTES.REPORT_WITH_ID_DETAILS,
                            Report_Details_Share_Code: ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE,
                        },
                    },
                    Report_Settings: {
                        screens: {
                            Report_Settings_Root: {
                                path: ROUTES.REPORT_SETTINGS,
                            },
                            Report_Settings_Room_Name: {
                                path: ROUTES.REPORT_SETTINGS_ROOM_NAME,
                            },
                            Report_Settings_Notification_Preferences: {
                                path: ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES,
                            },
                            Report_Settings_Write_Capability: {
                                path: ROUTES.REPORT_SETTINGS_WRITE_CAPABILITY,
                            },
                        },
                    },
                    Report_WelcomeMessage: {
                        screens: {
                            Report_WelcomeMessage_Root: ROUTES.REPORT_WELCOME_MESSAGE,
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
                    NewTask: {
                        screens: {
                            NewTask_Root: ROUTES.NEW_TASK_WITH_REPORT_ID,
                            NewTask_TaskAssigneeSelector: ROUTES.NEW_TASK_ASSIGNEE,
                            NewTask_TaskShareDestinationSelector: ROUTES.NEW_TASK_SHARE_DESTINATION,
                            NewTask_Details: ROUTES.NEW_TASK_DETAILS,
                            NewTask_Title: ROUTES.NEW_TASK_TITLE,
                            NewTask_Description: ROUTES.NEW_TASK_DESCRIPTION,
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
                    Profile: {
                        screens: {
                            Profile_Root: ROUTES.PROFILE,
                        },
                    },
                    Participants: {
                        screens: {
                            ReportParticipants_Root: ROUTES.REPORT_PARTICIPANTS,
                        },
                    },
                    MoneyRequest: {
                        screens: {
                            Money_Request: {
                                path: ROUTES.MONEY_REQUEST,
                                exact: true,
                                screens: {
                                    manual: {
                                        path: ROUTES.MONEY_REQUEST_MANUAL_TAB,
                                        exact: true,
                                    },
                                    scan: {
                                        path: ROUTES.MONEY_REQUEST_SCAN_TAB,
                                        exact: true,
                                    },
                                    distance: {
                                        path: ROUTES.MONEY_REQUEST_DISTANCE_TAB,
                                        exact: true,
                                    },
                                },
                            },
                            Money_Request_Amount: ROUTES.MONEY_REQUEST_AMOUNT,
                            Money_Request_Participants: ROUTES.MONEY_REQUEST_PARTICIPANTS,
                            Money_Request_Confirmation: ROUTES.MONEY_REQUEST_CONFIRMATION,
                            Money_Request_Date: ROUTES.MONEY_REQUEST_DATE,
                            Money_Request_Currency: ROUTES.MONEY_REQUEST_CURRENCY,
                            Money_Request_Description: ROUTES.MONEY_REQUEST_DESCRIPTION,
                            Money_Request_Category: ROUTES.MONEY_REQUEST_CATEGORY,
                            Money_Request_Merchant: ROUTES.MONEY_REQUEST_MERCHANT,
                            Money_Request_Waypoint: ROUTES.MONEY_REQUEST_WAYPOINT,
                            IOU_Send_Enable_Payments: ROUTES.IOU_SEND_ENABLE_PAYMENTS,
                            IOU_Send_Add_Bank_Account: ROUTES.IOU_SEND_ADD_BANK_ACCOUNT,
                            IOU_Send_Add_Debit_Card: ROUTES.IOU_SEND_ADD_DEBIT_CARD,
                        },
                    },
                    SplitDetails: {
                        screens: {
                            SplitDetails_Root: ROUTES.SPLIT_BILL_DETAILS,
                        },
                    },
                    Task_Details: {
                        screens: {
                            Task_Title: ROUTES.TASK_TITLE,
                            Task_Description: ROUTES.TASK_DESCRIPTION,
                            Task_Assignee: ROUTES.TASK_ASSIGNEE,
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
                    Wallet_Statement: {
                        screens: {
                            WalletStatement_Root: ROUTES.WALLET_STATEMENT_WITH_DATE,
                        },
                    },
                    Flag_Comment: {
                        screens: {
                            FlagComment_Root: ROUTES.FLAG_COMMENT,
                        },
                    },
                    EditRequest: {
                        screens: {
                            EditRequest_Root: ROUTES.EDIT_REQUEST,
                            EditRequest_Currency: ROUTES.EDIT_CURRENCY_REQUEST,
                        },
                    },
                    SignIn: {
                        screens: {
                            SignIn_Root: ROUTES.SIGN_IN_MODAL,
                        },
                    },
                },
            },
        },
    },
};

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
            [SCREENS.CONCIERGE]: ROUTES.CONCIERGE,
            AppleSignInDesktop: ROUTES.APPLE_SIGN_IN,
            GoogleSignInDesktop: ROUTES.GOOGLE_SIGN_IN,
            SAMLSignIn: ROUTES.SAML_SIGN_IN,
            [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: ROUTES.DESKTOP_SIGN_IN_REDIRECT,
            [SCREENS.REPORT_ATTACHMENTS]: ROUTES.REPORT_ATTACHMENTS.route,

            // Demo routes
            [CONST.DEMO_PAGES.MONEY2020]: ROUTES.MONEY2020,

            // Sidebar
            [SCREENS.HOME]: {
                path: ROUTES.HOME,
            },

            [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]: {
                screens: {
                    [SCREENS.REPORT]: ROUTES.REPORT_WITH_ID.route,
                },
            },
            [SCREENS.NOT_FOUND]: '*',

            [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: {
                screens: {
                    Settings: {
                        screens: {
                            [SCREENS.SETTINGS.ROOT]: {
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
                            [SCREENS.SETTINGS.SECURITY]: {
                                path: ROUTES.SETTINGS_SECURITY,
                                exact: true,
                            },
                            Settings_Wallet: {
                                path: ROUTES.SETTINGS_WALLET,
                                exact: true,
                            },
                            Settings_Wallet_DomainCards: {
                                path: ROUTES.SETTINGS_WALLET_DOMAINCARD.route,
                                exact: true,
                            },
                            Settings_Wallet_ReportVirtualCardFraud: {
                                path: ROUTES.SETTINGS_REPORT_FRAUD.route,
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
                            Settings_Wallet_Card_Activate: {
                                path: ROUTES.SETTINGS_WALLET_CARD_ACTIVATE.route,
                                exact: true,
                            },
                            Settings_Wallet_Cards_Digital_Details_Update_Address: {
                                path: ROUTES.SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS.route,
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
                                path: ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.route,
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
                            Settings_PersonalDetails_Address_Country: {
                                path: ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS_COUNTRY.route,
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
                            [SCREENS.SETTINGS.STATUS]: {
                                path: ROUTES.SETTINGS_STATUS,
                                exact: true,
                            },
                            Settings_Status_Set: {
                                path: ROUTES.SETTINGS_STATUS_SET,
                                exact: true,
                            },
                            Workspace_Initial: {
                                path: ROUTES.WORKSPACE_INITIAL.route,
                            },
                            Workspace_Settings: {
                                path: ROUTES.WORKSPACE_SETTINGS.route,
                            },
                            Workspace_Settings_Currency: {
                                path: ROUTES.WORKSPACE_SETTINGS_CURRENCY.route,
                            },
                            Workspace_Card: {
                                path: ROUTES.WORKSPACE_CARD.route,
                            },
                            Workspace_Reimburse: {
                                path: ROUTES.WORKSPACE_REIMBURSE.route,
                            },
                            Workspace_RateAndUnit: {
                                path: ROUTES.WORKSPACE_RATE_AND_UNIT.route,
                            },
                            Workspace_Bills: {
                                path: ROUTES.WORKSPACE_BILLS.route,
                            },
                            Workspace_Invoices: {
                                path: ROUTES.WORKSPACE_INVOICES.route,
                            },
                            Workspace_Travel: {
                                path: ROUTES.WORKSPACE_TRAVEL.route,
                            },
                            Workspace_Members: {
                                path: ROUTES.WORKSPACE_MEMBERS.route,
                            },
                            Workspace_Invite: {
                                path: ROUTES.WORKSPACE_INVITE.route,
                            },
                            Workspace_Invite_Message: {
                                path: ROUTES.WORKSPACE_INVITE_MESSAGE.route,
                            },
                            ReimbursementAccount: {
                                path: ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.route,
                                exact: true,
                            },
                            GetAssistance: {
                                path: ROUTES.GET_ASSISTANCE.route,
                            },
                            KeyboardShortcuts: {
                                path: ROUTES.KEYBOARD_SHORTCUTS,
                            },
                        },
                    },
                    Private_Notes: {
                        screens: {
                            PrivateNotes_View: ROUTES.PRIVATE_NOTES_VIEW.route,
                            PrivateNotes_List: ROUTES.PRIVATE_NOTES_LIST.route,
                            PrivateNotes_Edit: ROUTES.PRIVATE_NOTES_EDIT.route,
                        },
                    },
                    Report_Details: {
                        screens: {
                            Report_Details_Root: ROUTES.REPORT_WITH_ID_DETAILS.route,
                            Report_Details_Share_Code: ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.route,
                        },
                    },
                    Report_Settings: {
                        screens: {
                            Report_Settings_Root: {
                                path: ROUTES.REPORT_SETTINGS.route,
                            },
                            Report_Settings_Room_Name: {
                                path: ROUTES.REPORT_SETTINGS_ROOM_NAME.route,
                            },
                            Report_Settings_Notification_Preferences: {
                                path: ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.route,
                            },
                            Report_Settings_Write_Capability: {
                                path: ROUTES.REPORT_SETTINGS_WRITE_CAPABILITY.route,
                            },
                        },
                    },
                    Report_WelcomeMessage: {
                        screens: {
                            Report_WelcomeMessage_Root: ROUTES.REPORT_WELCOME_MESSAGE.route,
                        },
                    },
                    NewChat: {
                        screens: {
                            NewChat_Root: {
                                path: ROUTES.NEW,
                                exact: true,
                                screens: {
                                    chat: {
                                        path: ROUTES.NEW_CHAT,
                                        exact: true,
                                    },
                                    room: {
                                        path: ROUTES.NEW_ROOM,
                                        exact: true,
                                    },
                                },
                            },
                        },
                    },
                    NewTask: {
                        screens: {
                            NewTask_Root: ROUTES.NEW_TASK,
                            NewTask_TaskAssigneeSelector: ROUTES.NEW_TASK_ASSIGNEE,
                            NewTask_TaskShareDestinationSelector: ROUTES.NEW_TASK_SHARE_DESTINATION,
                            NewTask_Details: ROUTES.NEW_TASK_DETAILS,
                            NewTask_Title: ROUTES.NEW_TASK_TITLE,
                            NewTask_Description: ROUTES.NEW_TASK_DESCRIPTION,
                        },
                    },
                    TeachersUnite: {
                        screens: {
                            [SCREENS.SAVE_THE_WORLD.ROOT]: ROUTES.TEACHERS_UNITE,
                            I_Know_A_Teacher: ROUTES.I_KNOW_A_TEACHER,
                            Intro_School_Principal: ROUTES.INTRO_SCHOOL_PRINCIPAL,
                            I_Am_A_Teacher: ROUTES.I_AM_A_TEACHER,
                        },
                    },
                    Search: {
                        screens: {
                            Search_Root: ROUTES.SEARCH,
                        },
                    },
                    Details: {
                        screens: {
                            Details_Root: ROUTES.DETAILS.route,
                        },
                    },
                    Profile: {
                        screens: {
                            Profile_Root: ROUTES.PROFILE.route,
                        },
                    },
                    Participants: {
                        screens: {
                            ReportParticipants_Root: ROUTES.REPORT_PARTICIPANTS.route,
                        },
                    },
                    MoneyRequest: {
                        screens: {
                            Money_Request: {
                                path: ROUTES.MONEY_REQUEST.route,
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
                                        path: ROUTES.MONEY_REQUEST_DISTANCE_TAB.route,
                                        exact: true,
                                    },
                                },
                            },
                            Money_Request_Amount: ROUTES.MONEY_REQUEST_AMOUNT.route,
                            Money_Request_Participants: ROUTES.MONEY_REQUEST_PARTICIPANTS.route,
                            Money_Request_Confirmation: ROUTES.MONEY_REQUEST_CONFIRMATION.route,
                            Money_Request_Date: ROUTES.MONEY_REQUEST_DATE.route,
                            Money_Request_Currency: ROUTES.MONEY_REQUEST_CURRENCY.route,
                            Money_Request_Description: ROUTES.MONEY_REQUEST_DESCRIPTION.route,
                            Money_Request_Category: ROUTES.MONEY_REQUEST_CATEGORY.route,
                            Money_Request_Tag: ROUTES.MONEY_REQUEST_TAG.route,
                            Money_Request_Merchant: ROUTES.MONEY_REQUEST_MERCHANT.route,
                            Money_Request_Waypoint: ROUTES.MONEY_REQUEST_WAYPOINT.route,
                            Money_Request_Edit_Waypoint: ROUTES.MONEY_REQUEST_EDIT_WAYPOINT.route,
                            Money_Request_Receipt: ROUTES.MONEY_REQUEST_RECEIPT.route,
                            Money_Request_Distance: ROUTES.MONEY_REQUEST_DISTANCE.route,
                            IOU_Send_Enable_Payments: ROUTES.IOU_SEND_ENABLE_PAYMENTS,
                            IOU_Send_Add_Bank_Account: ROUTES.IOU_SEND_ADD_BANK_ACCOUNT,
                            IOU_Send_Add_Debit_Card: ROUTES.IOU_SEND_ADD_DEBIT_CARD,
                        },
                    },
                    SplitDetails: {
                        screens: {
                            SplitDetails_Root: ROUTES.SPLIT_BILL_DETAILS.route,
                            SplitDetails_Edit_Request: ROUTES.EDIT_SPLIT_BILL.route,
                            SplitDetails_Edit_Currency: ROUTES.EDIT_SPLIT_BILL_CURRENCY.route,
                        },
                    },
                    Task_Details: {
                        screens: {
                            Task_Title: ROUTES.TASK_TITLE.route,
                            Task_Description: ROUTES.TASK_DESCRIPTION.route,
                            Task_Assignee: ROUTES.TASK_ASSIGNEE.route,
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
                            FlagComment_Root: ROUTES.FLAG_COMMENT.route,
                        },
                    },
                    EditRequest: {
                        screens: {
                            EditRequest_Root: ROUTES.EDIT_REQUEST.route,
                            EditRequest_Currency: ROUTES.EDIT_CURRENCY_REQUEST.route,
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

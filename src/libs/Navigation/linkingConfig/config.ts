/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

// Moved to a separate file to avoid cyclic dependencies.
const config: LinkingOptions<RootStackParamList>['config'] = {
    initialRouteName: NAVIGATORS.BOTTOM_TAB_NAVIGATOR,
    screens: {
        // Main Routes
        [SCREENS.VALIDATE_LOGIN]: ROUTES.VALIDATE_LOGIN,
        [SCREENS.UNLINK_LOGIN]: ROUTES.UNLINK_LOGIN,
        [SCREENS.TRANSITION_BETWEEN_APPS]: ROUTES.TRANSITION_BETWEEN_APPS,
        [SCREENS.CONCIERGE]: ROUTES.CONCIERGE,
        [SCREENS.SIGN_IN_WITH_APPLE_DESKTOP]: ROUTES.APPLE_SIGN_IN,
        [SCREENS.SIGN_IN_WITH_GOOGLE_DESKTOP]: ROUTES.GOOGLE_SIGN_IN,
        [SCREENS.SAML_SIGN_IN]: ROUTES.SAML_SIGN_IN,
        [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: ROUTES.DESKTOP_SIGN_IN_REDIRECT,
        [SCREENS.REPORT_ATTACHMENTS]: ROUTES.REPORT_ATTACHMENTS.route,
        [SCREENS.PROFILE_AVATAR]: ROUTES.PROFILE_AVATAR.route,
        [SCREENS.WORKSPACE_AVATAR]: ROUTES.WORKSPACE_AVATAR.route,
        [SCREENS.REPORT_AVATAR]: ROUTES.REPORT_AVATAR.route,

        // Sidebar
        [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]: {
            path: ROUTES.ROOT,
            initialRouteName: SCREENS.HOME,
            screens: {
                [SCREENS.HOME]: ROUTES.HOME,
                [SCREENS.ALL_SETTINGS]: ROUTES.ALL_SETTINGS,
                [SCREENS.WORKSPACE.INITIAL]: {
                    path: ROUTES.WORKSPACE_INITIAL.route,
                    exact: true,
                },
            },
        },

        [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]: {
            screens: {
                [SCREENS.REPORT]: ROUTES.REPORT_WITH_ID.route,

                [SCREENS.SETTINGS.WORKSPACES]: ROUTES.SETTINGS_WORKSPACES,
                [SCREENS.WORKSPACE.PROFILE]: ROUTES.WORKSPACE_PROFILE.route,
                [SCREENS.WORKSPACE.CARD]: {
                    path: ROUTES.WORKSPACE_CARD.route,
                },
                [SCREENS.WORKSPACE.WORKFLOWS]: {
                    path: ROUTES.WORKSPACE_WORKFLOWS.route,
                },
                [SCREENS.WORKSPACE.REIMBURSE]: {
                    path: ROUTES.WORKSPACE_REIMBURSE.route,
                },
                [SCREENS.WORKSPACE.BILLS]: {
                    path: ROUTES.WORKSPACE_BILLS.route,
                },
                [SCREENS.WORKSPACE.INVOICES]: {
                    path: ROUTES.WORKSPACE_INVOICES.route,
                },
                [SCREENS.WORKSPACE.TRAVEL]: {
                    path: ROUTES.WORKSPACE_TRAVEL.route,
                },
                [SCREENS.WORKSPACE.MEMBERS]: {
                    path: ROUTES.WORKSPACE_MEMBERS.route,
                },
                [SCREENS.WORKSPACE.CATEGORIES]: {
                    path: ROUTES.WORKSPACE_CATEGORIES.route,
                },
            },
        },
        [SCREENS.NOT_FOUND]: '*',
        [NAVIGATORS.LEFT_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.LEFT_MODAL.SEARCH]: {
                    screens: {
                        [SCREENS.SEARCH_ROOT]: ROUTES.SEARCH,
                    },
                },
                [SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER]: {
                    screens: {
                        [SCREENS.WORKSPACE_SWITCHER.ROOT]: {
                            path: ROUTES.WORKSPACE_SWITCHER,
                        },
                    },
                },
            },
        },
        [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.RIGHT_MODAL.SETTINGS]: {
                    screens: {
                        [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: {
                            path: ROUTES.SETTINGS_PRIORITY_MODE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: {
                            path: ROUTES.SETTINGS_LANGUAGE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PREFERENCES.THEME]: {
                            path: ROUTES.SETTINGS_THEME,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.CLOSE]: {
                            path: ROUTES.SETTINGS_CLOSE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: {
                            path: ROUTES.SETTINGS_WALLET_DOMAINCARD.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: {
                            path: ROUTES.SETTINGS_REPORT_FRAUD.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME]: {
                            path: ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.PHONE]: {
                            path: ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS]: {
                            path: ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM]: {
                            path: ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: {
                            path: ROUTES.SETTINGS_ENABLE_PAYMENTS,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: {
                            path: ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: {
                            path: ROUTES.SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: {
                            path: ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: {
                            path: ROUTES.SETTINGS_WALLET_CARD_ACTIVATE.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: {
                            path: ROUTES.SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.ADD_DEBIT_CARD]: {
                            path: ROUTES.SETTINGS_ADD_DEBIT_CARD,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: {
                            path: ROUTES.SETTINGS_ADD_BANK_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.PRONOUNS]: {
                            path: ROUTES.SETTINGS_PRONOUNS,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: {
                            path: ROUTES.SETTINGS_DISPLAY_NAME,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.TIMEZONE]: {
                            path: ROUTES.SETTINGS_TIMEZONE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: {
                            path: ROUTES.SETTINGS_TIMEZONE_SELECT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: {
                            path: ROUTES.SETTINGS_APP_DOWNLOAD_LINKS,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.TROUBLESHOOT]: {
                            path: ROUTES.SETTINGS_TROUBLESHOOT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.CONSOLE]: {
                            path: ROUTES.SETTINGS_CONSOLE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.SHARE_LOG]: ROUTES.SETTINGS_SHARE_LOG.route,
                        [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: {
                            path: ROUTES.SETTINGS_CONTACT_METHODS.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: {
                            path: ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.route,
                        },
                        [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: {
                            path: ROUTES.SETTINGS_NEW_CONTACT_METHOD.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.LEGAL_NAME]: {
                            path: ROUTES.SETTINGS_LEGAL_NAME,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH]: {
                            path: ROUTES.SETTINGS_DATE_OF_BIRTH,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.ADDRESS]: {
                            path: ROUTES.SETTINGS_ADDRESS,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY]: {
                            path: ROUTES.SETTINGS_ADDRESS_COUNTRY.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: {
                            path: ROUTES.SETTINGS_2FA.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.STATUS]: {
                            path: ROUTES.SETTINGS_STATUS,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: {
                            path: ROUTES.SETTINGS_STATUS_CLEAR_AFTER,
                        },
                        [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: {
                            path: ROUTES.SETTINGS_STATUS_CLEAR_AFTER_DATE,
                        },
                        [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: {
                            path: ROUTES.SETTINGS_STATUS_CLEAR_AFTER_TIME,
                        },
                        [SCREENS.WORKSPACE.CURRENCY]: {
                            path: ROUTES.WORKSPACE_PROFILE_CURRENCY.route,
                        },
                        [SCREENS.WORKSPACE.DESCRIPTION]: {
                            path: ROUTES.WORKSPACE_PROFILE_DESCRIPTION.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET.route,
                        },
                        [SCREENS.WORKSPACE.SHARE]: {
                            path: ROUTES.WORKSPACE_PROFILE_SHARE.route,
                        },
                        [SCREENS.WORKSPACE.RATE_AND_UNIT]: {
                            path: ROUTES.WORKSPACE_RATE_AND_UNIT.route,
                        },
                        [SCREENS.WORKSPACE.RATE_AND_UNIT_RATE]: {
                            path: ROUTES.WORKSPACE_RATE_AND_UNIT_RATE.route,
                        },
                        [SCREENS.WORKSPACE.RATE_AND_UNIT_UNIT]: {
                            path: ROUTES.WORKSPACE_RATE_AND_UNIT_UNIT.route,
                        },
                        [SCREENS.WORKSPACE.INVITE]: {
                            path: ROUTES.WORKSPACE_INVITE.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_APPROVER]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_APPROVER.route,
                        },
                        [SCREENS.WORKSPACE.INVITE_MESSAGE]: {
                            path: ROUTES.WORKSPACE_INVITE_MESSAGE.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_SETTINGS]: {
                            path: ROUTES.WORKSPACE_CATEGORY_SETTINGS.route,
                            parse: {
                                categoryName: (categoryName: string) => decodeURI(categoryName),
                            },
                        },
                        [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: {
                            path: ROUTES.WORKSPACE_CATEGORIES_SETTINGS.route,
                        },
                        [SCREENS.REIMBURSEMENT_ACCOUNT]: {
                            path: ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.route,
                            exact: true,
                        },
                        [SCREENS.GET_ASSISTANCE]: {
                            path: ROUTES.GET_ASSISTANCE.route,
                        },
                        [SCREENS.KEYBOARD_SHORTCUTS]: {
                            path: ROUTES.KEYBOARD_SHORTCUTS,
                        },
                        [SCREENS.WORKSPACE.NAME]: ROUTES.WORKSPACE_PROFILE_NAME.route,
                        [SCREENS.SETTINGS.SHARE_CODE]: {
                            path: ROUTES.SETTINGS_SHARE_CODE,
                        },
                        [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: {
                            path: ROUTES.SETTINGS_EXIT_SURVEY_REASON,
                        },
                        [SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE]: {
                            path: ROUTES.SETTINGS_EXIT_SURVEY_RESPONSE.route,
                        },
                        [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: {
                            path: ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.route,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.PRIVATE_NOTES]: {
                    screens: {
                        [SCREENS.PRIVATE_NOTES.LIST]: ROUTES.PRIVATE_NOTES_LIST.route,
                        [SCREENS.PRIVATE_NOTES.EDIT]: ROUTES.PRIVATE_NOTES_EDIT.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.REPORT_DETAILS]: {
                    screens: {
                        [SCREENS.REPORT_DETAILS.ROOT]: ROUTES.REPORT_WITH_ID_DETAILS.route,
                        [SCREENS.REPORT_DETAILS.SHARE_CODE]: ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.REPORT_SETTINGS]: {
                    screens: {
                        [SCREENS.REPORT_SETTINGS.ROOT]: {
                            path: ROUTES.REPORT_SETTINGS.route,
                        },
                        [SCREENS.REPORT_SETTINGS.ROOM_NAME]: {
                            path: ROUTES.REPORT_SETTINGS_ROOM_NAME.route,
                        },
                        [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: {
                            path: ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.route,
                        },
                        [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: {
                            path: ROUTES.REPORT_SETTINGS_WRITE_CAPABILITY.route,
                        },
                        [SCREENS.REPORT_SETTINGS.VISIBILITY]: {
                            path: ROUTES.REPORT_SETTINGS_VISIBILITY.route,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.REPORT_DESCRIPTION]: {
                    screens: {
                        [SCREENS.REPORT_DESCRIPTION_ROOT]: ROUTES.REPORT_DESCRIPTION.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.NEW_CHAT]: {
                    screens: {
                        [SCREENS.NEW_CHAT.ROOT]: {
                            path: ROUTES.NEW,
                            exact: true,
                            screens: {
                                [SCREENS.NEW_CHAT.NEW_CHAT]: {
                                    path: ROUTES.NEW_CHAT,
                                    exact: true,
                                },
                                [SCREENS.NEW_CHAT.NEW_ROOM]: {
                                    path: ROUTES.NEW_ROOM,
                                    exact: true,
                                },
                            },
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.NEW_TASK]: {
                    screens: {
                        [SCREENS.NEW_TASK.ROOT]: ROUTES.NEW_TASK,
                        [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: ROUTES.NEW_TASK_ASSIGNEE,
                        [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: ROUTES.NEW_TASK_SHARE_DESTINATION,
                        [SCREENS.NEW_TASK.DETAILS]: ROUTES.NEW_TASK_DETAILS,
                        [SCREENS.NEW_TASK.TITLE]: ROUTES.NEW_TASK_TITLE,
                        [SCREENS.NEW_TASK.DESCRIPTION]: ROUTES.NEW_TASK_DESCRIPTION,
                    },
                },
                [SCREENS.RIGHT_MODAL.ONBOARD_ENGAGEMENT]: {
                    screens: {
                        [SCREENS.ONBOARD_ENGAGEMENT.ROOT]: ROUTES.ONBOARD,
                        [SCREENS.ONBOARD_ENGAGEMENT.MANAGE_TEAMS_EXPENSES]: ROUTES.ONBOARD_MANAGE_EXPENSES,
                        [SCREENS.ONBOARD_ENGAGEMENT.EXPENSIFY_CLASSIC]: ROUTES.ONBOARD_EXPENSIFY_CLASSIC,
                    },
                },
                [SCREENS.RIGHT_MODAL.TEACHERS_UNITE]: {
                    screens: {
                        [SCREENS.SAVE_THE_WORLD.ROOT]: ROUTES.TEACHERS_UNITE,
                        [SCREENS.I_KNOW_A_TEACHER]: ROUTES.I_KNOW_A_TEACHER,
                        [SCREENS.INTRO_SCHOOL_PRINCIPAL]: ROUTES.INTRO_SCHOOL_PRINCIPAL,
                        [SCREENS.I_AM_A_TEACHER]: ROUTES.I_AM_A_TEACHER,
                    },
                },
                [SCREENS.RIGHT_MODAL.DETAILS]: {
                    screens: {
                        [SCREENS.DETAILS_ROOT]: ROUTES.DETAILS.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.PROFILE]: {
                    screens: {
                        [SCREENS.PROFILE_ROOT]: ROUTES.PROFILE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.PARTICIPANTS]: {
                    screens: {
                        [SCREENS.REPORT_PARTICIPANTS_ROOT]: ROUTES.REPORT_PARTICIPANTS.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.ROOM_INVITE]: {
                    screens: {
                        [SCREENS.ROOM_INVITE_ROOT]: ROUTES.ROOM_INVITE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.ROOM_MEMBERS]: {
                    screens: {
                        [SCREENS.ROOM_MEMBERS_ROOT]: ROUTES.ROOM_MEMBERS.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.MONEY_REQUEST]: {
                    screens: {
                        [SCREENS.MONEY_REQUEST.START]: ROUTES.MONEY_REQUEST_START.route,
                        [SCREENS.MONEY_REQUEST.CREATE]: {
                            path: ROUTES.MONEY_REQUEST_CREATE.route,
                            exact: true,
                            screens: {
                                distance: {
                                    path: ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.route,
                                    exact: true,
                                },
                                manual: {
                                    path: ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.route,
                                    exact: true,
                                },
                                scan: {
                                    path: ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.route,
                                    exact: true,
                                },
                            },
                        },
                        [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: ROUTES.MONEY_REQUEST_STEP_AMOUNT.route,
                        [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: ROUTES.MONEY_REQUEST_STEP_CATEGORY.route,
                        [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.route,
                        [SCREENS.MONEY_REQUEST.STEP_CURRENCY]: ROUTES.MONEY_REQUEST_STEP_CURRENCY.route,
                        [SCREENS.MONEY_REQUEST.STEP_DATE]: ROUTES.MONEY_REQUEST_STEP_DATE.route,
                        [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.route,
                        [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: ROUTES.MONEY_REQUEST_STEP_DISTANCE.route,
                        [SCREENS.MONEY_REQUEST.HOLD]: ROUTES.MONEY_REQUEST_HOLD_REASON.route,
                        [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: ROUTES.MONEY_REQUEST_STEP_MERCHANT.route,
                        [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.route,
                        [SCREENS.MONEY_REQUEST.STEP_SCAN]: ROUTES.MONEY_REQUEST_STEP_SCAN.route,
                        [SCREENS.MONEY_REQUEST.STEP_TAG]: ROUTES.MONEY_REQUEST_STEP_TAG.route,
                        [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: ROUTES.MONEY_REQUEST_STEP_WAYPOINT.route,
                        [SCREENS.MONEY_REQUEST.ROOT]: {
                            path: ROUTES.MONEY_REQUEST.route,
                            exact: true,
                            screens: {
                                [SCREENS.MONEY_REQUEST.MANUAL_TAB]: {
                                    path: ROUTES.MONEY_REQUEST_MANUAL_TAB,
                                    exact: true,
                                },
                                [SCREENS.MONEY_REQUEST.SCAN_TAB]: {
                                    path: ROUTES.MONEY_REQUEST_SCAN_TAB,
                                    exact: true,
                                },
                                [SCREENS.MONEY_REQUEST.DISTANCE_TAB]: {
                                    path: ROUTES.MONEY_REQUEST_DISTANCE_TAB.route,
                                    exact: true,
                                },
                            },
                        },
                        [SCREENS.MONEY_REQUEST.AMOUNT]: ROUTES.MONEY_REQUEST_AMOUNT.route,
                        [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.route,
                        [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: ROUTES.MONEY_REQUEST_STEP_TAX_RATE.route,
                        [SCREENS.MONEY_REQUEST.PARTICIPANTS]: ROUTES.MONEY_REQUEST_PARTICIPANTS.route,
                        [SCREENS.MONEY_REQUEST.CONFIRMATION]: ROUTES.MONEY_REQUEST_CONFIRMATION.route,
                        [SCREENS.MONEY_REQUEST.CURRENCY]: ROUTES.MONEY_REQUEST_CURRENCY.route,
                        [SCREENS.MONEY_REQUEST.RECEIPT]: ROUTES.MONEY_REQUEST_RECEIPT.route,
                        [SCREENS.MONEY_REQUEST.DISTANCE]: ROUTES.MONEY_REQUEST_DISTANCE.route,
                        [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: ROUTES.IOU_SEND_ENABLE_PAYMENTS,
                        [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: ROUTES.IOU_SEND_ADD_BANK_ACCOUNT,
                        [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: ROUTES.IOU_SEND_ADD_DEBIT_CARD,
                    },
                },
                [SCREENS.RIGHT_MODAL.SPLIT_DETAILS]: {
                    screens: {
                        [SCREENS.SPLIT_DETAILS.ROOT]: ROUTES.SPLIT_BILL_DETAILS.route,
                        [SCREENS.SPLIT_DETAILS.EDIT_REQUEST]: ROUTES.EDIT_SPLIT_BILL.route,
                        [SCREENS.SPLIT_DETAILS.EDIT_CURRENCY]: ROUTES.EDIT_SPLIT_BILL_CURRENCY.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.TASK_DETAILS]: {
                    screens: {
                        [SCREENS.TASK.TITLE]: ROUTES.TASK_TITLE.route,
                        [SCREENS.TASK.ASSIGNEE]: ROUTES.TASK_ASSIGNEE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT]: {
                    screens: {
                        [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: ROUTES.BANK_ACCOUNT_PERSONAL,
                    },
                },
                [SCREENS.RIGHT_MODAL.ENABLE_PAYMENTS]: {
                    screens: {
                        [SCREENS.ENABLE_PAYMENTS_ROOT]: ROUTES.ENABLE_PAYMENTS,
                    },
                },
                [SCREENS.RIGHT_MODAL.WALLET_STATEMENT]: {
                    screens: {
                        [SCREENS.WALLET_STATEMENT_ROOT]: ROUTES.WALLET_STATEMENT_WITH_DATE,
                    },
                },
                [SCREENS.RIGHT_MODAL.FLAG_COMMENT]: {
                    screens: {
                        [SCREENS.FLAG_COMMENT_ROOT]: ROUTES.FLAG_COMMENT.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.EDIT_REQUEST]: {
                    screens: {
                        [SCREENS.EDIT_REQUEST.ROOT]: ROUTES.EDIT_REQUEST.route,
                        [SCREENS.EDIT_REQUEST.CURRENCY]: ROUTES.EDIT_CURRENCY_REQUEST.route,
                        [SCREENS.EDIT_REQUEST.REPORT_FIELD]: ROUTES.EDIT_REPORT_FIELD_REQUEST.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.SIGN_IN]: {
                    screens: {
                        [SCREENS.SIGN_IN_ROOT]: ROUTES.SIGN_IN_MODAL,
                    },
                },
                [SCREENS.RIGHT_MODAL.REFERRAL]: {
                    screens: {
                        [SCREENS.REFERRAL_DETAILS]: ROUTES.REFERRAL_DETAILS_MODAL.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.PROCESS_MONEY_REQUEST_HOLD]: {
                    screens: {
                        [SCREENS.PROCESS_MONEY_REQUEST_HOLD_ROOT]: ROUTES.PROCESS_MONEY_REQUEST_HOLD,
                    },
                },
            },
        },

        [NAVIGATORS.FULL_SCREEN_NAVIGATOR]: {
            screens: {
                [SCREENS.SETTINGS.ROOT]: {
                    path: ROUTES.SETTINGS,
                },
                [SCREENS.SETTINGS_CENTRAL_PANE]: {
                    screens: {
                        [SCREENS.SETTINGS.PROFILE.ROOT]: {
                            path: ROUTES.SETTINGS_PROFILE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PREFERENCES.ROOT]: {
                            path: ROUTES.SETTINGS_PREFERENCES,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.SECURITY]: {
                            path: ROUTES.SETTINGS_SECURITY,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.ROOT]: {
                            path: ROUTES.SETTINGS_WALLET,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.ABOUT]: {
                            path: ROUTES.SETTINGS_ABOUT,
                            exact: true,
                        },
                    },
                },
            },
        },
    },
};

export default config;

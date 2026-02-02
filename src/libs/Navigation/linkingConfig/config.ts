import type {LinkingOptions} from '@react-navigation/native';
import type {RouteConfig} from '@libs/Navigation/helpers/createNormalizedConfigs';
import createNormalizedConfigs from '@libs/Navigation/helpers/createNormalizedConfigs';
import type {RootNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';

// Moved to a separate file to avoid cyclic dependencies.
const config: LinkingOptions<RootNavigatorParamList>['config'] = {
    screens: {
        // Main Routes
        [SCREENS.VALIDATE_LOGIN]: ROUTES.VALIDATE_LOGIN,
        [SCREENS.UNLINK_LOGIN]: ROUTES.UNLINK_LOGIN,
        [SCREENS.TRANSITION_BETWEEN_APPS]: ROUTES.TRANSITION_BETWEEN_APPS,
        [SCREENS.CONNECTION_COMPLETE]: ROUTES.CONNECTION_COMPLETE,
        [SCREENS.BANK_CONNECTION_COMPLETE]: ROUTES.BANK_CONNECTION_COMPLETE,
        [SCREENS.CONCIERGE]: ROUTES.CONCIERGE,
        [SCREENS.TRACK_EXPENSE]: ROUTES.TRACK_EXPENSE,
        [SCREENS.SUBMIT_EXPENSE]: ROUTES.SUBMIT_EXPENSE,
        [SCREENS.HOME]: ROUTES.HOME,
        [SCREENS.SAML_SIGN_IN]: ROUTES.SAML_SIGN_IN,
        [SCREENS.REPORT_ATTACHMENTS]: ROUTES.REPORT_ATTACHMENTS.route,
        [SCREENS.REPORT_ADD_ATTACHMENT]: ROUTES.REPORT_ADD_ATTACHMENT.route,
        [SCREENS.PROFILE_AVATAR]: {
            path: ROUTES.PROFILE_AVATAR.route,
            parse: {
                accountID: Number,
            },
        },
        [SCREENS.WORKSPACE_AVATAR]: ROUTES.WORKSPACE_AVATAR.route,
        [SCREENS.REPORT_AVATAR]: ROUTES.REPORT_AVATAR.route,
        [SCREENS.TRANSACTION_RECEIPT]: ROUTES.TRANSACTION_RECEIPT.route,
        [SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW]: ROUTES.MONEY_REQUEST_RECEIPT_PREVIEW.route,
        [SCREENS.WORKSPACE_JOIN_USER]: ROUTES.WORKSPACE_JOIN_USER.route,
        [SCREENS.WORKSPACES_LIST]: {
            path: ROUTES.WORKSPACES_LIST.route,
            exact: true,
        },

        [SCREENS.NOT_FOUND]: '*',
        [NAVIGATORS.PUBLIC_RIGHT_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.PUBLIC_CONSOLE_DEBUG]: {
                    path: ROUTES.PUBLIC_CONSOLE_DEBUG.route,
                    exact: true,
                },
            },
        },
        [NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.FEATURE_TRAINING_ROOT]: {
                    path: ROUTES.TRACK_TRAINING_MODAL,
                    exact: true,
                },
                [SCREENS.AUTO_SUBMIT_ROOT]: ROUTES.AUTO_SUBMIT_MODAL_ROOT,
                [SCREENS.CHANGE_POLICY_EDUCATIONAL_ROOT]: ROUTES.CHANGE_POLICY_EDUCATIONAL.route,
            },
        },
        [NAVIGATORS.EXPLANATION_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.EXPLANATION_MODAL.ROOT]: {
                    path: ROUTES.EXPLANATION_MODAL_ROOT,
                    exact: true,
                },
            },
        },

        [NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT]: {
                    path: ROUTES.MIGRATED_USER_WELCOME_MODAL.route,
                    exact: true,
                },
            },
        },

        [NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.TEST_DRIVE_MODAL.ROOT]: {
                    path: ROUTES.TEST_DRIVE_MODAL_ROOT.route,
                    exact: true,
                },
            },
        },

        [NAVIGATORS.TEST_DRIVE_DEMO_NAVIGATOR]: {
            screens: {
                [SCREENS.TEST_DRIVE_DEMO.ROOT]: {
                    path: ROUTES.TEST_DRIVE_DEMO_ROOT,
                    exact: true,
                },
            },
        },

        [NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]: {
            // Don't set the initialRouteName, because when the user continues from the last visited onboarding page,
            // the onboarding purpose page will be briefly visible.
            path: ROUTES.ONBOARDING_ROOT.route,
            screens: {
                [SCREENS.ONBOARDING.WORK_EMAIL]: {
                    path: ROUTES.ONBOARDING_WORK_EMAIL.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]: {
                    path: ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.PURPOSE]: {
                    path: ROUTES.ONBOARDING_PURPOSE.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.PERSONAL_DETAILS]: {
                    path: ROUTES.ONBOARDING_PERSONAL_DETAILS.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.PRIVATE_DOMAIN]: {
                    path: ROUTES.ONBOARDING_PRIVATE_DOMAIN.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.EMPLOYEES]: {
                    path: ROUTES.ONBOARDING_EMPLOYEES.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.ACCOUNTING]: {
                    path: ROUTES.ONBOARDING_ACCOUNTING.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.INTERESTED_FEATURES]: {
                    path: ROUTES.ONBOARDING_INTERESTED_FEATURES.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.WORKSPACES]: {
                    path: ROUTES.ONBOARDING_WORKSPACES.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.WORKSPACE_OPTIONAL]: {
                    path: ROUTES.ONBOARDING_WORKSPACE.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.WORKSPACE_CONFIRMATION]: {
                    path: ROUTES.ONBOARDING_WORKSPACE_CONFIRMATION.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.WORKSPACE_CURRENCY]: {
                    path: ROUTES.ONBOARDING_WORKSPACE_CURRENCY.route,
                    exact: true,
                },
                [SCREENS.ONBOARDING.WORKSPACE_INVITE]: {
                    path: ROUTES.ONBOARDING_WORKSPACE_INVITE.route,
                    exact: true,
                },
            },
        },
        [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.RIGHT_MODAL.SEARCH_ROUTER]: {
                    path: ROUTES.SEARCH_ROUTER,
                    exact: true,
                },
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
                        [SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD]: {
                            path: ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY]: {
                            path: ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_PAYMENT_CURRENCY]: {
                            path: ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.ADD_PAYMENT_CARD_CHANGE_CURRENCY]: {
                            path: ROUTES.SETTINGS_CHANGE_CURRENCY,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PREFERENCES.THEME]: {
                            path: ROUTES.SETTINGS_THEME,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PREFERENCES.PAYMENT_CURRENCY]: {
                            path: ROUTES.SETTINGS_PAYMENT_CURRENCY,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.CLOSE]: {
                            path: ROUTES.SETTINGS_CLOSE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS]: {
                            path: ROUTES.SETTINGS_MERGE_ACCOUNTS.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_VALIDATE]: {
                            path: ROUTES.SETTINGS_MERGE_ACCOUNTS_MAGIC_CODE.route,
                        },
                        [SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT]: {
                            path: ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.route,
                        },
                        [SCREENS.SETTINGS.LOCK.LOCK_ACCOUNT]: {
                            path: ROUTES.SETTINGS_LOCK_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.LOCK.UNLOCK_ACCOUNT]: {
                            path: ROUTES.SETTINGS_UNLOCK_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.LOCK.FAILED_TO_LOCK_ACCOUNT]: {
                            path: ROUTES.SETTINGS_FAILED_TO_LOCK_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: {
                            path: ROUTES.SETTINGS_WALLET_DOMAIN_CARD.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_DETAILS]: {
                            path: ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_NAME]: {
                            path: ROUTES.SETTINGS_WALLET_PERSONAL_CARD_EDIT_NAME.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_TRANSACTION_START_DATE]: {
                            path: ROUTES.SETTINGS_WALLET_PERSONAL_CARD_EDIT_TRANSACTION_START_DATE.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.DOMAIN_CARD_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.SETTINGS_WALLET_DOMAIN_CARD_CONFIRM_MAGIC_CODE.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS]: {
                            path: ROUTES.SETTINGS_WALLET_CARD_MISSING_DETAILS.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.SETTINGS_WALLET_CARD_MISSING_DETAILS_CONFIRM_MAGIC_CODE.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.VERIFY_ACCOUNT]: {
                            path: ROUTES.SETTINGS_WALLET_VERIFY_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: {
                            path: ROUTES.SETTINGS_REPORT_FRAUD.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD_CONFIRMATION]: {
                            path: ROUTES.SETTINGS_REPORT_FRAUD_CONFIRMATION.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.SETTINGS_REPORT_FRAUD_VERIFY_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: {
                            path: ROUTES.SETTINGS_ENABLE_PAYMENTS,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT]: {
                            path: ROUTES.SETTINGS_WALLET_UNSHARE_BANK_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS]: {
                            path: ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.SHARE_BANK_ACCOUNT]: {
                            path: ROUTES.SETTINGS_WALLET_SHARE_BANK_ACCOUNT.route,
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
                        [SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS]: {
                            path: ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_CARD_NAME]: {
                            path: ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_CARD_NAME,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_CURRENCY]: {
                            path: ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_CURRENCY,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_SPREADSHEET]: {
                            path: ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_SPREADSHEET.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.WALLET.TRANSACTIONS_IMPORTED]: {
                            path: ROUTES.SETTINGS_WALLET_TRANSACTIONS_IMPORTED.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: {
                            path: ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_MAGIC_CODE.route,
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
                            path: ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT]: {
                            path: ROUTES.SETTINGS_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT]: {
                            path: ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT_ENTRY_POINT]: {
                            path: ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT_ENTRY_POINT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.ADD_BANK_ACCOUNT_SELECT_COUNTRY_VERIFY_ACCOUNT]: {
                            path: ROUTES.SETTINGS_ADD_BANK_ACCOUNT_SELECT_COUNTRY_VERIFY_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.RULES.ADD]: {
                            path: ROUTES.SETTINGS_RULES_ADD.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.RULES.ADD_MERCHANT]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.MERCHANT),
                        [SCREENS.SETTINGS.RULES.ADD_RENAME_MERCHANT]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.RENAME_MERCHANT),
                        [SCREENS.SETTINGS.RULES.ADD_CATEGORY]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.CATEGORY),
                        [SCREENS.SETTINGS.RULES.ADD_TAG]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.TAG),
                        [SCREENS.SETTINGS.RULES.ADD_TAX]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.TAX),
                        [SCREENS.SETTINGS.RULES.ADD_DESCRIPTION]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.DESCRIPTION),
                        [SCREENS.SETTINGS.RULES.ADD_REIMBURSABLE]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.REIMBURSABLE),
                        [SCREENS.SETTINGS.RULES.ADD_BILLABLE]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.BILLABLE),
                        [SCREENS.SETTINGS.RULES.ADD_REPORT]: ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.REPORT),
                        [SCREENS.SETTINGS.RULES.EDIT]: {
                            path: ROUTES.SETTINGS_RULES_EDIT.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.RULES.EDIT_MERCHANT]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.MERCHANT),
                        [SCREENS.SETTINGS.RULES.EDIT_RENAME_MERCHANT]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.RENAME_MERCHANT),
                        [SCREENS.SETTINGS.RULES.EDIT_CATEGORY]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.CATEGORY),
                        [SCREENS.SETTINGS.RULES.EDIT_TAG]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.TAG),
                        [SCREENS.SETTINGS.RULES.EDIT_TAX]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.TAX),
                        [SCREENS.SETTINGS.RULES.EDIT_DESCRIPTION]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.DESCRIPTION),
                        [SCREENS.SETTINGS.RULES.EDIT_REIMBURSABLE]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.REIMBURSABLE),
                        [SCREENS.SETTINGS.RULES.EDIT_BILLABLE]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.BILLABLE),
                        [SCREENS.SETTINGS.RULES.EDIT_REPORT]: ROUTES.SETTINGS_RULES_EDIT.getRoute(undefined, CONST.EXPENSE_RULES.FIELDS.REPORT),
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
                        [SCREENS.SETTINGS.CONSOLE]: {
                            path: ROUTES.SETTINGS_CONSOLE.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.SHARE_LOG]: ROUTES.SETTINGS_SHARE_LOG.route,
                        [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: {
                            path: ROUTES.SETTINGS_CONTACT_METHODS.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.AVATAR]: {
                            path: ROUTES.SETTINGS_AVATAR,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: {
                            path: ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.route,
                        },
                        [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: {
                            path: ROUTES.SETTINGS_NEW_CONTACT_METHOD.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_VERIFY_ACCOUNT]: {
                            path: ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.LEGAL_NAME]: {
                            path: ROUTES.SETTINGS_LEGAL_NAME,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.PROFILE.PHONE_NUMBER]: {
                            path: ROUTES.SETTINGS_PHONE_NUMBER,
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
                        [SCREENS.SETTINGS.PROFILE.ADDRESS_STATE]: {
                            path: ROUTES.SETTINGS_ADDRESS_STATE.route,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.DELEGATE.VERIFY_ACCOUNT]: {
                            path: ROUTES.SETTINGS_DELEGATE_VERIFY_ACCOUNT,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.DELEGATE.ADD_DELEGATE]: {
                            path: ROUTES.SETTINGS_ADD_DELEGATE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.DELEGATE.DELEGATE_ROLE]: {
                            path: ROUTES.SETTINGS_DELEGATE_ROLE.route,
                        },
                        [SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE]: {
                            path: ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.route,
                        },
                        [SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE_CONFIRM_MAGIC_CODE.route,
                        },
                        [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM]: {
                            path: ROUTES.SETTINGS_DELEGATE_CONFIRM.route,
                        },
                        [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.SETTINGS_DELEGATE_CONFIRM_MAGIC_CODE.route,
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
                        [SCREENS.SETTINGS.SUBSCRIPTION.SETTINGS_DETAILS]: {
                            path: ROUTES.SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS,
                        },
                        [SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE]: {
                            path: ROUTES.SETTINGS_VACATION_DELEGATE,
                            exact: true,
                        },
                        [SCREENS.SETTINGS.SUBSCRIPTION.SIZE]: {
                            path: ROUTES.SETTINGS_SUBSCRIPTION_SIZE.route,
                            parse: {
                                canChangeSize: Number,
                            },
                        },
                        [SCREENS.SETTINGS.SUBSCRIPTION.DISABLE_AUTO_RENEW_SURVEY]: {
                            path: ROUTES.SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY,
                        },
                        [SCREENS.SETTINGS.SUBSCRIPTION.REQUEST_EARLY_CANCELLATION]: {
                            path: ROUTES.SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION,
                        },
                        [SCREENS.SETTINGS.SUBSCRIPTION.SUBSCRIPTION_DOWNGRADE_BLOCKED]: {
                            path: ROUTES.SETTINGS_SUBSCRIPTION_DOWNGRADE_BLOCKED.route,
                        },
                        [SCREENS.WORKSPACE.CURRENCY]: {
                            path: ROUTES.WORKSPACE_OVERVIEW_CURRENCY.route,
                        },
                        [SCREENS.WORKSPACE.ADDRESS]: {
                            path: ROUTES.WORKSPACE_OVERVIEW_ADDRESS.route,
                        },
                        [SCREENS.WORKSPACE.PLAN]: {
                            path: ROUTES.WORKSPACE_OVERVIEW_PLAN.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_IMPORT]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TAXES.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ADVANCED]: {
                            path: ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR]: {
                            path: ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR]: {
                            path: ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_AUTO_SYNC]: {
                            path: ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNTING_METHOD]: {
                            path: ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ADVANCED]: {
                            path: ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_AUTO_SYNC]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_AUTO_SYNC.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ACCOUNTING_METHOD]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ACCOUNTING_METHOD.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_PREFERRED_EXPORTER]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_MODAL]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC]: {
                            path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_IMPORT]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ITEMS]: {path: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ITEMS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_IMPORT]: {path: ROUTES.POLICY_ACCOUNTING_XERO_IMPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_CHART_OF_ACCOUNTS]: {path: ROUTES.POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_ORGANIZATION]: {path: ROUTES.POLICY_ACCOUNTING_XERO_ORGANIZATION.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_TRACKING_CATEGORIES]: {path: ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_MAP_TRACKING_CATEGORY]: {path: ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_CUSTOMER]: {path: ROUTES.POLICY_ACCOUNTING_XERO_CUSTOMER.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_TAXES]: {path: ROUTES.POLICY_ACCOUNTING_XERO_TAXES.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT]: {path: ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT]: {path: ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_BANK_ACCOUNT_SELECT]: {path: ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_BANK_ACCOUNT_SELECT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_ADVANCED]: {path: ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.CLAIM_OFFER]: {path: ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_AUTO_SYNC]: {path: ROUTES.POLICY_ACCOUNTING_XERO_AUTO_SYNC.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_ACCOUNTING_METHOD]: {path: ROUTES.POLICY_ACCOUNTING_XERO_ACCOUNTING_METHOD.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR]: {path: ROUTES.POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: {path: ROUTES.POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: {path: ROUTES.POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR]: {path: ROUTES.POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_SUBSIDIARY_SELECTOR]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TOKEN_INPUT]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REUSE_EXISTING_CONNECTIONS]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXISTING_CONNECTIONS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_MAPPING]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_MAPPING.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_VIEW]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_EDIT]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_EDIT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_LIST_ADD]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT]: {path: ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PREFERRED_EXPORTER_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_DATE_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_DATE_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_RECEIVABLE_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TAX_POSTING_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_TAX_POSTING_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_ADVANCED]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_COLLECTION_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_COLLECTION_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_APPROVAL_ACCOUNT_SELECT]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_APPROVAL_ACCOUNT_SELECT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_CUSTOM_FORM_ID]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_AUTO_SYNC]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_ACCOUNTING_METHOD]: {
                            path: ROUTES.POLICY_ACCOUNTING_NETSUITE_ACCOUNTING_METHOD.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.ENTER_SAGE_INTACCT_CREDENTIALS]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ENTITY]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX_MAPPING]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX_MAPPING.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_TOGGLE_MAPPING]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_USER_DIMENSIONS]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADD_USER_DIMENSION]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADD_USER_DIMENSION.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EDIT_USER_DIMENSION]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EDIT_USER_DIMENSION.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREFERRED_EXPORTER]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREFERRED_EXPORTER.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT_DATE]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_EXPENSES]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_DESTINATION]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_DESTINATION.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT]: {
                            path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADVANCED]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_AUTO_SYNC]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_AUTO_SYNC.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ACCOUNTING_METHOD]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ACCOUNTING_METHOD.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PAYMENT_ACCOUNT]: {path: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION]: {path: ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.route},
                        [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION_QUICKBOOKS_DESKTOP_AUTO_SYNC]: {
                            path: ROUTES.POLICY_ACCOUNTING_CARD_RECONCILIATION_QUICKBOOKS_DESKTOP_AUTO_SYNC.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION_SAGE_INTACCT_AUTO_SYNC]: {
                            path: ROUTES.POLICY_ACCOUNTING_CARD_RECONCILIATION_SAGE_INTACCT_AUTO_SYNC.route,
                        },
                        [SCREENS.WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS]: {path: ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.route},
                        [SCREENS.WORKSPACE.DESCRIPTION]: {
                            path: ROUTES.WORKSPACE_OVERVIEW_DESCRIPTION.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET.route,
                        },
                        [SCREENS.WORKSPACE.SHARE]: {
                            path: ROUTES.WORKSPACE_OVERVIEW_SHARE.route,
                        },
                        [SCREENS.WORKSPACE.INVOICES_COMPANY_NAME]: {
                            path: ROUTES.WORKSPACE_INVOICES_COMPANY_NAME.route,
                        },
                        [SCREENS.WORKSPACE.INVOICES_COMPANY_WEBSITE]: {
                            path: ROUTES.WORKSPACE_INVOICES_COMPANY_WEBSITE.route,
                        },
                        [SCREENS.WORKSPACE.INVOICES_VERIFY_ACCOUNT]: {
                            path: ROUTES.WORKSPACE_INVOICES_VERIFY_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARD_DETAILS]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARD_EDIT_CARD_NAME.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARD_EDIT_TRANSACTION_START_DATE]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARD_EDIT_TRANSACTION_START_DATE.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARD_EXPORT]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_LIMIT.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_CONFIRM_MAGIC_CODE.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_NAME]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_NAME.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_LIMIT_TYPE.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_FREQUENCY.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_ACCOUNT]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_SELECT_FEED]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_SELECT_FEED.route,
                        },
                        [SCREENS.WORKSPACE.TRAVEL_SETTINGS_ACCOUNT]: {
                            path: ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_FEED_NAME]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS_FEED_NAME.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_STATEMENT_CLOSE_DATE]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS_STATEMENT_CLOSE_DATE.route,
                        },
                        [SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS]: {
                            path: ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_NAME]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_NAME.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.route,
                        },
                        [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER]: {
                            path: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER.route,
                        },
                        [SCREENS.WORKSPACE.INVITE]: {
                            path: ROUTES.WORKSPACE_INVITE.route,
                        },
                        [SCREENS.WORKSPACE.MEMBERS_IMPORT]: {
                            path: ROUTES.WORKSPACE_MEMBERS_IMPORT.route,
                        },
                        [SCREENS.WORKSPACE.MEMBERS_IMPORTED]: {
                            path: ROUTES.WORKSPACE_MEMBERS_IMPORTED.route,
                        },
                        [SCREENS.WORKSPACE.MEMBERS_IMPORTED_CONFIRMATION]: {
                            path: ROUTES.WORKSPACE_MEMBERS_IMPORTED_CONFIRMATION.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_NEW]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER_CHANGE.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER.route,
                        },
                        [SCREENS.WORKSPACE.INVITE_MESSAGE]: {
                            path: ROUTES.WORKSPACE_INVITE_MESSAGE.route,
                        },
                        [SCREENS.WORKSPACE.INVITE_MESSAGE_ROLE]: {
                            path: ROUTES.WORKSPACE_INVITE_MESSAGE_ROLE.route,
                        },
                        [SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE]: {
                            path: ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE.route,
                        },
                        [SCREENS.WORKSPACE.RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT]: {
                            path: ROUTES.WORKSPACE_RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT.route,
                        },
                        [SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE_EDIT]: {
                            path: ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT.route,
                            screens: {
                                [CONST.TAB.RECEIPT_PARTNERS.ALL]: {
                                    path: ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT_ALL,
                                    exact: true,
                                },
                                [CONST.TAB.RECEIPT_PARTNERS.LINKED]: {
                                    path: ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT_LINKED,
                                    exact: true,
                                },
                                [CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING]: {
                                    path: ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT_OUTSTANDING,
                                    exact: true,
                                },
                            },
                        },
                        [SCREENS.WORKSPACE.CATEGORY_SETTINGS]: {
                            path: ROUTES.WORKSPACE_CATEGORY_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.UPGRADE]: {
                            path: ROUTES.WORKSPACE_UPGRADE.route,
                        },
                        [SCREENS.WORKSPACE.DOWNGRADE]: {
                            path: ROUTES.WORKSPACE_DOWNGRADE.route,
                        },
                        [SCREENS.WORKSPACE.PAY_AND_DOWNGRADE]: {
                            path: ROUTES.WORKSPACE_PAY_AND_DOWNGRADE.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: {
                            path: ROUTES.WORKSPACE_CATEGORIES_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORIES_IMPORT]: {
                            path: ROUTES.WORKSPACE_CATEGORIES_IMPORT.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORIES_IMPORTED]: {
                            path: ROUTES.WORKSPACE_CATEGORIES_IMPORTED.route,
                        },
                        [SCREENS.WORKSPACE.WORKFLOWS_PAYER]: {
                            path: ROUTES.WORKSPACE_WORKFLOWS_PAYER.route,
                        },
                        [SCREENS.WORKSPACE.MEMBER_DETAILS]: {
                            path: ROUTES.WORKSPACE_MEMBER_DETAILS.route,
                        },
                        [SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE]: {
                            path: ROUTES.WORKSPACE_MEMBER_DETAILS_ROLE.route,
                        },
                        [SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD]: {
                            path: ROUTES.WORKSPACE_CUSTOM_FIELDS.route,
                        },
                        [SCREENS.WORKSPACE.OWNER_CHANGE_SUCCESS]: {
                            path: ROUTES.WORKSPACE_OWNER_CHANGE_SUCCESS.route,
                        },
                        [SCREENS.WORKSPACE.OWNER_CHANGE_ERROR]: {
                            path: ROUTES.WORKSPACE_OWNER_CHANGE_ERROR.route,
                        },
                        [SCREENS.WORKSPACE.OWNER_CHANGE_CHECK]: {
                            path: ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_CREATE]: {
                            path: ROUTES.WORKSPACE_CATEGORY_CREATE.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_EDIT]: {
                            path: ROUTES.WORKSPACE_CATEGORY_EDIT.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_PAYROLL_CODE]: {
                            path: ROUTES.WORKSPACE_CATEGORY_PAYROLL_CODE.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_GL_CODE]: {
                            path: ROUTES.WORKSPACE_CATEGORY_GL_CODE.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_DEFAULT_TAX_RATE]: {
                            path: ROUTES.WORKSPACE_CATEGORY_DEFAULT_TAX_RATE.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_FLAG_AMOUNTS_OVER]: {
                            path: ROUTES.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_DESCRIPTION_HINT]: {
                            path: ROUTES.WORKSPACE_CATEGORY_DESCRIPTION_HINT.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_APPROVER]: {
                            path: ROUTES.WORKSPACE_CATEGORY_APPROVER.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_REQUIRE_RECEIPTS_OVER]: {
                            path: ROUTES.WORKSPACE_CATEGORY_REQUIRE_RECEIPTS_OVER.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_REQUIRE_ITEMIZED_RECEIPTS_OVER]: {
                            path: ROUTES.WORKSPACE_CATEGORY_REQUIRE_ITEMIZED_RECEIPTS_OVER.route,
                        },
                        [SCREENS.WORKSPACE.CATEGORY_REQUIRED_FIELDS]: {
                            path: ROUTES.WORKSPACE_CATEGORY_REQUIRED_FIELDS.route,
                        },
                        [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE]: {
                            path: ROUTES.WORKSPACE_CREATE_DISTANCE_RATE.route,
                        },
                        [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE_UPGRADE]: {
                            path: ROUTES.WORKSPACE_CREATE_DISTANCE_RATE_UPGRADE.route,
                        },
                        [SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS]: {
                            path: ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS]: {
                            path: ROUTES.WORKSPACE_DISTANCE_RATE_DETAILS.route,
                        },
                        [SCREENS.WORKSPACE.DISTANCE_RATE_EDIT]: {
                            path: ROUTES.WORKSPACE_DISTANCE_RATE_EDIT.route,
                        },
                        [SCREENS.WORKSPACE.DISTANCE_RATE_NAME_EDIT]: {
                            path: ROUTES.WORKSPACE_DISTANCE_RATE_NAME_EDIT.route,
                        },
                        [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT]: {
                            path: ROUTES.WORKSPACE_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT.route,
                        },
                        [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT]: {
                            path: ROUTES.WORKSPACE_DISTANCE_RATE_TAX_RATE_EDIT.route,
                        },
                        [SCREENS.WORKSPACE.TAGS_SETTINGS]: {
                            path: ROUTES.WORKSPACE_TAGS_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.TAGS_EDIT]: {
                            path: ROUTES.WORKSPACE_EDIT_TAGS.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.WORKSPACE.TAGS_IMPORT]: {
                            path: ROUTES.WORKSPACE_TAGS_IMPORT.route,
                        },
                        [SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS]: {
                            path: ROUTES.WORKSPACE_TAGS_IMPORT_OPTIONS.route,
                        },
                        [SCREENS.WORKSPACE.TAGS_IMPORT_MULTI_LEVEL_SETTINGS]: {
                            path: ROUTES.WORKSPACE_MULTI_LEVEL_TAGS_IMPORT_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.TAGS_IMPORTED]: {
                            path: ROUTES.WORKSPACE_TAGS_IMPORTED.route,
                        },
                        [SCREENS.WORKSPACE.TAGS_IMPORTED_MULTI_LEVEL]: {
                            path: ROUTES.WORKSPACE_TAGS_IMPORTED_MULTI_LEVEL.route,
                        },
                        [SCREENS.WORKSPACE.TAG_CREATE]: {
                            path: ROUTES.WORKSPACE_TAG_CREATE.route,
                        },
                        [SCREENS.WORKSPACE.TAG_EDIT]: {
                            path: ROUTES.WORKSPACE_TAG_EDIT.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.WORKSPACE.TAG_APPROVER]: {
                            path: ROUTES.WORKSPACE_TAG_APPROVER.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.WORKSPACE.TAG_GL_CODE]: {
                            path: ROUTES.WORKSPACE_TAG_GL_CODE.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.WORKSPACE.TAG_SETTINGS]: {
                            path: ROUTES.WORKSPACE_TAG_SETTINGS.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.WORKSPACE.TAG_LIST_VIEW]: {
                            path: ROUTES.WORKSPACE_TAG_LIST_VIEW.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.WORKSPACE.TAXES_SETTINGS]: {
                            path: ROUTES.WORKSPACE_TAXES_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.TAXES_SETTINGS_CUSTOM_TAX_NAME]: {
                            path: ROUTES.WORKSPACE_TAXES_SETTINGS_CUSTOM_TAX_NAME.route,
                        },
                        [SCREENS.WORKSPACE.TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT]: {
                            path: ROUTES.WORKSPACE_TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT.route,
                        },
                        [SCREENS.WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT]: {
                            path: ROUTES.WORKSPACE_TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT.route,
                        },
                        [SCREENS.WORKSPACE.REPORT_FIELDS_CREATE]: {
                            path: ROUTES.WORKSPACE_CREATE_REPORT_FIELD.route,
                        },
                        [SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES]: {
                            path: ROUTES.WORKSPACE_REPORT_FIELDS_LIST_VALUES.route,
                        },
                        [SCREENS.WORKSPACE.REPORT_FIELDS_ADD_VALUE]: {
                            path: ROUTES.WORKSPACE_REPORT_FIELDS_ADD_VALUE.route,
                        },
                        [SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS]: {
                            path: ROUTES.WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_VALUE]: {
                            path: ROUTES.WORKSPACE_REPORT_FIELDS_EDIT_VALUE.route,
                        },
                        [SCREENS.WORKSPACE.REPORT_FIELDS_SETTINGS]: {
                            path: ROUTES.WORKSPACE_REPORT_FIELDS_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE]: {
                            path: ROUTES.WORKSPACE_EDIT_REPORT_FIELDS_INITIAL_VALUE.route,
                        },
                        [SCREENS.CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT_ROOT]: {
                            path: ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.REIMBURSEMENT_ACCOUNT]: {
                            path: ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.route,
                            exact: true,
                        },
                        [SCREENS.REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT]: {
                            path: ROUTES.BANK_ACCOUNT_VERIFY_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO]: ROUTES.BANK_ACCOUNT_ENTER_SIGNER_INFO.route,
                        [SCREENS.KEYBOARD_SHORTCUTS]: {
                            path: ROUTES.KEYBOARD_SHORTCUTS.route,
                        },
                        [SCREENS.WORKSPACE.NAME]: ROUTES.WORKSPACE_OVERVIEW_NAME.route,
                        [SCREENS.SETTINGS.SHARE_CODE]: {
                            path: ROUTES.SETTINGS_SHARE_CODE,
                        },
                        [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: {
                            path: ROUTES.SETTINGS_EXIT_SURVEY_REASON,
                        },
                        [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: {
                            path: ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.route,
                        },
                        [SCREENS.WORKSPACE.TAX_CREATE]: {
                            path: ROUTES.WORKSPACE_TAX_CREATE.route,
                        },
                        [SCREENS.WORKSPACE.TAX_EDIT]: {
                            path: ROUTES.WORKSPACE_TAX_EDIT.route,
                        },
                        [SCREENS.WORKSPACE.TAX_CODE]: {
                            path: ROUTES.WORKSPACE_TAX_CODE.route,
                        },
                        [SCREENS.WORKSPACE.TAX_NAME]: {
                            path: ROUTES.WORKSPACE_TAX_NAME.route,
                        },
                        [SCREENS.WORKSPACE.TAX_VALUE]: {
                            path: ROUTES.WORKSPACE_TAX_VALUE.route,
                        },
                        [SCREENS.WORKSPACE.REPORTS_DEFAULT_TITLE]: {
                            path: ROUTES.REPORTS_DEFAULT_TITLE.route,
                        },
                        [SCREENS.WORKSPACE.RULES_AUTO_APPROVE_REPORTS_UNDER]: {
                            path: ROUTES.RULES_AUTO_APPROVE_REPORTS_UNDER.route,
                        },
                        [SCREENS.WORKSPACE.RULES_RANDOM_REPORT_AUDIT]: {
                            path: ROUTES.RULES_RANDOM_REPORT_AUDIT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_AUTO_PAY_REPORTS_UNDER]: {
                            path: ROUTES.RULES_AUTO_PAY_REPORTS_UNDER.route,
                        },
                        [SCREENS.WORKSPACE.RULES_RECEIPT_REQUIRED_AMOUNT]: {
                            path: ROUTES.RULES_RECEIPT_REQUIRED_AMOUNT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT]: {
                            path: ROUTES.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AMOUNT]: {
                            path: ROUTES.RULES_MAX_EXPENSE_AMOUNT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AGE]: {
                            path: ROUTES.RULES_MAX_EXPENSE_AGE.route,
                        },
                        [SCREENS.WORKSPACE.RULES_BILLABLE_DEFAULT]: {
                            path: ROUTES.RULES_BILLABLE_DEFAULT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_REIMBURSABLE_DEFAULT]: {
                            path: ROUTES.RULES_REIMBURSABLE_DEFAULT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_CUSTOM]: {
                            path: ROUTES.RULES_CUSTOM.route,
                        },
                        [SCREENS.WORKSPACE.RULES_PROHIBITED_DEFAULT]: {
                            path: ROUTES.RULES_PROHIBITED_DEFAULT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_NEW]: {
                            path: ROUTES.RULES_MERCHANT_NEW.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH]: {
                            path: ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_MATCH_TYPE]: {
                            path: ROUTES.RULES_MERCHANT_MATCH_TYPE.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT]: {
                            path: ROUTES.RULES_MERCHANT_MERCHANT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_CATEGORY]: {
                            path: ROUTES.RULES_MERCHANT_CATEGORY.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_TAG]: {
                            path: ROUTES.RULES_MERCHANT_TAG.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_TAX]: {
                            path: ROUTES.RULES_MERCHANT_TAX.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_DESCRIPTION]: {
                            path: ROUTES.RULES_MERCHANT_DESCRIPTION.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_REIMBURSABLE]: {
                            path: ROUTES.RULES_MERCHANT_REIMBURSABLE.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_BILLABLE]: {
                            path: ROUTES.RULES_MERCHANT_BILLABLE.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_EDIT]: {
                            path: ROUTES.RULES_MERCHANT_EDIT.route,
                        },
                        [SCREENS.WORKSPACE.PER_DIEM_IMPORT]: {
                            path: ROUTES.WORKSPACE_PER_DIEM_IMPORT.route,
                        },
                        [SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES]: {
                            path: ROUTES.RULES_MERCHANT_PREVIEW_MATCHES.route,
                        },
                        [SCREENS.WORKSPACE.PER_DIEM_IMPORTED]: {
                            path: ROUTES.WORKSPACE_PER_DIEM_IMPORTED.route,
                        },
                        [SCREENS.WORKSPACE.PER_DIEM_SETTINGS]: {
                            path: ROUTES.WORKSPACE_PER_DIEM_SETTINGS.route,
                        },
                        [SCREENS.WORKSPACE.PER_DIEM_DETAILS]: {
                            path: ROUTES.WORKSPACE_PER_DIEM_DETAILS.route,
                        },
                        [SCREENS.WORKSPACE.PER_DIEM_EDIT_DESTINATION]: {
                            path: ROUTES.WORKSPACE_PER_DIEM_EDIT_DESTINATION.route,
                        },
                        [SCREENS.WORKSPACE.PER_DIEM_EDIT_SUBRATE]: {
                            path: ROUTES.WORKSPACE_PER_DIEM_EDIT_SUBRATE.route,
                        },
                        [SCREENS.WORKSPACE.PER_DIEM_EDIT_AMOUNT]: {
                            path: ROUTES.WORKSPACE_PER_DIEM_EDIT_AMOUNT.route,
                        },
                        [SCREENS.WORKSPACE.PER_DIEM_EDIT_CURRENCY]: {
                            path: ROUTES.WORKSPACE_PER_DIEM_EDIT_CURRENCY.route,
                        },
                        [SCREENS.WORKSPACE.TIME_TRACKING_DEFAULT_RATE]: {
                            path: ROUTES.WORKSPACE_TIME_TRACKING_DEFAULT_RATE.route,
                        },
                        [SCREENS.DOMAIN.VERIFY]: {
                            path: ROUTES.DOMAIN_VERIFY.route,
                        },
                        [SCREENS.DOMAIN.ADD_ADMIN]: {
                            path: ROUTES.DOMAIN_ADD_ADMIN.route,
                        },
                        [SCREENS.DOMAIN.VERIFIED]: {
                            path: ROUTES.DOMAIN_VERIFIED.route,
                        },
                        [SCREENS.DOMAIN.ADMIN_DETAILS]: {
                            path: ROUTES.DOMAIN_ADMIN_DETAILS.route,
                        },
                        [SCREENS.DOMAIN.ADMINS_SETTINGS]: {
                            path: ROUTES.DOMAIN_ADMINS_SETTINGS.route,
                        },
                        [SCREENS.DOMAIN.ADD_PRIMARY_CONTACT]: {
                            path: ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.route,
                        },
                        [SCREENS.DOMAIN.MEMBER_DETAILS]: {
                            path: ROUTES.DOMAIN_MEMBER_DETAILS.route,
                        },
                        [SCREENS.DOMAIN.RESET_DOMAIN]: {
                            path: ROUTES.DOMAIN_RESET_DOMAIN.route,
                        },
                        [SCREENS.DOMAIN.ADD_MEMBER]: {
                            path: ROUTES.DOMAIN_ADD_MEMBER.route,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH]: {
                    screens: {
                        [SCREENS.TWO_FACTOR_AUTH.VERIFY_ACCOUNT]: {
                            path: ROUTES.SETTINGS_2FA_VERIFY_ACCOUNT.route,
                            exact: true,
                        },
                        [SCREENS.TWO_FACTOR_AUTH.ROOT]: {
                            path: ROUTES.SETTINGS_2FA_ROOT.route,
                            exact: true,
                        },
                        [SCREENS.TWO_FACTOR_AUTH.VERIFY]: {
                            path: ROUTES.SETTINGS_2FA_VERIFY.route,
                            exact: true,
                        },
                        [SCREENS.TWO_FACTOR_AUTH.SUCCESS]: {
                            path: ROUTES.SETTINGS_2FA_SUCCESS.route,
                            exact: true,
                        },
                        [SCREENS.TWO_FACTOR_AUTH.DISABLED]: {
                            path: ROUTES.SETTINGS_2FA_DISABLED,
                            exact: true,
                        },
                        [SCREENS.TWO_FACTOR_AUTH.DISABLE]: {
                            path: ROUTES.SETTINGS_2FA_DISABLE,
                            exact: true,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.PRIVATE_NOTES]: {
                    screens: {
                        [SCREENS.PRIVATE_NOTES.LIST]: ROUTES.PRIVATE_NOTES_LIST.route,
                        [SCREENS.PRIVATE_NOTES.EDIT]: ROUTES.PRIVATE_NOTES_EDIT.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.NEW_REPORT_WORKSPACE_SELECTION]: {
                    screens: {
                        [SCREENS.NEW_REPORT_WORKSPACE_SELECTION.ROOT]: ROUTES.NEW_REPORT_WORKSPACE_SELECTION.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.REPORT_DETAILS]: {
                    screens: {
                        [SCREENS.REPORT_DETAILS.ROOT]: ROUTES.REPORT_WITH_ID_DETAILS.route,
                        [SCREENS.REPORT_DETAILS.SHARE_CODE]: ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.route,
                        [SCREENS.REPORT_DETAILS.EXPORT]: ROUTES.REPORT_WITH_ID_DETAILS_EXPORT.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.REPORT_CARD_ACTIVATE]: {
                    screens: {
                        [SCREENS.REPORT_CARD_ACTIVATE]: ROUTES.REPORT_CARD_ACTIVATE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.REPORT_CHANGE_WORKSPACE]: {
                    screens: {
                        [SCREENS.REPORT_CHANGE_WORKSPACE.ROOT]: ROUTES.REPORT_WITH_ID_CHANGE_WORKSPACE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.REPORT_SETTINGS]: {
                    screens: {
                        [SCREENS.REPORT_SETTINGS.ROOT]: {
                            path: ROUTES.REPORT_SETTINGS.route,
                        },
                        [SCREENS.REPORT_SETTINGS.NAME]: {
                            path: ROUTES.REPORT_SETTINGS_NAME.route,
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
                        [SCREENS.REPORT_SETTINGS.REPORT_LAYOUT]: {
                            path: ROUTES.REPORT_SETTINGS_REPORT_LAYOUT.route,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.SETTINGS_CATEGORIES]: {
                    screens: {
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS]: {
                            path: ROUTES.SETTINGS_CATEGORY_SETTINGS.route,
                        },
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS]: {
                            path: ROUTES.SETTINGS_CATEGORIES_SETTINGS.route,
                        },
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE]: {
                            path: ROUTES.SETTINGS_CATEGORY_CREATE.route,
                        },
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_EDIT]: {
                            path: ROUTES.SETTINGS_CATEGORY_EDIT.route,
                        },
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORT]: {
                            path: ROUTES.SETTINGS_CATEGORIES_IMPORT.route,
                        },
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED]: {
                            path: ROUTES.SETTINGS_CATEGORIES_IMPORTED.route,
                        },
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_PAYROLL_CODE]: {
                            path: ROUTES.SETTINGS_CATEGORY_PAYROLL_CODE.route,
                        },
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_GL_CODE]: {
                            path: ROUTES.SETTINGS_CATEGORY_GL_CODE.route,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.SETTINGS_TAGS]: {
                    screens: {
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_SETTINGS]: {
                            path: ROUTES.SETTINGS_TAGS_SETTINGS.route,
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_EDIT]: {
                            path: ROUTES.SETTINGS_TAGS_EDIT.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_CREATE]: {
                            path: ROUTES.SETTINGS_TAG_CREATE.route,
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_EDIT]: {
                            path: ROUTES.SETTINGS_TAG_EDIT.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_SETTINGS]: {
                            path: ROUTES.SETTINGS_TAG_SETTINGS.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_APPROVER]: {
                            path: ROUTES.SETTINGS_TAG_APPROVER.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_LIST_VIEW]: {
                            path: ROUTES.SETTINGS_TAG_LIST_VIEW.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_GL_CODE]: {
                            path: ROUTES.SETTINGS_TAG_GL_CODE.route,
                            parse: {
                                orderWeight: Number,
                            },
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORT]: {
                            path: ROUTES.SETTINGS_TAGS_IMPORT.route,
                        },
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORTED]: {
                            path: ROUTES.SETTINGS_TAGS_IMPORTED.route,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.EXPENSIFY_CARD]: {
                    screens: {
                        [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_DETAILS]: {
                            path: ROUTES.EXPENSIFY_CARD_DETAILS.route,
                        },
                        [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_NAME]: {
                            path: ROUTES.EXPENSIFY_CARD_NAME.route,
                        },
                        [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT]: {
                            path: ROUTES.EXPENSIFY_CARD_LIMIT.route,
                        },
                        [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT_TYPE]: {
                            path: ROUTES.EXPENSIFY_CARD_LIMIT_TYPE.route,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.DOMAIN_CARD]: {
                    screens: {
                        [SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL]: {
                            path: ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.route,
                        },
                        [SCREENS.DOMAIN_CARD.DOMAIN_CARD_REPORT_FRAUD]: {
                            path: ROUTES.SETTINGS_DOMAIN_CARD_REPORT_FRAUD.route,
                        },
                        [SCREENS.DOMAIN_CARD.DOMAIN_CARD_UPDATE_ADDRESS]: {
                            path: ROUTES.SETTINGS_DOMAIN_CARD_UPDATE_ADDRESS.route,
                        },
                        [SCREENS.DOMAIN_CARD.DOMAIN_CARD_CONFIRM_MAGIC_CODE]: {
                            path: ROUTES.SETTINGS_DOMAIN_CARD_CONFIRM_MAGIC_CODE.route,
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
                        [SCREENS.NEW_CHAT.NEW_CHAT_CONFIRM]: {
                            path: ROUTES.NEW_CHAT_CONFIRM,
                            exact: true,
                        },
                        [SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME]: {
                            path: ROUTES.NEW_CHAT_EDIT_NAME,
                            exact: true,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.WORKSPACE_CONFIRMATION]: {
                    screens: {
                        [SCREENS.WORKSPACE_CONFIRMATION.ROOT]: ROUTES.WORKSPACE_CONFIRMATION.route,
                        [SCREENS.CURRENCY.SELECTION]: ROUTES.CURRENCY_SELECTION.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.WORKSPACE_DUPLICATE]: {
                    screens: {
                        [SCREENS.WORKSPACE_DUPLICATE.ROOT]: ROUTES.WORKSPACE_DUPLICATE.route,
                        [SCREENS.WORKSPACE_DUPLICATE.SELECT_FEATURES]: ROUTES.WORKSPACE_DUPLICATE_SELECT_FEATURES.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.NEW_TASK]: {
                    screens: {
                        [SCREENS.NEW_TASK.ROOT]: ROUTES.NEW_TASK.route,
                        [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: ROUTES.NEW_TASK_ASSIGNEE.route,
                        [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: ROUTES.NEW_TASK_SHARE_DESTINATION,
                        [SCREENS.NEW_TASK.DETAILS]: ROUTES.NEW_TASK_DETAILS.route,
                        [SCREENS.NEW_TASK.TITLE]: ROUTES.NEW_TASK_TITLE.route,
                        [SCREENS.NEW_TASK.DESCRIPTION]: ROUTES.NEW_TASK_DESCRIPTION.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.TEACHERS_UNITE]: {
                    screens: {
                        [SCREENS.I_KNOW_A_TEACHER]: ROUTES.I_KNOW_A_TEACHER,
                        [SCREENS.INTRO_SCHOOL_PRINCIPAL]: ROUTES.INTRO_SCHOOL_PRINCIPAL,
                        [SCREENS.I_AM_A_TEACHER]: ROUTES.I_AM_A_TEACHER,
                    },
                },
                [SCREENS.RIGHT_MODAL.PROFILE]: {
                    screens: {
                        [SCREENS.PROFILE_ROOT]: ROUTES.PROFILE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.PARTICIPANTS]: {
                    screens: {
                        [SCREENS.REPORT_PARTICIPANTS.ROOT]: ROUTES.REPORT_PARTICIPANTS.route,
                        [SCREENS.REPORT_PARTICIPANTS.INVITE]: ROUTES.REPORT_PARTICIPANTS_INVITE.route,
                        [SCREENS.REPORT_PARTICIPANTS.DETAILS]: ROUTES.REPORT_PARTICIPANTS_DETAILS.route,
                        [SCREENS.REPORT_PARTICIPANTS.ROLE]: ROUTES.REPORT_PARTICIPANTS_ROLE_SELECTION.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.ROOM_MEMBERS]: {
                    screens: {
                        [SCREENS.ROOM_MEMBERS.ROOT]: ROUTES.ROOM_MEMBERS.route,
                        [SCREENS.ROOM_MEMBERS.INVITE]: ROUTES.ROOM_INVITE.route,
                        [SCREENS.ROOM_MEMBERS.DETAILS]: ROUTES.ROOM_MEMBER_DETAILS.route,
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
                                },
                                manual: {
                                    path: ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.route,
                                },
                                scan: {
                                    path: ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.route,
                                },
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'per-diem': {
                                    path: ROUTES.MONEY_REQUEST_CREATE_TAB_PER_DIEM.route,
                                },
                                time: {
                                    path: ROUTES.MONEY_REQUEST_CREATE_TAB_TIME.route,
                                },
                            },
                        },
                        [SCREENS.MONEY_REQUEST.DISTANCE_CREATE]: {
                            path: ROUTES.DISTANCE_REQUEST_CREATE.route,
                            exact: true,
                            screens: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'distance-map': {
                                    path: ROUTES.DISTANCE_REQUEST_CREATE_TAB_MAP.route,
                                },
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'distance-manual': {
                                    path: ROUTES.DISTANCE_REQUEST_CREATE_TAB_MANUAL.route,
                                },
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'distance-gps': {
                                    path: ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.route,
                                },
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'distance-odometer': {
                                    path: ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.route,
                                },
                            },
                        },
                        [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT]: ROUTES.SETTINGS_CATEGORIES_ROOT.route,
                        [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_ROOT]: ROUTES.SETTINGS_TAGS_ROOT.route,
                        [SCREENS.MONEY_REQUEST.EDIT_REPORT]: ROUTES.MONEY_REQUEST_EDIT_REPORT.route,
                        [SCREENS.MONEY_REQUEST.STEP_SEND_FROM]: ROUTES.MONEY_REQUEST_STEP_SEND_FROM.route,
                        [SCREENS.MONEY_REQUEST.STEP_REPORT]: ROUTES.MONEY_REQUEST_STEP_REPORT.route,
                        [SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO]: ROUTES.MONEY_REQUEST_STEP_COMPANY_INFO.route,
                        [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: ROUTES.MONEY_REQUEST_STEP_AMOUNT.route,
                        [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: ROUTES.MONEY_REQUEST_STEP_CATEGORY.route,
                        [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.route,
                        [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION_VERIFY_ACCOUNT]: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT.route,
                        [SCREENS.MONEY_REQUEST.STEP_DATE]: ROUTES.MONEY_REQUEST_STEP_DATE.route,
                        [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.route,
                        [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: ROUTES.MONEY_REQUEST_STEP_DISTANCE.route,
                        [SCREENS.MONEY_REQUEST.STEP_DISTANCE_MANUAL]: ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.route,
                        [SCREENS.MONEY_REQUEST.STEP_DISTANCE_ODOMETER]: ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.route,
                        [SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE]: ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.route,
                        [SCREENS.MONEY_REQUEST.HOLD]: ROUTES.MONEY_REQUEST_HOLD_REASON.route,
                        [SCREENS.MONEY_REQUEST.REJECT]: ROUTES.REJECT_MONEY_REQUEST_REASON.route,
                        [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: ROUTES.MONEY_REQUEST_STEP_MERCHANT.route,
                        [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.route,
                        [SCREENS.MONEY_REQUEST.STEP_SCAN]: ROUTES.MONEY_REQUEST_STEP_SCAN.route,
                        [SCREENS.MONEY_REQUEST.RECEIPT_VIEW]: ROUTES.MONEY_REQUEST_RECEIPT_VIEW.route,
                        [SCREENS.MONEY_REQUEST.STEP_TAG]: ROUTES.MONEY_REQUEST_STEP_TAG.route,
                        [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: ROUTES.MONEY_REQUEST_STEP_WAYPOINT.route,
                        [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.route,
                        [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: ROUTES.MONEY_REQUEST_STEP_TAX_RATE.route,
                        [SCREENS.MONEY_REQUEST.STATE_SELECTOR]: {
                            path: ROUTES.MONEY_REQUEST_STATE_SELECTOR.route,
                            exact: true,
                        },
                        [SCREENS.MONEY_REQUEST.STEP_ATTENDEES]: ROUTES.MONEY_REQUEST_ATTENDEE.route,
                        [SCREENS.MONEY_REQUEST.STEP_ACCOUNTANT]: ROUTES.MONEY_REQUEST_ACCOUNTANT.route,
                        [SCREENS.MONEY_REQUEST.STEP_UPGRADE]: ROUTES.MONEY_REQUEST_UPGRADE.route,
                        [SCREENS.MONEY_REQUEST.STEP_DESTINATION]: ROUTES.MONEY_REQUEST_STEP_DESTINATION.route,
                        [SCREENS.MONEY_REQUEST.STEP_TIME]: ROUTES.MONEY_REQUEST_STEP_TIME.route,
                        [SCREENS.MONEY_REQUEST.STEP_SUBRATE]: ROUTES.MONEY_REQUEST_STEP_SUBRATE.route,
                        [SCREENS.MONEY_REQUEST.STEP_DESTINATION_EDIT]: ROUTES.MONEY_REQUEST_STEP_DESTINATION_EDIT.route,
                        [SCREENS.MONEY_REQUEST.STEP_TIME_EDIT]: ROUTES.MONEY_REQUEST_STEP_TIME_EDIT.route,
                        [SCREENS.MONEY_REQUEST.STEP_SUBRATE_EDIT]: ROUTES.MONEY_REQUEST_STEP_SUBRATE_EDIT.route,
                        [SCREENS.MONEY_REQUEST.STEP_TIME_RATE]: ROUTES.MONEY_REQUEST_STEP_TIME_RATE.route,
                        [SCREENS.MONEY_REQUEST.STEP_HOURS]: ROUTES.MONEY_REQUEST_STEP_HOURS.route,
                        [SCREENS.MONEY_REQUEST.STEP_HOURS_EDIT]: ROUTES.MONEY_REQUEST_STEP_HOURS_EDIT.route,
                        [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: ROUTES.IOU_SEND_ENABLE_PAYMENTS,
                        [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: ROUTES.IOU_SEND_ADD_BANK_ACCOUNT,
                        [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: ROUTES.IOU_SEND_ADD_DEBIT_CARD,
                        [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE]: {
                            path: ROUTES.SPLIT_EXPENSE.route,
                            exact: true,
                            screens: {
                                [CONST.TAB.SPLIT.AMOUNT]: {
                                    path: CONST.TAB.SPLIT.AMOUNT,
                                },
                                [CONST.TAB.SPLIT.PERCENTAGE]: {
                                    path: CONST.TAB.SPLIT.PERCENTAGE,
                                },
                                [CONST.TAB.SPLIT.DATE]: {
                                    path: CONST.TAB.SPLIT.DATE,
                                },
                            },
                        },
                        [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_SEARCH]: {
                            path: ROUTES.SPLIT_EXPENSE_SEARCH.route,
                            exact: true,
                            screens: {
                                [CONST.TAB.SPLIT.AMOUNT]: {
                                    path: CONST.TAB.SPLIT.AMOUNT,
                                },
                                [CONST.TAB.SPLIT.PERCENTAGE]: {
                                    path: CONST.TAB.SPLIT.PERCENTAGE,
                                },
                                [CONST.TAB.SPLIT.DATE]: {
                                    path: CONST.TAB.SPLIT.DATE,
                                },
                            },
                        },
                        [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_CREATE_DATE_RANGE]: {
                            path: ROUTES.SPLIT_EXPENSE_CREATE_DATE_RANGE.route,
                            exact: true,
                        },
                        [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_EDIT]: {
                            path: ROUTES.SPLIT_EXPENSE_EDIT.route,
                            exact: true,
                        },
                        [SCREENS.SET_DEFAULT_WORKSPACE]: ROUTES.SET_DEFAULT_WORKSPACE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE]: {
                    screens: {
                        [SCREENS.TRANSACTION_DUPLICATE.REVIEW]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.TRANSACTION_DUPLICATE.MERCHANT]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.TRANSACTION_DUPLICATE.CATEGORY]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.TRANSACTION_DUPLICATE.TAG]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.TRANSACTION_DUPLICATE.DESCRIPTION]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.TRANSACTION_DUPLICATE.TAX_CODE]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.TRANSACTION_DUPLICATE.REIMBURSABLE]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.TRANSACTION_DUPLICATE.BILLABLE]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.TRANSACTION_DUPLICATE.CONFIRMATION]: {
                            path: ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.route,
                            exact: true,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.MERGE_TRANSACTION]: {
                    screens: {
                        [SCREENS.MERGE_TRANSACTION.LIST_PAGE]: ROUTES.MERGE_TRANSACTION_LIST_PAGE.route,
                        [SCREENS.MERGE_TRANSACTION.RECEIPT_PAGE]: ROUTES.MERGE_TRANSACTION_RECEIPT_PAGE.route,
                        [SCREENS.MERGE_TRANSACTION.DETAILS_PAGE]: ROUTES.MERGE_TRANSACTION_DETAILS_PAGE.route,
                        [SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE]: ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.SPLIT_DETAILS]: {
                    screens: {
                        [SCREENS.SPLIT_DETAILS.ROOT]: ROUTES.SPLIT_BILL_DETAILS.route,
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
                        [SCREENS.EDIT_REQUEST.REPORT_FIELD]: {
                            path: ROUTES.EDIT_REPORT_FIELD_REQUEST.route,
                        },
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
                [SCREENS.RIGHT_MODAL.REPORT_VERIFY_ACCOUNT]: {
                    screens: {
                        [SCREENS.REPORT_VERIFY_ACCOUNT]: ROUTES.REPORT_VERIFY_ACCOUNT.route,
                        [SCREENS.EXPENSE_REPORT_VERIFY_ACCOUNT]: ROUTES.EXPENSE_REPORT_VERIFY_ACCOUNT.route,
                        [SCREENS.SEARCH.REPORT_VERIFY_ACCOUNT]: ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.TRAVEL]: {
                    screens: {
                        [SCREENS.TRAVEL.MY_TRIPS]: ROUTES.TRAVEL_MY_TRIPS.route,
                        [SCREENS.TRAVEL.TRAVEL_DOT_LINK_WEB_VIEW]: ROUTES.TRAVEL_DOT_LINK_WEB_VIEW.route,
                        [SCREENS.TRAVEL.UPGRADE]: ROUTES.TRAVEL_UPGRADE.route,
                        [SCREENS.TRAVEL.TCS]: ROUTES.TRAVEL_TCS.route,
                        [SCREENS.TRAVEL.TRIP_SUMMARY]: ROUTES.TRAVEL_TRIP_SUMMARY.route,
                        [SCREENS.TRAVEL.TRIP_DETAILS]: {
                            path: ROUTES.TRAVEL_TRIP_DETAILS.route,
                            parse: {
                                reservationIndex: (reservationIndex: string) => parseInt(reservationIndex, 10),
                            },
                        },
                        [SCREENS.TRAVEL.DOMAIN_SELECTOR]: ROUTES.TRAVEL_DOMAIN_SELECTOR.route,
                        [SCREENS.TRAVEL.DOMAIN_PERMISSION_INFO]: ROUTES.TRAVEL_DOMAIN_PERMISSION_INFO.route,
                        [SCREENS.TRAVEL.PUBLIC_DOMAIN_ERROR]: ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.route,
                        [SCREENS.TRAVEL.WORKSPACE_CONFIRMATION]: ROUTES.TRAVEL_WORKSPACE_CONFIRMATION.route,
                        [SCREENS.TRAVEL.WORKSPACE_ADDRESS]: ROUTES.TRAVEL_WORKSPACE_ADDRESS.route,
                        [SCREENS.TRAVEL.VERIFY_ACCOUNT]: ROUTES.TRAVEL_VERIFY_ACCOUNT.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.SEARCH_COLUMNS]: {
                    screens: {
                        [SCREENS.SEARCH.COLUMNS_RHP]: ROUTES.SEARCH_COLUMNS,
                    },
                },
                [SCREENS.RIGHT_MODAL.SEARCH_REPORT]: ROUTES.SEARCH_REPORT.route,
                [SCREENS.RIGHT_MODAL.SEARCH_REPORT_ACTIONS]: {
                    screens: {
                        [SCREENS.SEARCH.ROOT_VERIFY_ACCOUNT]: ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT,
                        [SCREENS.SEARCH.MONEY_REQUEST_REPORT_VERIFY_ACCOUNT]: ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.route,
                        [SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS]: ROUTES.SEARCH_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS.route,
                        [SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS]: ROUTES.SEARCH_MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS.route,
                        [SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP]: ROUTES.TRANSACTION_HOLD_REASON_RHP,
                        [SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP]: ROUTES.SEARCH_REJECT_REASON_RHP,
                        [SCREENS.SEARCH.TRANSACTIONS_CHANGE_REPORT_SEARCH_RHP]: ROUTES.MOVE_TRANSACTIONS_SEARCH_RHP,
                    },
                },
                [SCREENS.RIGHT_MODAL.SEARCH_ADVANCED_FILTERS]: {
                    screens: {
                        [SCREENS.SEARCH.ADVANCED_FILTERS_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_TYPE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_GROUP_BY_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_BY),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_VIEW_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.VIEW),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_STATUS_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_DATE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_SUBMITTED_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_APPROVED_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_PAID_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_EXPORTED_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_POSTED_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_WITHDRAWN_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_CURRENCY_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_GROUP_CURRENCY_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_CURRENCY),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_MERCHANT_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_DESCRIPTION_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_REPORT_ID_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.REPORT_ID),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_AMOUNT_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_TOTAL_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_CATEGORY_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_KEYWORD_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_CARD_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CARD_ID),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_TAX_RATE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAX_RATE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_EXPENSE_TYPE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.EXPENSE_TYPE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_WITHDRAWAL_TYPE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.WITHDRAWAL_TYPE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_IS_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IS),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_WITHDRAWAL_ID_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.WITHDRAWAL_ID),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_TAG_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_FROM_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_TO_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TO),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_IN_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.IN),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_TITLE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_ASSIGNEE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_BILLABLE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_REIMBURSABLE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_WORKSPACE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_HAS_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.HAS),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_LIMIT_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.LIMIT),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_PURCHASE_AMOUNT_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.PURCHASE_AMOUNT),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_PURCHASE_CURRENCY_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.PURCHASE_CURRENCY),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_ATTENDEE_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.ATTENDEE),
                        [SCREENS.SEARCH.ADVANCED_FILTERS_REPORT_FIELD_RHP]: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.REPORT_FIELD),
                    },
                },
                [SCREENS.RIGHT_MODAL.SEARCH_SAVED_SEARCH]: {
                    screens: {
                        [SCREENS.SEARCH.SAVED_SEARCH_RENAME_RHP]: ROUTES.SEARCH_SAVED_SEARCH_RENAME.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.RESTRICTED_ACTION]: {
                    screens: {
                        [SCREENS.RESTRICTED_ACTION_ROOT]: ROUTES.RESTRICTED_ACTION.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.MISSING_PERSONAL_DETAILS]: {
                    screens: {
                        [SCREENS.MISSING_PERSONAL_DETAILS]: {
                            path: ROUTES.MISSING_PERSONAL_DETAILS.route,
                            exact: true,
                        },
                        [SCREENS.MISSING_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE]: ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE,
                    },
                },
                [SCREENS.RIGHT_MODAL.ADD_UNREPORTED_EXPENSE]: {
                    screens: {
                        [SCREENS.ADD_UNREPORTED_EXPENSES_ROOT]: ROUTES.ADD_UNREPORTED_EXPENSE.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.DEBUG]: {
                    screens: {
                        [SCREENS.DEBUG.REPORT]: {
                            path: ROUTES.DEBUG_REPORT.route,
                            exact: true,
                            screens: {
                                details: {
                                    path: ROUTES.DEBUG_REPORT_TAB_DETAILS.route,
                                    exact: true,
                                },
                                json: {
                                    path: ROUTES.DEBUG_REPORT_TAB_JSON.route,
                                    exact: true,
                                },
                                actions: {
                                    path: ROUTES.DEBUG_REPORT_TAB_ACTIONS.route,
                                    exact: true,
                                },
                            },
                        },
                        [SCREENS.DEBUG.REPORT_ACTION]: {
                            path: ROUTES.DEBUG_REPORT_ACTION.route,
                            exact: true,
                            screens: {
                                details: {
                                    path: ROUTES.DEBUG_REPORT_ACTION_TAB_DETAILS.route,
                                    exact: true,
                                },
                                json: {
                                    path: ROUTES.DEBUG_REPORT_ACTION_TAB_JSON.route,
                                    exact: true,
                                },
                                preview: {
                                    path: ROUTES.DEBUG_REPORT_ACTION_TAB_PREVIEW.route,
                                    exact: true,
                                },
                            },
                        },
                        [SCREENS.DEBUG.REPORT_ACTION_CREATE]: {
                            path: ROUTES.DEBUG_REPORT_ACTION_CREATE.route,
                            exact: true,
                        },
                        [SCREENS.DEBUG.DETAILS_CONSTANT_PICKER_PAGE]: {
                            path: ROUTES.DETAILS_CONSTANT_PICKER_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.DEBUG.DETAILS_DATE_TIME_PICKER_PAGE]: {
                            path: ROUTES.DETAILS_DATE_TIME_PICKER_PAGE.route,
                            exact: true,
                        },
                        [SCREENS.DEBUG.TRANSACTION]: {
                            path: ROUTES.DEBUG_TRANSACTION.route,
                            exact: true,
                            screens: {
                                details: {
                                    path: ROUTES.DEBUG_TRANSACTION_TAB_DETAILS.route,
                                    exact: true,
                                },
                                json: {
                                    path: ROUTES.DEBUG_TRANSACTION_TAB_JSON.route,
                                    exact: true,
                                },
                                violations: {
                                    path: ROUTES.DEBUG_TRANSACTION_TAB_VIOLATIONS.route,
                                    exact: true,
                                },
                            },
                        },
                        [SCREENS.DEBUG.TRANSACTION_VIOLATION_CREATE]: {
                            path: ROUTES.DEBUG_TRANSACTION_VIOLATION_CREATE.route,
                            exact: true,
                        },
                        [SCREENS.DEBUG.TRANSACTION_VIOLATION]: {
                            path: ROUTES.DEBUG_TRANSACTION_VIOLATION.route,
                            exact: true,
                            screens: {
                                details: {
                                    path: ROUTES.DEBUG_TRANSACTION_VIOLATION_TAB_DETAILS.route,
                                    exact: true,
                                },
                                json: {
                                    path: ROUTES.DEBUG_TRANSACTION_VIOLATION_TAB_JSON.route,
                                    exact: true,
                                },
                            },
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.SCHEDULE_CALL]: {
                    screens: {
                        [SCREENS.SCHEDULE_CALL.BOOK]: {
                            path: ROUTES.SCHEDULE_CALL_BOOK.route,
                        },
                        [SCREENS.SCHEDULE_CALL.CONFIRMATION]: {
                            path: ROUTES.SCHEDULE_CALL_CONFIRMATION.route,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.REPORT_CHANGE_APPROVER]: {
                    screens: {
                        [SCREENS.REPORT_CHANGE_APPROVER.ROOT]: ROUTES.REPORT_CHANGE_APPROVER.route,
                        [SCREENS.REPORT_CHANGE_APPROVER.ADD_APPROVER]: ROUTES.REPORT_CHANGE_APPROVER_ADD_APPROVER.route,
                    },
                },
                [SCREENS.RIGHT_MODAL.EXPENSE_REPORT]: ROUTES.EXPENSE_REPORT_RHP.route,
                [SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT]: ROUTES.SEARCH_MONEY_REQUEST_REPORT.route,
                [SCREENS.RIGHT_MODAL.DOMAIN]: {
                    screens: {
                        [SCREENS.WORKSPACES_VERIFY_DOMAIN]: {
                            path: ROUTES.WORKSPACES_VERIFY_DOMAIN.route,
                            exact: true,
                        },
                        [SCREENS.WORKSPACES_DOMAIN_VERIFIED]: {
                            path: ROUTES.WORKSPACES_DOMAIN_VERIFIED.route,
                            exact: true,
                        },
                        [SCREENS.WORKSPACES_ADD_DOMAIN]: ROUTES.WORKSPACES_ADD_DOMAIN,
                        [SCREENS.WORKSPACES_ADD_DOMAIN_VERIFY_ACCOUNT]: ROUTES.WORKSPACES_ADD_DOMAIN_VERIFY_ACCOUNT,
                        [SCREENS.WORKSPACES_DOMAIN_ADDED]: {
                            path: ROUTES.WORKSPACES_DOMAIN_ADDED.route,
                            exact: true,
                        },
                        [SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED]: {
                            path: ROUTES.WORKSPACES_DOMAIN_ACCESS_RESTRICTED.route,
                            exact: true,
                        },
                    },
                },
                [SCREENS.RIGHT_MODAL.MULTIFACTOR_AUTHENTICATION]: {
                    screens: {
                        [SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE]: ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE,
                        [SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST]: ROUTES.MULTIFACTOR_AUTHENTICATION_BIOMETRICS_TEST,
                        [SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME]: ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.route,
                        [SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT]: ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.route,
                        [SCREENS.MULTIFACTOR_AUTHENTICATION.NOT_FOUND]: ROUTES.MULTIFACTOR_AUTHENTICATION_NOT_FOUND,
                        [SCREENS.MULTIFACTOR_AUTHENTICATION.REVOKE]: ROUTES.MULTIFACTOR_AUTHENTICATION_REVOKE,
                    },
                },
            },
        },

        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: {
            path: ROUTES.ROOT,
            screens: {
                [SCREENS.INBOX]: {
                    path: ROUTES.INBOX,
                    exact: true,
                },
                [SCREENS.REPORT]: {
                    path: ROUTES.REPORT_WITH_ID.route,
                    // If params are defined, but reportID is explicitly undefined, we will get the url /r/undefined.
                    // We want to avoid that situation, so we will return an empty string instead.
                    parse: {
                        // eslint-disable-next-line
                        reportID: (reportID: string | undefined) => reportID ?? '',
                    },
                    stringify: {
                        // eslint-disable-next-line
                        reportID: (reportID: string | undefined) => reportID ?? '',
                    },
                },
            },
        },

        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: {
            screens: {
                [SCREENS.SETTINGS.ROOT]: ROUTES.SETTINGS,
                [SCREENS.SETTINGS.PROFILE.ROOT]: {
                    path: ROUTES.SETTINGS_PROFILE.route,
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
                [SCREENS.SETTINGS.RULES.ROOT]: {
                    path: ROUTES.SETTINGS_RULES,
                    exact: true,
                },
                [SCREENS.SETTINGS.ABOUT]: {
                    path: ROUTES.SETTINGS_ABOUT,
                    exact: true,
                },
                [SCREENS.SETTINGS.TROUBLESHOOT]: {
                    path: ROUTES.SETTINGS_TROUBLESHOOT,
                    exact: true,
                },
                [SCREENS.SETTINGS.SAVE_THE_WORLD]: ROUTES.SETTINGS_SAVE_THE_WORLD,
                [SCREENS.SETTINGS.PREFERENCES.ROOT]: {
                    path: ROUTES.SETTINGS_PREFERENCES,
                    // exact: true,
                },
                [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: ROUTES.SETTINGS_SUBSCRIPTION.route,
            },
        },

        [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: {
            // The path given as initialRouteName does not have route params.
            // initialRouteName is not defined in this split navigator because in this case the initial route requires a policyID defined in its route params.
            screens: {
                [SCREENS.WORKSPACE.INITIAL]: {
                    path: ROUTES.WORKSPACE_INITIAL.route,
                },
                [SCREENS.WORKSPACE.PROFILE]: ROUTES.WORKSPACE_OVERVIEW.route,
                [SCREENS.WORKSPACE.EXPENSIFY_CARD]: {
                    path: ROUTES.WORKSPACE_EXPENSIFY_CARD.route,
                },
                [SCREENS.WORKSPACE.COMPANY_CARDS]: {
                    path: ROUTES.WORKSPACE_COMPANY_CARDS.route,
                },
                [SCREENS.WORKSPACE.PER_DIEM]: {
                    path: ROUTES.WORKSPACE_PER_DIEM.route,
                },
                [SCREENS.WORKSPACE.RECEIPT_PARTNERS]: {
                    path: ROUTES.WORKSPACE_RECEIPT_PARTNERS.route,
                },
                [SCREENS.WORKSPACE.WORKFLOWS]: {
                    path: ROUTES.WORKSPACE_WORKFLOWS.route,
                },
                [SCREENS.WORKSPACE.INVOICES]: {
                    path: ROUTES.WORKSPACE_INVOICES.route,
                },
                [SCREENS.WORKSPACE.MEMBERS]: {
                    path: ROUTES.WORKSPACE_MEMBERS.route,
                },
                [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: {
                    path: ROUTES.POLICY_ACCOUNTING.route,
                },
                [SCREENS.WORKSPACE.CATEGORIES]: {
                    path: ROUTES.WORKSPACE_CATEGORIES.route,
                },
                [SCREENS.WORKSPACE.MORE_FEATURES]: {
                    path: ROUTES.WORKSPACE_MORE_FEATURES.route,
                },
                [SCREENS.WORKSPACE.TAGS]: {
                    path: ROUTES.WORKSPACE_TAGS.route,
                },
                [SCREENS.WORKSPACE.TAXES]: {
                    path: ROUTES.WORKSPACE_TAXES.route,
                },
                [SCREENS.WORKSPACE.REPORTS]: {
                    path: ROUTES.WORKSPACE_REPORTS.route,
                },
                [SCREENS.WORKSPACE.DISTANCE_RATES]: {
                    path: ROUTES.WORKSPACE_DISTANCE_RATES.route,
                },
                [SCREENS.WORKSPACE.TRAVEL]: {
                    path: ROUTES.WORKSPACE_TRAVEL.route,
                },
                [SCREENS.WORKSPACE.RULES]: {
                    path: ROUTES.WORKSPACE_RULES.route,
                },
                [SCREENS.WORKSPACE.TIME_TRACKING]: {
                    path: ROUTES.WORKSPACE_TIME_TRACKING.route,
                },
            },
        },

        [NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR]: {
            screens: {
                [SCREENS.DOMAIN.INITIAL]: {
                    path: ROUTES.DOMAIN_INITIAL.route,
                },
                [SCREENS.DOMAIN.SAML]: {
                    path: ROUTES.DOMAIN_SAML.route,
                },
                [SCREENS.DOMAIN.ADMINS]: {
                    path: ROUTES.DOMAIN_ADMINS.route,
                },
                [SCREENS.DOMAIN.MEMBERS]: {
                    path: ROUTES.DOMAIN_MEMBERS.route,
                },
            },
        },

        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: {
            screens: {
                [SCREENS.SEARCH.ROOT]: {
                    path: ROUTES.SEARCH_ROOT.route,
                },
            },
        },
        [NAVIGATORS.SHARE_MODAL_NAVIGATOR]: {
            initialRouteName: SCREENS.SHARE.ROOT,
            screens: {
                [SCREENS.SHARE.ROOT]: {
                    path: ROUTES.SHARE_ROOT,
                    screens: {
                        [CONST.TAB.SHARE.SHARE]: {
                            path: ROUTES.SHARE_ROOT_SHARE,
                            exact: true,
                        },
                        [CONST.TAB.SHARE.SUBMIT]: {
                            path: ROUTES.SHARE_ROOT_SUBMIT,
                            exact: true,
                        },
                    },
                },
                [SCREENS.SHARE.SHARE_DETAILS]: {path: ROUTES.SHARE_DETAILS.route},
                [SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT]: {path: ROUTES.SHARE_DETAILS_ATTACHMENT},
                [SCREENS.SHARE.SUBMIT_DETAILS]: {path: ROUTES.SHARE_SUBMIT_DETAILS.route},
            },
        },
        [NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR]: {
            screens: {
                [SCREENS.TEST_TOOLS_MODAL.ROOT]: {
                    path: ROUTES.TEST_TOOLS_MODAL.route,
                    exact: true,
                },
            },
        },
    },
};

const normalizedConfigs = Object.keys(config.screens)
    .map((key) =>
        createNormalizedConfigs(
            key,
            config.screens,
            [],
            config.initialRouteName
                ? [
                      {
                          initialRouteName: config.initialRouteName,
                          parentScreens: [],
                      },
                  ]
                : [],
            [],
        ),
    )
    .flat()
    .reduce(
        (acc, route) => {
            acc[route.screen as Screen] = route;
            return acc;
        },
        {} as Record<Screen, RouteConfig>,
    );

export {normalizedConfigs, config};

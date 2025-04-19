
let _a;
    let _b;
    let _c;
    let _d;
    let _e;
    let _f;
    let _g;
    let _h;
    let _j;
    let _k;
    let _l;
    let _m;
    let _o;
    let _p;
    let _q;
    let _r;
    let _s;
    let _t;
    let _u;
    let _v;
    let _w;
    let _x;
    let _y;
    let _z;
    let _0;
    let _1;
    let _2;
    let _3;
    let _4;
    let _5;
    let _6;
    let _7;
    let _8;
    let _9;
    let _10;
    let _11;
    let _12;
    let _13;
    let _14;
    let _15;
    let _16;
    let _17;
    let _18;
    let _19;
    let _20;
    let _21;
    let _22;
    let _23;
    let _24;
    let _25;
    let _26;
    let _27;
    let _28;
exports.__esModule = true;
exports.config = exports.normalizedConfigs = void 0;
const createNormalizedConfigs_1 = require('@libs/Navigation/helpers/createNormalizedConfigs');
const NAVIGATORS_1 = require('@src/NAVIGATORS');
const ROUTES_1 = require('@src/ROUTES');
const SCREENS_1 = require('@src/SCREENS');
// Moved to a separate file to avoid cyclic dependencies.
const config = {
    screens:
        ((_a = {}),
        // Main Routes
        (_a[SCREENS_1['default'].VALIDATE_LOGIN] = ROUTES_1['default'].VALIDATE_LOGIN),
        (_a[SCREENS_1['default'].UNLINK_LOGIN] = ROUTES_1['default'].UNLINK_LOGIN),
        (_a[SCREENS_1['default'].TRANSITION_BETWEEN_APPS] = ROUTES_1['default'].TRANSITION_BETWEEN_APPS),
        (_a[SCREENS_1['default'].CONNECTION_COMPLETE] = ROUTES_1['default'].CONNECTION_COMPLETE),
        (_a[SCREENS_1['default'].BANK_CONNECTION_COMPLETE] = ROUTES_1['default'].BANK_CONNECTION_COMPLETE),
        (_a[SCREENS_1['default'].CONCIERGE] = ROUTES_1['default'].CONCIERGE),
        (_a[SCREENS_1['default'].TRACK_EXPENSE] = ROUTES_1['default'].TRACK_EXPENSE),
        (_a[SCREENS_1['default'].SUBMIT_EXPENSE] = ROUTES_1['default'].SUBMIT_EXPENSE),
        (_a[SCREENS_1['default'].SIGN_IN_WITH_APPLE_DESKTOP] = ROUTES_1['default'].APPLE_SIGN_IN),
        (_a[SCREENS_1['default'].SIGN_IN_WITH_GOOGLE_DESKTOP] = ROUTES_1['default'].GOOGLE_SIGN_IN),
        (_a[SCREENS_1['default'].SAML_SIGN_IN] = ROUTES_1['default'].SAML_SIGN_IN),
        (_a[SCREENS_1['default'].DESKTOP_SIGN_IN_REDIRECT] = ROUTES_1['default'].DESKTOP_SIGN_IN_REDIRECT),
        (_a[SCREENS_1['default'].ATTACHMENTS] = ROUTES_1['default'].ATTACHMENTS.route),
        (_a[SCREENS_1['default'].PROFILE_AVATAR] = ROUTES_1['default'].PROFILE_AVATAR.route),
        (_a[SCREENS_1['default'].WORKSPACE_AVATAR] = ROUTES_1['default'].WORKSPACE_AVATAR.route),
        (_a[SCREENS_1['default'].REPORT_AVATAR] = ROUTES_1['default'].REPORT_AVATAR.route),
        (_a[SCREENS_1['default'].TRANSACTION_RECEIPT] = ROUTES_1['default'].TRANSACTION_RECEIPT.route),
        (_a[SCREENS_1['default'].WORKSPACE_JOIN_USER] = ROUTES_1['default'].WORKSPACE_JOIN_USER.route),
        (_a[SCREENS_1['default'].REQUIRE_TWO_FACTOR_AUTH] = ROUTES_1['default'].REQUIRE_TWO_FACTOR_AUTH),
        (_a[SCREENS_1['default'].NOT_FOUND] = '*'),
        (_a[NAVIGATORS_1['default'].LEFT_MODAL_NAVIGATOR] = {
            screens:
                ((_b = {}),
                (_b[SCREENS_1['default'].LEFT_MODAL.WORKSPACE_SWITCHER] = {
                    path: ROUTES_1['default'].WORKSPACE_SWITCHER,
                }),
                _b),
        }),
        (_a[NAVIGATORS_1['default'].PUBLIC_RIGHT_MODAL_NAVIGATOR] = {
            screens:
                ((_c = {}),
                (_c[SCREENS_1['default'].PUBLIC_CONSOLE_DEBUG] = {
                    path: ROUTES_1['default'].PUBLIC_CONSOLE_DEBUG.route,
                    exact: true,
                }),
                _c),
        }),
        (_a[NAVIGATORS_1['default'].FEATURE_TRANING_MODAL_NAVIGATOR] = {
            screens:
                ((_d = {}),
                (_d[SCREENS_1['default'].FEATURE_TRAINING_ROOT] = {
                    path: ROUTES_1['default'].TRACK_TRAINING_MODAL,
                    exact: true,
                }),
                (_d[SCREENS_1['default'].PROCESS_MONEY_REQUEST_HOLD_ROOT] = ROUTES_1['default'].PROCESS_MONEY_REQUEST_HOLD.route),
                (_d[SCREENS_1['default'].CHANGE_POLICY_EDUCATIONAL_ROOT] = ROUTES_1['default'].CHANGE_POLICY_EDUCATIONAL.route),
                _d),
        }),
        (_a[NAVIGATORS_1['default'].WELCOME_VIDEO_MODAL_NAVIGATOR] = {
            screens:
                ((_e = {}),
                (_e[SCREENS_1['default'].WELCOME_VIDEO.ROOT] = {
                    path: ROUTES_1['default'].WELCOME_VIDEO_ROOT,
                    exact: true,
                }),
                _e),
        }),
        (_a[NAVIGATORS_1['default'].EXPLANATION_MODAL_NAVIGATOR] = {
            screens:
                ((_f = {}),
                (_f[SCREENS_1['default'].EXPLANATION_MODAL.ROOT] = {
                    path: ROUTES_1['default'].EXPLANATION_MODAL_ROOT,
                    exact: true,
                }),
                _f),
        }),
        (_a[NAVIGATORS_1['default'].MIGRATED_USER_MODAL_NAVIGATOR] = {
            screens:
                ((_g = {}),
                (_g[SCREENS_1['default'].MIGRATED_USER_WELCOME_MODAL.ROOT] = {
                    path: ROUTES_1['default'].MIGRATED_USER_WELCOME_MODAL,
                    exact: true,
                }),
                _g),
        }),
        (_a[NAVIGATORS_1['default'].TEST_DRIVE_MODAL_NAVIGATOR] = {
            screens:
                ((_h = {}),
                (_h[SCREENS_1['default'].TEST_DRIVE_MODAL.ROOT] = {
                    path: ROUTES_1['default'].TEST_DRIVE_MODAL_ROOT,
                    exact: true,
                }),
                _h),
        }),
        (_a[NAVIGATORS_1['default'].ONBOARDING_MODAL_NAVIGATOR] = {
            // Don't set the initialRouteName, because when the user continues from the last visited onboarding page,
            // the onboarding purpose page will be briefly visible.
            path: ROUTES_1['default'].ONBOARDING_ROOT.route,
            screens:
                ((_j = {}),
                (_j[SCREENS_1['default'].ONBOARDING.WORK_EMAIL] = {
                    path: ROUTES_1['default'].ONBOARDING_WORK_EMAIL.route,
                    exact: true,
                }),
                (_j[SCREENS_1['default'].ONBOARDING.WORK_EMAIL_VALIDATION] = {
                    path: ROUTES_1['default'].ONBOARDING_WORK_EMAIL_VALIDATION.route,
                    exact: true,
                }),
                (_j[SCREENS_1['default'].ONBOARDING.PURPOSE] = {
                    path: ROUTES_1['default'].ONBOARDING_PURPOSE.route,
                    exact: true,
                }),
                (_j[SCREENS_1['default'].ONBOARDING.PERSONAL_DETAILS] = {
                    path: ROUTES_1['default'].ONBOARDING_PERSONAL_DETAILS.route,
                    exact: true,
                }),
                (_j[SCREENS_1['default'].ONBOARDING.PRIVATE_DOMAIN] = {
                    path: ROUTES_1['default'].ONBOARDING_PRIVATE_DOMAIN.route,
                    exact: true,
                }),
                (_j[SCREENS_1['default'].ONBOARDING.EMPLOYEES] = {
                    path: ROUTES_1['default'].ONBOARDING_EMPLOYEES.route,
                    exact: true,
                }),
                (_j[SCREENS_1['default'].ONBOARDING.ACCOUNTING] = {
                    path: ROUTES_1['default'].ONBOARDING_ACCOUNTING.route,
                    exact: true,
                }),
                (_j[SCREENS_1['default'].ONBOARDING.WORKSPACES] = {
                    path: ROUTES_1['default'].ONBOARDING_WORKSPACES.route,
                    exact: true,
                }),
                _j),
        }),
        (_a[NAVIGATORS_1['default'].RIGHT_MODAL_NAVIGATOR] = {
            screens:
                ((_k = {}),
                (_k[SCREENS_1['default'].RIGHT_MODAL.SETTINGS] = {
                    screens:
                        ((_l = {}),
                        (_l[SCREENS_1['default'].SETTINGS.PREFERENCES.PRIORITY_MODE] = {
                            path: ROUTES_1['default'].SETTINGS_PRIORITY_MODE,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PREFERENCES.LANGUAGE] = {
                            path: ROUTES_1['default'].SETTINGS_LANGUAGE,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD] = {
                            path: ROUTES_1['default'].SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY] = {
                            path: ROUTES_1['default'].SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.SUBSCRIPTION.CHANGE_PAYMENT_CURRENCY] = {
                            path: ROUTES_1['default'].SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.ADD_PAYMENT_CARD_CHANGE_CURRENCY] = {
                            path: ROUTES_1['default'].SETTINGS_CHANGE_CURRENCY,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PREFERENCES.THEME] = {
                            path: ROUTES_1['default'].SETTINGS_THEME,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PREFERENCES.PAYMENT_CURRENCY] = {
                            path: ROUTES_1['default'].SETTINGS_PAYMENT_CURRENCY,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.CLOSE] = {
                            path: ROUTES_1['default'].SETTINGS_CLOSE,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS] = {
                            path: ROUTES_1['default'].SETTINGS_MERGE_ACCOUNTS.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.MERGE_ACCOUNTS.ACCOUNT_VALIDATE] = {
                            path: ROUTES_1['default'].SETTINGS_MERGE_ACCOUNTS_MAGIC_CODE.route,
                            parse: {
                                login (login) {
                                    return decodeURIComponent(login);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT] = {
                            path: ROUTES_1['default'].SETTINGS_MERGE_ACCOUNTS_RESULT.route,
                            parse: {
                                login (login) {
                                    return decodeURIComponent(login);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.VERIFY_ACCOUNT] = {
                            path: ROUTES_1['default'].SETTINGS_WALLET_VERIFY_ACCOUNT.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.DOMAIN_CARD] = {
                            path: ROUTES_1['default'].SETTINGS_WALLET_DOMAINCARD.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD] = {
                            path: ROUTES_1['default'].SETTINGS_REPORT_FRAUD.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD_CONFIRMATION] = {
                            path: ROUTES_1['default'].SETTINGS_REPORT_FRAUD_CONFIRMATION.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.ENABLE_PAYMENTS] = {
                            path: ROUTES_1['default'].SETTINGS_ENABLE_PAYMENTS,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.TRANSFER_BALANCE] = {
                            path: ROUTES_1['default'].SETTINGS_WALLET_TRANSFER_BALANCE,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT] = {
                            path: ROUTES_1['default'].SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.REPORT_CARD_LOST_OR_DAMAGED] = {
                            path: ROUTES_1['default'].SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.CARD_ACTIVATE] = {
                            path: ROUTES_1['default'].SETTINGS_WALLET_CARD_ACTIVATE.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS] = {
                            path: ROUTES_1['default'].SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.ADD_DEBIT_CARD] = {
                            path: ROUTES_1['default'].SETTINGS_ADD_DEBIT_CARD,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.ADD_BANK_ACCOUNT] = {
                            path: ROUTES_1['default'].SETTINGS_ADD_BANK_ACCOUNT,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.ADD_US_BANK_ACCOUNT] = {
                            path: ROUTES_1['default'].SETTINGS_ADD_US_BANK_ACCOUNT,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.PRONOUNS] = {
                            path: ROUTES_1['default'].SETTINGS_PRONOUNS,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.DISPLAY_NAME] = {
                            path: ROUTES_1['default'].SETTINGS_DISPLAY_NAME,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.TIMEZONE] = {
                            path: ROUTES_1['default'].SETTINGS_TIMEZONE,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.TIMEZONE_SELECT] = {
                            path: ROUTES_1['default'].SETTINGS_TIMEZONE_SELECT,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.APP_DOWNLOAD_LINKS] = {
                            path: ROUTES_1['default'].SETTINGS_APP_DOWNLOAD_LINKS,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.CONSOLE] = {
                            path: ROUTES_1['default'].SETTINGS_CONSOLE.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.SHARE_LOG] = ROUTES_1['default'].SETTINGS_SHARE_LOG.route),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.CONTACT_METHODS] = {
                            path: ROUTES_1['default'].SETTINGS_CONTACT_METHODS.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.CONTACT_METHOD_DETAILS] = {
                            path: ROUTES_1['default'].SETTINGS_CONTACT_METHOD_DETAILS.route,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.NEW_CONTACT_METHOD] = {
                            path: ROUTES_1['default'].SETTINGS_NEW_CONTACT_METHOD.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.LEGAL_NAME] = {
                            path: ROUTES_1['default'].SETTINGS_LEGAL_NAME,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.PHONE_NUMBER] = {
                            path: ROUTES_1['default'].SETTINGS_PHONE_NUMBER,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.DATE_OF_BIRTH] = {
                            path: ROUTES_1['default'].SETTINGS_DATE_OF_BIRTH,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.ADDRESS] = {
                            path: ROUTES_1['default'].SETTINGS_ADDRESS,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.ADDRESS_COUNTRY] = {
                            path: ROUTES_1['default'].SETTINGS_ADDRESS_COUNTRY.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.ADDRESS_STATE] = {
                            path: ROUTES_1['default'].SETTINGS_ADDRESS_STATE.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.DELEGATE.ADD_DELEGATE] = {
                            path: ROUTES_1['default'].SETTINGS_ADD_DELEGATE,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.DELEGATE.DELEGATE_ROLE] = {
                            path: ROUTES_1['default'].SETTINGS_DELEGATE_ROLE.route,
                            parse: {
                                login (login) {
                                    return decodeURIComponent(login);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE] = {
                            path: ROUTES_1['default'].SETTINGS_UPDATE_DELEGATE_ROLE.route,
                            parse: {
                                login (login) {
                                    return decodeURIComponent(login);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.DELEGATE.DELEGATE_CONFIRM] = {
                            path: ROUTES_1['default'].SETTINGS_DELEGATE_CONFIRM.route,
                            parse: {
                                login (login) {
                                    return decodeURIComponent(login);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.STATUS] = {
                            path: ROUTES_1['default'].SETTINGS_STATUS,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.STATUS_CLEAR_AFTER] = {
                            path: ROUTES_1['default'].SETTINGS_STATUS_CLEAR_AFTER,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE] = {
                            path: ROUTES_1['default'].SETTINGS_STATUS_CLEAR_AFTER_DATE,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME] = {
                            path: ROUTES_1['default'].SETTINGS_STATUS_CLEAR_AFTER_TIME,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.SUBSCRIPTION.SETTINGS_DETAILS] = {
                            path: ROUTES_1['default'].SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.SUBSCRIPTION.SIZE] = {
                            path: ROUTES_1['default'].SETTINGS_SUBSCRIPTION_SIZE.route,
                            parse: {
                                canChangeSize: Number,
                            },
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.SUBSCRIPTION.DISABLE_AUTO_RENEW_SURVEY] = {
                            path: ROUTES_1['default'].SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.SUBSCRIPTION.REQUEST_EARLY_CANCELLATION] = {
                            path: ROUTES_1['default'].SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CURRENCY] = {
                            path: ROUTES_1['default'].WORKSPACE_OVERVIEW_CURRENCY.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ADDRESS] = {
                            path: ROUTES_1['default'].WORKSPACE_OVERVIEW_ADDRESS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PLAN] = {
                            path: ROUTES_1['default'].WORKSPACE_OVERVIEW_PLAN.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_IMPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TAXES.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ADVANCED] = {
                            path: ROUTES_1['default'].WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR] = {
                            path: ROUTES_1['default'].WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR] = {
                            path: ROUTES_1['default'].WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_AUTO_SYNC] = {
                            path: ROUTES_1['default'].WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNTING_METHOD] = {
                            path: ROUTES_1['default'].WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ADVANCED] = {
                            path: ROUTES_1['default'].WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_PREFERRED_EXPORTER] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_MODAL] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_IMPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ITEMS] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ITEMS.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_IMPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_IMPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_CHART_OF_ACCOUNTS] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_ORGANIZATION] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_ORGANIZATION.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_TRACKING_CATEGORIES] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_MAP_TRACKING_CATEGORY] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_CUSTOMER] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_CUSTOMER.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_TAXES] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_TAXES.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_EXPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_EXPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_EXPORT_BANK_ACCOUNT_SELECT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_EXPORT_BANK_ACCOUNT_SELECT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_ADVANCED] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_ADVANCED.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_SUBSIDIARY_SELECTOR] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_TOKEN_INPUT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_REUSE_EXISTING_CONNECTIONS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_EXISTING_CONNECTIONS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_MAPPING] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT_MAPPING.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_VIEW] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_EDIT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_EDIT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_LIST_ADD] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_EXPORT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_EXPORT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_PREFERRED_EXPORTER_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_DATE_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_DATE_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_RECEIVABLE_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_TAX_POSTING_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_TAX_POSTING_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_ADVANCED] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_ADVANCED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_COLLECTION_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_COLLECTION_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_APPROVAL_ACCOUNT_SELECT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_APPROVAL_ACCOUNT_SELECT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_CUSTOM_FORM_ID] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_AUTO_SYNC] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.NETSUITE_ACCOUNTING_METHOD] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_NETSUITE_ACCOUNTING_METHOD.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.ENTER_SAGE_INTACCT_CREDENTIALS] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_ENTITY] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX_MAPPING] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX_MAPPING.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_TOGGLE_MAPPING] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_USER_DIMENSIONS] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADD_USER_DIMENSION] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_ADD_USER_DIMENSION.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_EDIT_USER_DIMENSION] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_EDIT_USER_DIMENSION.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREFERRED_EXPORTER] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_PREFERRED_EXPORTER.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT_DATE] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_EXPENSES] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_DESTINATION] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_DESTINATION.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT] = {
                            path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADVANCED] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.SAGE_INTACCT_PAYMENT_ACCOUNT] = {path: ROUTES_1['default'].POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.CARD_RECONCILIATION] = {path: ROUTES_1['default'].WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.route}),
                        (_l[SCREENS_1['default'].WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.DESCRIPTION] = {
                            path: ROUTES_1['default'].WORKSPACE_OVERVIEW_DESCRIPTION.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY] = {
                            path: ROUTES_1['default'].WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET] = {
                            path: ROUTES_1['default'].WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.SHARE] = {
                            path: ROUTES_1['default'].WORKSPACE_OVERVIEW_SHARE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.INVOICES_COMPANY_NAME] = {
                            path: ROUTES_1['default'].WORKSPACE_INVOICES_COMPANY_NAME.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.INVOICES_COMPANY_WEBSITE] = {
                            path: ROUTES_1['default'].WORKSPACE_INVOICES_COMPANY_WEBSITE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARDS_SELECT_FEED] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARDS_SELECT_FEED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARDS_BANK_CONNECTION] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARD_DETAILS] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARD_DETAILS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARD_NAME] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARD_NAME.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARD_EXPORT] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARD_EXPORT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_LIMIT] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_LIMIT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_NAME] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_NAME.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_LIMIT_TYPE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_SETTINGS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_SETTINGS_FREQUENCY.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_SETTINGS_ACCOUNT] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_SELECT_FEED] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_SELECT_FEED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARDS_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARDS_SETTINGS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARDS_SETTINGS_FEED_NAME] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARDS_SETTINGS_FEED_NAME.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD_DETAILS] = {
                            path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD_DETAILS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARDS_ADD_NEW] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARDS_ADD_NEW.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARDS_ASSIGN_CARD] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.COMPANY_CARDS_TRANSACTION_START_DATE] = {
                            path: ROUTES_1['default'].WORKSPACE_COMPANY_CARDS_TRANSACTION_START_DATE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.INVITE] = {
                            path: ROUTES_1['default'].WORKSPACE_INVITE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.MEMBERS_IMPORT] = {
                            path: ROUTES_1['default'].WORKSPACE_MEMBERS_IMPORT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.MEMBERS_IMPORTED] = {
                            path: ROUTES_1['default'].WORKSPACE_MEMBERS_IMPORTED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.WORKFLOWS_APPROVALS_NEW] = {
                            path: ROUTES_1['default'].WORKSPACE_WORKFLOWS_APPROVALS_NEW.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.WORKFLOWS_APPROVALS_EDIT] = {
                            path: ROUTES_1['default'].WORKSPACE_WORKFLOWS_APPROVALS_EDIT.route,
                            parse: {
                                firstApproverEmail (firstApproverEmail) {
                                    return decodeURIComponent(firstApproverEmail);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM] = {
                            path: ROUTES_1['default'].WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.WORKFLOWS_APPROVALS_APPROVER] = {
                            path: ROUTES_1['default'].WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.INVITE_MESSAGE] = {
                            path: ROUTES_1['default'].WORKSPACE_INVITE_MESSAGE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_CATEGORY_SETTINGS.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.UPGRADE] = {
                            path: ROUTES_1['default'].WORKSPACE_UPGRADE.route,
                            parse: {
                                featureName (featureName) {
                                    return decodeURIComponent(featureName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.DOWNGRADE] = {
                            path: ROUTES_1['default'].WORKSPACE_DOWNGRADE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PAY_AND_DOWNGRADE] = {
                            path: ROUTES_1['default'].WORKSPACE_PAY_AND_DOWNGRADE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORIES_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_CATEGORIES_SETTINGS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORIES_IMPORT] = {
                            path: ROUTES_1['default'].WORKSPACE_CATEGORIES_IMPORT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORIES_IMPORTED] = {
                            path: ROUTES_1['default'].WORKSPACE_CATEGORIES_IMPORTED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.WORKFLOWS_PAYER] = {
                            path: ROUTES_1['default'].WORKSPACE_WORKFLOWS_PAYER.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.MEMBER_DETAILS] = {
                            path: ROUTES_1['default'].WORKSPACE_MEMBER_DETAILS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.MEMBER_NEW_CARD] = {
                            path: ROUTES_1['default'].WORKSPACE_MEMBER_NEW_CARD.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.OWNER_CHANGE_SUCCESS] = {
                            path: ROUTES_1['default'].WORKSPACE_OWNER_CHANGE_SUCCESS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.OWNER_CHANGE_ERROR] = {
                            path: ROUTES_1['default'].WORKSPACE_OWNER_CHANGE_ERROR.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.OWNER_CHANGE_CHECK] = {
                            path: ROUTES_1['default'].WORKSPACE_OWNER_CHANGE_CHECK.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_CREATE] = {
                            path: ROUTES_1['default'].WORKSPACE_CATEGORY_CREATE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_EDIT] = {
                            path: ROUTES_1['default'].WORKSPACE_CATEGORY_EDIT.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_PAYROLL_CODE] = {
                            path: ROUTES_1['default'].WORKSPACE_CATEGORY_PAYROLL_CODE.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_GL_CODE] = {
                            path: ROUTES_1['default'].WORKSPACE_CATEGORY_GL_CODE.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_DEFAULT_TAX_RATE] = {
                            path: ROUTES_1['default'].WORSKPACE_CATEGORY_DEFAULT_TAX_RATE.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_FLAG_AMOUNTS_OVER] = {
                            path: ROUTES_1['default'].WORSKPACE_CATEGORY_FLAG_AMOUNTS_OVER.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_DESCRIPTION_HINT] = {
                            path: ROUTES_1['default'].WORSKPACE_CATEGORY_DESCRIPTION_HINT.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_APPROVER] = {
                            path: ROUTES_1['default'].WORSKPACE_CATEGORY_APPROVER.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CATEGORY_REQUIRE_RECEIPTS_OVER] = {
                            path: ROUTES_1['default'].WORSKPACE_CATEGORY_REQUIRE_RECEIPTS_OVER.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.CREATE_DISTANCE_RATE] = {
                            path: ROUTES_1['default'].WORKSPACE_CREATE_DISTANCE_RATE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.DISTANCE_RATES_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_DISTANCE_RATES_SETTINGS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.DISTANCE_RATE_DETAILS] = {
                            path: ROUTES_1['default'].WORKSPACE_DISTANCE_RATE_DETAILS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.DISTANCE_RATE_EDIT] = {
                            path: ROUTES_1['default'].WORKSPACE_DISTANCE_RATE_EDIT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT] = {
                            path: ROUTES_1['default'].WORKSPACE_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT] = {
                            path: ROUTES_1['default'].WORKSPACE_DISTANCE_RATE_TAX_RATE_EDIT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAGS_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_TAGS_SETTINGS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAGS_EDIT] = {
                            path: ROUTES_1['default'].WORKSPACE_EDIT_TAGS.route,
                            parse: {
                                orderWeight: Number,
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAGS_IMPORT] = {
                            path: ROUTES_1['default'].WORKSPACE_TAGS_IMPORT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAGS_IMPORTED] = {
                            path: ROUTES_1['default'].WORKSPACE_TAGS_IMPORTED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAG_CREATE] = {
                            path: ROUTES_1['default'].WORKSPACE_TAG_CREATE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAG_EDIT] = {
                            path: ROUTES_1['default'].WORKSPACE_TAG_EDIT.route,
                            parse: {
                                orderWeight: Number,
                                tagName (tagName) {
                                    return decodeURIComponent(tagName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAG_APPROVER] = {
                            path: ROUTES_1['default'].WORKSPACE_TAG_APPROVER.route,
                            parse: {
                                orderWeight: Number,
                                tagName (tagName) {
                                    return decodeURIComponent(tagName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAG_GL_CODE] = {
                            path: ROUTES_1['default'].WORKSPACE_TAG_GL_CODE.route,
                            parse: {
                                orderWeight: Number,
                                tagName (tagName) {
                                    return decodeURIComponent(tagName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAG_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_TAG_SETTINGS.route,
                            parse: {
                                orderWeight: Number,
                                tagName (tagName) {
                                    return decodeURIComponent(tagName);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAG_LIST_VIEW] = {
                            path: ROUTES_1['default'].WORKSPACE_TAG_LIST_VIEW.route,
                            parse: {
                                orderWeight: Number,
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAXES_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_TAXES_SETTINGS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAXES_SETTINGS_CUSTOM_TAX_NAME] = {
                            path: ROUTES_1['default'].WORKSPACE_TAXES_SETTINGS_CUSTOM_TAX_NAME.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT] = {
                            path: ROUTES_1['default'].WORKSPACE_TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT] = {
                            path: ROUTES_1['default'].WORKSPACE_TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.REPORT_FIELDS_CREATE] = {
                            path: ROUTES_1['default'].WORKSPACE_CREATE_REPORT_FIELD.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.REPORT_FIELDS_LIST_VALUES] = {
                            path: ROUTES_1['default'].WORKSPACE_REPORT_FIELDS_LIST_VALUES.route,
                            parse: {
                                reportFieldID (reportFieldID) {
                                    return decodeURIComponent(reportFieldID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.REPORT_FIELDS_ADD_VALUE] = {
                            path: ROUTES_1['default'].WORKSPACE_REPORT_FIELDS_ADD_VALUE.route,
                            parse: {
                                reportFieldID (reportFieldID) {
                                    return decodeURIComponent(reportFieldID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS.route,
                            parse: {
                                reportFieldID (reportFieldID) {
                                    return decodeURIComponent(reportFieldID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.REPORT_FIELDS_EDIT_VALUE] = {
                            path: ROUTES_1['default'].WORKSPACE_REPORT_FIELDS_EDIT_VALUE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.REPORT_FIELDS_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_REPORT_FIELDS_SETTINGS.route,
                            parse: {
                                reportFieldID (reportFieldID) {
                                    return decodeURIComponent(reportFieldID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE] = {
                            path: ROUTES_1['default'].WORKSPACE_EDIT_REPORT_FIELDS_INITIAL_VALUE.route,
                            parse: {
                                reportFieldID (reportFieldID) {
                                    return decodeURIComponent(reportFieldID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].REIMBURSEMENT_ACCOUNT] = {
                            path: ROUTES_1['default'].BANK_ACCOUNT_WITH_STEP_TO_OPEN.route,
                            exact: true,
                        }),
                        (_l[SCREENS_1['default'].KEYBOARD_SHORTCUTS] = {
                            path: ROUTES_1['default'].KEYBOARD_SHORTCUTS,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.NAME] = ROUTES_1['default'].WORKSPACE_OVERVIEW_NAME.route),
                        (_l[SCREENS_1['default'].SETTINGS.SHARE_CODE] = {
                            path: ROUTES_1['default'].SETTINGS_SHARE_CODE,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.EXIT_SURVEY.REASON] = {
                            path: ROUTES_1['default'].SETTINGS_EXIT_SURVEY_REASON.route,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.EXIT_SURVEY.BOOK_CALL] = {
                            path: ROUTES_1['default'].SETTINGS_EXIT_SURVERY_BOOK_CALL.route,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.EXIT_SURVEY.RESPONSE] = {
                            path: ROUTES_1['default'].SETTINGS_EXIT_SURVEY_RESPONSE.route,
                        }),
                        (_l[SCREENS_1['default'].SETTINGS.EXIT_SURVEY.CONFIRM] = {
                            path: ROUTES_1['default'].SETTINGS_EXIT_SURVEY_CONFIRM.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAX_CREATE] = {
                            path: ROUTES_1['default'].WORKSPACE_TAX_CREATE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAX_EDIT] = {
                            path: ROUTES_1['default'].WORKSPACE_TAX_EDIT.route,
                            parse: {
                                taxID (taxID) {
                                    return decodeURIComponent(taxID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAX_CODE] = {
                            path: ROUTES_1['default'].WORKSPACE_TAX_CODE.route,
                            parse: {
                                taxID (taxID) {
                                    return decodeURIComponent(taxID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAX_NAME] = {
                            path: ROUTES_1['default'].WORKSPACE_TAX_NAME.route,
                            parse: {
                                taxID (taxID) {
                                    return decodeURIComponent(taxID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.TAX_VALUE] = {
                            path: ROUTES_1['default'].WORKSPACE_TAX_VALUE.route,
                            parse: {
                                taxID (taxID) {
                                    return decodeURIComponent(taxID);
                                },
                            },
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_CUSTOM_NAME] = {
                            path: ROUTES_1['default'].RULES_CUSTOM_NAME.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_AUTO_APPROVE_REPORTS_UNDER] = {
                            path: ROUTES_1['default'].RULES_AUTO_APPROVE_REPORTS_UNDER.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_RANDOM_REPORT_AUDIT] = {
                            path: ROUTES_1['default'].RULES_RANDOM_REPORT_AUDIT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_AUTO_PAY_REPORTS_UNDER] = {
                            path: ROUTES_1['default'].RULES_AUTO_PAY_REPORTS_UNDER.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_RECEIPT_REQUIRED_AMOUNT] = {
                            path: ROUTES_1['default'].RULES_RECEIPT_REQUIRED_AMOUNT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_MAX_EXPENSE_AMOUNT] = {
                            path: ROUTES_1['default'].RULES_MAX_EXPENSE_AMOUNT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_MAX_EXPENSE_AGE] = {
                            path: ROUTES_1['default'].RULES_MAX_EXPENSE_AGE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_BILLABLE_DEFAULT] = {
                            path: ROUTES_1['default'].RULES_BILLABLE_DEFAULT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_CUSTOM] = {
                            path: ROUTES_1['default'].RULES_CUSTOM.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.RULES_PROHIBITED_DEFAULT] = {
                            path: ROUTES_1['default'].RULES_PROHIBITED_DEFAULT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PER_DIEM_IMPORT] = {
                            path: ROUTES_1['default'].WORKSPACE_PER_DIEM_IMPORT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PER_DIEM_IMPORTED] = {
                            path: ROUTES_1['default'].WORKSPACE_PER_DIEM_IMPORTED.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PER_DIEM_SETTINGS] = {
                            path: ROUTES_1['default'].WORKSPACE_PER_DIEM_SETTINGS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PER_DIEM_DETAILS] = {
                            path: ROUTES_1['default'].WORKSPACE_PER_DIEM_DETAILS.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PER_DIEM_EDIT_DESTINATION] = {
                            path: ROUTES_1['default'].WORKSPACE_PER_DIEM_EDIT_DESTINATION.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PER_DIEM_EDIT_SUBRATE] = {
                            path: ROUTES_1['default'].WORKSPACE_PER_DIEM_EDIT_SUBRATE.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PER_DIEM_EDIT_AMOUNT] = {
                            path: ROUTES_1['default'].WORKSPACE_PER_DIEM_EDIT_AMOUNT.route,
                        }),
                        (_l[SCREENS_1['default'].WORKSPACE.PER_DIEM_EDIT_CURRENCY] = {
                            path: ROUTES_1['default'].WORKSPACE_PER_DIEM_EDIT_CURRENCY.route,
                        }),
                        _l),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.TWO_FACTOR_AUTH] = {
                    screens:
                        ((_m = {}),
                        (_m[SCREENS_1['default'].TWO_FACTOR_AUTH.ROOT] = {
                            path: ROUTES_1['default'].SETTINGS_2FA_ROOT.route,
                            exact: true,
                        }),
                        (_m[SCREENS_1['default'].TWO_FACTOR_AUTH.VERIFY] = {
                            path: ROUTES_1['default'].SETTINGS_2FA_VERIFY.route,
                            exact: true,
                        }),
                        (_m[SCREENS_1['default'].TWO_FACTOR_AUTH.SUCCESS] = {
                            path: ROUTES_1['default'].SETTINGS_2FA_SUCCESS.route,
                            exact: true,
                        }),
                        (_m[SCREENS_1['default'].TWO_FACTOR_AUTH.DISABLED] = {
                            path: ROUTES_1['default'].SETTINGS_2FA_DISABLED,
                            exact: true,
                        }),
                        (_m[SCREENS_1['default'].TWO_FACTOR_AUTH.DISABLE] = {
                            path: ROUTES_1['default'].SETTINGS_2FA_DISABLE,
                            exact: true,
                        }),
                        _m),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.PRIVATE_NOTES] = {
                    screens:
                        ((_o = {}),
                        (_o[SCREENS_1['default'].PRIVATE_NOTES.LIST] = ROUTES_1['default'].PRIVATE_NOTES_LIST.route),
                        (_o[SCREENS_1['default'].PRIVATE_NOTES.EDIT] = ROUTES_1['default'].PRIVATE_NOTES_EDIT.route),
                        _o),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.NEW_REPORT_WORKSPACE_SELECTION] = {
                    screens: ((_p = {}), (_p[SCREENS_1['default'].NEW_REPORT_WORKSPACE_SELECTION.ROOT] = ROUTES_1['default'].NEW_REPORT_WORKSPACE_SELECTION), _p),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.REPORT_DETAILS] = {
                    screens:
                        ((_q = {}),
                        (_q[SCREENS_1['default'].REPORT_DETAILS.ROOT] = ROUTES_1['default'].REPORT_WITH_ID_DETAILS.route),
                        (_q[SCREENS_1['default'].REPORT_DETAILS.SHARE_CODE] = ROUTES_1['default'].REPORT_WITH_ID_DETAILS_SHARE_CODE.route),
                        (_q[SCREENS_1['default'].REPORT_DETAILS.EXPORT] = ROUTES_1['default'].REPORT_WITH_ID_DETAILS_EXPORT.route),
                        _q),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.REPORT_CHANGE_WORKSPACE] = {
                    screens: ((_r = {}), (_r[SCREENS_1['default'].REPORT_CHANGE_WORKSPACE.ROOT] = ROUTES_1['default'].REPORT_WITH_ID_CHANGE_WORKSPACE.route), _r),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.REPORT_SETTINGS] = {
                    screens:
                        ((_s = {}),
                        (_s[SCREENS_1['default'].REPORT_SETTINGS.ROOT] = {
                            path: ROUTES_1['default'].REPORT_SETTINGS.route,
                        }),
                        (_s[SCREENS_1['default'].REPORT_SETTINGS.NAME] = {
                            path: ROUTES_1['default'].REPORT_SETTINGS_NAME.route,
                        }),
                        (_s[SCREENS_1['default'].REPORT_SETTINGS.NOTIFICATION_PREFERENCES] = {
                            path: ROUTES_1['default'].REPORT_SETTINGS_NOTIFICATION_PREFERENCES.route,
                        }),
                        (_s[SCREENS_1['default'].REPORT_SETTINGS.WRITE_CAPABILITY] = {
                            path: ROUTES_1['default'].REPORT_SETTINGS_WRITE_CAPABILITY.route,
                        }),
                        (_s[SCREENS_1['default'].REPORT_SETTINGS.VISIBILITY] = {
                            path: ROUTES_1['default'].REPORT_SETTINGS_VISIBILITY.route,
                        }),
                        _s),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.SETTINGS_CATEGORIES] = {
                    screens:
                        ((_t = {}),
                        (_t[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS] = {
                            path: ROUTES_1['default'].SETTINGS_CATEGORY_SETTINGS.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_t[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS] = {
                            path: ROUTES_1['default'].SETTINGS_CATEGORIES_SETTINGS.route,
                        }),
                        (_t[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE] = {
                            path: ROUTES_1['default'].SETTINGS_CATEGORY_CREATE.route,
                        }),
                        (_t[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORY_EDIT] = {
                            path: ROUTES_1['default'].SETTINGS_CATEGORY_EDIT.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_t[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORT] = {
                            path: ROUTES_1['default'].SETTINGS_CATEGORIES_IMPORT.route,
                        }),
                        (_t[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED] = {
                            path: ROUTES_1['default'].SETTINGS_CATEGORIES_IMPORTED.route,
                        }),
                        (_t[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORY_PAYROLL_CODE] = {
                            path: ROUTES_1['default'].SETTINGS_CATEGORY_PAYROLL_CODE.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        (_t[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORY_GL_CODE] = {
                            path: ROUTES_1['default'].SETTINGS_CATEGORY_GL_CODE.route,
                            parse: {
                                categoryName (categoryName) {
                                    return decodeURIComponent(categoryName);
                                },
                            },
                        }),
                        _t),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.SETTINGS_TAGS] = {
                    screens:
                        ((_u = {}),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAGS_SETTINGS] = {
                            path: ROUTES_1['default'].SETTINGS_TAGS_SETTINGS.route,
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAGS_EDIT] = {
                            path: ROUTES_1['default'].SETTINGS_TAGS_EDIT.route,
                            parse: {
                                orderWeight: Number,
                            },
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAG_CREATE] = {
                            path: ROUTES_1['default'].SETTINGS_TAG_CREATE.route,
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAG_EDIT] = {
                            path: ROUTES_1['default'].SETTINGS_TAG_EDIT.route,
                            parse: {
                                orderWeight: Number,
                                tagName (tagName) {
                                    return decodeURIComponent(tagName);
                                },
                            },
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAG_SETTINGS] = {
                            path: ROUTES_1['default'].SETTINGS_TAG_SETTINGS.route,
                            parse: {
                                orderWeight: Number,
                                tagName (tagName) {
                                    return decodeURIComponent(tagName);
                                },
                            },
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAG_APPROVER] = {
                            path: ROUTES_1['default'].SETTINGS_TAG_APPROVER.route,
                            parse: {
                                orderWeight: Number,
                                tagName (tagName) {
                                    return decodeURIComponent(tagName);
                                },
                            },
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAG_LIST_VIEW] = {
                            path: ROUTES_1['default'].SETTINGS_TAG_LIST_VIEW.route,
                            parse: {
                                orderWeight: Number,
                            },
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAG_GL_CODE] = {
                            path: ROUTES_1['default'].SETTINGS_TAG_GL_CODE.route,
                            parse: {
                                orderWeight: Number,
                                tagName (tagName) {
                                    return decodeURIComponent(tagName);
                                },
                            },
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAGS_IMPORT] = {
                            path: ROUTES_1['default'].SETTINGS_TAGS_IMPORT.route,
                        }),
                        (_u[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAGS_IMPORTED] = {
                            path: ROUTES_1['default'].SETTINGS_TAGS_IMPORTED.route,
                        }),
                        _u),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.EXPENSIFY_CARD] = {
                    screens:
                        ((_v = {}),
                        (_v[SCREENS_1['default'].EXPENSIFY_CARD.EXPENSIFY_CARD_DETAILS] = {
                            path: ROUTES_1['default'].EXPENSIFY_CARD_DETAILS.route,
                        }),
                        (_v[SCREENS_1['default'].EXPENSIFY_CARD.EXPENSIFY_CARD_NAME] = {
                            path: ROUTES_1['default'].EXPENSIFY_CARD_NAME.route,
                        }),
                        (_v[SCREENS_1['default'].EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT] = {
                            path: ROUTES_1['default'].EXPENSIFY_CARD_LIMIT.route,
                        }),
                        (_v[SCREENS_1['default'].EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT_TYPE] = {
                            path: ROUTES_1['default'].EXPENSIFY_CARD_LIMIT_TYPE.route,
                        }),
                        _v),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.DOMAIN_CARD] = {
                    screens:
                        ((_w = {}),
                        (_w[SCREENS_1['default'].DOMAIN_CARD.DOMAIN_CARD_DETAIL] = {
                            path: ROUTES_1['default'].SETTINGS_DOMAINCARD_DETAIL.route,
                        }),
                        (_w[SCREENS_1['default'].DOMAIN_CARD.DOMAIN_CARD_REPORT_FRAUD] = {
                            path: ROUTES_1['default'].SETTINGS_DOMAINCARD_REPORT_FRAUD.route,
                        }),
                        _w),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.REPORT_DESCRIPTION] = {
                    screens: ((_x = {}), (_x[SCREENS_1['default'].REPORT_DESCRIPTION_ROOT] = ROUTES_1['default'].REPORT_DESCRIPTION.route), _x),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.NEW_CHAT] = {
                    screens:
                        ((_y = {}),
                        (_y[SCREENS_1['default'].NEW_CHAT.ROOT] = {
                            path: ROUTES_1['default'].NEW,
                            exact: true,
                            screens:
                                ((_z = {}),
                                (_z[SCREENS_1['default'].NEW_CHAT.NEW_CHAT] = {
                                    path: ROUTES_1['default'].NEW_CHAT,
                                    exact: true,
                                }),
                                (_z[SCREENS_1['default'].NEW_CHAT.NEW_ROOM] = {
                                    path: ROUTES_1['default'].NEW_ROOM,
                                    exact: true,
                                }),
                                _z),
                        }),
                        (_y[SCREENS_1['default'].NEW_CHAT.NEW_CHAT_CONFIRM] = {
                            path: ROUTES_1['default'].NEW_CHAT_CONFIRM,
                            exact: true,
                        }),
                        (_y[SCREENS_1['default'].NEW_CHAT.NEW_CHAT_EDIT_NAME] = {
                            path: ROUTES_1['default'].NEW_CHAT_EDIT_NAME,
                            exact: true,
                        }),
                        _y),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.WORKSPACE_CONFIRMATION] = {
                    screens: ((_0 = {}), (_0[SCREENS_1['default'].WORKSPACE_CONFIRMATION.ROOT] = ROUTES_1['default'].WORKSPACE_CONFIRMATION.route), _0),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.NEW_TASK] = {
                    screens:
                        ((_1 = {}),
                        (_1[SCREENS_1['default'].NEW_TASK.ROOT] = ROUTES_1['default'].NEW_TASK.route),
                        (_1[SCREENS_1['default'].NEW_TASK.TASK_ASSIGNEE_SELECTOR] = ROUTES_1['default'].NEW_TASK_ASSIGNEE.route),
                        (_1[SCREENS_1['default'].NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR] = ROUTES_1['default'].NEW_TASK_SHARE_DESTINATION),
                        (_1[SCREENS_1['default'].NEW_TASK.DETAILS] = ROUTES_1['default'].NEW_TASK_DETAILS.route),
                        (_1[SCREENS_1['default'].NEW_TASK.TITLE] = ROUTES_1['default'].NEW_TASK_TITLE.route),
                        (_1[SCREENS_1['default'].NEW_TASK.DESCRIPTION] = ROUTES_1['default'].NEW_TASK_DESCRIPTION.route),
                        _1),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.TEACHERS_UNITE] = {
                    screens:
                        ((_2 = {}),
                        (_2[SCREENS_1['default'].I_KNOW_A_TEACHER] = ROUTES_1['default'].I_KNOW_A_TEACHER),
                        (_2[SCREENS_1['default'].INTRO_SCHOOL_PRINCIPAL] = ROUTES_1['default'].INTRO_SCHOOL_PRINCIPAL),
                        (_2[SCREENS_1['default'].I_AM_A_TEACHER] = ROUTES_1['default'].I_AM_A_TEACHER),
                        _2),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.PROFILE] = {
                    screens: ((_3 = {}), (_3[SCREENS_1['default'].PROFILE_ROOT] = ROUTES_1['default'].PROFILE.route), _3),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.PARTICIPANTS] = {
                    screens:
                        ((_4 = {}),
                        (_4[SCREENS_1['default'].REPORT_PARTICIPANTS.ROOT] = ROUTES_1['default'].REPORT_PARTICIPANTS.route),
                        (_4[SCREENS_1['default'].REPORT_PARTICIPANTS.INVITE] = ROUTES_1['default'].REPORT_PARTICIPANTS_INVITE.route),
                        (_4[SCREENS_1['default'].REPORT_PARTICIPANTS.DETAILS] = ROUTES_1['default'].REPORT_PARTICIPANTS_DETAILS.route),
                        (_4[SCREENS_1['default'].REPORT_PARTICIPANTS.ROLE] = ROUTES_1['default'].REPORT_PARTICIPANTS_ROLE_SELECTION.route),
                        _4),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.ROOM_MEMBERS] = {
                    screens:
                        ((_5 = {}),
                        (_5[SCREENS_1['default'].ROOM_MEMBERS.ROOT] = ROUTES_1['default'].ROOM_MEMBERS.route),
                        (_5[SCREENS_1['default'].ROOM_MEMBERS.INVITE] = ROUTES_1['default'].ROOM_INVITE.route),
                        (_5[SCREENS_1['default'].ROOM_MEMBERS.DETAILS] = ROUTES_1['default'].ROOM_MEMBER_DETAILS.route),
                        _5),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.MONEY_REQUEST] = {
                    screens:
                        ((_6 = {}),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.START] = ROUTES_1['default'].MONEY_REQUEST_START.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.CREATE] = {
                            path: ROUTES_1['default'].MONEY_REQUEST_CREATE.route,
                            exact: true,
                            screens: {
                                distance: {
                                    path: ROUTES_1['default'].MONEY_REQUEST_CREATE_TAB_DISTANCE.route,
                                    exact: true,
                                },
                                manual: {
                                    path: ROUTES_1['default'].MONEY_REQUEST_CREATE_TAB_MANUAL.route,
                                    exact: true,
                                },
                                scan: {
                                    path: ROUTES_1['default'].MONEY_REQUEST_CREATE_TAB_SCAN.route,
                                    exact: true,
                                },
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'per-diem': {
                                    path: ROUTES_1['default'].MONEY_REQUEST_CREATE_TAB_PER_DIEM.route,
                                    exact: true,
                                },
                            },
                        }),
                        (_6[SCREENS_1['default'].SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT] = ROUTES_1['default'].SETTINGS_CATEGORIES_ROOT.route),
                        (_6[SCREENS_1['default'].SETTINGS_TAGS.SETTINGS_TAGS_ROOT] = ROUTES_1['default'].SETTINGS_TAGS_ROOT.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_SEND_FROM] = ROUTES_1['default'].MONEY_REQUEST_STEP_SEND_FROM.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_REPORT] = ROUTES_1['default'].MONEY_REQUEST_STEP_REPORT.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_COMPANY_INFO] = ROUTES_1['default'].MONEY_REQUEST_STEP_COMPANY_INFO.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_AMOUNT] = ROUTES_1['default'].MONEY_REQUEST_STEP_AMOUNT.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_CATEGORY] = ROUTES_1['default'].MONEY_REQUEST_STEP_CATEGORY.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_CONFIRMATION] = ROUTES_1['default'].MONEY_REQUEST_STEP_CONFIRMATION.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_CURRENCY] = ROUTES_1['default'].MONEY_REQUEST_STEP_CURRENCY.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_DATE] = ROUTES_1['default'].MONEY_REQUEST_STEP_DATE.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_DESCRIPTION] = ROUTES_1['default'].MONEY_REQUEST_STEP_DESCRIPTION.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_DISTANCE] = ROUTES_1['default'].MONEY_REQUEST_STEP_DISTANCE.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_DISTANCE_RATE] = ROUTES_1['default'].MONEY_REQUEST_STEP_DISTANCE_RATE.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.HOLD] = ROUTES_1['default'].MONEY_REQUEST_HOLD_REASON.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_MERCHANT] = ROUTES_1['default'].MONEY_REQUEST_STEP_MERCHANT.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_PARTICIPANTS] = ROUTES_1['default'].MONEY_REQUEST_STEP_PARTICIPANTS.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_SCAN] = ROUTES_1['default'].MONEY_REQUEST_STEP_SCAN.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_TAG] = ROUTES_1['default'].MONEY_REQUEST_STEP_TAG.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_WAYPOINT] = ROUTES_1['default'].MONEY_REQUEST_STEP_WAYPOINT.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_TAX_AMOUNT] = ROUTES_1['default'].MONEY_REQUEST_STEP_TAX_AMOUNT.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_TAX_RATE] = ROUTES_1['default'].MONEY_REQUEST_STEP_TAX_RATE.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STATE_SELECTOR] = {
                            path: ROUTES_1['default'].MONEY_REQUEST_STATE_SELECTOR.route,
                            exact: true,
                        }),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_SPLIT_PAYER] = ROUTES_1['default'].MONEY_REQUEST_STEP_SPLIT_PAYER.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_ATTENDEES] = ROUTES_1['default'].MONEY_REQUEST_ATTENDEE.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_UPGRADE] = ROUTES_1['default'].MONEY_REQUEST_UPGRADE.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_DESTINATION] = ROUTES_1['default'].MONEY_REQUEST_STEP_DESTINATION.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_TIME] = ROUTES_1['default'].MONEY_REQUEST_STEP_TIME.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_SUBRATE] = ROUTES_1['default'].MONEY_REQUEST_STEP_SUBRATE.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_DESTINATION_EDIT] = ROUTES_1['default'].MONEY_REQUEST_STEP_DESTINATION_EDIT.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_TIME_EDIT] = ROUTES_1['default'].MONEY_REQUEST_STEP_TIME_EDIT.route),
                        (_6[SCREENS_1['default'].MONEY_REQUEST.STEP_SUBRATE_EDIT] = ROUTES_1['default'].MONEY_REQUEST_STEP_SUBRATE_EDIT.route),
                        (_6[SCREENS_1['default'].IOU_SEND.ENABLE_PAYMENTS] = ROUTES_1['default'].IOU_SEND_ENABLE_PAYMENTS),
                        (_6[SCREENS_1['default'].IOU_SEND.ADD_BANK_ACCOUNT] = ROUTES_1['default'].IOU_SEND_ADD_BANK_ACCOUNT),
                        (_6[SCREENS_1['default'].IOU_SEND.ADD_DEBIT_CARD] = ROUTES_1['default'].IOU_SEND_ADD_DEBIT_CARD),
                        _6),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.TRANSACTION_DUPLICATE] = {
                    screens:
                        ((_7 = {}),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.REVIEW] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_REVIEW_PAGE.route,
                            exact: true,
                        }),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.MERCHANT] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.route,
                            exact: true,
                        }),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.CATEGORY] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.route,
                            exact: true,
                        }),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.TAG] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.route,
                            exact: true,
                        }),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.DESCRIPTION] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.route,
                            exact: true,
                        }),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.TAX_CODE] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.route,
                            exact: true,
                        }),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.REIMBURSABLE] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.route,
                            exact: true,
                        }),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.BILLABLE] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.route,
                            exact: true,
                        }),
                        (_7[SCREENS_1['default'].TRANSACTION_DUPLICATE.CONFIRMATION] = {
                            path: ROUTES_1['default'].TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.route,
                            exact: true,
                        }),
                        _7),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.SPLIT_DETAILS] = {
                    screens: ((_8 = {}), (_8[SCREENS_1['default'].SPLIT_DETAILS.ROOT] = ROUTES_1['default'].SPLIT_BILL_DETAILS.route), _8),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.TASK_DETAILS] = {
                    screens:
                        ((_9 = {}),
                        (_9[SCREENS_1['default'].TASK.TITLE] = ROUTES_1['default'].TASK_TITLE.route),
                        (_9[SCREENS_1['default'].TASK.ASSIGNEE] = ROUTES_1['default'].TASK_ASSIGNEE.route),
                        _9),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT] = {
                    screens: ((_10 = {}), (_10[SCREENS_1['default'].ADD_PERSONAL_BANK_ACCOUNT_ROOT] = ROUTES_1['default'].BANK_ACCOUNT_PERSONAL), _10),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.ENABLE_PAYMENTS] = {
                    screens: ((_11 = {}), (_11[SCREENS_1['default'].ENABLE_PAYMENTS_ROOT] = ROUTES_1['default'].ENABLE_PAYMENTS), _11),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.WALLET_STATEMENT] = {
                    screens: ((_12 = {}), (_12[SCREENS_1['default'].WALLET_STATEMENT_ROOT] = ROUTES_1['default'].WALLET_STATEMENT_WITH_DATE), _12),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.FLAG_COMMENT] = {
                    screens: ((_13 = {}), (_13[SCREENS_1['default'].FLAG_COMMENT_ROOT] = ROUTES_1['default'].FLAG_COMMENT.route), _13),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.EDIT_REQUEST] = {
                    screens:
                        ((_14 = {}),
                        (_14[SCREENS_1['default'].EDIT_REQUEST.REPORT_FIELD] = {
                            path: ROUTES_1['default'].EDIT_REPORT_FIELD_REQUEST.route,
                            parse: {
                                fieldID (fieldID) {
                                    return decodeURIComponent(fieldID);
                                },
                            },
                        }),
                        _14),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.SIGN_IN] = {
                    screens: ((_15 = {}), (_15[SCREENS_1['default'].SIGN_IN_ROOT] = ROUTES_1['default'].SIGN_IN_MODAL), _15),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.REFERRAL] = {
                    screens: ((_16 = {}), (_16[SCREENS_1['default'].REFERRAL_DETAILS] = ROUTES_1['default'].REFERRAL_DETAILS_MODAL.route), _16),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.TRAVEL] = {
                    screens:
                        ((_17 = {}),
                        (_17[SCREENS_1['default'].TRAVEL.MY_TRIPS] = ROUTES_1['default'].TRAVEL_MY_TRIPS),
                        (_17[SCREENS_1['default'].TRAVEL.UPGRADE] = ROUTES_1['default'].TRAVEL_UPGRADE),
                        (_17[SCREENS_1['default'].TRAVEL.TCS] = ROUTES_1['default'].TRAVEL_TCS.route),
                        (_17[SCREENS_1['default'].TRAVEL.TRIP_SUMMARY] = ROUTES_1['default'].TRAVEL_TRIP_SUMMARY.route),
                        (_17[SCREENS_1['default'].TRAVEL.TRIP_DETAILS] = {
                            path: ROUTES_1['default'].TRAVEL_TRIP_DETAILS.route,
                            parse: {
                                reservationIndex (reservationIndex) {
                                    return parseInt(reservationIndex, 10);
                                },
                            },
                        }),
                        (_17[SCREENS_1['default'].TRAVEL.DOMAIN_SELECTOR] = ROUTES_1['default'].TRAVEL_DOMAIN_SELECTOR),
                        (_17[SCREENS_1['default'].TRAVEL.DOMAIN_PERMISSION_INFO] = ROUTES_1['default'].TRAVEL_DOMAIN_PERMISSION_INFO.route),
                        (_17[SCREENS_1['default'].TRAVEL.PUBLIC_DOMAIN_ERROR] = ROUTES_1['default'].TRAVEL_PUBLIC_DOMAIN_ERROR),
                        (_17[SCREENS_1['default'].TRAVEL.WORKSPACE_ADDRESS] = ROUTES_1['default'].TRAVEL_WORKSPACE_ADDRESS.route),
                        _17),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.SEARCH_REPORT] = {
                    screens:
                        ((_18 = {}),
                        (_18[SCREENS_1['default'].SEARCH.REPORT_RHP] = ROUTES_1['default'].SEARCH_REPORT.route),
                        (_18[SCREENS_1['default'].SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS] = ROUTES_1['default'].SEARCH_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS.route),
                        (_18[SCREENS_1['default'].SEARCH.TRANSACTION_HOLD_REASON_RHP] = ROUTES_1['default'].TRANSACTION_HOLD_REASON_RHP),
                        _18),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.SEARCH_ADVANCED_FILTERS] = {
                    screens:
                        ((_19 = {}),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_DATE_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_DATE),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_SUBMITTED_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_SUBMITTED),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_APPROVED_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_APPROVED),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_PAID_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_PAID),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_EXPORTED_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_EXPORTED),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_POSTED_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_POSTED),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_CURRENCY_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_CURRENCY),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_MERCHANT_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_MERCHANT),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_DESCRIPTION_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_DESCRIPTION),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_REPORT_ID_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_REPORT_ID),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_AMOUNT_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_AMOUNT),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_CATEGORY_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_CATEGORY),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_KEYWORD_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_KEYWORD),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_CARD_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_CARD),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_TAX_RATE_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_TAX_RATE),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_EXPENSE_TYPE_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_EXPENSE_TYPE),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_TAG_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_TAG),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_FROM_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_FROM),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_TO_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_TO),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_IN_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_IN),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_BILLABLE_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_BILLABLE),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_REIMBURSABLE_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_REIMBURSABLE),
                        (_19[SCREENS_1['default'].SEARCH.ADVANCED_FILTERS_WORKSPACE_RHP] = ROUTES_1['default'].SEARCH_ADVANCED_FILTERS_WORKSPACE),
                        _19),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.SEARCH_SAVED_SEARCH] = {
                    screens: ((_20 = {}), (_20[SCREENS_1['default'].SEARCH.SAVED_SEARCH_RENAME_RHP] = ROUTES_1['default'].SEARCH_SAVED_SEARCH_RENAME.route), _20),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.RESTRICTED_ACTION] = {
                    screens: ((_21 = {}), (_21[SCREENS_1['default'].RESTRICTED_ACTION_ROOT] = ROUTES_1['default'].RESTRICTED_ACTION.route), _21),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.MISSING_PERSONAL_DETAILS] = {
                    screens: ((_22 = {}), (_22[SCREENS_1['default'].MISSING_PERSONAL_DETAILS_ROOT] = ROUTES_1['default'].MISSING_PERSONAL_DETAILS), _22),
                }),
                (_k[SCREENS_1['default'].RIGHT_MODAL.DEBUG] = {
                    screens:
                        ((_23 = {}),
                        (_23[SCREENS_1['default'].DEBUG.REPORT] = {
                            path: ROUTES_1['default'].DEBUG_REPORT.route,
                            exact: true,
                            screens: {
                                details: {
                                    path: ROUTES_1['default'].DEBUG_REPORT_TAB_DETAILS.route,
                                    exact: true,
                                },
                                json: {
                                    path: ROUTES_1['default'].DEBUG_REPORT_TAB_JSON.route,
                                    exact: true,
                                },
                                actions: {
                                    path: ROUTES_1['default'].DEBUG_REPORT_TAB_ACTIONS.route,
                                    exact: true,
                                },
                            },
                        }),
                        (_23[SCREENS_1['default'].DEBUG.REPORT_ACTION] = {
                            path: ROUTES_1['default'].DEBUG_REPORT_ACTION.route,
                            exact: true,
                            screens: {
                                details: {
                                    path: ROUTES_1['default'].DEBUG_REPORT_ACTION_TAB_DETAILS.route,
                                    exact: true,
                                },
                                json: {
                                    path: ROUTES_1['default'].DEBUG_REPORT_ACTION_TAB_JSON.route,
                                    exact: true,
                                },
                                preview: {
                                    path: ROUTES_1['default'].DEBUG_REPORT_ACTION_TAB_PREVIEW.route,
                                    exact: true,
                                },
                            },
                        }),
                        (_23[SCREENS_1['default'].DEBUG.REPORT_ACTION_CREATE] = {
                            path: ROUTES_1['default'].DEBUG_REPORT_ACTION_CREATE.route,
                            exact: true,
                        }),
                        (_23[SCREENS_1['default'].DEBUG.DETAILS_CONSTANT_PICKER_PAGE] = {
                            path: ROUTES_1['default'].DETAILS_CONSTANT_PICKER_PAGE.route,
                            exact: true,
                        }),
                        (_23[SCREENS_1['default'].DEBUG.DETAILS_DATE_TIME_PICKER_PAGE] = {
                            path: ROUTES_1['default'].DETAILS_DATE_TIME_PICKER_PAGE.route,
                            exact: true,
                        }),
                        (_23[SCREENS_1['default'].DEBUG.TRANSACTION] = {
                            path: ROUTES_1['default'].DEBUG_TRANSACTION.route,
                            exact: true,
                            screens: {
                                details: {
                                    path: ROUTES_1['default'].DEBUG_TRANSACTION_TAB_DETAILS.route,
                                    exact: true,
                                },
                                json: {
                                    path: ROUTES_1['default'].DEBUG_TRANSACTION_TAB_JSON.route,
                                    exact: true,
                                },
                                violations: {
                                    path: ROUTES_1['default'].DEBUG_TRANSACTION_TAB_VIOLATIONS.route,
                                    exact: true,
                                },
                            },
                        }),
                        (_23[SCREENS_1['default'].DEBUG.TRANSACTION_VIOLATION_CREATE] = {
                            path: ROUTES_1['default'].DEBUG_TRANSACTION_VIOLATION_CREATE.route,
                            exact: true,
                        }),
                        (_23[SCREENS_1['default'].DEBUG.TRANSACTION_VIOLATION] = {
                            path: ROUTES_1['default'].DEBUG_TRANSACTION_VIOLATION.route,
                            exact: true,
                            screens: {
                                details: {
                                    path: ROUTES_1['default'].DEBUG_TRANSACTION_VIOLATION_TAB_DETAILS.route,
                                    exact: true,
                                },
                                json: {
                                    path: ROUTES_1['default'].DEBUG_TRANSACTION_VIOLATION_TAB_JSON.route,
                                    exact: true,
                                },
                            },
                        }),
                        _23),
                }),
                _k),
        }),
        (_a[NAVIGATORS_1['default'].REPORTS_SPLIT_NAVIGATOR] = {
            path: ROUTES_1['default'].ROOT,
            screens:
                ((_24 = {}),
                (_24[SCREENS_1['default'].HOME] = {
                    path: ROUTES_1['default'].HOME,
                    exact: true,
                }),
                (_24[SCREENS_1['default'].REPORT] = {
                    path: ROUTES_1['default'].REPORT_WITH_ID.route,
                    // If params are defined, but reportID is explicitly undefined, we will get the url /r/undefined.
                    // We want to avoid that situation, so we will return an empty string instead.
                    parse: {
                        // eslint-disable-next-line
                        reportID: function (reportID) {
                            return reportID !== null && reportID !== void 0 ? reportID : '';
                        },
                    },
                    stringify: {
                        // eslint-disable-next-line
                        reportID: function (reportID) {
                            return reportID !== null && reportID !== void 0 ? reportID : '';
                        },
                    },
                }),
                _24),
        }),
        (_a[NAVIGATORS_1['default'].SETTINGS_SPLIT_NAVIGATOR] = {
            screens:
                ((_25 = {}),
                (_25[SCREENS_1['default'].SETTINGS.ROOT] = ROUTES_1['default'].SETTINGS),
                (_25[SCREENS_1['default'].SETTINGS.WORKSPACES] = {
                    path: ROUTES_1['default'].SETTINGS_WORKSPACES.route,
                    exact: true,
                }),
                (_25[SCREENS_1['default'].SETTINGS.PROFILE.ROOT] = {
                    path: ROUTES_1['default'].SETTINGS_PROFILE.route,
                    exact: true,
                }),
                (_25[SCREENS_1['default'].SETTINGS.SECURITY] = {
                    path: ROUTES_1['default'].SETTINGS_SECURITY,
                    exact: true,
                }),
                (_25[SCREENS_1['default'].SETTINGS.WALLET.ROOT] = {
                    path: ROUTES_1['default'].SETTINGS_WALLET,
                    exact: true,
                }),
                (_25[SCREENS_1['default'].SETTINGS.ABOUT] = {
                    path: ROUTES_1['default'].SETTINGS_ABOUT,
                    exact: true,
                }),
                (_25[SCREENS_1['default'].SETTINGS.TROUBLESHOOT] = {
                    path: ROUTES_1['default'].SETTINGS_TROUBLESHOOT,
                    exact: true,
                }),
                (_25[SCREENS_1['default'].SETTINGS.SAVE_THE_WORLD] = ROUTES_1['default'].SETTINGS_SAVE_THE_WORLD),
                (_25[SCREENS_1['default'].SETTINGS.SUBSCRIPTION.ROOT] = {path: ROUTES_1['default'].SETTINGS_SUBSCRIPTION.route}),
                (_25[SCREENS_1['default'].SETTINGS.PREFERENCES.ROOT] = {
                    path: ROUTES_1['default'].SETTINGS_PREFERENCES,
                }),
                _25),
        }),
        (_a[NAVIGATORS_1['default'].WORKSPACE_SPLIT_NAVIGATOR] = {
            // The path given as initialRouteName does not have route params.
            // initialRouteName is not defined in this split navigator because in this case the initial route requires a policyID defined in its route params.
            screens:
                ((_26 = {}),
                (_26[SCREENS_1['default'].WORKSPACE.INITIAL] = {
                    path: ROUTES_1['default'].WORKSPACE_INITIAL.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.PROFILE] = ROUTES_1['default'].WORKSPACE_OVERVIEW.route),
                (_26[SCREENS_1['default'].WORKSPACE.EXPENSIFY_CARD] = {
                    path: ROUTES_1['default'].WORKSPACE_EXPENSIFY_CARD.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.COMPANY_CARDS] = {
                    path: ROUTES_1['default'].WORKSPACE_COMPANY_CARDS.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.PER_DIEM] = {
                    path: ROUTES_1['default'].WORKSPACE_PER_DIEM.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.WORKFLOWS] = {
                    path: ROUTES_1['default'].WORKSPACE_WORKFLOWS.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.INVOICES] = {
                    path: ROUTES_1['default'].WORKSPACE_INVOICES.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.MEMBERS] = {
                    path: ROUTES_1['default'].WORKSPACE_MEMBERS.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.ACCOUNTING.ROOT] = {
                    path: ROUTES_1['default'].POLICY_ACCOUNTING.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.CATEGORIES] = {
                    path: ROUTES_1['default'].WORKSPACE_CATEGORIES.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.MORE_FEATURES] = {
                    path: ROUTES_1['default'].WORKSPACE_MORE_FEATURES.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.TAGS] = {
                    path: ROUTES_1['default'].WORKSPACE_TAGS.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.TAXES] = {
                    path: ROUTES_1['default'].WORKSPACE_TAXES.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.REPORT_FIELDS] = {
                    path: ROUTES_1['default'].WORKSPACE_REPORT_FIELDS.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.DISTANCE_RATES] = {
                    path: ROUTES_1['default'].WORKSPACE_DISTANCE_RATES.route,
                }),
                (_26[SCREENS_1['default'].WORKSPACE.RULES] = {
                    path: ROUTES_1['default'].WORKSPACE_RULES.route,
                }),
                _26),
        }),
        (_a[NAVIGATORS_1['default'].SEARCH_FULLSCREEN_NAVIGATOR] = {
            screens:
                ((_27 = {}),
                (_27[SCREENS_1['default'].SEARCH.ROOT] = {
                    path: ROUTES_1['default'].SEARCH_ROOT.route,
                }),
                (_27[SCREENS_1['default'].SEARCH.MONEY_REQUEST_REPORT] = {
                    path: ROUTES_1['default'].SEARCH_MONEY_REQUEST_REPORT.route,
                }),
                _27),
        }),
        (_a[NAVIGATORS_1['default'].SHARE_MODAL_NAVIGATOR] = {
            initialRouteName: SCREENS_1['default'].SHARE.ROOT,
            screens:
                ((_28 = {}),
                (_28[SCREENS_1['default'].SHARE.ROOT] = {path: ROUTES_1['default'].SHARE_ROOT}),
                (_28[SCREENS_1['default'].SHARE.SHARE_DETAILS] = {path: ROUTES_1['default'].SHARE_DETAILS.route}),
                (_28[SCREENS_1['default'].SHARE.SUBMIT_DETAILS] = {path: ROUTES_1['default'].SHARE_SUBMIT_DETAILS.route}),
                _28),
        }),
        _a),
};
exports.config = config;
const normalizedConfigs = Object.keys(config.screens)
    .map(function (key) {
        return createNormalizedConfigs_1['default'](
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
        );
    })
    .flat()
    .reduce(function (acc, route) {
        acc[route.screen] = route;
        return acc;
    }, {});
exports.normalizedConfigs = normalizedConfigs;

/* eslint-disable @typescript-eslint/naming-convention  */
import type {
    CommonActions,
    NavigationContainerRefWithCurrent,
    NavigationHelpers,
    NavigationState,
    NavigatorScreenParams,
    ParamListBase,
    PartialRoute,
    PartialState,
    Route,
} from '@react-navigation/native';
import type {TupleToUnion, ValueOf} from 'type-fest';
import type {SearchQueryString} from '@components/Search/types';
import type {IOURequestType} from '@libs/actions/IOU';
import type {SaveSearchParams} from '@libs/API/parameters';
import type {ReimbursementAccountStepToOpen} from '@libs/ReimbursementAccountUtils';
import type CONST from '@src/CONST';
import type {Country, IOUAction, IOUType} from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import type {Route as ExpensifyRoute, HybridAppRoute, Route as Routes} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type EXIT_SURVEY_REASON_FORM_INPUT_IDS from '@src/types/form/ExitSurveyReasonForm';
import type {CompanyCardFeed} from '@src/types/onyx';
import type {ConnectionName, SageIntacctMappingName} from '@src/types/onyx/Policy';
import type {SIDEBAR_TO_SPLIT} from './linkingConfig/RELATIONS';

type NavigationRef = NavigationContainerRefWithCurrent<RootNavigatorParamList>;

type NavigationRoot = NavigationHelpers<RootNavigatorParamList>;

type GoBackAction = Extract<CommonActions.Action, {type: 'GO_BACK'}>;
type ResetAction = Extract<CommonActions.Action, {type: 'RESET'}>;
type SetParamsAction = Extract<CommonActions.Action, {type: 'SET_PARAMS'}>;

type ActionNavigate = {
    type: ValueOf<typeof CONST.NAVIGATION.ACTION_TYPE>;
    payload: {
        name?: string;
        key?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params?: any;
        path?: string;
        merge?: boolean;
    };
    source?: string;
    target?: string;
};

type StackNavigationAction = GoBackAction | ResetAction | SetParamsAction | ActionNavigate | undefined;

type NavigationStateRoute = NavigationState['routes'][number];
type NavigationPartialRoute<TRouteName extends string = string> = PartialRoute<Route<TRouteName>>;
type StateOrRoute = NavigationState | NavigationStateRoute | NavigationPartialRoute;
type State<TParamList extends ParamListBase = ParamListBase> = NavigationState<TParamList> | PartialState<NavigationState<TParamList>>;
type NavigationRoute = NavigationStateRoute | NavigationPartialRoute;

type SplitNavigatorSidebarScreen = keyof typeof SIDEBAR_TO_SPLIT;

type SplitNavigatorParamList = {
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: SettingsSplitNavigatorParamList;
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: ReportsSplitNavigatorParamList;
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: WorkspaceSplitNavigatorParamList;
};

type SplitNavigatorBySidebar<T extends SplitNavigatorSidebarScreen> = (typeof SIDEBAR_TO_SPLIT)[T];

type BackToParams = {
    backTo?: Routes;
};

type ConsoleNavigatorParamList = {
    [SCREENS.PUBLIC_CONSOLE_DEBUG]: {
        backTo: Routes;
    };
};

type SettingsNavigatorParamList = {
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: undefined;
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: undefined;
    [SCREENS.SETTINGS.PROFILE.LEGAL_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH]: undefined;
    [SCREENS.SETTINGS.PROFILE.ADDRESS]: {
        country?: Country | '';
    };
    [SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY]: {
        backTo?: Routes;
        country: string;
    };
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: {
        backTo: Routes;
    };
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: {
        contactMethod: string;
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: {
        backTo?: Routes;
        forwardTo?: Routes;
    };
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.PAYMENT_CURRENCY]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.THEME]: undefined;
    [SCREENS.SETTINGS.CLOSE]: undefined;
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: undefined;
    [SCREENS.SETTINGS.CONSOLE]: {
        backTo: Routes;
    };
    [SCREENS.SETTINGS.SHARE_LOG]: {
        /** URL of the generated file to share logs in a report */
        source: string;
        backTo: Routes;
    };
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: undefined;
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD_CONFIRMATION]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_PAYER]: {
        policyID: string;
    };
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: undefined;
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: undefined;
    [SCREENS.SETTINGS.WALLET.VERIFY_ACCOUNT]: {
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: undefined;
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: undefined;
    [SCREENS.WORKSPACE.CURRENCY]: undefined;
    [SCREENS.WORKSPACE.ADDRESS]: {
        policyID: string;
        country?: Country | '';
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.NAME]: undefined;
    [SCREENS.WORKSPACE.DESCRIPTION]: undefined;
    [SCREENS.WORKSPACE.SHARE]: undefined;
    [SCREENS.WORKSPACE.INVITE]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.MEMBERS_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_CREATE]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_EDIT]: {
        policyID: string;
        categoryName: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_PAYROLL_CODE]: {
        policyID: string;
        categoryName: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_GL_CODE]: {
        policyID: string;
        categoryName: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_DEFAULT_TAX_RATE]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_FLAG_AMOUNTS_OVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_DESCRIPTION_HINT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_APPROVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_REQUIRE_RECEIPTS_OVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_SETTINGS]: {
        policyID: string;
        categoryName: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.UPGRADE]: {
        policyID?: string;
        featureName?: string;
        backTo?: Routes;
        categoryId?: string;
    };
    [SCREENS.WORKSPACE.DOWNGRADE]: {
        policyID?: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORIES_IMPORT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORIES_IMPORTED]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_CREATE]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.TAGS_SETTINGS]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORTED]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_SETTINGS]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_LIST_VIEW]: {
        policyID: string;
        orderWeight: number;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_EDIT]: {
        policyID: string;
        orderWeight: number;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_EDIT]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_APPROVER]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_GL_CODE]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: {backTo?: Routes};
    [SCREENS.SETTINGS.SUBSCRIPTION.SIZE]: {
        canChangeSize: 0 | 1;
    };
    [SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_PAYMENT_CURRENCY]: undefined;
    [SCREENS.WORKSPACE.TAXES_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAXES_SETTINGS_CUSTOM_TAX_NAME]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_CREATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES]: {
        policyID: string;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_ADD_VALUE]: {
        policyID: string;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS]: {
        policyID: string;
        valueIndex: number;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_VALUE]: {
        policyID: string;
        valueIndex: number;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_SETTINGS]: {
        policyID: string;
        reportFieldID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE]: {
        policyID: string;
        reportFieldID: string;
    };
    [SCREENS.WORKSPACE.MEMBER_DETAILS]: {
        policyID: string;
        accountID: string;
    };
    [SCREENS.WORKSPACE.MEMBER_NEW_CARD]: {
        policyID: string;
        accountID: string;
    };
    [SCREENS.WORKSPACE.OWNER_CHANGE_SUCCESS]: {
        policyID: string;
        accountID: number;
    };
    [SCREENS.WORKSPACE.OWNER_CHANGE_ERROR]: {
        policyID: string;
        accountID: number;
    };
    [SCREENS.WORKSPACE.OWNER_CHANGE_CHECK]: {
        policyID: string;
        accountID: number;
        error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>;
    };
    [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_MODAL]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ITEMS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CHART_OF_ACCOUNTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CUSTOMER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ORGANIZATION]: {
        policyID: string;
        organizationID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TAXES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TRACKING_CATEGORIES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_MAP_TRACKING_CATEGORY]: {
        policyID: string;
        categoryId: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_BANK_ACCOUNT_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.ENTER_SAGE_INTACCT_CREDENTIALS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ENTITY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_SUBSIDIARY_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REUSE_EXISTING_CONNECTIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TOKEN_INPUT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_MAPPING]: {
        policyID: string;
        importField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_FIELDS>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD]: {
        policyID: string;
        importCustomField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_VIEW]: {
        policyID: string;
        importCustomField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;
        internalID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_EDIT]: {
        policyID: string;
        importCustomField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;
        internalID: string;
        fieldName: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_LIST_ADD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PREFERRED_EXPORTER_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_DATE_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_RECEIVABLE_ACCOUNT_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TAX_POSTING_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_COLLECTION_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_APPROVAL_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_CUSTOM_FORM_ID]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_SETUP]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_IMPORT_CUSTOMERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_IMPORT_CUSTOMERS_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_IMPORT_PROJECTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_IMPORT_PROJECTS_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_EXPORT_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_EXPORT_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_EXPORT_PAYMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NSQS_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_TOGGLE_MAPPING]: {
        policyID: string;
        mapping: SageIntacctMappingName;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE]: {
        policyID: string;
        mapping: SageIntacctMappingName;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADD_USER_DIMENSION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_USER_DIMENSIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EDIT_USER_DIMENSION]: {
        policyID: string;
        dimensionName: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREFERRED_EXPORTER]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT_DATE]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_EXPENSES]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_DESTINATION]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR]: {
        policyID: string;
        reimbursable: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PAYMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION]: {
        policyID: string;
        connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS]: {
        policyID: string;
        connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.MULTI_CONNECTION_SELECTOR]: {
        policyID: string;
        connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
    };
    [SCREENS.TWO_FACTOR_AUTH.DISABLED]: undefined;
    [SCREENS.TWO_FACTOR_AUTH.DISABLE]: undefined;
    [SCREENS.SETTINGS.DELEGATE.ADD_DELEGATE]: undefined;
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_ROLE]: {
        login: string;
        role?: string;
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE]: {
        login: string;
        currentRole: string;
        showValidateActionModal?: string;
        newRole?: ValueOf<typeof CONST.DELEGATE_ROLE>;
    };
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM]: {
        login: string;
        role: string;
        showValidateActionModal?: string;
    };
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.KEYBOARD_SHORTCUTS]: undefined;
    [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: undefined;
    [SCREENS.SETTINGS.EXIT_SURVEY.BOOK_CALL]: undefined;
    [SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE]: {
        [EXIT_SURVEY_REASON_FORM_INPUT_IDS.REASON]: ValueOf<typeof CONST.EXIT_SURVEY.REASONS>;
        backTo: Routes;
    };
    [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: {
        backTo: Routes;
    };
    [SCREENS.WORKSPACE.TAX_CREATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAX_EDIT]: {
        policyID: string;
        taxID: string;
    };
    [SCREENS.WORKSPACE.TAX_NAME]: {
        policyID: string;
        taxID: string;
    };
    [SCREENS.WORKSPACE.TAX_VALUE]: {
        policyID: string;
        taxID: string;
    };
    [SCREENS.WORKSPACE.TAX_CODE]: {
        policyID: string;
        taxID: string;
    };
    [SCREENS.WORKSPACE.INVOICES_COMPANY_NAME]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVOICES_COMPANY_WEBSITE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION]: {
        policyID: string;
        bankName: string;
        backTo: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_DETAILS]: {
        policyID: string;
        bank: CompanyCardFeed;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_NAME]: {
        policyID: string;
        cardID: string;
        bank: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_EXPORT]: {
        policyID: string;
        cardID: string;
        bank: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_ACCOUNT]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD]: {
        policyID: string;
        feed: CompanyCardFeed;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_FEED_NAME]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS]: {
        policyID: string;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_NAME]: {
        policyID: string;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT]: {
        policyID: string;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE]: {
        policyID: string;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_DETAILS]: {
        policyID: string;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_NAME]: {
        policyID: string;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT]: {
        policyID: string;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT_TYPE]: {
        policyID: string;
        cardID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.RULES_CUSTOM_NAME]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_AUTO_APPROVE_REPORTS_UNDER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_RANDOM_REPORT_AUDIT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_AUTO_PAY_REPORTS_UNDER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_RECEIPT_REQUIRED_AMOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AMOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AGE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_BILLABLE_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_PROHIBITED_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_CUSTOM]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_DETAILS]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_DESTINATION]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_SUBRATE]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_AMOUNT]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_CURRENCY]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
} & ReimbursementAccountNavigatorParamList;

type TwoFactorAuthNavigatorParamList = {
    [SCREENS.TWO_FACTOR_AUTH.ROOT]: {
        backTo?: Routes;
        forwardTo?: string;
    };
    [SCREENS.TWO_FACTOR_AUTH.VERIFY]: {
        backTo?: Routes;
        forwardTo?: string;
    };
    [SCREENS.TWO_FACTOR_AUTH.SUCCESS]: {
        backTo?: Routes;
        forwardTo?: string;
    };
    [SCREENS.TWO_FACTOR_AUTH.DISABLE]: undefined;
    [SCREENS.TWO_FACTOR_AUTH.DISABLED]: undefined;
};

type NewChatNavigatorParamList = {
    [SCREENS.NEW_CHAT.ROOT]: undefined;
    [SCREENS.NEW_CHAT.NEW_CHAT_CONFIRM]: undefined;
    [SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME]: undefined;
};

type DetailsNavigatorParamList = {
    [SCREENS.DETAILS_ROOT]: {
        login: string;
        reportID: string;
    };
};

type ProfileNavigatorParamList = {
    [SCREENS.PROFILE_ROOT]: {
        accountID: string;
        reportID: string;
        login?: string;
        backTo: Routes;
    };
};

type NewReportWorkspaceSelectionNavigatorParamList = {
    [SCREENS.NEW_REPORT_WORKSPACE_SELECTION.ROOT]: undefined;
};

type ReportDetailsNavigatorParamList = {
    [SCREENS.REPORT_DETAILS.ROOT]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_DETAILS.EXPORT]: {
        reportID: string;
        policyID: string;
        connectionName: ConnectionName;
        backTo?: Routes;
    };
};

type ReportChangeWorkspaceNavigatorParamList = {
    [SCREENS.REPORT_CHANGE_WORKSPACE.ROOT]: {
        reportID: string;
        backTo?: Routes;
    };
};

type ReportSettingsNavigatorParamList = {
    [SCREENS.REPORT_SETTINGS.ROOT]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.NAME]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.VISIBILITY]: {
        reportID: string;
        backTo?: Routes;
    };
};

type ReportDescriptionNavigatorParamList = {
    [SCREENS.REPORT_DESCRIPTION_ROOT]: {
        reportID: string;
        backTo?: Routes;
    };
};

type ParticipantsNavigatorParamList = {
    [SCREENS.REPORT_PARTICIPANTS.ROOT]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_PARTICIPANTS.INVITE]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_PARTICIPANTS.DETAILS]: {
        reportID: string;
        accountID: string;
        backTo?: Routes;
    };
    [SCREENS.REPORT_PARTICIPANTS.ROLE]: {
        reportID: string;
        accountID: string;
        backTo?: Routes;
    };
};

type RoomMembersNavigatorParamList = {
    [SCREENS.ROOM_MEMBERS.ROOT]: {
        reportID: string;
        backTo?: Routes;
    };
    [SCREENS.ROOM_MEMBERS.INVITE]: {
        reportID: string;
        role?: 'accountant';
        backTo?: Routes;
    };
    [SCREENS.ROOM_MEMBERS.DETAILS]: {
        reportID: string;
        accountID: string;
        backTo?: Routes;
    };
};

type MoneyRequestNavigatorParamList = {
    [SCREENS.MONEY_REQUEST.STEP_SEND_FROM]: {
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO]: {
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_DATE]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
        reportActionID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportActionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
        currency?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAG]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
        reportActionID: string;
        orderWeight: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: {
        iouType: IOUType;
        reportID: string;
        backTo: Routes | undefined;
        action: IOUAction;
        pageIndex: string;
        transactionID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_SPLIT_PAYER]: {
        action: ValueOf<typeof CONST.IOU.ACTION>;
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: undefined;
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: undefined;
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: undefined;
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.CREATE]: {
        iouType: IOUType;
        reportID: string;
        transactionID: string;

        // These are not used in the screen, but are needed for the navigation
        // for IOURequestStepDistance and IOURequestStepAmount components
        backTo: never;
        action: never;
        currency: never;
        pageIndex?: string;
    };
    [SCREENS.MONEY_REQUEST.START]: {
        iouType: IOUType;
        reportID: string;
        transactionID: string;
        iouRequestType: IOURequestType;
    };
    [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: {
        iouType: IOUType;
        reportID: string;
        transactionID: string;
        backTo: Routes;
        action: IOUAction;
        pageIndex?: string;
        currency?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE]: {
        action: IOUAction;
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        transactionID: string;
        backTo: Routes;
        reportID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        pageIndex?: string;
        backTo?: string;
        participantsAutoAssigned?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_SCAN]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        pageIndex: number;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_CURRENCY]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        pageIndex?: string;
        backTo?: Routes;
        currency?: string;
    };
    [SCREENS.MONEY_REQUEST.HOLD]: {
        /** ID of the transaction the page was opened for */
        transactionID: string;

        /** ID of the report that user is providing hold reason to */
        reportID: string;

        /** Link to previous page */
        backTo: ExpensifyRoute;

        /** Hash that includes info about what is searched for */
        searchHash?: number;
    };
    [SCREENS.MONEY_REQUEST.STEP_ATTENDEES]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_UPGRADE]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_DESTINATION]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes | undefined;
    };
    [SCREENS.MONEY_REQUEST.STEP_TIME]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes | undefined;
    };
    [SCREENS.MONEY_REQUEST.STEP_SUBRATE]: {
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        reportID: string;
        backTo: Routes | undefined;
        action: IOUAction;
        pageIndex: string;
        transactionID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DESTINATION_EDIT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes | undefined;
    };
    [SCREENS.MONEY_REQUEST.STEP_TIME_EDIT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        backTo: Routes | undefined;
    };
    [SCREENS.MONEY_REQUEST.STEP_SUBRATE_EDIT]: {
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        reportID: string;
        backTo: Routes | undefined;
        action: IOUAction;
        pageIndex: string;
        transactionID: string;
    };
};

type WorkspaceConfirmationNavigatorParamList = {
    [SCREENS.WORKSPACE_CONFIRMATION.ROOT]: {
        backTo?: Routes;
    };
};

type NewTaskNavigatorParamList = {
    [SCREENS.NEW_TASK.ROOT]: {
        backTo?: Routes;
    };
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: {
        backTo?: Routes;
    };
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: undefined;
    [SCREENS.NEW_TASK.DETAILS]: {
        backTo?: Routes;
    };
    [SCREENS.NEW_TASK.TITLE]: {
        backTo?: Routes;
    };
    [SCREENS.NEW_TASK.DESCRIPTION]: {
        backTo?: Routes;
    };
};

type TeachersUniteNavigatorParamList = {
    [SCREENS.SAVE_THE_WORLD.ROOT]: undefined;
    [SCREENS.I_KNOW_A_TEACHER]: undefined;
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: undefined;
    [SCREENS.I_AM_A_TEACHER]: undefined;
};

type TaskDetailsNavigatorParamList = {
    [SCREENS.TASK.TITLE]: {
        backTo?: Routes;
    };
    [SCREENS.TASK.ASSIGNEE]: {
        reportID: string;
        backTo?: Routes;
    };
};

type EnablePaymentsNavigatorParamList = {
    [SCREENS.ENABLE_PAYMENTS_ROOT]: undefined;
};

type SplitDetailsNavigatorParamList = {
    [SCREENS.SPLIT_DETAILS.ROOT]: {
        reportID: string;
        reportActionID: string;
        backTo?: Routes;
    };
    [SCREENS.SPLIT_DETAILS.EDIT_REQUEST]: {
        field: string;
        reportID: string;
        reportActionID: string;
        currency: string;
        tagIndex: string;
    };
};

type AddPersonalBankAccountNavigatorParamList = {
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: undefined;
};

type ReimbursementAccountNavigatorParamList = {
    [SCREENS.REIMBURSEMENT_ACCOUNT_ROOT]: {
        stepToOpen?: ReimbursementAccountStepToOpen;
        backTo?: Routes;
        policyID?: string;
    };
};

type WalletStatementNavigatorParamList = {
    [SCREENS.WALLET_STATEMENT_ROOT]: {
        /** The statement year and month as one string, i.e. 202110 */
        yearMonth: string;
    };
};

type FlagCommentNavigatorParamList = {
    [SCREENS.FLAG_COMMENT_ROOT]: {
        reportID: string;
        reportActionID: string;
        backTo?: Routes;
    };
};

type EditRequestNavigatorParamList = {
    [SCREENS.EDIT_REQUEST.REPORT_FIELD]: {
        fieldID: string;
        reportID: string;
        policyID: string;
        backTo?: Routes;
    };
};

type SignInNavigatorParamList = {
    [SCREENS.SIGN_IN_ROOT]: undefined;
};

type FeatureTrainingNavigatorParamList = {
    [SCREENS.FEATURE_TRAINING_ROOT]: undefined;
    [SCREENS.PROCESS_MONEY_REQUEST_HOLD_ROOT]: undefined;
    [SCREENS.CHANGE_POLICY_EDUCATIONAL_ROOT]: undefined;
};

type ReferralDetailsNavigatorParamList = {
    [SCREENS.REFERRAL_DETAILS]: {
        contentType: ValueOf<typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES>;
        backTo: string;
    };
};

type PrivateNotesNavigatorParamList = {
    [SCREENS.PRIVATE_NOTES.LIST]: {
        backTo?: Routes;
    };
    [SCREENS.PRIVATE_NOTES.EDIT]: {
        reportID: string;
        accountID: string;
        backTo?: Routes;
    };
};

type TransactionDuplicateNavigatorParamList = {
    [SCREENS.TRANSACTION_DUPLICATE.REVIEW]: {
        threadReportID: string;
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.MERCHANT]: {
        threadReportID: string;
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.CATEGORY]: {
        threadReportID: string;
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.TAG]: {
        threadReportID: string;
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.DESCRIPTION]: {
        threadReportID: string;
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.TAX_CODE]: {
        threadReportID: string;
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.BILLABLE]: {
        threadReportID: string;
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.REIMBURSABLE]: {
        threadReportID: string;
        backTo?: Routes;
    };
};

type LeftModalNavigatorParamList = {
    [SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER]: undefined;
};

type RightModalNavigatorParamList = {
    [SCREENS.RIGHT_MODAL.SETTINGS]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH]: NavigatorScreenParams<TwoFactorAuthNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_CHAT]: NavigatorScreenParams<NewChatNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.DETAILS]: NavigatorScreenParams<DetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PROFILE]: NavigatorScreenParams<ProfileNavigatorParamList>;
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.RIGHT_MODAL.NEW_REPORT_WORKSPACE_SELECTION]: NavigatorScreenParams<NewReportWorkspaceSelectionNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_DETAILS]: NavigatorScreenParams<ReportDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_CHANGE_WORKSPACE]: NavigatorScreenParams<ReportChangeWorkspaceNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_SETTINGS]: NavigatorScreenParams<ReportSettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SETTINGS_CATEGORIES]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SETTINGS_TAGS]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.EXPENSIFY_CARD]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.DOMAIN_CARD]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_DESCRIPTION]: NavigatorScreenParams<ReportDescriptionNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PARTICIPANTS]: NavigatorScreenParams<ParticipantsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ROOM_MEMBERS]: NavigatorScreenParams<RoomMembersNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.MONEY_REQUEST]: NavigatorScreenParams<MoneyRequestNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.WORKSPACE_CONFIRMATION]: NavigatorScreenParams<WorkspaceConfirmationNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_TASK]: NavigatorScreenParams<NewTaskNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TEACHERS_UNITE]: NavigatorScreenParams<TeachersUniteNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TASK_DETAILS]: NavigatorScreenParams<TaskDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ENABLE_PAYMENTS]: NavigatorScreenParams<EnablePaymentsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SPLIT_DETAILS]: NavigatorScreenParams<SplitDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT]: NavigatorScreenParams<AddPersonalBankAccountNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.WALLET_STATEMENT]: NavigatorScreenParams<WalletStatementNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.FLAG_COMMENT]: NavigatorScreenParams<FlagCommentNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.EDIT_REQUEST]: NavigatorScreenParams<EditRequestNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SIGN_IN]: NavigatorScreenParams<SignInNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REFERRAL]: NavigatorScreenParams<ReferralDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PRIVATE_NOTES]: NavigatorScreenParams<PrivateNotesNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE]: NavigatorScreenParams<TransactionDuplicateNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TRAVEL]: NavigatorScreenParams<TravelNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH_REPORT]: NavigatorScreenParams<SearchReportParamList>;
    [SCREENS.RIGHT_MODAL.RESTRICTED_ACTION]: NavigatorScreenParams<RestrictedActionParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH_ADVANCED_FILTERS]: NavigatorScreenParams<SearchAdvancedFiltersParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH_SAVED_SEARCH]: NavigatorScreenParams<SearchSavedSearchParamList>;
    [SCREENS.RIGHT_MODAL.MISSING_PERSONAL_DETAILS]: NavigatorScreenParams<MissingPersonalDetailsParamList>;
    [SCREENS.RIGHT_MODAL.DEBUG]: NavigatorScreenParams<DebugParamList>;
};

type TravelNavigatorParamList = {
    [SCREENS.TRAVEL.MY_TRIPS]: undefined;
    [SCREENS.TRAVEL.TRIP_SUMMARY]: {
        reportID: string;
        transactionID: string;
        backTo?: string;
    };
    [SCREENS.TRAVEL.TRIP_DETAILS]: {
        reportID: string;
        transactionID: string;
        reservationIndex: number;
        backTo?: string;
    };
    [SCREENS.TRAVEL.TCS]: {
        domain?: string;
    };
    [SCREENS.TRAVEL.DOMAIN_PERMISSION_INFO]: {
        domain: string;
    };
    [SCREENS.TRAVEL.WORKSPACE_ADDRESS]: {
        domain: string;
    };
};

type ReportsSplitNavigatorParamList = {
    [SCREENS.HOME]: undefined;
    [SCREENS.REPORT]: {
        reportActionID: string;
        reportID: string;
        openOnAdminRoom?: boolean;
        referrer?: string;
        moneyRequestReportActionID?: string;
        transactionID?: string;
    };
};

type SettingsSplitNavigatorParamList = {
    [SCREENS.SETTINGS.ROOT]: undefined;
    [SCREENS.SETTINGS.WORKSPACES]: {
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    [SCREENS.SETTINGS.PROFILE.ROOT]: undefined;
    [SCREENS.SETTINGS.WALLET.ROOT]: undefined;
    [SCREENS.SETTINGS.ABOUT]: undefined;
    [SCREENS.SETTINGS.TROUBLESHOOT]: undefined;
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: undefined;
};

type WorkspaceSplitNavigatorParamList = {
    [SCREENS.WORKSPACE.INITIAL]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.PROFILE]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_TRANSACTION_START_DATE]: {
        policyID: string;
        feed: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.PER_DIEM]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_NEW]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT]: {
        policyID: string;
        firstApproverEmail: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER]: {
        policyID: string;
        approverIndex: number;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVOICES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CATEGORIES]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.MORE_FEATURES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAGS]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAXES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES]: {
        policyID: string;
    };
};

type OnboardingModalNavigatorParamList = {
    [SCREENS.ONBOARDING_MODAL.ONBOARDING]: {
        backTo?: string;
    };
    [SCREENS.ONBOARDING.PERSONAL_DETAILS]: {
        backTo?: string;
    };
    [SCREENS.ONBOARDING.PRIVATE_DOMAIN]: {
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORKSPACES]: {
        backTo?: string;
    };
    [SCREENS.ONBOARDING.PURPOSE]: {
        backTo?: string;
    };
    [SCREENS.ONBOARDING.EMPLOYEES]: {
        backTo?: string;
    };
    [SCREENS.ONBOARDING.ACCOUNTING]: {
        backTo?: string;
    };
};

type WelcomeVideoModalNavigatorParamList = {
    [SCREENS.WELCOME_VIDEO.ROOT]: undefined;
};

type ExplanationModalNavigatorParamList = {
    [SCREENS.EXPLANATION_MODAL.ROOT]: undefined;
};

type MigratedUserModalNavigatorParamList = {
    [SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT]: undefined;
};

type SharedScreensParamList = {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NavigatorScreenParams<ReportsSplitNavigatorParamList>;
    [SCREENS.TRANSITION_BETWEEN_APPS]: {
        email?: string;
        accountID?: number;
        error?: string;
        shortLivedAuthToken?: string;
        shortLivedToken?: string;
        authTokenType?: ValueOf<typeof CONST.AUTH_TOKEN_TYPES>;
        exitTo?: Routes | HybridAppRoute;
        shouldForceLogin: string;
        domain?: Routes;
    };
    [SCREENS.VALIDATE_LOGIN]: {
        accountID: string;
        validateCode: string;
        exitTo?: Routes | HybridAppRoute;
    };
};

type ShareNavigatorParamList = {
    [SCREENS.SHARE.ROOT]: undefined;
    [SCREENS.SHARE.SHARE_DETAILS]: {reportOrAccountID: string};
    [SCREENS.SHARE.SUBMIT_DETAILS]: {reportOrAccountID: string};
};

type PublicScreensParamList = SharedScreensParamList & {
    [SCREENS.UNLINK_LOGIN]: {
        accountID?: string;
        validateCode?: string;
    };
    [SCREENS.SIGN_IN_WITH_APPLE_DESKTOP]: undefined;
    [SCREENS.SIGN_IN_WITH_GOOGLE_DESKTOP]: undefined;
    [SCREENS.SAML_SIGN_IN]: undefined;
    [SCREENS.CONNECTION_COMPLETE]: undefined;
    [SCREENS.BANK_CONNECTION_COMPLETE]: undefined;
    [NAVIGATORS.PUBLIC_RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<ConsoleNavigatorParamList>;
};

type AuthScreensParamList = SharedScreensParamList & {
    [SCREENS.CONCIERGE]: undefined;
    [SCREENS.TRACK_EXPENSE]: undefined;
    [SCREENS.SUBMIT_EXPENSE]: undefined;
    [SCREENS.ATTACHMENTS]: {
        reportID: string;
        source: string;
        type: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
        accountID: string;
        isAuthTokenRequired?: string;
        fileName?: string;
        attachmentLink?: string;
    };
    [SCREENS.PROFILE_AVATAR]: {
        accountID: string;
    };
    [SCREENS.WORKSPACE_AVATAR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE_JOIN_USER]: {
        policyID: string;
        email: string;
    };
    [SCREENS.REPORT_AVATAR]: {
        reportID: string;
        policyID?: string;
    };
    [SCREENS.NOT_FOUND]: undefined;
    [SCREENS.REQUIRE_TWO_FACTOR_AUTH]: undefined;
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NavigatorScreenParams<ReportsSplitNavigatorParamList> & {policyID?: string};
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NavigatorScreenParams<SettingsSplitNavigatorParamList> & {policyID?: string};
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: NavigatorScreenParams<WorkspaceSplitNavigatorParamList>;
    [NAVIGATORS.LEFT_MODAL_NAVIGATOR]: NavigatorScreenParams<LeftModalNavigatorParamList>;
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
    [NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]: NavigatorScreenParams<OnboardingModalNavigatorParamList>;
    [NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR]: NavigatorScreenParams<FeatureTrainingNavigatorParamList>;
    [NAVIGATORS.WELCOME_VIDEO_MODAL_NAVIGATOR]: NavigatorScreenParams<WelcomeVideoModalNavigatorParamList>;
    [NAVIGATORS.EXPLANATION_MODAL_NAVIGATOR]: NavigatorScreenParams<ExplanationModalNavigatorParamList>;
    [NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR]: NavigatorScreenParams<MigratedUserModalNavigatorParamList>;
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NavigatorScreenParams<SearchFullscreenNavigatorParamList>;
    [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: undefined;
    [SCREENS.TRANSACTION_RECEIPT]: {
        reportID: string;
        transactionID: string;
        readonly?: string;
        isFromReviewDuplicates?: string;
        action?: IOUAction;
        iouType?: IOUType;
    };
    [SCREENS.CONNECTION_COMPLETE]: undefined;
    [NAVIGATORS.SHARE_MODAL_NAVIGATOR]: NavigatorScreenParams<ShareNavigatorParamList>;
    [SCREENS.BANK_CONNECTION_COMPLETE]: undefined;
};

type SearchReportParamList = {
    [SCREENS.SEARCH.REPORT_RHP]: {
        reportID: string;
        reportActionID?: string;
    };
    [SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP]: {
        /** ID of the transaction the page was opened for */
        transactionID: string;

        /** ID of the report that user is providing hold reason to */
        reportID: string;

        /** Link to previous page */
        backTo: ExpensifyRoute;

        /** Hash that includes info about what is searched for */
        searchHash?: number;
    };
};

type SearchFullscreenNavigatorParamList = {
    [SCREENS.SEARCH.ROOT]: {
        q: SearchQueryString;
        name?: string;
        groupBy?: string;
    };
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT]: {
        reportID: string;
    };
};

type SearchAdvancedFiltersParamList = {
    [SCREENS.SEARCH.ADVANCED_FILTERS_RHP]: Record<string, never>;
};

type SearchSavedSearchParamList = {
    [SCREENS.SEARCH.SAVED_SEARCH_RENAME_RHP]: SaveSearchParams;
};

type RestrictedActionParamList = {
    [SCREENS.RESTRICTED_ACTION_ROOT]: {
        policyID: string;
    };
};

type MissingPersonalDetailsParamList = {
    [SCREENS.MISSING_PERSONAL_DETAILS_ROOT]: undefined;
};

type DebugParamList = {
    [SCREENS.DEBUG.REPORT]: {
        reportID: string;
    };
    [SCREENS.DEBUG.REPORT_ACTION]: {
        reportID: string;
        reportActionID: string;
    };
    [SCREENS.DEBUG.REPORT_ACTION_CREATE]: {
        reportID: string;
    };
    [SCREENS.DEBUG.DETAILS_CONSTANT_PICKER_PAGE]: {
        formType: string;
        fieldName: string;
        fieldValue?: string;
        policyID?: string;
        backTo?: string;
    };
    [SCREENS.DEBUG.DETAILS_DATE_TIME_PICKER_PAGE]: {
        fieldName: string;
        fieldValue?: string;
        backTo?: string;
    };
    [SCREENS.DEBUG.TRANSACTION]: {
        transactionID: string;
    };
    [SCREENS.DEBUG.TRANSACTION_VIOLATION_CREATE]: {
        transactionID: string;
    };
    [SCREENS.DEBUG.TRANSACTION_VIOLATION]: {
        transactionID: string;
        index: string;
    };
};

type RootNavigatorParamList = PublicScreensParamList & AuthScreensParamList & LeftModalNavigatorParamList & SearchFullscreenNavigatorParamList;

type OnboardingFlowName = keyof OnboardingModalNavigatorParamList;

type SplitNavigatorName = keyof SplitNavigatorParamList;

type SearchFullscreenNavigatorName = typeof NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;

type FullScreenName = SplitNavigatorName | SearchFullscreenNavigatorName;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ReactNavigation {
        // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-interface
        interface RootParamList extends RootNavigatorParamList {}
    }
}

export type {
    AddPersonalBankAccountNavigatorParamList,
    AuthScreensParamList,
    BackToParams,
    DebugParamList,
    DetailsNavigatorParamList,
    EditRequestNavigatorParamList,
    EnablePaymentsNavigatorParamList,
    ExplanationModalNavigatorParamList,
    FeatureTrainingNavigatorParamList,
    FlagCommentNavigatorParamList,
    FullScreenName,
    LeftModalNavigatorParamList,
    MissingPersonalDetailsParamList,
    MoneyRequestNavigatorParamList,
    NavigationPartialRoute,
    NavigationRef,
    NavigationRoot,
    NavigationStateRoute,
    NavigationRoute,
    NewChatNavigatorParamList,
    NewTaskNavigatorParamList,
    OnboardingFlowName,
    OnboardingModalNavigatorParamList,
    ParticipantsNavigatorParamList,
    PrivateNotesNavigatorParamList,
    ProfileNavigatorParamList,
    PublicScreensParamList,
    ReferralDetailsNavigatorParamList,
    ReimbursementAccountNavigatorParamList,
    NewReportWorkspaceSelectionNavigatorParamList,
    ReportDescriptionNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportChangeWorkspaceNavigatorParamList,
    ReportSettingsNavigatorParamList,
    ReportsSplitNavigatorParamList,
    RestrictedActionParamList,
    ShareNavigatorParamList,
    RightModalNavigatorParamList,
    RoomMembersNavigatorParamList,
    RootNavigatorParamList,
    SearchAdvancedFiltersParamList,
    SearchReportParamList,
    SearchSavedSearchParamList,
    SearchFullscreenNavigatorParamList,
    SettingsNavigatorParamList,
    SettingsSplitNavigatorParamList,
    SignInNavigatorParamList,
    SplitDetailsNavigatorParamList,
    SplitNavigatorBySidebar,
    SplitNavigatorName,
    SplitNavigatorParamList,
    SplitNavigatorSidebarScreen,
    StackNavigationAction,
    State,
    StateOrRoute,
    TaskDetailsNavigatorParamList,
    TeachersUniteNavigatorParamList,
    TransactionDuplicateNavigatorParamList,
    TravelNavigatorParamList,
    WalletStatementNavigatorParamList,
    WelcomeVideoModalNavigatorParamList,
    WorkspaceSplitNavigatorParamList,
    MigratedUserModalNavigatorParamList,
    WorkspaceConfirmationNavigatorParamList,
    TwoFactorAuthNavigatorParamList,
    ConsoleNavigatorParamList,
};

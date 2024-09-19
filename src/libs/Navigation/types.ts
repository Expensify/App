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
import type CONST from '@src/CONST';
import type {Country, IOUAction, IOUType} from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import type {HybridAppRoute, Route as Routes} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type EXIT_SURVEY_REASON_FORM_INPUT_IDS from '@src/types/form/ExitSurveyReasonForm';
import type {ConnectionName, SageIntacctMappingName} from '@src/types/onyx/Policy';

type NavigationRef = NavigationContainerRefWithCurrent<RootStackParamList>;

type NavigationRoot = NavigationHelpers<RootStackParamList>;

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

type CentralPaneScreensParamList = {
    [SCREENS.REPORT]: {
        reportActionID: string;
        reportID: string;
        openOnAdminRoom?: boolean;
        referrer?: string;
    };
    [SCREENS.SETTINGS.PROFILE.ROOT]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    [SCREENS.SETTINGS.WALLET.ROOT]: undefined;
    [SCREENS.SETTINGS.ABOUT]: undefined;
    [SCREENS.SETTINGS.TROUBLESHOOT]: undefined;
    [SCREENS.SETTINGS.WORKSPACES]: undefined;

    [SCREENS.SEARCH.CENTRAL_PANE]: {
        q: SearchQueryString;
    };
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: undefined;
};

type BackToParams = {
    backTo?: Routes;
};

type BackToAndForwardToParms = {
    backTo?: Routes;
    forwardTo?: Routes;
};

type SettingsNavigatorParamList = {
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.SETTINGS.PROFILE.ROOT]: undefined;
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
        backTo: Routes;
    };
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.THEME]: undefined;
    [SCREENS.SETTINGS.CLOSE]: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    [SCREENS.SETTINGS.ABOUT]: undefined;
    [SCREENS.SETTINGS.TROUBLESHOOT]: undefined;
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: undefined;
    [SCREENS.SETTINGS.TROUBLESHOOT]: undefined;
    [SCREENS.SETTINGS.CONSOLE]: {
        backTo: Routes;
    };
    [SCREENS.SETTINGS.SHARE_LOG]: {
        /** URL of the generated file to share logs in a report */
        source: string;
        backTo: Routes;
    };
    [SCREENS.SETTINGS.WALLET.ROOT]: undefined;
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: undefined;
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME]: {
        /** domain of selected card */
        domain: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.PHONE]: {
        /** domain of selected card */
        domain: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS]: {
        /** Currently selected country */
        country: string;
        /** domain of selected card */
        domain: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM]: {
        /** Currently selected country */
        country: string;
        /** domain of selected card */
        domain: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_PAYER]: {
        policyID: string;
    };
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: undefined;
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: undefined;
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: undefined;
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: undefined;
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
    [SCREENS.WORKSPACE.RATE_AND_UNIT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RATE_AND_UNIT_RATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RATE_AND_UNIT_UNIT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: {
        policyID: string;
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
    };
    [SCREENS.WORKSPACE.CATEGORY_GL_CODE]: {
        policyID: string;
        categoryName: string;
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
        policyID: string;
        featureName: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: {
        policyID: string;
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORIES_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CATEGORIES_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAG_CREATE]: {
        policyID: string;
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
    };
    [SCREENS.WORKSPACE.TAGS_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAG_SETTINGS]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
    };
    [SCREENS.WORKSPACE.TAG_LIST_VIEW]: {
        policyID: string;
        orderWeight: number;
    };
    [SCREENS.WORKSPACE.TAGS_EDIT]: {
        policyID: string;
        orderWeight: number;
    };
    [SCREENS.WORKSPACE.TAG_EDIT]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
    };
    [SCREENS.WORKSPACE.TAG_GL_CODE]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
    };
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: undefined;
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
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: {
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
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: {
        policyID: string;
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
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PREFERRED_EXPORTER_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_DATE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_RECEIVABLE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT]: {
        policyID: string;
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
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_EXPENSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR]: {
        policyID: string;
        reimbursable: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT]: {
        policyID: string;
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
    [SCREENS.GET_ASSISTANCE]: {
        backTo: Routes;
    };
    [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: {
        backTo?: Routes;
        forwardTo?: string;
    };
    [SCREENS.SETTINGS.DELEGATE.ADD_DELEGATE]: undefined;
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_ROLE]: {
        login: string;
        role?: string;
    };
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM]: {
        login: string;
        role: string;
    };
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_MAGIC_CODE]: {
        login: string;
        role: string;
    };
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.KEYBOARD_SHORTCUTS]: undefined;
    [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: undefined;
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
    [SCREENS.WORKSPACE.COMPANY_CARD_DETAILS]: {
        policyID: string;
        bank: string;
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
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS]: {
        policyID: string;
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
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT]: {
        policyID: string;
        cardID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE]: {
        policyID: string;
        cardID: string;
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
} & ReimbursementAccountNavigatorParamList;

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

type ReportDetailsNavigatorParamList = {
    [SCREENS.REPORT_DETAILS.ROOT]: undefined;
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: {
        reportID: string;
    };
    [SCREENS.REPORT_DETAILS.EXPORT]: {
        reportID: string;
        policyID: string;
        connectionName: ConnectionName;
    };
};

type ReportSettingsNavigatorParamList = {
    [SCREENS.REPORT_SETTINGS.ROOT]: {reportID: string};
    [SCREENS.REPORT_SETTINGS.NAME]: {reportID: string};
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: {reportID: string};
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: {reportID: string};
    [SCREENS.REPORT_SETTINGS.VISIBILITY]: {
        reportID: string;
    };
};

type ReportDescriptionNavigatorParamList = {
    [SCREENS.REPORT_DESCRIPTION_ROOT]: {reportID: string};
};

type ParticipantsNavigatorParamList = {
    [SCREENS.REPORT_PARTICIPANTS.ROOT]: {reportID: string};
    [SCREENS.REPORT_PARTICIPANTS.INVITE]: {reportID: string};
    [SCREENS.REPORT_PARTICIPANTS.DETAILS]: {
        reportID: string;
        accountID: string;
    };
    [SCREENS.REPORT_PARTICIPANTS.ROLE]: {
        reportID: string;
        accountID: string;
    };
};

type RoomMembersNavigatorParamList = {
    [SCREENS.ROOM_MEMBERS.ROOT]: {reportID: string};
    [SCREENS.ROOM_MEMBERS.INVITE]: {
        reportID: string;
        role?: 'accountant';
    };
    [SCREENS.ROOM_MEMBERS.DETAILS]: {
        reportID: string;
        accountID: string;
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
        backTo: string;
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
};

type NewTaskNavigatorParamList = {
    [SCREENS.NEW_TASK.ROOT]: undefined;
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: undefined;
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: undefined;
    [SCREENS.NEW_TASK.DETAILS]: undefined;
    [SCREENS.NEW_TASK.TITLE]: undefined;
    [SCREENS.NEW_TASK.DESCRIPTION]: undefined;
};

type TeachersUniteNavigatorParamList = {
    [SCREENS.SAVE_THE_WORLD.ROOT]: undefined;
    [SCREENS.I_KNOW_A_TEACHER]: undefined;
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: undefined;
    [SCREENS.I_AM_A_TEACHER]: undefined;
};

type TaskDetailsNavigatorParamList = {
    [SCREENS.TASK.TITLE]: undefined;
    [SCREENS.TASK.ASSIGNEE]: {
        reportID: string;
    };
};

type EnablePaymentsNavigatorParamList = {
    [SCREENS.ENABLE_PAYMENTS_ROOT]: undefined;
};

type SplitDetailsNavigatorParamList = {
    [SCREENS.SPLIT_DETAILS.ROOT]: {
        reportID: string;
        reportActionID: string;
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
        stepToOpen?: string;
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
    };
};

type EditRequestNavigatorParamList = {
    [SCREENS.EDIT_REQUEST.REPORT_FIELD]: undefined;
};

type SignInNavigatorParamList = {
    [SCREENS.SIGN_IN_ROOT]: undefined;
};

type FeatureTrainingNavigatorParamList = {
    [SCREENS.FEATURE_TRAINING_ROOT]: undefined;
};

type ReferralDetailsNavigatorParamList = {
    [SCREENS.REFERRAL_DETAILS]: {
        contentType: ValueOf<typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES>;
        backTo: string;
    };
};

type ProcessMoneyRequestHoldNavigatorParamList = {
    [SCREENS.PROCESS_MONEY_REQUEST_HOLD_ROOT]: undefined;
};

type PrivateNotesNavigatorParamList = {
    [SCREENS.PRIVATE_NOTES.LIST]: undefined;
    [SCREENS.PRIVATE_NOTES.EDIT]: {
        reportID: string;
        accountID: string;
    };
};

type TransactionDuplicateNavigatorParamList = {
    [SCREENS.TRANSACTION_DUPLICATE.REVIEW]: {
        threadReportID: string;
    };
    [SCREENS.TRANSACTION_DUPLICATE.MERCHANT]: {
        threadReportID: string;
    };
    [SCREENS.TRANSACTION_DUPLICATE.CATEGORY]: {
        threadReportID: string;
    };
    [SCREENS.TRANSACTION_DUPLICATE.TAG]: {
        threadReportID: string;
    };
    [SCREENS.TRANSACTION_DUPLICATE.DESCRIPTION]: {
        threadReportID: string;
    };
    [SCREENS.TRANSACTION_DUPLICATE.TAX_CODE]: {
        threadReportID: string;
    };
    [SCREENS.TRANSACTION_DUPLICATE.BILLABLE]: {
        threadReportID: string;
    };
    [SCREENS.TRANSACTION_DUPLICATE.REIMBURSABLE]: {
        threadReportID: string;
    };
};

type LeftModalNavigatorParamList = {
    [SCREENS.LEFT_MODAL.CHAT_FINDER]: undefined;
    [SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER]: undefined;
};

type RightModalNavigatorParamList = {
    [SCREENS.RIGHT_MODAL.SETTINGS]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_CHAT]: NavigatorScreenParams<NewChatNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.DETAILS]: NavigatorScreenParams<DetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PROFILE]: NavigatorScreenParams<ProfileNavigatorParamList>;
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.RIGHT_MODAL.REPORT_DETAILS]: NavigatorScreenParams<ReportDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_SETTINGS]: NavigatorScreenParams<ReportSettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SETTINGS_CATEGORIES]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_DESCRIPTION]: NavigatorScreenParams<ReportDescriptionNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PARTICIPANTS]: NavigatorScreenParams<ParticipantsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ROOM_MEMBERS]: NavigatorScreenParams<RoomMembersNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.MONEY_REQUEST]: NavigatorScreenParams<MoneyRequestNavigatorParamList>;
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
    [SCREENS.RIGHT_MODAL.PROCESS_MONEY_REQUEST_HOLD]: NavigatorScreenParams<ProcessMoneyRequestHoldNavigatorParamList>;
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
};

type FullScreenNavigatorParamList = {
    [SCREENS.WORKSPACE.INITIAL]: {
        policyID: string;
        backTo?: string;
    };
    [SCREENS.WORKSPACE.PROFILE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CARD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD]: {
        policyID: string;
        feed: string;
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
    [SCREENS.WORKSPACE.REIMBURSE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.BILLS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVOICES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TRAVEL]: {
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
    [SCREENS.ONBOARDING.PURPOSE]: {
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORK]: {
        backTo?: string;
    };
};

type WelcomeVideoModalNavigatorParamList = {
    [SCREENS.WELCOME_VIDEO.ROOT]: undefined;
};

type ExplanationModalNavigatorParamList = {
    [SCREENS.EXPLANATION_MODAL.ROOT]: undefined;
};

type BottomTabNavigatorParamList = {
    [SCREENS.HOME]: {policyID?: string};
    [SCREENS.SEARCH.BOTTOM_TAB]: undefined;
    [SCREENS.SETTINGS.ROOT]: {policyID?: string};
};

type SharedScreensParamList = {
    [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]: NavigatorScreenParams<BottomTabNavigatorParamList>;
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

type PublicScreensParamList = SharedScreensParamList & {
    [SCREENS.UNLINK_LOGIN]: {
        accountID?: string;
        validateCode?: string;
    };
    [SCREENS.SIGN_IN_WITH_APPLE_DESKTOP]: undefined;
    [SCREENS.SIGN_IN_WITH_GOOGLE_DESKTOP]: undefined;
    [SCREENS.SAML_SIGN_IN]: undefined;
    [SCREENS.CONNECTION_COMPLETE]: undefined;
};

type AuthScreensParamList = CentralPaneScreensParamList &
    SharedScreensParamList & {
        [SCREENS.CONCIERGE]: undefined;
        [SCREENS.TRACK_EXPENSE]: undefined;
        [SCREENS.SUBMIT_EXPENSE]: undefined;
        [SCREENS.ATTACHMENTS]: {
            reportID: string;
            source: string;
            type: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
            accountID: string;
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
        [NAVIGATORS.LEFT_MODAL_NAVIGATOR]: NavigatorScreenParams<LeftModalNavigatorParamList>;
        [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
        [NAVIGATORS.FULL_SCREEN_NAVIGATOR]: NavigatorScreenParams<FullScreenNavigatorParamList>;
        [NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]: NavigatorScreenParams<OnboardingModalNavigatorParamList>;
        [NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR]: NavigatorScreenParams<FeatureTrainingNavigatorParamList>;
        [NAVIGATORS.WELCOME_VIDEO_MODAL_NAVIGATOR]: NavigatorScreenParams<WelcomeVideoModalNavigatorParamList>;
        [NAVIGATORS.EXPLANATION_MODAL_NAVIGATOR]: NavigatorScreenParams<ExplanationModalNavigatorParamList>;
        [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: undefined;
        [SCREENS.TRANSACTION_RECEIPT]: {
            reportID: string;
            transactionID: string;
            readonly?: boolean;
        };
        [SCREENS.CONNECTION_COMPLETE]: undefined;
    };

type SearchReportParamList = {
    [SCREENS.SEARCH.REPORT_RHP]: {
        reportID: string;
        reportActionID?: string;
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
        fieldName: string;
        fieldValue?: string;
        backTo?: string;
    };
    [SCREENS.DEBUG.DETAILS_DATE_TIME_PICKER_PAGE]: {
        fieldName: string;
        fieldValue?: string;
        backTo?: string;
    };
};

type RootStackParamList = PublicScreensParamList & AuthScreensParamList & LeftModalNavigatorParamList;

type BottomTabName = keyof BottomTabNavigatorParamList;

type FullScreenName = keyof FullScreenNavigatorParamList;

type CentralPaneName = keyof CentralPaneScreensParamList;

type OnboardingFlowName = keyof OnboardingModalNavigatorParamList;

type SwitchPolicyIDParams = {
    policyID?: string;
    route?: Routes;
    isPolicyAdmin?: boolean;
};

export type {
    AddPersonalBankAccountNavigatorParamList,
    AuthScreensParamList,
    CentralPaneScreensParamList,
    CentralPaneName,
    BackToParams,
    BackToAndForwardToParms,
    BottomTabName,
    BottomTabNavigatorParamList,
    DetailsNavigatorParamList,
    EditRequestNavigatorParamList,
    EnablePaymentsNavigatorParamList,
    ExplanationModalNavigatorParamList,
    FlagCommentNavigatorParamList,
    FullScreenName,
    FullScreenNavigatorParamList,
    LeftModalNavigatorParamList,
    MoneyRequestNavigatorParamList,
    NavigationPartialRoute,
    NavigationRef,
    NavigationRoot,
    NavigationStateRoute,
    NewChatNavigatorParamList,
    NewTaskNavigatorParamList,
    OnboardingModalNavigatorParamList,
    OnboardingFlowName,
    ParticipantsNavigatorParamList,
    PrivateNotesNavigatorParamList,
    ProfileNavigatorParamList,
    PublicScreensParamList,
    ReferralDetailsNavigatorParamList,
    ReimbursementAccountNavigatorParamList,
    ReportDescriptionNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportSettingsNavigatorParamList,
    RightModalNavigatorParamList,
    RoomMembersNavigatorParamList,
    RootStackParamList,
    SettingsNavigatorParamList,
    SignInNavigatorParamList,
    FeatureTrainingNavigatorParamList,
    SplitDetailsNavigatorParamList,
    StackNavigationAction,
    State,
    StateOrRoute,
    SwitchPolicyIDParams,
    TravelNavigatorParamList,
    TaskDetailsNavigatorParamList,
    TeachersUniteNavigatorParamList,
    WalletStatementNavigatorParamList,
    WelcomeVideoModalNavigatorParamList,
    TransactionDuplicateNavigatorParamList,
    SearchReportParamList,
    SearchAdvancedFiltersParamList,
    SearchSavedSearchParamList,
    RestrictedActionParamList,
    MissingPersonalDetailsParamList,
    DebugParamList,
};

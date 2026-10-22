import type RECONCILIATION_ACCOUNT_SETTINGS_TYPE from '@pages/workspace/accounting/reconciliation/constants';

import type {Country, IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';
import type {Route as Routes} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CardFeedWithDomainID, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {BusinessCentralBankAccountSettingName, PolicyReportFieldType, SageIntacctMappingName} from '@src/types/onyx/Policy';
import type {CustomFieldType} from '@src/types/onyx/PolicyEmployee';

import type {TupleToUnion, ValueOf} from 'type-fest';

type WorkspaceSettingsParamList = {
    [SCREENS.WORKSPACE.WORKFLOWS_PAYER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CURRENCY]: {
        isForcedToChangeCurrency?: boolean;
        shouldStartExpensifyCardEnrollment?: boolean;
    };
    [SCREENS.WORKSPACE.CURRENCY_GOVERNMENT_RATE_COUNTRY]: {
        policyID: string;
        currencyCode: string;
        isForcedToChangeCurrency?: boolean;
        shouldStartExpensifyCardEnrollment?: boolean;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_OVERVIEW_ADDRESS]: {
        policyID: string;
        country?: Country | '';
    };
    [SCREENS.WORKSPACE.NAME]: undefined;
    [SCREENS.WORKSPACE.OFFICE_LOCATION_ADD]: {
        policyID: string;
        country?: Country | '';
    };
    [SCREENS.WORKSPACE.OFFICE_LOCATION_EDIT]: {
        policyID: string;
        officeID: string;
        country?: Country | '';
    };
    [SCREENS.WORKSPACE.DESCRIPTION]: undefined;
    [SCREENS.WORKSPACE.CLIENT_ID]: undefined;
    [SCREENS.WORKSPACE.SHARE]: undefined;
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_IMPORTED_CONFIRMATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS_IMPORTED_CONFIRMATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE_ROLE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_CREATE]: {
        policyID: string;
    };
    [SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORY_CREATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_EDIT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORY_EDIT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_PAYROLL_CODE]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_PAYROLL_CODE]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_GL_CODE]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_GL_CODE]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_DEFAULT_TAX_RATE]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_AMOUNTS_OVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_EXPENSE_LIMIT_TYPE_SELECTOR]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_IMPORTED_MEMBERS_ROLE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_DESCRIPTION_HINT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_APPROVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_RECEIPTS_OVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_ITEMIZED_RECEIPTS_OVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_SETTINGS]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORY_SETTINGS]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRED_FIELDS]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_NEW]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_EDIT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_AMOUNT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_FIELDS_RULE_NEW]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_FIELDS_RULE_EDIT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_NEW]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.UPGRADE]: {
        policyID?: string;
        featureName?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        categoryId?: string;
        reportID?: string;
        upgradePlanType?: ValueOf<typeof CONST.POLICY.TYPE>;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_DOWNGRADE]: {
        policyID?: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_PAY_AND_DOWNGRADE]: {
        policyID?: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_DEFAULT_CATEGORY_SELECTOR]: {
        policyID: string;
        customUnitID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_IMPORT]: {
        policyID: string;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAG_CREATE]: {
        policyID: string;
    };
    [SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_CREATE]: {
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
    [SCREENS.WORKSPACE.DISTANCE_RATE_NAME_EDIT]: {
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
    [SCREENS.WORKSPACE.DISTANCE_RATE_START_DATE_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_END_DATE_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAGS_IMPORT]: {
        policyID: string;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORT_MULTI_LEVEL_SETTINGS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAGS_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORTED]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORTED_MULTI_LEVEL]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAG_SETTINGS]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        parentTagsFilter?: string;
    };
    [SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_SETTINGS]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        parentTagsFilter?: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAG_LIST_VIEW]: {
        policyID: string;
        orderWeight: number | string;
    };
    [SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_LIST_VIEW]: {
        policyID: string;
        orderWeight: number | string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAGS_EDIT]: {
        policyID: string;
        orderWeight: number;
    };
    [SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAGS_EDIT]: {
        policyID: string;
        orderWeight: number;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAG_EDIT]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
    };
    [SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_EDIT]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
    };
    [SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_GL_CODE]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        parentTagsFilter?: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAG_APPROVER]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
    };
    [SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_APPROVER]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_TAG_GL_CODE]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        parentTagsFilter?: string;
    };
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
    [SCREENS.WORKSPACE.INVOICE_FIELDS_CREATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_REPORT_FIELDS_INITIAL_LIST_VALUE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_INVOICE_FIELDS_INITIAL_LIST_VALUE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES]: {
        policyID: string;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.INVOICE_FIELDS_LIST_VALUES]: {
        policyID: string;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_ADD_VALUE]: {
        policyID: string;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.INVOICE_FIELDS_ADD_VALUE]: {
        policyID: string;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS]: {
        policyID: string;
        valueIndex: number;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.INVOICE_FIELDS_VALUE_SETTINGS]: {
        policyID: string;
        valueIndex: number;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_VALUE]: {
        policyID: string;
        valueIndex: number;
    };
    [SCREENS.WORKSPACE.INVOICE_FIELDS_EDIT_VALUE]: {
        policyID: string;
        valueIndex: number;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_SETTINGS]: {
        policyID: string;
        reportFieldID: string;
    };
    [SCREENS.WORKSPACE.INVOICE_FIELDS_SETTINGS]: {
        policyID: string;
        reportFieldID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE]: {
        policyID: string;
        reportFieldID: string;
    };
    [SCREENS.WORKSPACE.INVOICE_FIELDS_EDIT_INITIAL_VALUE]: {
        policyID: string;
        reportFieldID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_TYPE_SELECTOR]: {
        policyID: string;
        currentType?: PolicyReportFieldType;
    };
    [SCREENS.WORKSPACE.INVOICE_FIELDS_TYPE_SELECTOR]: {
        policyID: string;
        currentType?: PolicyReportFieldType;
    };
    [SCREENS.WORKSPACE.MEMBER_DETAILS]: {
        policyID: string;
        accountID: string;
    };
    [SCREENS.WORKSPACE.ROOM_CREATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE]: {
        policyID: string;
        accountID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS_ROLE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBER_WORK_ARRANGEMENT]: {
        policyID: string;
        accountID: string;
    };
    [SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD]: {
        policyID: string;
        accountID: string;
        customFieldType: CustomFieldType;
    };
    [SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_SUCCESS]: {
        policyID: string;
        accountID: number;
    };
    [SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_ERROR]: {
        policyID: string;
        accountID: number;
    };
    [SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_CHECK]: {
        policyID: string;
        accountID: number;
        error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>;
    };
    [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE]: {
        policyID: string;
        transactionID?: string;
        reportID?: string;
        action?: IOUAction;
        iouType?: IOUType;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES_UNIT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES_GOVERNMENT_RATE_COUNTRY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES_COMMUTER_EXCLUSIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CONNECTIONS_ACCOUNTING]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CONNECTIONS_HR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CONNECTIONS_RECRUITING]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CONNECTIONS_RECEIPT_PARTNERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES_WORK_ARRANGEMENT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_SETUP]: {
        policyID: string;
        isIntuitEnterpriseSuite?: string;
        isSandbox?: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.INTUIT_ENTERPRISE_SUITE_ENTITY_SELECTOR]: {
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
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ITEMS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOM_DIMENSION]: {
        policyID: string;
        dimensionID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_CREDIT_CARD_DEFAULT_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TRAVEL_BILLING_CONFIGURATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TRAVEL_BILLING_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TRAVEL_BILLING_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_TRAVEL_BILLING_CONFIGURATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_TRAVEL_BILLING_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TRAVEL_BILLING_CONFIGURATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TRAVEL_BILLING_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TRAVEL_BILLING_JOURNAL_POSTING_PREFERENCE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_FX_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_EXPORT_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_OUT_OF_POCKET_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_OUT_OF_POCKET_EXPENSE_ENTITY_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_DESKTOP_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_REUSE_EXISTING_CONNECTIONS]: {
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
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_SETUP]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.ZOHO_BOOKS_OAUTH]: {
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
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_TRAVEL_BILLING_CONFIGURATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_TRAVEL_BILLING_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CLAIM_OFFER]: {
        policyID: string;
        integration: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_AUTO_SYNC]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_BILL_STATUS_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_ACCOUNTING_METHOD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_AUTO_SYNC]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_EXPORT_BANK_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_NON_REIMBURSABLE_DEFAULT_CONTACT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_FX_EXPENSE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_PREREQUISITES]: {
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
        subPage?: string;
        authType?: string;
        isMigration?: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_SETUP]: {
        policyID: string;
        accountID?: string;
        isMigration?: string;
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
        subPage?: string;
        action?: 'edit';
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_LIST_SELECTOR]: {
        policyID: string;
        action?: 'edit';
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD]: {
        policyID: string;
        subPage?: string;
        action?: 'edit';
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_PREFERRED_EXPORTER_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_DATE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT_EXPENSES]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_RECEIVABLE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_INVOICE_ITEM_SELECT]: {
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
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_FX_EXPENSE_ACCOUNT_SELECT]: {
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
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX]: {
        policyID: string;
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
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREFERRED_EXPORTER]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT_DATE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_EXPENSES]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_DESTINATION]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_DEFAULT_VENDOR]: {
        policyID: string;
        reimbursable: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_TRAVEL_BILLING_CONFIGURATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_TRAVEL_BILLING_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_AUTO_SYNC]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_ACCOUNTING_METHOD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PAYMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_FX_EXPENSE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_PREREQUISITES]: {
        policyID: string;
        isSandbox?: string;
        subPage?: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_EXISTING_CONNECTIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_DIMENSION_MAPPING]: {
        policyID: string;
        dimension: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_EXPORT_STATUS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_EXPORT_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_DEFAULT_VENDOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_FX_EXPENSE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_TAGS_MAPPING]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_REPORT_EXPORT_STATUS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_COMPANY_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_SETUP]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_EXISTING_CONNECTIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_SUBSIDIARY_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_VENDOR_BILL_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_COMPANY_CARD_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_DEFAULT_COMPANY_CARD_VENDOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_CARD_PROGRAM_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_CARD_PROGRAM_ACCOUNT_SELECTOR]: {
        policyID: string;
        feed: CardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_CARD_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_CARD_ACCOUNT_CARD_LIST]: {
        policyID: string;
        feed: CardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_EXPORT_METHOD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_BILL_PAYMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_FX_EXPENSE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RILLET_TRAVEL_BILLING_SETTLEMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_SETUP]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_EXISTING_CONNECTIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_SUBSIDIARY_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_VENDOR_BILL_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_COMPANY_CARD_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_DEFAULT_COMPANY_CARD_VENDOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_CARD_PROGRAM_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_CARD_PROGRAM_ACCOUNT_SELECTOR]: {
        policyID: string;
        feed: CardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_CARD_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_CARD_ACCOUNT_CARD_LIST]: {
        policyID: string;
        feed: CardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_EXPORT_METHOD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_BILL_PAYMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_FX_EXPENSE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_TRAVEL_BILLING_SETTLEMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DUALENTRY_TRAVEL_BILLING_PAYABLE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_SETUP]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_EXISTING_CONNECTIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_SUBSIDIARY_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_VENDOR_BILL_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_DEFAULT_COMPANY_CARD_VENDOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_COMPANY_CARD_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_CARD_PROGRAM_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_CARD_PROGRAM_ACCOUNT_SELECTOR]: {
        policyID: string;
        feed: CardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_CARD_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_CARD_ACCOUNT_CARD_LIST]: {
        policyID: string;
        feed: CardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_EXPORT_METHOD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_BILL_PAYMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_TRAVEL_BILLING_SETTLEMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_TRAVEL_BILLING_PAYABLE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_PREREQUISITES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_SETUP]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_COMPANY_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT_PREFERRED_EXPORTER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT_REIMBURSABLE_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT_COMPANY_CARD_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT_DEFAULT_VENDOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_EXPORT_PAYMENT_METHOD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_ACCOUNTING_METHOD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_ADVANCED_POSTING_MODE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_BANK_ACCOUNT_SELECTOR]: {
        policyID: string;
        settingName: BusinessCentralBankAccountSettingName;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION]: {
        policyID: string;
        connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_RECONCILIATION_ACCOUNT_SETTINGS]: {
        policyID: string;
        connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
        reconciliationAccountSettingsType?: ValueOf<typeof RECONCILIATION_ACCOUNT_SETTINGS_TYPE>;
        fundID?: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_RECONCILIATION_SELECT_FEED]: {
        policyID: string;
        connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
        fundID?: string;
    };
    [SCREENS.WORKSPACE.TAX_CREATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAX_CREATE_VALUE]: {
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
    [SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_EDIT_TRANSACTION_START_DATE]: {
        policyID: string;
        feed: string;
        cardID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_EXPORT]: {
        policyID: string;
        cardID: string;
        feed: CompanyCardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_CONFIRM_VALIDATE_CODE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT]: {
        policyID: string;
        fundID?: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SELECT_FEED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_TRAVEL_BILLING_SELECT_FEED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_ADD_WORK_EMAIL]: {
        policyID: string;
        fundID: number;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_SELECTION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MERCHANTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MERCHANT_EDIT]: {
        policyID: string;
        merchantIndex: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_CATEGORY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_CURRENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MAX_AMOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_VERIFY_WORK_EMAIL]: {
        policyID: string;
        fundID: number;
    };
    [SCREENS.WORKSPACE.TRAVEL_SETTINGS_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TRAVEL_SETTINGS_FREQUENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TRAVEL_SETTINGS_MONTHLY_LIMIT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TRAVEL_EXPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TRAVEL_MISSING_PERSONAL_DETAILS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_ADD_WORK_EMAIL]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_VERIFY_WORK_EMAIL]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
    };
    [SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_NAME]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_FEED_NAME]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_STATEMENT_CLOSE_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_EXPENSIFY_CARD_DETAILS]: {
        policyID: string;
        cardID: string;
    };
    [SCREENS.EXPENSIFY_CARD.DYNAMIC_EXPENSIFY_CARD_DETAILS]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.DYNAMIC_EXPENSIFY_CARD_NAME]: {
        policyID: string;
        cardID: string;
    };
    [SCREENS.EXPENSIFY_CARD.DYNAMIC_EXPENSIFY_CARD_LIMIT]: {
        policyID: string;
        cardID: string;
    };
    [SCREENS.EXPENSIFY_CARD.DYNAMIC_EXPENSIFY_CARD_LIMIT_TYPE]: {
        policyID: string;
        cardID: string;
    };
    [SCREENS.WORKSPACE.REPORTS_DEFAULT_TITLE]: {
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
    [SCREENS.WORKSPACE.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_REQUIRE_RECEIPTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS]: {
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
    [SCREENS.WORKSPACE.RULES_REIMBURSABLE_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_HR_SYNC_RESULTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RECRUITING_SYNC_RESULTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.HR_GUSTO_APPROVAL_MODE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.HR_GUSTO_FINAL_APPROVER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.HR_ZENEFITS_APPROVAL_MODE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.HR_ZENEFITS_FINAL_APPROVER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.HR_MERGE_APPROVAL_MODE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.HR_MERGE_FINAL_APPROVER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.HR_MERGE_GROUPS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_PROHIBITED_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_CUSTOM]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_NEW]: {
        policyID: string;
        categoryName?: string;
    };
    [SCREENS.WORKSPACE.RULES_EXPENSE_DEFAULT_TYPE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_NEW]: {
        policyID: string;
        categoryName?: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_NEW]: {
        policyID: string;
        categoryName?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MERCHANT_TO_MATCH]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MATCH_TYPE]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MERCHANT]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_CATEGORY]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TAG]: {
        policyID: string;
        orderWeight: number | string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TAX]: {
        policyID: string;
        ruleID?: undefined;
        /** Set when opened from a category tax default in the category details RHP, absent from the callout flow */
        categoryName?: string;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_VENDOR]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_DESCRIPTION]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_REIMBURSABLE]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_BILLABLE]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_PREVIEW_MATCHES]: {
        policyID: string;
        ruleID?: undefined;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_SPEND_NEW]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_NEW]: {
        policyID: string;
        categoryName?: string;
    };
    [SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_EDIT]: {
        policyID: string;
        categoryName: string;
        /** When 'true', category field is locked (e.g. opened from category details RHP). */
        isCategoryLocked?: string;
    };
    [SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_CATEGORY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_CATEGORY_EDIT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_NEW]: {
        policyID: string;
        categoryName?: string;
    };
    [SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_EDIT]: {
        policyID: string;
        categoryName: string;
        /** When 'true', category field is locked (e.g. opened from category details RHP). */
        isCategoryLocked?: string;
    };
    [SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_CATEGORY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_CATEGORY_EDIT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_AMOUNT]: {
        policyID: string;
        /** When 'true', return to create with ?categoryName= so the locked category create entry matches. */
        isCategoryLocked?: string;
    };
    [SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_AMOUNT_EDIT]: {
        policyID: string;
        categoryName: string;
        /** When 'true', preserve locked category on return to the edit screen. */
        isCategoryLocked?: string;
    };
    [SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_EXPENSE_LIMIT_TYPE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_EXPENSE_LIMIT_TYPE_EDIT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_TYPE_EDIT]: {
        policyID: string;
        groupID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_TYPE_CATEGORY]: {
        policyID: string;
        groupID: string;
    };
    [SCREENS.WORKSPACE.RULES_SPEND_EDIT]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_SPEND_CARD]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_SPEND_CATEGORY]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_SPEND_MAX_AMOUNT]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_SPEND_CURRENCIES]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_SPEND_MERCHANTS]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_SPEND_MERCHANT_EDIT]: {
        policyID: string;
        ruleID: string;
        merchantIndex: string;
    };
    [SCREENS.WORKSPACE.RULES_AGENT_NEW]: {
        policyID: string;
        generationID?: string;
    };
    [SCREENS.WORKSPACE.RULES_AGENT_EDIT]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_MATCH_TYPE]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_CATEGORY]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_TAG]: {
        policyID: string;
        ruleID: string;
        orderWeight: number;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_TAX]: {
        policyID: string;
        ruleID: string;
        /** Set when editing a category tax default, so the picker returns to that editor. */
        categoryName?: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_VENDOR]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_DESCRIPTION]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_REIMBURSABLE]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_BILLABLE]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_EDIT]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_CATEGORY_TO_MATCH]: {
        policyID: string;
        ruleID: string;
        categoryName?: string;
    };
    [SCREENS.WORKSPACE.RULES_CATEGORY_TAX_EDIT]: {
        policyID: string;
        categoryName: string;
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
    [SCREENS.WORKSPACE.TIME_TRACKING_DEFAULT_RATE]: {
        policyID: string;
    };
};

export default WorkspaceSettingsParamList;

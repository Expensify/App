import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type * as OnyxTypes from '.';
import type * as OnyxCommon from './OnyxCommon';
import type {WorkspaceTravelSettings} from './TravelSettings';

/** Distance units */
type Unit = 'mi' | 'km';

/** Tax rate attributes of the policy distance rate */
type TaxRateAttributes = {
    /** Percentage of the tax that can be reclaimable */
    taxClaimablePercentage?: number;

    /** External ID associated to this tax rate */
    taxRateExternalID?: string;
};

/** Model of policy distance rate */
type Rate = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Name of the distance rate */
        name?: string;

        /** Amount to be reimbursed per distance unit travelled */
        rate?: number;

        /** Currency used to pay the distance rate */
        currency?: string;

        /** Generated ID to identify the distance rate */
        customUnitRateID?: string;

        /** Whether this distance rate is currently enabled */
        enabled?: boolean;

        /** Error messages to show in UI */
        errors?: OnyxCommon.Errors;

        /** Form fields that triggered the errors */
        errorFields?: OnyxCommon.ErrorFields;

        /** Tax rate attributes of the policy */
        attributes?: TaxRateAttributes;
    },
    keyof TaxRateAttributes
>;

/** Custom unit attributes */
type Attributes = {
    /** Distance unit name */
    unit: Unit;

    /** Whether the tax tracking is enabled or not */
    taxEnabled?: boolean;
};

/** Policy custom unit */
type CustomUnit = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Custom unit name */
        name: string;

        /** ID that identifies this custom unit */
        customUnitID: string;

        /** Contains custom attributes like unit, for this custom unit */
        attributes: Attributes;

        /** Distance rates using this custom unit */
        rates: Record<string, Rate>;

        /** The default category in which this custom unit is used */
        defaultCategory?: string;

        /** Whether this custom unit is enabled */
        enabled?: boolean;

        /** Error messages to show in UI */
        errors?: OnyxCommon.Errors;

        /** Form fields that triggered errors */
        errorFields?: OnyxCommon.ErrorFields;
    },
    keyof Attributes
>;

/** Policy company address data */
type CompanyAddress = {
    /** Street address */
    addressStreet: string;

    /** City */
    city: string;

    /** State */
    state: string;

    /** Zip post code */
    zipCode: string;

    /** Country code */
    country: Country | '';
};

/** Policy disabled fields */
type DisabledFields = {
    /** Whether the default billable field is disabled */
    defaultBillable?: boolean;

    /** Whether the reimbursable field is disabled */
    reimbursable?: boolean;
};

/** Policy tax rate */
type TaxRate = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of the tax rate. */
    name: string;

    /** The value of the tax rate. */
    value: string;

    /** The code associated with the tax rate. If a tax is created in old dot, code field is undefined */
    code?: string;

    /** This contains the tax name and tax value as one name */
    modifiedName?: string;

    /** Indicates if the tax rate is disabled. */
    isDisabled?: boolean;

    /** Indicates if the tax rate is selected. */
    isSelected?: boolean;

    /** The old tax code of the tax rate when we edit the tax code */
    previousTaxCode?: string;

    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;

    /** An error object keyed by field name containing errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;
}>;

/** Record of policy tax rates, indexed by id_{taxRateName} where taxRateName is the name of the tax rate in UPPER_SNAKE_CASE */
type TaxRates = Record<string, TaxRate>;

/** Policy tax rates with default tax rate */
type TaxRatesWithDefault = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of the tax */
    name: string;

    /** Default policy tax code */
    defaultExternalID: string;

    /** Default value of taxes */
    defaultValue: string;

    /** Default foreign policy tax code */
    foreignTaxDefault: string;

    /** List of tax names and values */
    taxes: TaxRates;

    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;

    /** Error objects keyed by field name containing errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;
}>;

/** Connection sync source values */
type JobSourceValues = 'DIRECT' | 'EXPENSIFYWEB' | 'EXPENSIFYAPI' | 'NEWEXPENSIFY' | 'AUTOSYNC' | 'AUTOAPPROVE';

/** Connection last synchronization state */
type ConnectionLastSync = {
    /** Date when the connection's last successful sync occurred */
    successfulDate?: string;

    /** Date when the connection's last failed sync occurred */
    errorDate?: string;

    /** Error message when the connection's last sync failed */
    errorMessage?: string;

    /** If the connection's last sync failed due to authentication error */
    isAuthenticationError: boolean;

    /** Whether the connection's last sync was successful */
    isSuccessful: boolean;

    /** Where did the connection's last sync job come from */
    source: JobSourceValues;

    /**
     * Sometimes we'll have a connection that is not connected, but the connection object is still present, so we can
     * show an error message
     */
    isConnected?: boolean;
};

/** Financial account (bank account, debit card, etc) */
type Account = {
    /** GL code assigned to the financial account */
    glCode?: string;

    /** Name of the financial account */
    name: string;

    /** Currency of the financial account */
    currency: string;

    /** ID assigned to the financial account */
    id: string;
};

/**
 * Model of QuickBooks Online employee data
 *
 * TODO: QBO remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type Employee = {
    /** ID assigned to the employee */
    id: string;

    /** Employee's first name */
    firstName?: string;

    /** Employee's last name */
    lastName?: string;

    /** Employee's display name */
    name: string;

    /** Employee's e-mail */
    email: string;
};

/**
 * Model of QuickBooks Online vendor data
 *
 * TODO: QBO remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type Vendor = {
    /** ID assigned to the vendor */
    id: string;

    /** Vendor's name */
    name: string;

    /** Vendor's currency */
    currency: string;

    /** Vendor's e-mail */
    email: string;
};

/**
 * Model of QuickBooks Online tax code data
 *
 * TODO: QBO remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type TaxCode = {
    /** TODO: Will be handled in another issue */
    totalTaxRateVal: string;

    /** TODO: Will be handled in another issue */
    simpleName: string;

    /** TODO: Will be handled in another issue */
    taxCodeRef: string;

    /** TODO: Will be handled in another issue */
    taxRateRefs: Record<string, string>;

    /** TODO: Will be handled in another issue */
    /** Name of the tax code */
    name: string;
};

/**
 * Data imported from QuickBooks Online.
 *
 * TODO: QBO remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type QBOConnectionData = {
    /** Country code */
    country: ValueOf<typeof CONST.COUNTRY>;

    /** TODO: Will be handled in another issue */
    edition: string;

    /** TODO: Will be handled in another issue */
    homeCurrency: string;

    /** TODO: Will be handled in another issue */
    isMultiCurrencyEnabled: boolean;

    /** Collection of journal entry accounts  */
    journalEntryAccounts: Account[];

    /** Collection of bank accounts */
    bankAccounts: Account[];

    /** Collection of credit cards */
    creditCards: Account[];

    /** Collection of export destination accounts */
    accountsReceivable: Account[];

    /** TODO: Will be handled in another issue */
    accountPayable: Account[];

    /** TODO: Will be handled in another issue */
    otherCurrentAssetAccounts: Account[];

    /** TODO: Will be handled in another issue */
    taxCodes: TaxCode[];

    /** TODO: Will be handled in another issue */
    employees: Employee[];

    /** Collections of vendors */
    vendors: Vendor[];
};

/** Sync entity names */
type IntegrationEntityMap = ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>;

/**
 * Non reimbursable account types exported from QuickBooks Online
 *
 * TODO: QBO remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type QBONonReimbursableExportAccountType = ValueOf<typeof CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE>;

/**
 * Reimbursable account types exported from QuickBooks Online
 *
 * TODO: QBO remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type QBOReimbursableExportAccountType = ValueOf<typeof CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE>;

/**
 * User configuration for the QuickBooks Online accounting integration.
 *
 * TODO: QBO remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type QBOConnectionConfig = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** TODO: Will be handled in another issue */
    realmId: string;

    /** TODO: Will be handled in another issue */
    companyName: string;

    /** Configuration of automatic synchronization from QuickBooks Online to the app */
    autoSync: {
        /** TODO: Will be handled in another issue */
        jobID: string;

        /** Whether changes made in QuickBooks Online should be reflected into the app automatically */
        enabled: boolean;
    };

    /** Whether employees can be invited */
    syncPeople: boolean;

    /** TODO: Will be handled in another issue */
    syncItems: boolean;

    /** TODO: Will be handled in another issue */
    markChecksToBePrinted: boolean;

    /** Defines how reimbursable expenses are exported */
    reimbursableExpensesExportDestination: QBOReimbursableExportAccountType;

    /** Defines how non reimbursable expenses are exported */
    nonReimbursableExpensesExportDestination: QBONonReimbursableExportAccountType;

    /** Default vendor of non reimbursable bill */
    nonReimbursableBillDefaultVendor: string;

    /** ID of the invoice collection account */
    collectionAccountID?: string;

    /** ID of the bill payment account */
    reimbursementAccountID?: string;

    /** Account that receives the reimbursable expenses */
    reimbursableExpensesAccount?: Account;

    /** Account that receives the non reimbursable expenses */
    nonReimbursableExpensesAccount?: Account;

    /** Account that receives the exported invoices */
    receivableAccount?: Account;

    /**
     * Whether a default vendor will be created and applied to all credit card
     * transactions upon import
     */
    autoCreateVendor: boolean;

    /** TODO: Will be handled in another issue */
    hasChosenAutoSyncOption: boolean;

    /** Whether Quickbooks Online classes should be imported */
    syncClasses: IntegrationEntityMap;

    /** Whether Quickbooks Online customers should be imported */
    syncCustomers: IntegrationEntityMap;

    /** Whether Quickbooks Online locations should be imported */
    syncLocations: IntegrationEntityMap;

    /** TODO: Will be handled in another issue */
    lastConfigurationTime: number;

    /** Whether the taxes should be synchronized */
    syncTax: boolean;

    /** Whether new categories are enabled in chart of accounts */
    enableNewCategories: boolean;

    /** TODO: Will be handled in another issue */
    errors?: OnyxCommon.Errors;

    /** TODO: Will be handled in another issue */
    exportDate: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_DATE>;

    /** Configuration of the export */
    export: {
        /** E-mail of the exporter */
        exporter: string;
    };

    /** Collections of form field errors */
    errorFields?: OnyxCommon.ErrorFields;
}>;

/**
 * Reimbursable account types exported from QuickBooks Desktop
 */
type QBDReimbursableExportAccountType = ValueOf<typeof CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE>;

/**
 * Non reimbursable account types exported from QuickBooks Desktop
 */
type QBDNonReimbursableExportAccountType = ValueOf<typeof CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE>;

/** Xero bill status values
 *
 * TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type BillStatusValues = 'DRAFT' | 'AWT_APPROVAL' | 'AWT_PAYMENT';

/** Xero expense status values
 *
 *  TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type ExpenseTypesValues = 'BILL' | 'BANK_TRANSACTION' | 'SALES_INVOICE' | 'NOTHING';

/** Xero bill date values
 *
 *  TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type BillDateValues = 'REPORT_SUBMITTED' | 'REPORT_EXPORTED' | 'LAST_EXPENSE';

/**
 * Model of an organization in Xero
 *
 * TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type Tenant = {
    /** ID of the organization */
    id: string;

    /** Name of the organization */
    name: string;

    /** TODO: Will be handled in another issue */
    value: string;
};

/** TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033) */
type XeroTrackingCategory = {
    /** TODO: Will be handled in another issue */
    id: string;

    /** TODO: Will be handled in another issue */
    name: string;
};

/**
 * Data imported from Xero
 *
 * TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type XeroConnectionData = {
    /** Collection of bank accounts */
    bankAccounts: Account[];

    /** TODO: Will be handled in another issue */
    countryCode: string;

    /** TODO: Will be handled in another issue */
    organisationID: string;

    /** TODO: Will be handled in another issue */
    revenueAccounts: Array<{
        /** TODO: Will be handled in another issue */
        id: string;

        /** TODO: Will be handled in another issue */
        name: string;
    }>;

    /** Collection of organizations */
    tenants: Tenant[];

    /** TODO: Will be handled in another issue */
    trackingCategories: XeroTrackingCategory[];
};

/** TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033) */
type XeroMappingType = {
    /** TODO: Will be handled in another issue */
    customer: string;
} & {
    [key in `trackingCategory_${string}`]: string;
};

/** Xero auto synchronization configs */
type XeroAutoSyncConfig = {
    /** Whether data should be automatically synched between the app and Xero */
    enabled: boolean;

    /** TODO: Will be handled in another issue */
    jobID: string;
};

/** Xero export configs */
type XeroExportConfig = {
    /** Current bill status */
    billDate: BillDateValues;

    /** TODO: Will be handled in another issue */
    billStatus: {
        /** Current status of the purchase bill */
        purchase: BillStatusValues;

        /** Current status of the sales bill */
        sales: BillStatusValues;
    };

    /** TODO: Will be handled in another issue */
    billable: ExpenseTypesValues;

    /** The e-mail of the exporter */
    exporter: string;

    /** TODO: Will be handled in another issue */
    nonReimbursable: ExpenseTypesValues;

    /** TODO: Will be handled in another issue */
    nonReimbursableAccount: string;

    /** TODO: Will be handled in another issue */
    reimbursable: ExpenseTypesValues;
};

/** TODO: Will be handled in another issue */
type XeroSyncConfig = {
    /** TODO: Will be handled in another issue */
    hasChosenAutoSyncOption: boolean;

    /** TODO: Will be handled in another issue */
    hasChosenSyncReimbursedReportsOption: boolean;

    /** ID of the bank account for Xero invoice collections */
    invoiceCollectionsAccountID: string;

    /** ID of the bank account for Xero bill payment account */
    reimbursementAccountID: string;

    /** Whether the reimbursed reports should be synched */
    syncReimbursedReports: boolean;
};

/**
 * User configuration for the Xero accounting integration.
 *
 * TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type XeroConnectionConfig = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Xero auto synchronization configs */
        autoSync: XeroAutoSyncConfig;

        /** TODO: Will be handled in another issue */
        enableNewCategories: boolean;

        /** Xero export configs */
        export: XeroExportConfig;

        /** Whether customers should be imported from Xero */
        importCustomers: boolean;

        /** Whether tax rates should be imported from Xero */
        importTaxRates: boolean;

        /** Whether tracking categories should be imported from Xero */
        importTrackingCategories: boolean;

        /** TODO: Will be handled in another issue */
        isConfigured: boolean;

        /** TODO: Will be handled in another issue */
        mappings: XeroMappingType;

        /** TODO: Will be handled in another issue */
        sync: XeroSyncConfig;

        /** ID of Xero organization */
        tenantID: string;

        /** TODO: Will be handled in another issue */
        errors?: OnyxCommon.Errors;

        /** Collection of form field errors  */
        errorFields?: OnyxCommon.ErrorFields;
    },
    keyof XeroAutoSyncConfig | keyof XeroExportConfig | keyof XeroSyncConfig | keyof XeroMappingType
>;

/** Data stored about subsidiaries from NetSuite  */
type NetSuiteSubsidiary = {
    /** ID of the subsidiary */
    internalID: string;

    /** Country where subsidiary is present */
    country: string;

    /** Whether the subsidiary is an elimination subsidiary (a special type used to handle intercompany transaction) */
    isElimination: boolean;

    /** Name of the subsidiary */
    name: string;
};

/** NetSuite bank account type values imported by Expensify */
type AccountTypeValues = '_accountsPayable' | '_otherCurrentLiability' | '_creditCard' | '_bank' | '_otherCurrentAsset' | '_longTermLiability' | '_accountsReceivable' | '_expense';

/** NetSuite Financial account (bank account, debit card, etc) */
type NetSuiteAccount = {
    /** GL code assigned to the financial account */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code'?: string;

    /** Name of the account */
    name: string;

    /** ID assigned to the financial account in NetSuite */
    id: string;

    /** Type of the financial account */
    type: AccountTypeValues;
};

/** NetSuite Tax account */
type NetSuiteTaxAccount = {
    /** Name of the tax account */
    name: string;

    /** ID assigned to the tax account in NetSuite */
    externalID: string;

    /** Country of the tax account */
    country: string;
};

/** NetSuite Vendor Model */
type NetSuiteVendor = {
    /** ID of the vendor in NetSuite */
    id: string;

    /** Name of the vendor */
    name: string;

    /** E-mail of the vendor */
    email: string;
};

/** NetSuite Invoice Item Model */
type InvoiceItem = {
    /** ID of the invoice item in NetSuite */
    id: string;

    /** Name of the invoice item */
    name: string;
};

/**
 * NetSuite Custom List data modal
 */
type NetSuiteCustomListSource = {
    /** Internal ID of the custom list in NetSuite */
    id: string;

    /** Name of the custom list */
    name: string;
};

/** Data from the NetSuite accounting integration. */
type NetSuiteConnectionData = {
    /** Collection of the custom lists in the NetSuite account */
    customLists: NetSuiteCustomListSource[];

    /** Collection of the subsidiaries present in the NetSuite account */
    subsidiaryList: NetSuiteSubsidiary[];

    /** Collection of receivable accounts */
    receivableList?: NetSuiteAccount[];

    /** Collection of vendors */
    vendors?: NetSuiteVendor[];

    /** Collection of invoice items */
    items?: InvoiceItem[];

    /** Collection of the payable accounts */
    payableList: NetSuiteAccount[];

    /** Collection of tax accounts */
    taxAccountsList?: NetSuiteTaxAccount[];
};

/** NetSuite mapping values */
type NetSuiteMappingValues = 'NETSUITE_DEFAULT' | 'REPORT_FIELD' | 'TAG';

/** NetSuite invoice item preference values */
type NetSuiteInvoiceItemPreferenceValues = 'create' | 'select';

/** NetSuite export destination values */
type NetSuiteExportDestinationValues = 'EXPENSE_REPORT' | 'VENDOR_BILL' | 'JOURNAL_ENTRY';

/** NetSuite expense report approval level values */
type NetSuiteExpenseReportApprovalLevels = 'REPORTS_APPROVED_NONE' | 'REPORTS_SUPERVISOR_APPROVED' | 'REPORTS_ACCOUNTING_APPROVED' | 'REPORTS_APPROVED_BOTH';

/** NetSuite vendor bills approval level values */
type NetSuiteVendorBillApprovalLevels = 'VENDOR_BILLS_APPROVED_NONE' | 'VENDOR_BILLS_APPROVAL_PENDING' | 'VENDOR_BILLS_APPROVED';

/** NetSuite journal approval level values */
type NetSuiteJournalApprovalLevels = 'JOURNALS_APPROVED_NONE' | 'JOURNALS_APPROVAL_PENDING' | 'JOURNALS_APPROVED';

/** NetSuite export date values */
type NetSuiteExportDateOptions = 'SUBMITTED' | 'EXPORTED' | 'LAST_EXPENSE';

/** NetSuite journal posting preference values */
type NetSuiteJournalPostingPreferences = 'JOURNALS_POSTING_TOTAL_LINE' | 'JOURNALS_POSTING_INDIVIDUAL_LINE';

/** NetSuite custom segment/records and custom lists mapping values */
type NetSuiteCustomFieldMapping = 'TAG' | 'REPORT_FIELD';

/** The custom form selection options for transactions (any one will be used at most) */
type NetSuiteCustomFormIDOptions = {
    /** If the option is expense report */
    expenseReport?: string;

    /** If the option is vendor bill */
    vendorBill?: string;

    /** If the option is journal entry */
    journalEntry?: string;
};

/** NetSuite custom list */
type NetSuiteCustomList = {
    /** The name of the custom list in NetSuite */
    listName: string;

    /** The internalID of the custom list in NetSuite */
    internalID: string;

    /** The ID of the transaction form field we'll code the list option onto during Export */
    transactionFieldID: string;

    /** Whether we import this list as a report field or tag */
    mapping: NetSuiteCustomFieldMapping;
};

/** NetSuite custom segments/records */
type NetSuiteCustomSegment = {
    /** The name of the custom segment */
    segmentName: string;

    /** The ID of the custom segment in NetSuite */
    internalID: string;

    /** The ID of the transaction form field we'll code this segment onto during Export */
    scriptID: string;

    /** Whether we import this segment as a report field or tag */
    mapping: NetSuiteCustomFieldMapping;
};

/** The custom form ID object */
type NetSuiteCustomFormID = {
    /** The custom form selections for reimbursable transactions */
    reimbursable: NetSuiteCustomFormIDOptions;

    /** The custom form selections for non-reimbursable transactions */
    nonReimbursable: NetSuiteCustomFormIDOptions;

    /** Whether we'll use the custom form selections upon export to NetSuite */
    enabled: boolean;
};

/** Different NetSuite records that can be mapped to either Report Fields or Tags in Expensify */
type NetSuiteSyncOptionsMapping = {
    /** A general type of classification category in NetSuite */
    classes: NetSuiteMappingValues;

    /** A type of classification category in NetSuite linked to projects */
    jobs: NetSuiteMappingValues;

    /** A type of classification category in NetSuite linked to locations */
    locations: NetSuiteMappingValues;

    /** A type of classification category in NetSuite linked to customers */
    customers: NetSuiteMappingValues;

    /** A type of classification category in NetSuite linked to departments within the company */
    departments: NetSuiteMappingValues;
};

/** Configuration options pertaining to sync. This subset of configurations is a legacy object. New configurations should just go directly under the config */
type NetSuiteSyncOptions = {
    /** Different NetSuite records that can be mapped to either Report Fields or Tags in Expensify */
    mapping: NetSuiteSyncOptionsMapping;

    /** Whether we want to import customers into NetSuite from across all subsidiaries */
    crossSubsidiaryCustomers: boolean;

    /** Whether we'll import employee supervisors and set them as managers in the Expensify approval workflow */
    syncApprovalWorkflow: boolean;

    /** Whether we import custom lists from NetSuite */
    syncCustomLists?: boolean;

    /** The approval level we set for an Expense Report record created in NetSuite */
    exportReportsTo: NetSuiteExpenseReportApprovalLevels;

    /** The approval level we set for a Vendor Bill record created in NetSuite */
    exportVendorBillsTo: NetSuiteVendorBillApprovalLevels;

    /** Whether or not we need to set the final approver in this policy via sync */
    setFinalApprover: boolean;

    /** Whether we sync report reimbursement status between Expensify and NetSuite */
    syncReimbursedReports: boolean;

    /** The relevant details of the custom segments we import into Expensify and code onto expenses */
    customSegments?: NetSuiteCustomSegment[];

    /** Whether to import Employees from NetSuite into Expensify */
    syncPeople: boolean;

    /** Whether to enable a new Expense Category into Expensify */
    enableNewCategories?: boolean;

    /** A now unused configuration saying whether a customer had toggled AutoSync yet. */
    hasChosenAutoSyncOption: boolean;

    /** The final approver to be set in the Expensify approval workflow */
    finalApprover: string;

    /** Whether to import tax groups from NetSuite */
    syncTax?: boolean;

    /** Whether to import custom segments from NetSuite */
    syncCustomSegments?: boolean;

    /** The relevant details of the custom lists we import into Expensify and code onto expenses */
    customLists?: NetSuiteCustomList[];

    /** Whether we'll import Expense Categories into Expensify as categories */
    syncCategories: boolean;

    /** A now unused configuration saying whether a customer had toggled syncing reimbursement yet. */
    hasChosenSyncReimbursedReportsOption: boolean;

    /** The approval level we set for a Journal Entry record created in NetSuite */
    exportJournalsTo: NetSuiteJournalApprovalLevels;
};

/** User configuration for the NetSuite accounting integration. */
type NetSuiteConnectionConfig = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Invoice Item Preference */
        invoiceItemPreference?: NetSuiteInvoiceItemPreferenceValues;

        /** ID of the bank account for NetSuite invoice collections */
        receivableAccount?: string;

        /** ID of the bank account for NetSuite tax posting */
        taxPostingAccount?: string;

        /** Whether we should export to the most recent open period if the current one is closed  */
        exportToNextOpenPeriod: boolean;

        /** Whether we will include the original foreign amount of a transaction to NetSuite */
        allowForeignCurrency?: boolean;

        /** Where to export reimbursable expenses */
        reimbursableExpensesExportDestination: NetSuiteExportDestinationValues;

        /** The sub-entity within the NetSuite account for which this policy is connected */
        subsidiary: string;

        /** Configuration options pertaining to sync. This subset of configurations is a legacy object. New configurations should just go directly under the config */
        syncOptions: NetSuiteSyncOptions;

        /** Whether to automatically create employees and vendors upon export in NetSuite if they don't exist */
        autoCreateEntities: boolean;

        /** The account to run auto export */
        exporter: string;

        /** The transaction date to set upon export */
        exportDate?: NetSuiteExportDateOptions;

        /** The type of transaction in NetSuite we export non-reimbursable transactions to */
        nonreimbursableExpensesExportDestination: NetSuiteExportDestinationValues;

        /** Credit account for reimbursable transactions */
        reimbursablePayableAccount: string;

        /** Whether we post Journals as individual separate entries or a single unified entry */
        journalPostingPreference?: NetSuiteJournalPostingPreferences;

        /** The Item record to associate with lines on an invoice created via Expensify */
        invoiceItem?: string;

        /** The internaID of the selected subsidiary in NetSuite */
        subsidiaryID?: string;

        /** The default vendor to use for Transactions in NetSuite */
        defaultVendor?: string;

        /** The provincial tax account for tax line items in NetSuite (only for Canadian Subsidiaries) */
        provincialTaxPostingAccount?: string;

        /** The account used for reimbursement in NetSuite */
        reimbursementAccountID?: string;

        /** The account used for approvals in NetSuite */
        approvalAccount: string;

        /** Credit account for Non-reimbursables (not applicable to expense report entry) */
        payableAcct: string;

        /** Configurations for customer to set custom forms for which reimbursable and non-reimbursable transactions will export to in NetSuite */
        customFormIDOptions?: NetSuiteCustomFormID;

        /** The account to use for Invoices export to NetSuite */
        collectionAccount?: string;

        /** Whether this account is using the newer version of tax in NetSuite, SuiteTax */
        suiteTaxEnabled?: boolean;

        /** Collection of errors coming from BE */
        errors?: OnyxCommon.Errors;

        /** Collection of form field errors  */
        errorFields?: OnyxCommon.ErrorFields;
    },
    keyof NetSuiteSyncOptions | keyof NetSuiteCustomFormID | keyof NetSuiteSyncOptionsMapping
>;

/** NetSuite connection model */
type NetSuiteConnection = {
    /** Account ID of the NetSuite Integration */
    accountID: string;

    /** Encrypted tokenID for authenticating to NetSuite */
    tokenID: string;

    /** Config and Data for the NetSuite connection */
    options: {
        /** Data imported from NetSuite */
        data: NetSuiteConnectionData;

        /** Configuration of the connection */
        config: NetSuiteConnectionConfig;
    };

    /** Whether the sync connection has been successful */
    verified: boolean;

    /** Date when the connection's last successful sync occurred */
    lastSyncDate: string;

    /** Date when the connection's last failed sync occurred */
    lastErrorSyncDate: string;

    /** State of the last synchronization */
    lastSync?: ConnectionLastSync;

    /** Config object used solely to store autosync settings */
    config: OnyxCommon.OnyxValueWithOfflineFeedback<{
        /** NetSuite auto synchronization configs */
        autoSync: {
            /** Whether data should be automatically synched between the app and NetSuite */
            enabled: boolean;

            /** The bedrock job associated with the NetSuite Auto Sync job */
            jobID: string;
        };

        /** Collection of errors coming from BE */
        errors?: OnyxCommon.Errors;

        /** Collection of form field errors  */
        errorFields?: OnyxCommon.ErrorFields;
    }>;

    /** Encrypted token secret for authenticating to NetSuite */
    tokenSecret: string;
};

/** One of the SageIntacctConnectionData object elements */
type SageIntacctDataElement = {
    /** Element ID */
    id: string;

    /** Element name */
    name: string;
};

/** One of the SageIntacctConnectionData object elements with value */
type SageIntacctDataElementWithValue = SageIntacctDataElement & {
    /** Element value */
    value: string;
};

/**
 * Connection data for Sage Intacct
 */
type SageIntacctConnectionData = {
    /** Collection of credit cards */
    creditCards: SageIntacctDataElement[];

    /** Collection of entities */
    entities: SageIntacctDataElementWithValue[];

    /** Collection of bank accounts */
    bankAccounts: SageIntacctDataElement[];

    /** Collection of vendors */
    vendors: SageIntacctDataElementWithValue[];

    /** Collection of journals */
    journals: SageIntacctDataElementWithValue[];

    /** Collection of items */
    items: SageIntacctDataElement[];

    /** Collection of tax solutions IDs */
    taxSolutionIDs: string[];
};

/** Mapping value for Sage Intacct */
type SageIntacctMappingValue = ValueOf<typeof CONST.SAGE_INTACCT_MAPPING_VALUE>;

/** Mapping names for Sage Intacct */
type SageIntacctMappingName = ValueOf<typeof CONST.SAGE_INTACCT_CONFIG.MAPPINGS>;

/**
 * Sage Intacct dimension type
 */
type SageIntacctDimension = {
    /** Name of user defined dimention */
    dimension: string;

    /** Mapping value for user defined dimention */
    mapping: typeof CONST.SAGE_INTACCT_MAPPING_VALUE.TAG | typeof CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD;
};

/** Mapping type for Sage Intacct */
type SageIntacctMappingType = {
    /** Whether should sync items for Sage Intacct */
    syncItems: boolean;

    /** Mapping type for Sage Intacct */
    departments: SageIntacctMappingValue;

    /** Mapping type for Sage Intacct */
    classes: SageIntacctMappingValue;

    /** Mapping type for Sage Intacct */
    locations: SageIntacctMappingValue;

    /** Mapping type for Sage Intacct */
    customers: SageIntacctMappingValue;

    /** Mapping type for Sage Intacct */
    projects: SageIntacctMappingValue;

    /** User defined dimention type for Sage Intacct */
    dimensions: SageIntacctDimension[];
};

/** Configuration of automatic synchronization from Sage Intacct to the app */
type SageIntacctAutoSyncConfig = {
    /** Whether changes made in Sage Intacct should be reflected into the app automatically */
    enabled: boolean;
};

/** Sage Intacct sync */
type SageIntacctSyncConfig = {
    /** ID of the bank account for Sage Intacct bill payment account */
    reimbursementAccountID?: string;

    /** Whether the reimbursed reports should be synced */
    syncReimbursedReports: boolean | string;
};

/** Sage Intacct export configs */
type SageIntacctExportConfig = {
    /** Export date type */
    exportDate: ValueOf<typeof CONST.SAGE_INTACCT_EXPORT_DATE>;

    /** The e-mail of the exporter */
    exporter: string;

    /** Defines how non-reimbursable expenses are exported */
    nonReimbursable: ValueOf<typeof CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE>;

    /** Account that receives the non-reimbursable expenses */
    nonReimbursableAccount: string;

    /** Default vendor used for credit card transactions of non-reimbursable bill */
    nonReimbursableCreditCardChargeDefaultVendor: string;

    /** Default vendor of non-reimbursable bill */
    nonReimbursableVendor: string;

    /** Defines how reimbursable expenses are exported */
    reimbursable: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>;

    /** Default vendor of reimbursable bill */
    reimbursableExpenseReportDefaultVendor: string;
};

/**
 * Connection config for Sage Intacct
 */
type SageIntacctOfflineStateKeys = keyof SageIntacctMappingType | `dimension_${string}`;

/**
 * Connection config for Sage Intacct
 */
type SageIntacctConnectionsConfig = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Sage Intacct credentials */
        credentials: {
            /** Sage Intacct companyID */
            companyID: string;

            /** Sage Intacct password */
            password: string;

            /** Sage Intacct userID */
            userID: string;
        };

        /** Sage Intacct mappings */
        mappings: SageIntacctMappingType;

        /** Sage Intacct tax */
        tax: {
            /** Sage Intacct tax solution ID */
            taxSolutionID: string;

            /** Whether should sync tax with Sage Intacct */
            syncTax: boolean;
        };

        /** Sage Intacct export configs */
        export: SageIntacctExportConfig;

        /** Whether employees should be imported from Sage Intacct */
        importEmployees: boolean;

        /** Sage Intacct approval mode */
        approvalMode: ValueOf<typeof CONST.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL> | null;

        /** Configuration of automatic synchronization from Sage Intacct to the app */
        autoSync: SageIntacctAutoSyncConfig;

        /** Sage Intacct sync */
        sync: SageIntacctSyncConfig;

        /** Sage Intacct entity */
        entity?: string;

        /** Collection of Sage Intacct config errors */
        errors?: OnyxCommon.Errors;

        /** Collection of form field errors  */
        errorFields?: OnyxCommon.ErrorFields;
    },
    SageIntacctOfflineStateKeys | keyof SageIntacctSyncConfig | keyof SageIntacctAutoSyncConfig | keyof SageIntacctExportConfig
>;

/**
 * Data imported from QuickBooks Desktop.
 */
type QBDConnectionData = {
    /** Collection of cash accounts */
    cashAccounts: Account[];

    /** Collection of credit cards */
    creditCardAccounts: Account[];

    /** Collection of journal entry accounts  */
    journalEntryAccounts: Account[];

    /** Collection of payable accounts */
    payableAccounts: Account[];

    /** Collection of bank accounts */
    bankAccounts: Account[];

    /** Collections of vendors */
    vendors: Vendor[];

    /** Collection of export destination accounts */
    accountPayable: Account[];
};

/**
 * User configuration for the QuickBooks Desktop accounting integration.
 */
type QBDConnectionConfig = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** API provider */
        apiProvider: string;

        /** Configuration of automatic synchronization from QuickBooks Desktop to the app */
        autoSync: {
            /** TODO: Will be handled in another issue */
            jobID: string;

            /** Whether changes made in QuickBooks Online should be reflected into the app automatically */
            enabled: boolean;
        };

        /** Whether a check to be printed */
        markChecksToBePrinted: boolean;

        /** Whether Quickbooks Desktop locations should be imported */
        syncLocations: IntegrationEntityMap;

        /** Defines how non reimbursable expenses are exported */
        nonReimbursableExpensesExportDestination: QBDNonReimbursableExportAccountType;

        /** Whether the taxes should be synchronized */
        syncTax: boolean;

        /** Account that receives the exported invoices */
        receivableAccount?: Account;

        /**
         * Whether a default vendor will be created and applied to all credit card
         * transactions upon import
         */
        autoCreateVendor: boolean;

        /** Defines the export date */
        exportDate: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_DATE>;

        /** Configuration of the export */
        export: {
            /** E-mail of the exporter */
            exporter?: string;

            /** Defines how reimbursable expenses are exported */
            reimbursable: QBDReimbursableExportAccountType;

            /** Account that receives the reimbursable expenses */
            reimbursableAccount?: string;
        };

        /** Collections of form field errors */
        errorFields?: OnyxCommon.ErrorFields;
    },
    string
>;

/** State of integration connection */
type Connection<ConnectionData, ConnectionConfig> = {
    /** State of the last synchronization */
    lastSync?: ConnectionLastSync;

    /** Data imported from integration */
    data?: ConnectionData;

    /** Configuration of the connection */
    config: ConnectionConfig;
};

/** Available integration connections */
type Connections = {
    /** QuickBooks Online integration connection */
    [CONST.POLICY.CONNECTIONS.NAME.QBO]: Connection<QBOConnectionData, QBOConnectionConfig>;

    /** Xero integration connection */
    [CONST.POLICY.CONNECTIONS.NAME.XERO]: Connection<XeroConnectionData, XeroConnectionConfig>;

    /** NetSuite integration connection */
    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: NetSuiteConnection;

    /** Sage Intacct integration connection */
    [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: Connection<SageIntacctConnectionData, SageIntacctConnectionsConfig>;

    /** QuickBooks Desktop integration connection */
    [CONST.POLICY.CONNECTIONS.NAME.QBD]: Connection<QBDConnectionData, QBDConnectionConfig>;
};

/** All integration connections, including unsupported ones */
type AllConnections = Connections & {
    /** Quickbooks Desktop integration connection */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quickbooksDesktop: any;
};

/** Names of integration connections */
type ConnectionName = keyof Connections;

/** Names of all integration connections */
type AllConnectionName = keyof AllConnections;

/** Merchant Category Code. This is a way to identify the type of merchant (and type of spend) when a credit card is swiped.  */
type MccGroup = {
    /** Default category for provided MCC Group */
    category: string;

    /** ID of the Merchant Category Code */
    groupID: string;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction;
};

/** Model of verified reimbursement bank account linked to policy */
type ACHAccount = {
    /** ID of the bank account */
    bankAccountID: number;

    /** Bank account number */
    accountNumber: string;

    /** Routing number of bank account */
    routingNumber: string;

    /** Address name of the bank account */
    addressName: string;

    /** Name of the bank */
    bankName: string;

    /** E-mail of the reimburser */
    reimburser: string;
};

/** Day of the month to schedule submission  */
type AutoReportingOffset = number | ValueOf<typeof CONST.POLICY.AUTO_REPORTING_OFFSET>;

/** Types of policy report fields */
type PolicyReportFieldType = 'text' | 'date' | 'dropdown' | 'formula';

/** Model of policy report field */
type PolicyReportField = {
    /** Name of the field */
    name: string;

    /** Default value assigned to the field */
    defaultValue: string;

    /** Unique id of the field */
    fieldID: string;

    /** Position at which the field should show up relative to the other fields */
    orderWeight: number;

    /** Type of report field */
    type: PolicyReportFieldType;

    /** Tells if the field is required or not */
    deletable: boolean;

    /** Value of the field */
    value?: string | null;

    /** Value of the target */
    target?: 'expense' | 'invoice' | 'paycheck';

    /** Options to select from if field is of type dropdown */
    values: string[];

    /** Tax UDFs have keys holding the names of taxes (eg, VAT), values holding percentages (eg, 15%) and a value indicating the currently selected tax value (eg, 15%). */
    keys: string[];

    /** list of externalIDs, this are either imported from the integrations or auto generated by us, each externalID */
    externalIDs: string[];

    /** Collection of flags that state whether droplist field options are disabled */
    disabledOptions: boolean[];

    /** Is this a tax user defined report field */
    isTax: boolean;

    /** This is the selected externalID in an expense. */
    externalID?: string | null;

    /** Automated action or integration that added this report field */
    origin?: string | null;

    /** This is indicates which default value we should use. It was preferred using this over having defaultValue (which we have anyway for historical reasons), since the values are not unique we can't determine which key the defaultValue is referring too. It was also preferred over having defaultKey since the keys are user editable and can be changed. The externalIDs work effectively as an ID, which never changes even after changing the key, value or position of the option. */
    defaultExternalID?: string | null;
};

/** Policy invoicing details */
type PolicyInvoicingDetails = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Stripe Connect company name */
    companyName?: string;

    /** Stripe Connect company website */
    companyWebsite?: string;

    /** Bank account */
    bankAccount?: {
        /** Account balance */
        stripeConnectAccountBalance?: number;

        /** bankAccountID of selected BBA for payouts */
        transferBankAccountID?: number;
    };
}>;

/** Names of policy features */
type PolicyFeatureName = ValueOf<typeof CONST.POLICY.MORE_FEATURES>;

/** Current user policy join request state */
type PendingJoinRequestPolicy = {
    /** Whether the current user requested to join the policy */
    isJoinRequestPending: boolean;

    /** Record of public policy details, indexed by policy ID */
    policyDetailsForNonMembers: Record<string, OnyxCommon.OnyxValueWithOfflineFeedback<PolicyDetailsForNonMembers>>;
};

/** Details of public policy */
type PolicyDetailsForNonMembers = {
    /** Name of the policy */
    name: string;

    /** Policy owner account ID */
    ownerAccountID: number;

    /** Policy owner e-mail */
    ownerEmail: string;

    /** Policy type */
    type: ValueOf<typeof CONST.POLICY.TYPE>;

    /** Policy avatar */
    avatar?: string;
};

/** Data informing when a given rule should be applied */
type ApplyRulesWhen = {
    /** The condition for applying the rule to the workspace */
    condition: string;

    /** The target field to which the rule is applied */
    field: string;

    /** The value of the target field */
    value: string;
};

/** Approval rule data model */
type ApprovalRule = {
    /** The approver's email */
    approver: string;

    /** Set of conditions under which the approval rule should be applied */
    applyWhen: ApplyRulesWhen[];

    /** An id of the rule */
    id?: string;
};

/** Expense rule data model */
type ExpenseRule = {
    /** Object containing information about the tax field id and its external identifier */
    tax: {
        /** Object wrapping the external tax id */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: {
            /** The external id of the tax field. */
            externalID: string;
        };
    };
    /** Set of conditions under which the expense rule should be applied */
    applyWhen: ApplyRulesWhen[];

    /** An id of the rule */
    id?: string;
};

/** Model of policy data */
type Policy = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** The ID of the policy */
        id: string;

        /** The name of the policy */
        name: string;

        /** The current user's role in the policy */
        role: ValueOf<typeof CONST.POLICY.ROLE>;

        /** The policy type */
        type: ValueOf<typeof CONST.POLICY.TYPE>;

        /** The email of the policy owner */
        owner: string;

        /** The accountID of the policy owner */
        ownerAccountID?: number;

        /** The output currency for the policy */
        outputCurrency: string;

        /** The address of the company */
        address?: CompanyAddress;

        /** The URL for the policy avatar */
        avatarURL?: string;

        /** Error objects keyed by field name containing errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;

        /** A list of errors keyed by microtime */
        errors?: OnyxCommon.Errors;

        /** Whether this policy was loaded from a policy summary, or loaded completely with all of its values */
        isFromFullPolicy?: boolean;

        /** When this policy was last modified */
        lastModified?: string;

        /** The custom units data for this policy */
        customUnits?: Record<string, CustomUnit>;

        /** Whether policy expense chats can be created and used on this policy. Enabled manually by CQ/JS snippet. Always true for free policies. */
        isPolicyExpenseChatEnabled: boolean;

        /** Whether the auto reporting is enabled */
        autoReporting?: boolean;

        /**
         * The scheduled submit frequency set up on this policy.
         * Note that manual does not exist in the DB and thus should not exist in Onyx, only as a param for the API.
         * "manual" really means "immediate" (aka "daily") && harvesting.enabled === false
         */
        autoReportingFrequency?: Exclude<ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL>;

        /** Scheduled submit data */
        harvesting?: {
            /** Whether the scheduled submit is enabled */
            enabled: boolean;
        };

        /** Whether the self approval or submitting is enabled */
        preventSelfApproval?: boolean;

        /** When the monthly scheduled submit should happen */
        autoReportingOffset?: AutoReportingOffset;

        /** The employee list of the policy */
        employeeList?: OnyxTypes.PolicyEmployeeList;

        /** The reimbursement choice for policy */
        reimbursementChoice?: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;

        /** Detailed settings for the autoReimbursement */
        autoReimbursement?: OnyxCommon.OnyxValueWithOfflineFeedback<
            {
                /**
                 * The maximum report total allowed to trigger auto reimbursement.
                 */
                limit?: number;
            },
            'limit'
        >;

        /** The maximum report total allowed to trigger auto reimbursement */
        autoReimbursementLimit?: number;

        /**
         * Whether the auto-approval options are enabled in the policy rules
         */
        shouldShowAutoApprovalOptions?: boolean;

        /** Detailed settings for the autoApproval */
        autoApproval?: OnyxCommon.OnyxValueWithOfflineFeedback<
            {
                /**
                 * The maximum report total allowed to trigger auto approval.
                 */
                limit?: number;
                /**
                 * Percentage of the reports that should be selected for a random audit
                 */
                auditRate?: number;
            },
            'limit' | 'auditRate'
        >;

        /**
         * Whether the custom report name options are enabled in the policy rules
         */
        shouldShowCustomReportTitleOption?: boolean;

        /** Whether to leave the calling account as an admin on the policy */
        makeMeAdmin?: boolean;

        /** Original file name which is used for the policy avatar */
        originalFileName?: string;

        /** Alert message for the policy */
        alertMessage?: string;

        /** Informative messages about which policy members were added with primary logins when invited with their secondary login */
        primaryLoginsInvited?: Record<string, string>;

        /** Whether policy is updating */
        isPolicyUpdating?: boolean;

        /** The approver of the policy */
        approver?: string;

        /** The approval mode set up on this policy */
        approvalMode?: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>;

        /** Whether transactions should be billable by default */
        defaultBillable?: boolean;

        /** The workspace description */
        description?: string;

        /** List of field names that are disabled */
        disabledFields?: DisabledFields;

        /** Whether new transactions need to be tagged */
        requiresTag?: boolean;

        /** Whether new transactions need to be categorized */
        requiresCategory?: boolean;

        /** Whether the workspace has multiple levels of tags enabled */
        hasMultipleTagLists?: boolean;

        /**
         * Whether or not the policy has tax tracking enabled
         *
         * @deprecated - use tax.trackingEnabled instead
         */
        isTaxTrackingEnabled?: boolean;

        /** Policy invoicing details */
        invoice?: PolicyInvoicingDetails;

        /** Tax data */
        tax?: {
            /** Whether or not the policy has tax tracking enabled */
            trackingEnabled: boolean;
        };

        /** Collection of tax rates attached to a policy */
        taxRates?: TaxRatesWithDefault;

        /** A set of rules related to the workpsace */
        rules?: {
            /** A set of rules related to the workpsace approvals */
            approvalRules?: ApprovalRule[];

            /** A set of rules related to the workpsace expenses */
            expenseRules?: ExpenseRule[];
        };

        /** ReportID of the admins room for this workspace */
        chatReportIDAdmins?: number;

        /** ReportID of the announce room for this workspace */
        chatReportIDAnnounce?: number;

        /** All the integration connections attached to the policy */
        connections?: Connections;

        /** Report fields attached to the policy */
        fieldList?: Record<string, OnyxCommon.OnyxValueWithOfflineFeedback<PolicyReportField, 'defaultValue' | 'deletable'>>;

        /** Whether the Categories feature is enabled */
        areCategoriesEnabled?: boolean;

        /** Whether the Tags feature is enabled */
        areTagsEnabled?: boolean;

        /** Whether the Accounting feature is enabled */
        areAccountingEnabled?: boolean;

        /** Whether the Distance Rates feature is enabled */
        areDistanceRatesEnabled?: boolean;

        /** Whether the Expensify Card feature is enabled */
        areExpensifyCardsEnabled?: boolean;

        /** Whether the workflows feature is enabled */
        areWorkflowsEnabled?: boolean;

        /** Whether the rules feature is enabled */
        areRulesEnabled?: boolean;

        /** Whether the Report Fields feature is enabled */
        areReportFieldsEnabled?: boolean;

        /** Whether the Connections feature is enabled */
        areConnectionsEnabled?: boolean;

        /** Whether the Invoices feature is enabled */
        areInvoicesEnabled?: boolean;

        /** Whether the Company Cards feature is enabled */
        areCompanyCardsEnabled?: boolean;

        /** The verified bank account linked to the policy */
        achAccount?: ACHAccount;

        /** Whether the eReceipts are enabled */
        eReceipts?: boolean;

        /** Indicates if the Policy is in loading state */
        isLoading?: boolean;

        /** Indicates the Policy's SetWorkspaceReimbursement call loading state */
        isLoadingWorkspaceReimbursement?: boolean;

        /** Indicates if the Policy ownership change is successful */
        isChangeOwnerSuccessful?: boolean;

        /** Indicates if the Policy ownership change is failed */
        isChangeOwnerFailed?: boolean;

        /** Object containing all policy information necessary to connect with Spontana */
        travelSettings?: WorkspaceTravelSettings;

        /** Indicates if the policy is pending an upgrade */
        isPendingUpgrade?: boolean;

        /** Max expense age for a Policy violation */
        maxExpenseAge?: number;

        /** Max expense amount for a policy violation */
        maxExpenseAmount?: number;

        /** Max amount for an expense with no receipt violation */
        maxExpenseAmountNoReceipt?: number;

        /** Whether GL codes are enabled */
        glCodes?: boolean;

        /** Is the auto-pay option for the policy enabled  */
        shouldShowAutoReimbursementLimitOption?: boolean;

        /** Policy MCC Group settings */
        mccGroup?: Record<string, MccGroup>;

        /** Workspace account ID configured for Expensify Card */
        workspaceAccountID?: number;
    } & Partial<PendingJoinRequestPolicy>,
    'addWorkspaceRoom' | keyof ACHAccount | keyof Attributes
>;

/** Stages of policy connection sync */
type PolicyConnectionSyncStage = ValueOf<typeof CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME>;

/** Names of policy connection services */
type PolicyConnectionName = ConnectionName;

/** Policy connection sync progress state */
type PolicyConnectionSyncProgress = {
    /** Current sync stage */
    stageInProgress: PolicyConnectionSyncStage;

    /** Name of the connected service */
    connectionName: ConnectionName;

    /** Timestamp of the connection */
    timestamp: string;
};

export default Policy;

export type {
    PolicyReportField,
    PolicyReportFieldType,
    Unit,
    CustomUnit,
    Attributes,
    Rate,
    TaxRateAttributes,
    TaxRate,
    TaxRates,
    TaxRatesWithDefault,
    CompanyAddress,
    IntegrationEntityMap,
    PolicyFeatureName,
    PolicyDetailsForNonMembers,
    PendingJoinRequestPolicy,
    PolicyConnectionName,
    PolicyConnectionSyncStage,
    PolicyConnectionSyncProgress,
    Connections,
    SageIntacctOfflineStateKeys,
    ConnectionName,
    AllConnectionName,
    Tenant,
    Account,
    QBONonReimbursableExportAccountType,
    QBOReimbursableExportAccountType,
    QBOConnectionConfig,
    XeroTrackingCategory,
    NetSuiteConnection,
    ConnectionLastSync,
    QBDReimbursableExportAccountType,
    NetSuiteSubsidiary,
    NetSuiteCustomList,
    NetSuiteCustomSegment,
    NetSuiteCustomListSource,
    NetSuiteCustomFieldMapping,
    NetSuiteAccount,
    NetSuiteVendor,
    InvoiceItem,
    NetSuiteTaxAccount,
    NetSuiteCustomFormIDOptions,
    NetSuiteCustomFormID,
    SageIntacctMappingValue,
    SageIntacctMappingType,
    SageIntacctMappingName,
    SageIntacctDimension,
    SageIntacctDataElementWithValue,
    NetSuiteMappingValues,
    SageIntacctDataElement,
    SageIntacctConnectionsConfig,
    SageIntacctExportConfig,
    ACHAccount,
    ApprovalRule,
    ExpenseRule,
    NetSuiteConnectionConfig,
};

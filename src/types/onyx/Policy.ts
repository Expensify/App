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
type CustomUnit = OnyxCommon.OnyxValueWithOfflineFeedback<{
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
}>;

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

/** Connection last synchronization state */
type ConnectionLastSync = {
    /** Date when the connection's last successful sync occurred */
    successfulDate?: string;

    /** Date when the connection's last failed sync occurred */
    errorDate?: string;

    /** Whether the connection's last sync was successful */
    isSuccessful: boolean;

    /** Where did the connection's last sync came from */
    source: 'DIRECT' | 'EXPENSIFYWEB' | 'EXPENSIFYAPI' | 'AUTOSYNC' | 'AUTOAPPROVE';
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

/**
 * User configuration for the Xero accounting integration.
 *
 * TODO: Xero remaining comments will be handled here (https://github.com/Expensify/App/issues/43033)
 */
type XeroConnectionConfig = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Xero auto synchronization configs */
    autoSync: {
        /** Whether data should be automatically synched between the app and Xero */
        enabled: boolean;

        /** TODO: Will be handled in another issue */
        jobID: string;
    };

    /** TODO: Will be handled in another issue */
    enableNewCategories: boolean;

    /** Xero export configs */
    export: {
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
    sync: {
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

    /** ID of Xero organization */
    tenantID: string;

    /** TODO: Will be handled in another issue */
    errors?: OnyxCommon.Errors;

    /** Collection of form field errors  */
    errorFields?: OnyxCommon.ErrorFields;
}>;

/** */
type Subsidiary = {
    /** ID of the subsidiary */
    internalID: string;

    /** Country where subsidiary is present */
    country: string;

    /** Whether the subsidiary is an elimination */
    isElimination: boolean;

    /** Name of the subsidiary */
    name: string;
};

/** NetSuite financial account type values */
type AccountTypeValues = '_accountsPayable' | '_otherCurrentLiability' | '_creditCard' | '_bank' | '_otherCurrentAsset' | '_longTermLiability' | '_accountsReceivable' | '_expense';

/** NetSuite Financial account (bank account, debit card, etc) */
type NetSuiteAccount = {
    /** GL code assigned to the financial account */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code': string;

    /** Name of the account */
    name: string;

    /** ID assigned to the financial account */
    id: string;

    /** Type of the financial account */
    type: AccountTypeValues;
};

/** NetSuite Tax account */
type NetSuiteTaxAccount = {
    /** Name of the tax account */
    name: string;

    /** ID assigned to the tax account */
    externalID: string;

    /** Country of the tax account */
    country: string;
};

/** NetSuite Vendor Model */
type NetSuiteVendor = {
    /** ID of the vendor */
    id: string;

    /** Name of the vendor */
    name: string;

    /** E-mail of the vendor */
    email: string;
};

/** NetSuite Invoice Item Model */
type InvoiceItem = {
    /** ID of the invoice item */
    id: string;

    /** Name of the invoice item */
    name: string;
};

/** Data from the NetSuite accounting integration. */
type NetSuiteConnectionData = {
    /** Collection of the subsidiaries present in the NetSuite account */
    subsidiaryList: Subsidiary[];

    /** Collection of receivable accounts */
    receivableList: NetSuiteAccount[];

    /** Collection of vendors */
    vendors: NetSuiteVendor[];

    /** Collection of invoice items */
    items: InvoiceItem[];

    /** Collection of the payable accounts */
    payableList: NetSuiteAccount[];

    /** Collection of tax accounts */
    taxAccountsList: NetSuiteTaxAccount[];
};

/** NetSuite mapping values */
type NetSuiteMappingValues = 'NETSUITE_DEFAULT' | 'REPORT_FIELD' | 'TAG';

/** NetSuite invoice item preference values */
type InvoiceItemPreferenceValues = 'create' | 'select';

/** NetSuite export destination values */
type ExpensesExportDestinationValues = 'EXPENSE_REPORT' | 'VENDOR_BILL' | 'JOURNAL_ENTRY';

/** NetSuite expense report approval level values */
type ExpenseReportsApprovalLevelValues = 'REPORTS_APPROVED_NONE' | 'REPORTS_SUPERVISOR_APPROVED' | 'REPORTS_ACCOUNTING_APPROVED' | 'REPORTS_APPROVED_BOTH';

/** NetSuite vendor bills approval level values */
type VendorBillsApprovalLevelValues = 'VENDOR_BILLS_APPROVED_NONE' | 'VENDOR_BILLS_APPROVAL_PENDING' | 'VENDOR_BILLS_APPROVED';

/** NetSuite journal approval level values */
type JournalsApprovalLevelValues = 'JOURNALS_APPROVED_NONE' | 'JOURNALS_APPROVAL_PENDING' | 'JOURNALS_APPROVED';

/** NetSuite export date values */
type ExportDateValues = 'SUBMITTED' | 'EXPORTED' | 'LAST_EXPENSE';

/** NetSuite journal posting preference values */
type JournalPostingPreferenceValues = 'JOURNALS_POSTING_TOTAL_LINE' | 'JOURNALS_POSTING_INDIVIDUAL_LINE';

/** User configuration for the NetSuite accounting integration. */
type NetSuiteConnectionConfig = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Invoice Item Preference */
    invoiceItemPreference: InvoiceItemPreferenceValues;

    /** ID of the bank account for NetSuite invoice collections */
    receivableAccount: string;

    /** ID of the bank account for NetSuite tax posting */
    taxPostingAccount: string;

    /**  */
    exportToNextOpenPeriod: boolean;

    /** */
    allowForeignCurrency: boolean;

    /** Where to export reimbursable expenses */
    reimbursableExpensesExportDestination: ExpensesExportDestinationValues;

    /** */
    subsidiary: string;

    /** */
    syncOptions: {
        /** */
        mapping: {
            /** */
            classes: NetSuiteMappingValues;

            /** */
            jobs: NetSuiteMappingValues;

            /** */
            locations: NetSuiteMappingValues;

            /** */
            customers: NetSuiteMappingValues;

            /** */
            departments: NetSuiteMappingValues;
        };

        /** */
        crossSubsidiaryCustomers: boolean;

        /** */
        syncApprovalWorkflow: boolean;

        /** */
        syncCustomLists: boolean;

        /** Tells the expense reports approval level */
        exportReportsTo: ExpenseReportsApprovalLevelValues;

        /** Tells the vendor bills approval level */
        exportVendorBillsTo: VendorBillsApprovalLevelValues;

        /** */
        setFinalApprover: boolean;

        /** */
        syncReimbursedReports: boolean;

        /** */
        customSegments: Array<{
            /** */
            segmentName: string;

            /** */
            internalID: string;

            /** */
            scriptID: string;

            /** */
            mapping: 'tag' | 'reportField';
        }>;

        /** */
        syncPeople: boolean;

        /** */
        enableNewCategories: boolean;

        /** */
        hasChosenAutoSyncOption: boolean;

        /** */
        finalApprover: string;

        /** */
        syncTax: boolean;

        /** */
        syncCustomSegments: boolean;

        /** */
        customLists: Array<{
            /** */
            listName: string;

            /** */
            internalID: string;

            /** */
            transactionFieldID: string;

            /** */
            mapping: 'tag' | 'reportField';
        }>;

        /** */
        syncCategories: boolean;

        /** */
        hasChosenSyncReimbursedReportsOption: boolean;

        /** */
        exportJournalsTo: JournalsApprovalLevelValues;
    };

    /** */
    autoCreateEntities: boolean;

    /** */
    exporter: string;

    /** */
    exportDate: ExportDateValues;

    /** */
    nonreimbursableExpensesExportDestination: ExpensesExportDestinationValues;

    /** */
    reimbursablePayableAccount: string;

    /** */
    journalPostingPreference: JournalPostingPreferenceValues;

    /** */
    invoiceItem: string;

    /** */
    subsidiaryID: string;

    /** */
    defaultVendor: string;

    /** */
    provincialTaxPostingAccount: string;

    /** */
    reimbursementAccountID: string;

    /** */
    approvalAccount: string;

    /** */
    payableAcct: string;

    /** */
    customFormIDOptions: {
        /** */
        reimbursable: {
            /** */
            expenseReport: string;
        };

        /** */
        nonReimbursable: {
            /** */
            vendorBill: string;
        };

        /** */
        enabled: boolean;
    };

    /** */
    collectionAccount: string;
}>;

/** NetSuite connection model */
type NetSuiteConnection = {
    /** Account ID of the NetSuite Integration */
    accountID: string;

    /** */
    tokenID: string;

    /** */
    options: {
        /** Data imported from NetSuite */
        data: NetSuiteConnectionData;

        /** Configuration of the connection */
        config: NetSuiteConnectionConfig;
    };

    /** */
    verified: boolean;

    /** */
    lastSyncDate: string;

    /** */
    lastErrorSyncDate: string;

    /** */
    source: string;

    /** */
    config: {
        /** NetSuite auto synchronization configs */
        autoSync: {
            /** Whether data should be automatically synched between the app and Xero */
            enabled: boolean;

            /** */
            jobID: string;
        };
    };

    /** */
    tokenSecret: string;
};

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
    /** QuickBooks integration connection */
    quickbooksOnline: Connection<QBOConnectionData, QBOConnectionConfig>;

    /** Xero integration connection */
    xero: Connection<XeroConnectionData, XeroConnectionConfig>;

    /** NetSuite integration connection */
    netsuite: NetSuiteConnection;
};

/** Names of integration connections */
type ConnectionName = keyof Connections;

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
    value: string | null;

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

/** Names of policy features */
type PolicyFeatureName = ValueOf<typeof CONST.POLICY.MORE_FEATURES>;

/** Current user policy join request state */
type PendingJoinRequestPolicy = {
    /** Whether the current user requested to join the policy */
    isJoinRequestPending: boolean;

    /** Record of public policy details, indexed by policy ID */
    policyDetailsForNonMembers: Record<
        string,
        OnyxCommon.OnyxValueWithOfflineFeedback<{
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
        }>
    >;
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

        /** The scheduled submit frequency set up on this policy */
        autoReportingFrequency?: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

        /** Scheduled submit data */
        harvesting?: {
            /** Whether the scheduled submit is enabled */
            enabled: boolean;
        };

        /** Whether the self approval or submitting is enabled */
        preventSelfApproval?: boolean;

        /** When the monthly scheduled submit should happen */
        autoReportingOffset?: AutoReportingOffset;

        /** The accountID of manager who the employee submits their expenses to on paid policies */
        submitsTo?: number;

        /** The employee list of the policy */
        employeeList?: OnyxTypes.PolicyEmployeeList;

        /** The reimbursement choice for policy */
        reimbursementChoice?: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;

        /** The maximum report total allowed to trigger auto reimbursement. */
        autoReimbursementLimit?: number;

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

        /** Tax data */
        tax?: {
            /** Whether or not the policy has tax tracking enabled */
            trackingEnabled: boolean;
        };

        /** Collection of tax rates attached to a policy */
        taxRates?: TaxRatesWithDefault;

        /** ReportID of the admins room for this workspace */
        chatReportIDAdmins?: number;

        /** ReportID of the announce room for this workspace */
        chatReportIDAnnounce?: number;

        /** All the integration connections attached to the policy */
        connections?: Connections;

        /** Report fields attached to the policy */
        fieldList?: Record<string, PolicyReportField>;

        /** Whether the Categories feature is enabled */
        areCategoriesEnabled?: boolean;

        /** Whether the Tags feature is enabled */
        areTagsEnabled?: boolean;

        /** Whether the Accounting feature is enabled */
        areAccountingEnabled?: boolean;

        /** Whether the Distance Rates feature is enabled */
        areDistanceRatesEnabled?: boolean;

        /** Whether the workflows feature is enabled */
        areWorkflowsEnabled?: boolean;

        /** Whether the Report Fields feature is enabled */
        areReportFieldsEnabled?: boolean;

        /** Whether the Connections feature is enabled */
        areConnectionsEnabled?: boolean;

        /** The verified bank account linked to the policy */
        achAccount?: ACHAccount;

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
    } & Partial<PendingJoinRequestPolicy>,
    'generalSettings' | 'addWorkspaceRoom' | keyof ACHAccount
>;

/** Stages of policy connection sync */
type PolicyConnectionSyncStage = ValueOf<typeof CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME>;

/** Names of policy connection services */
type PolicyConnectionName = ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME>;

/** Policy connection sync progress state */
type PolicyConnectionSyncProgress = {
    /** Current sync stage */
    stageInProgress: PolicyConnectionSyncStage;

    /** Name of the connected service */
    connectionName: PolicyConnectionName;

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
    PendingJoinRequestPolicy,
    PolicyConnectionName,
    PolicyConnectionSyncStage,
    PolicyConnectionSyncProgress,
    Connections,
    ConnectionName,
    Tenant,
    Account,
    QBONonReimbursableExportAccountType,
    QBOReimbursableExportAccountType,
    QBOConnectionConfig,
    XeroTrackingCategory,
};

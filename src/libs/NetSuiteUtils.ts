import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {Policy} from '@src/types/onyx';
import type {NetSuiteAccount, NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

function getNetSuiteVendorOptions(policy: Policy | undefined, selectedVendorId: string | undefined): SelectorType[] {
    const vendors = policy?.connections?.netsuite?.options.data.vendors;

    return (vendors ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: id === selectedVendorId,
    }));
}

function getNetSuitePayableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;

    return (payableAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: id === selectedBankAccountId,
    }));
}

function getNetSuiteReceivableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const receivableAccounts = policy?.connections?.netsuite?.options.data.receivableList;

    return (receivableAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: id === selectedBankAccountId,
    }));
}

function getNetSuiteExpenseAccountOptions(policy: Policy | undefined, selectedExpenseAccountId: string | undefined): SelectorType[] {
    const expenseAccounts = policy?.connections?.netsuite?.options.data.expenseAccounts;

    return (expenseAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: id === selectedExpenseAccountId,
    }));
}

function getNetSuiteInvoiceItemOptions(policy: Policy | undefined, selectedItemId: string | undefined): SelectorType[] {
    const invoiceItems = policy?.connections?.netsuite?.options.data.items;

    return (invoiceItems ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: id === selectedItemId,
    }));
}

function getNetSuiteTaxAccountOptions(policy: Policy | undefined, subsidiaryCountry?: string, selectedAccountId?: string): SelectorType[] {
    const taxAccounts = policy?.connections?.netsuite?.options.data.taxAccountsList;
    const accountOptions = (taxAccounts ?? []).filter(({country}) => country === subsidiaryCountry);

    return accountOptions.map(({externalID, name}) => ({
        value: externalID,
        text: name,
        keyForList: externalID,
        isSelected: externalID === selectedAccountId,
    }));
}

function canUseTaxNetSuite(canUseNetSuiteUSATax?: boolean, subsidiaryCountry?: string) {
    return !!canUseNetSuiteUSATax || CONST.NETSUITE_TAX_COUNTRIES.includes(subsidiaryCountry ?? '');
}

function canUseProvincialTaxNetSuite(subsidiaryCountry?: string) {
    return subsidiaryCountry === '_canada';
}

function getFilteredReimbursableAccountOptions(payableAccounts: NetSuiteAccount[] | undefined) {
    return (payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.BANK || type === CONST.NETSUITE_ACCOUNT_TYPE.CREDIT_CARD);
}

function getNetSuiteReimbursableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;
    const accountOptions = getFilteredReimbursableAccountOptions(payableAccounts);

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: id === selectedBankAccountId,
    }));
}

function getFilteredCollectionAccountOptions(payableAccounts: NetSuiteAccount[] | undefined) {
    return (payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.BANK);
}

function getNetSuiteCollectionAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;
    const accountOptions = getFilteredCollectionAccountOptions(payableAccounts);

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: id === selectedBankAccountId,
    }));
}

function getFilteredApprovalAccountOptions(payableAccounts: NetSuiteAccount[] | undefined) {
    return (payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.ACCOUNTS_PAYABLE);
}

function getNetSuiteApprovalAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined, translate: LocalizedTranslate): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;
    const defaultApprovalAccount: NetSuiteAccount = {
        id: CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT,
        name: translate('workspace.netsuite.advancedConfig.defaultApprovalAccount'),
        type: CONST.NETSUITE_ACCOUNT_TYPE.ACCOUNTS_PAYABLE,
    };
    const accountOptions = getFilteredApprovalAccountOptions([defaultApprovalAccount].concat(payableAccounts ?? []));

    // When nothing is explicitly set, the synthesized default approval account is the effective selection in NetSuite.
    const effectiveSelectionId = selectedBankAccountId ?? CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT;

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: id === effectiveSelectionId,
    }));
}

function getCustomersOrJobsLabelNetSuite(policy: Policy | undefined, translate: LocaleContextProps['translate']): string | undefined {
    const importMapping = policy?.connections?.netsuite?.options?.config?.syncOptions?.mapping;
    if (!importMapping?.customers && !importMapping?.jobs) {
        return undefined;
    }
    const importFields: string[] = [];
    const importCustomer = importMapping?.customers ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const importJobs = importMapping?.jobs ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

    if (importCustomer === CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT && importJobs === CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        return undefined;
    }

    const importedValue = importMapping?.customers !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? importCustomer : importJobs;

    if (importCustomer !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        importFields.push(translate('workspace.netsuite.import.customersOrJobs.customers'));
    }

    if (importJobs !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        importFields.push(translate('workspace.netsuite.import.customersOrJobs.jobs'));
    }

    const importedValueLabel = translate(`workspace.netsuite.import.customersOrJobs.label`, importFields, translate(`workspace.accounting.importTypes.${importedValue}`).toLowerCase());
    return importedValueLabel.charAt(0).toUpperCase() + importedValueLabel.slice(1);
}

function getNetSuiteImportCustomFieldLabel(
    policy: Policy | undefined,
    importField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>,
    translate: LocaleContextProps['translate'],
    localeCompare: LocaleContextProps['localeCompare'],
): string | undefined {
    const fieldData = policy?.connections?.netsuite?.options?.config.syncOptions?.[importField] ?? [];
    if (fieldData.length === 0) {
        return undefined;
    }

    const mappingSet = new Set(fieldData.map((item) => item.mapping));
    const importedTypes = Array.from(mappingSet)
        .sort((a, b) => localeCompare(b, a))
        .map((mapping) => translate(`workspace.netsuite.import.importTypes.${mapping !== '' ? mapping : 'TAG'}.label`).toLowerCase());
    return translate(`workspace.netsuite.import.importCustomFields.label`, importedTypes);
}

function isNetSuiteCustomSegmentRecord(customField: NetSuiteCustomList | NetSuiteCustomSegment): boolean {
    return 'segmentName' in customField;
}

function getNameFromNetSuiteCustomField(customField: NetSuiteCustomList | NetSuiteCustomSegment): string {
    return 'segmentName' in customField ? customField.segmentName : customField.listName;
}

function isNetSuiteCustomFieldPropertyEditable(customField: NetSuiteCustomList | NetSuiteCustomSegment, fieldName: string) {
    const fieldsAllowedToEdit = isNetSuiteCustomSegmentRecord(customField) ? [INPUT_IDS.SEGMENT_NAME, INPUT_IDS.INTERNAL_ID, INPUT_IDS.SCRIPT_ID, INPUT_IDS.MAPPING] : [INPUT_IDS.MAPPING];
    const fieldKey = fieldName as keyof typeof customField;
    return fieldsAllowedToEdit.includes(fieldKey);
}

export {
    getNetSuiteVendorOptions,
    getNetSuitePayableAccountOptions,
    getNetSuiteReceivableAccountOptions,
    getNetSuiteExpenseAccountOptions,
    getNetSuiteInvoiceItemOptions,
    getNetSuiteTaxAccountOptions,
    canUseTaxNetSuite,
    canUseProvincialTaxNetSuite,
    getFilteredReimbursableAccountOptions,
    getNetSuiteReimbursableAccountOptions,
    getFilteredCollectionAccountOptions,
    getNetSuiteCollectionAccountOptions,
    getFilteredApprovalAccountOptions,
    getNetSuiteApprovalAccountOptions,
    getCustomersOrJobsLabelNetSuite,
    getNetSuiteImportCustomFieldLabel,
    isNetSuiteCustomSegmentRecord,
    getNameFromNetSuiteCustomField,
    isNetSuiteCustomFieldPropertyEditable,
};

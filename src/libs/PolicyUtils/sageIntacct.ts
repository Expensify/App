/**
 * Sage Intacct entity name and the bank, expense, vendor, and credit-card option lists.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

function getCurrentSageIntacctEntityName(policy: Policy | undefined, defaultNameIfNoEntity: string): string | undefined {
    const currentEntityID = policy?.connections?.intacct?.config?.entity;
    if (!currentEntityID) {
        return defaultNameIfNoEntity;
    }
    const entities = policy?.connections?.intacct?.data?.entities;
    return entities?.find((entity) => entity.id === currentEntityID)?.name;
}

function getSageIntacctBankAccounts(policy?: Policy, selectedBankAccountId?: string): SelectorType[] {
    const bankAccounts = policy?.connections?.intacct?.data?.bankAccounts ?? [];
    return (bankAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
    }));
}

function getSageIntacctExpenseAccounts(policy: Policy | undefined, selectedExpenseAccountID: string | undefined): SelectorType[] {
    const expenseAccounts = policy?.connections?.intacct?.data?.expenseAccounts ?? [];
    return expenseAccounts.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedExpenseAccountID === id,
    }));
}

function getSageIntacctVendors(policy?: Policy, selectedVendorId?: string, localeCompare?: LocaleContextProps['localeCompare']): SelectorType[] {
    const vendors = policy?.connections?.intacct?.data?.vendors ?? [];
    const sortedVendors = localeCompare ? [...vendors].sort((a, b) => localeCompare(a.value ?? '', b.value ?? '') || localeCompare(a.id, b.id)) : vendors;
    return sortedVendors.map(({id, value}) => ({
        value: id,
        text: value,
        keyForList: id,
        isSelected: selectedVendorId === id,
    }));
}

function getSageIntacctNonReimbursableActiveDefaultVendor(policy?: Policy): string | undefined {
    const {
        nonReimbursableCreditCardChargeDefaultVendor: creditCardDefaultVendor,
        nonReimbursableVendor: expenseReportDefaultVendor,
        nonReimbursable,
    } = policy?.connections?.intacct?.config.export ?? {};

    return nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE ? creditCardDefaultVendor : expenseReportDefaultVendor;
}

function getSageIntacctCreditCards(policy?: Policy, selectedAccount?: string): SelectorType[] {
    const creditCards = policy?.connections?.intacct?.data?.creditCards ?? [];
    return creditCards.map(({name}) => ({
        value: name,
        text: name,
        keyForList: name,
        isSelected: name === selectedAccount,
    }));
}

export {
    getCurrentSageIntacctEntityName,
    getSageIntacctBankAccounts,
    getSageIntacctExpenseAccounts,
    getSageIntacctVendors,
    getSageIntacctNonReimbursableActiveDefaultVendor,
    getSageIntacctCreditCards,
};

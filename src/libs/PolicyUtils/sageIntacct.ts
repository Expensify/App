/**
 * Sage Intacct entity name and the bank, expense, vendor, and credit-card option lists.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {SageIntacctCreditCard, SageIntacctJournal} from '@src/types/onyx/Policy';

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

function formatSageIntacctLiabilityAccount(glNumber?: string, glTitle?: string): string {
    if (!glNumber) {
        return '';
    }
    return glTitle ? `${glNumber} – ${glTitle}` : glNumber;
}

function getSageIntacctCreditCards(policy?: Policy, selectedAccount?: string, translate?: LocaleContextProps['translate']): SelectorType[] {
    const creditCards = policy?.connections?.intacct?.data?.creditCards ?? [];
    return creditCards.map(({name, value, liabilityAccountTitle}) => {
        const liabilityAccount = formatSageIntacctLiabilityAccount(value, liabilityAccountTitle);
        return {
            value: name,
            text: name,
            keyForList: name,
            isSelected: name === selectedAccount,
            ...(translate && liabilityAccount ? {alternateText: translate('workspace.sageIntacct.reconciliation.liabilityAccountSubtitle', liabilityAccount)} : {}),
        };
    });
}

function getResolvedSageIntacctReconciliationCard(policy: Policy | undefined, storedLiabilityAccountID: string | undefined, isExistingCR: boolean): SageIntacctCreditCard | undefined {
    const creditCards = policy?.connections?.intacct?.data?.creditCards ?? [];

    // Existing domains can hold a card name or an auto-created legacy liability code instead of the card ID.
    // Only existing CR domains fall back to the default card when no value is stored yet.
    if (storedLiabilityAccountID) {
        const byID = creditCards.find((card) => card.id === storedLiabilityAccountID);
        if (byID) {
            return byID;
        }
        const byName = creditCards.find((card) => card.name === storedLiabilityAccountID);
        if (byName) {
            return byName;
        }
        if (storedLiabilityAccountID.startsWith(CONST.SAGE_INTACCT_LEGACY_LIABILITY_ACCOUNT_PREFIX)) {
            return creditCards.find((card) => card.name === CONST.SAGE_INTACCT_DEFAULT_RECONCILIATION_CARD);
        }
    }
    if (isExistingCR) {
        return creditCards.find((card) => card.name === CONST.SAGE_INTACCT_DEFAULT_RECONCILIATION_CARD);
    }
    return undefined;
}

function getSageIntacctReconciliationCreditCards(policy: Policy | undefined, selectedCardID: string | undefined, translate: LocaleContextProps['translate']): SelectorType[] {
    const creditCards = policy?.connections?.intacct?.data?.creditCards ?? [];
    return creditCards.map(({id, name, value, liabilityAccountTitle}) => {
        const liabilityAccount = formatSageIntacctLiabilityAccount(value, liabilityAccountTitle);
        return {
            value: id,
            text: name,
            keyForList: id,
            isSelected: id === selectedCardID,
            ...(liabilityAccount ? {alternateText: translate('workspace.sageIntacct.reconciliation.liabilityAccountSubtitle', liabilityAccount)} : {}),
        };
    });
}

function isSageIntacctDualBookCompany(policy?: Policy): boolean {
    const journals = policy?.connections?.intacct?.data?.journals ?? [];
    let hasAccrual = false;
    let hasCash = false;
    for (const journal of journals) {
        const book = journal.value?.trim().toUpperCase() ?? '';
        if (book === CONST.SAGE_INTACCT_JOURNAL_BOOK.CASH_AND_ACCRUAL.toUpperCase()) {
            hasAccrual = true;
            hasCash = true;
        } else if (book === CONST.SAGE_INTACCT_JOURNAL_BOOK.ACCRUAL) {
            hasAccrual = true;
        } else if (book === CONST.SAGE_INTACCT_JOURNAL_BOOK.CASH) {
            hasCash = true;
        }
        if (hasAccrual && hasCash) {
            return true;
        }
    }
    return false;
}

function getSageIntacctJournalBookLabel(bookValue: string | undefined, translate: LocaleContextProps['translate']): string {
    const normalizedBook = bookValue?.trim().toUpperCase() ?? '';
    if (normalizedBook === CONST.SAGE_INTACCT_JOURNAL_BOOK.CASH_AND_ACCRUAL.toUpperCase()) {
        return translate('workspace.sageIntacct.reconciliation.journalBooks.cashAndAccrual');
    }
    if (normalizedBook === CONST.SAGE_INTACCT_JOURNAL_BOOK.ACCRUAL) {
        return translate('workspace.sageIntacct.reconciliation.journalBooks.accrual');
    }
    if (normalizedBook === CONST.SAGE_INTACCT_JOURNAL_BOOK.CASH) {
        return translate('workspace.sageIntacct.reconciliation.journalBooks.cash');
    }
    return translate('workspace.sageIntacct.reconciliation.journalBooks.noReportingBook');
}

function formatSageIntacctJournalLabel(journal: SageIntacctJournal | undefined): string {
    if (!journal) {
        return '';
    }
    return journal.name ? `${journal.id} – ${journal.name}` : journal.id;
}

function getResolvedSageIntacctReconciliationJournal(policy: Policy | undefined, isExistingCR: boolean): SageIntacctJournal | undefined {
    const journals = policy?.connections?.intacct?.data?.journals ?? [];
    const configuredJournalID = policy?.connections?.intacct?.config?.reconciliationJournal;
    if (configuredJournalID) {
        return journals.find((journal) => journal.id === configuredJournalID);
    }
    if (isExistingCR) {
        return journals.find((journal) => journal.id === CONST.SAGE_INTACCT_DEFAULT_RECONCILIATION_JOURNAL);
    }
    return undefined;
}

function isSageIntacctReconciliationJournalValid(policy: Policy | undefined, journal: SageIntacctJournal | undefined): boolean {
    if (!journal) {
        return false;
    }
    if (!isSageIntacctDualBookCompany(policy)) {
        return true;
    }
    return !!journal.value?.trim();
}

function getSageIntacctReconciliationJournals(policy: Policy | undefined, selectedJournalID: string | undefined, translate: LocaleContextProps['translate']): SelectorType[] {
    const journals = policy?.connections?.intacct?.data?.journals ?? [];
    const isDualBook = isSageIntacctDualBookCompany(policy);
    return journals
        .filter((journal) => !journal.disallowDirectPosting)
        .map((journal) => {
            const hasBook = !!journal.value?.trim();
            return {
                value: journal.id,
                text: formatSageIntacctJournalLabel(journal),
                alternateText: getSageIntacctJournalBookLabel(journal.value, translate),
                keyForList: journal.id,
                isSelected: journal.id === selectedJournalID,
                isDisabled: isDualBook && !hasBook,
            };
        });
}

export {
    getCurrentSageIntacctEntityName,
    getSageIntacctBankAccounts,
    getSageIntacctExpenseAccounts,
    getSageIntacctVendors,
    getSageIntacctNonReimbursableActiveDefaultVendor,
    getSageIntacctCreditCards,
    formatSageIntacctLiabilityAccount,
    getResolvedSageIntacctReconciliationCard,
    getSageIntacctReconciliationCreditCards,
    isSageIntacctDualBookCompany,
    getSageIntacctJournalBookLabel,
    formatSageIntacctJournalLabel,
    getResolvedSageIntacctReconciliationJournal,
    isSageIntacctReconciliationJournalValid,
    getSageIntacctReconciliationJournals,
};

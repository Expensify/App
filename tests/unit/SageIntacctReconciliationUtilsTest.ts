import {
    formatSageIntacctLiabilityAccount,
    getResolvedSageIntacctReconciliationCard,
    getResolvedSageIntacctReconciliationJournal,
    getSageIntacctCreditCards,
    getSageIntacctReconciliationCreditCards,
    getSageIntacctReconciliationJournals,
    isSageIntacctDualBookCompany,
} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy} from '@src/types/onyx';
import type {SageIntacctConnectionsConfig, SageIntacctCreditCard, SageIntacctJournal} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';

function createIntacctPolicy(overrides?: {journals?: SageIntacctJournal[]; creditCards?: SageIntacctCreditCard[]; reconciliationJournal?: string}): Policy {
    const basePolicy = createRandomPolicy(1);
    const baseIntacctConfig: SageIntacctConnectionsConfig = {
        credentials: {companyID: 'COMP', userID: 'USER'},
        mappings: {
            departments: CONST.SAGE_INTACCT_MAPPING_VALUE.NONE,
            classes: CONST.SAGE_INTACCT_MAPPING_VALUE.NONE,
            locations: CONST.SAGE_INTACCT_MAPPING_VALUE.NONE,
            customers: CONST.SAGE_INTACCT_MAPPING_VALUE.NONE,
            projects: CONST.SAGE_INTACCT_MAPPING_VALUE.NONE,
            syncItems: false,
            dimensions: [],
        },
        tax: {syncTax: false},
        export: {
            exportDate: CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE,
            nonReimbursable: CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE,
            nonReimbursableAccount: '',
            nonReimbursableCreditCardChargeDefaultVendor: '',
            nonReimbursableVendor: '',
            reimbursable: CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT,
            reimbursableExpenseReportDefaultVendor: '',
            accountingMethod: COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL,
        },
        importEmployees: false,
        approvalMode: null,
        autoSync: {enabled: true},
        sync: {syncReimbursedReports: false},
        reconciliationJournal: overrides?.reconciliationJournal,
    };

    return {
        ...basePolicy,
        id: 'POLICY_1',
        connections: {
            ...basePolicy.connections,
            intacct: {
                config: baseIntacctConfig,
                data: {
                    journals: overrides?.journals ?? [],
                    creditCards: overrides?.creditCards ?? [],
                    entities: [],
                    bankAccounts: [],
                    vendors: [],
                    items: [],
                    taxSolutionIDs: [],
                },
            },
        },
    };
}

describe('Sage Intacct reconciliation helpers', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    it('filters out disallowDirectPosting journals and disables no-book journals for dual-book companies', () => {
        // Given a dual-book Intacct company with accrual, cash, no-book, and direct-posting-blocked journals
        const defaultJournal = CONST.SAGE_INTACCT_DEFAULT_RECONCILIATION_JOURNAL;
        const policy = createIntacctPolicy({
            journals: [
                {id: defaultJournal, name: 'Expensify Clearing Journal', value: '', disallowDirectPosting: false},
                {id: 'GJ', name: 'General Journal', value: 'CASH and ACCRUAL', disallowDirectPosting: false},
                {id: 'APJ', name: 'Accounts Payable', value: 'ACCRUAL', disallowDirectPosting: false},
                {id: 'SYS', name: 'System Journal', value: 'CASH and ACCRUAL', disallowDirectPosting: true},
            ],
        });

        // When building the journal picker options
        const isDualBook = isSageIntacctDualBookCompany(policy);
        const options = getSageIntacctReconciliationJournals(policy, 'GJ', translateLocal);

        // Then disallowed journals are omitted, books are labeled, and no-book journals are disabled
        expect(isDualBook).toBe(true);
        expect(options.map((option) => option.value)).toEqual([defaultJournal, 'GJ', 'APJ']);
        expect(options.find((option) => option.value === defaultJournal)?.isDisabled).toBe(true);
        expect(options.find((option) => option.value === defaultJournal)?.alternateText).toBe('No reporting book');
        expect(options.find((option) => option.value === 'GJ')?.alternateText).toBe('Cash and accrual');
        expect(options.find((option) => option.value === 'GJ')?.text).toBe('GJ – General Journal');
        expect(options.find((option) => option.value === 'GJ')?.isSelected).toBe(true);
        expect(options.find((option) => option.value === 'APJ')?.isDisabled).toBe(false);
    });

    it('allows no-book journals in single-book companies', () => {
        // Given a single-book Intacct company with only accrual and no-book journals
        const defaultJournal = CONST.SAGE_INTACCT_DEFAULT_RECONCILIATION_JOURNAL;
        const policy = createIntacctPolicy({
            journals: [
                {id: defaultJournal, name: 'Expensify Clearing Journal', value: ''},
                {id: 'APJ', name: 'Accounts Payable', value: 'ACCRUAL'},
            ],
        });

        // When checking dual-book status and building journal options
        const isDualBook = isSageIntacctDualBookCompany(policy);
        const options = getSageIntacctReconciliationJournals(policy, defaultJournal, translateLocal);

        // Then single-book mode does not disable no-book journals
        expect(isDualBook).toBe(false);
        expect(options.find((option) => option.value === defaultJournal)?.isDisabled).toBe(false);
    });

    it('preselects the default journal and charge card for existing CR domains', () => {
        // Given an existing CR domain whose config has no explicit journal and whose card NVP still holds a legacy liability code
        const defaultJournal = CONST.SAGE_INTACCT_DEFAULT_RECONCILIATION_JOURNAL;
        const legacyAccountCode = `${CONST.SAGE_INTACCT_LEGACY_LIABILITY_ACCOUNT_PREFIX}0`;
        const policy = createIntacctPolicy({
            journals: [{id: defaultJournal, name: 'Expensify Clearing Journal', value: ''}],
            creditCards: [
                {id: '10', name: CONST.SAGE_INTACCT_DEFAULT_RECONCILIATION_CARD, value: legacyAccountCode, liabilityAccountTitle: 'Expensify Card Liability Account'},
                {id: '20', name: 'Corp Visa', value: '2150', liabilityAccountTitle: 'Corporate Card Liability'},
            ],
        });

        // When resolving preselected journal and charge card
        const resolvedJournal = getResolvedSageIntacctReconciliationJournal(policy, true);
        const resolvedCardFromLegacy = getResolvedSageIntacctReconciliationCard(policy, legacyAccountCode, true);
        const resolvedCardUnset = getResolvedSageIntacctReconciliationCard(policy, undefined, true);
        const cardOptions = getSageIntacctReconciliationCreditCards(policy, '20', translateLocal);
        const travelCardOptions = getSageIntacctCreditCards(policy, 'Corp Visa', translateLocal);

        // Then default clearing journal and liability card are preselected and liability GL subtitles are shown
        expect(resolvedJournal?.id).toBe(defaultJournal);
        expect(resolvedCardFromLegacy?.id).toBe('10');
        expect(resolvedCardUnset?.id).toBe('10');
        expect(formatSageIntacctLiabilityAccount('2150', 'Corporate Card Liability')).toBe('2150 – Corporate Card Liability');
        expect(cardOptions.find((option) => option.value === '20')?.alternateText).toBe('Liability account: 2150 – Corporate Card Liability');
        expect(travelCardOptions.find((option) => option.value === 'Corp Visa')?.alternateText).toBe('Liability account: 2150 – Corporate Card Liability');
    });
});

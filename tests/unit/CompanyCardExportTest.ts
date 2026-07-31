import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {ThemeStyles} from '@styles/index';

import CONST from '@src/CONST';
import type {Card, Policy} from '@src/types/onyx';

import {getExportMenuItem} from '../../src/pages/workspace/companyCards/utils';
import {translateLocal} from '../utils/TestHelper';

const MOCK_POLICY_ID = 'ABC123';

const QBD_CREDIT_CARD_ACCOUNTS = [
    {id: '80000103-1746639410', name: 'American Express (91000)', currency: 'USD'},
    {id: '80000104-1746639411', name: 'Visa Business (92000)', currency: 'USD'},
];

function createQBDPolicy(overrides?: Partial<Policy>, nonReimbursableAccount = '80000103-1746639410'): Policy {
    return {
        id: MOCK_POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'test@qbdcc.com',
        ownerAccountID: 1,
        isPolicyExpenseChatEnabled: false,
        outputCurrency: 'USD',
        connections: {
            quickbooksDesktop: {
                config: {
                    export: {
                        nonReimbursable: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                        nonReimbursableAccount,
                        reimbursable: CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                        reimbursableAccount: '',
                        exportDate: CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE,
                        nonReimbursableBillDefaultVendor: '',
                        accountingMethod: 'accrual',
                    },
                },
                data: {
                    creditCardAccounts: QBD_CREDIT_CARD_ACCOUNTS,
                },
            },
        },
        ...overrides,
    } as Policy;
}

function createCard(nvpExportAccount?: string): Card {
    const nameValuePairs: Record<string, string> = {};
    if (nvpExportAccount !== undefined) {
        nameValuePairs.quickbooks_desktop_export_account_credit = nvpExportAccount;
    }

    return {
        cardID: 1001,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        domainName: 'test.exfy',
        fraud: 'none',
        lastUpdated: '',
        nameValuePairs,
    } as unknown as Card;
}

describe('getExportMenuItem - QBD credit card account resolution', () => {
    const translate = translateLocal as unknown as LocaleContextProps['translate'];

    it('resolves account by ID when NVP contains a QBD ListID (Classic-saved)', () => {
        const policy = createQBDPolicy();
        const card = createCard('80000103-1746639410');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, card);

        expect(result).toBeDefined();
        expect(result?.title).toBe('American Express (91000)');

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption).toBeDefined();
        expect(selectedOption?.value).toBe('80000103-1746639410');
        expect(selectedOption?.text).toBe('American Express (91000)');
    });

    it('resolves account by name fallback when NVP contains a display name (pre-fix NewDot-saved)', () => {
        const policy = createQBDPolicy();
        const card = createCard('American Express (91000)');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, card);

        expect(result).toBeDefined();
        expect(result?.title).toBe('American Express (91000)');

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption).toBeDefined();
        expect(selectedOption?.text).toBe('American Express (91000)');
    });

    it('selects default when NVP is not set', () => {
        const policy = createQBDPolicy();
        const card = createCard();

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, card);

        expect(result).toBeDefined();

        const defaultCard = translateLocal('workspace.moreFeatures.companyCards.defaultCard');
        expect(result?.title).toBe(defaultCard);

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption).toBeDefined();
        expect(selectedOption?.text).toBe(defaultCard);
    });

    it('selects default when NVP is set to DEFAULT_EXPORT_TYPE', () => {
        const policy = createQBDPolicy();
        const card = createCard(CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, card);

        expect(result).toBeDefined();

        const defaultCard = translateLocal('workspace.moreFeatures.companyCards.defaultCard');
        expect(result?.title).toBe(defaultCard);
    });

    it('shows the default label even when no workspace default account is configured', () => {
        const policy = createQBDPolicy(undefined, '');
        const card = createCard();

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, card);

        expect(result).toBeDefined();

        const defaultCard = translateLocal('workspace.moreFeatures.companyCards.defaultCard');
        expect(result?.title).toBe(defaultCard);

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption?.text).toBe(defaultCard);
    });

    it('uses card.id (not card.name) as the option value for all items', () => {
        const policy = createQBDPolicy();
        const card = createCard('80000103-1746639410');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, card);

        expect(result).toBeDefined();

        const nonDefaultOptions = result?.data?.filter((item) => item.value !== translateLocal('workspace.moreFeatures.companyCards.defaultCard')) ?? [];
        for (const option of nonDefaultOptions) {
            const matchingAccount = QBD_CREDIT_CARD_ACCOUNTS.find((account) => account.id === option.value);
            expect(matchingAccount).toBeDefined();
        }
    });
});

const QBO_CREDIT_CARDS = [
    {id: '101', name: 'Business Credit Card', currency: 'USD'},
    {id: '102', name: 'Corporate Amex', currency: 'USD'},
];
const QBO_BANK_ACCOUNTS = [
    {id: '201', name: 'Checking', currency: 'USD'},
    {id: '202', name: 'Savings', currency: 'USD'},
];

function createQBOPolicy(nonReimbursableExpensesExportDestination: string): Policy {
    return {
        id: MOCK_POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'test@qbocc.com',
        ownerAccountID: 1,
        isPolicyExpenseChatEnabled: false,
        outputCurrency: 'USD',
        connections: {
            quickbooksOnline: {
                config: {
                    nonReimbursableExpensesExportDestination,
                    reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                },
                data: {
                    creditCards: QBO_CREDIT_CARDS,
                    bankAccounts: QBO_BANK_ACCOUNTS,
                },
            },
        },
    } as unknown as Policy;
}

describe('getExportMenuItem - QBO company card export destination', () => {
    const translate = translateLocal as unknown as LocaleContextProps['translate'];
    const emptyCard = {cardID: 1001, nameValuePairs: {}} as unknown as Card;

    it('lists credit card accounts and shows the menu item for a credit card destination', () => {
        const policy = createQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBO, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, emptyCard);

        expect(result?.shouldShowMenuItem).toBe(true);
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT);
        for (const account of QBO_CREDIT_CARDS) {
            expect(result?.data?.some((option) => option.value === account.id)).toBe(true);
        }
    });

    it('lists bank accounts and shows the menu item for a debit card destination', () => {
        const policy = createQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBO, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, emptyCard);

        expect(result?.shouldShowMenuItem).toBe(true);
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT);
        for (const account of QBO_BANK_ACCOUNTS) {
            expect(result?.data?.some((option) => option.value === account.id)).toBe(true);
        }
    });

    it('does not surface any per-card account list for a vendor bill destination', () => {
        const policy = createQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBO, MOCK_POLICY_ID, translate, {} as ThemeStyles, policy, emptyCard);

        // Vendor bill has no per-card export account, so the menu item is hidden and the credit card list must not leak through.
        expect(result?.shouldShowMenuItem).toBe(false);
        expect(result?.exportType).toBeUndefined();
        expect(result?.data).toEqual([]);
    });
});

import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {Card, Policy} from '@src/types/onyx';
import {getExportMenuItem} from '../../src/pages/workspace/companyCards/utils';
import {translateLocal} from '../utils/TestHelper';

const MOCK_POLICY_ID = 'ABC123';

const QBD_CREDIT_CARD_ACCOUNTS = [
    {id: '80000103-1746639410', name: 'American Express (91000)', currency: 'USD'},
    {id: '80000104-1746639411', name: 'Visa Business (92000)', currency: 'USD'},
];

function createQBDPolicy(overrides?: Partial<Policy>): Policy {
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
                        nonReimbursableAccount: '80000103-1746639410',
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

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, policy, card);

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

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, policy, card);

        expect(result).toBeDefined();
        expect(result?.title).toBe('American Express (91000)');

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption).toBeDefined();
        expect(selectedOption?.text).toBe('American Express (91000)');
    });

    it('selects default when NVP is not set', () => {
        const policy = createQBDPolicy();
        const card = createCard();

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, policy, card);

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

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, policy, card);

        expect(result).toBeDefined();

        const defaultCard = translateLocal('workspace.moreFeatures.companyCards.defaultCard');
        expect(result?.title).toBe(defaultCard);
    });

    it('uses card.id (not card.name) as the option value for all items', () => {
        const policy = createQBDPolicy();
        const card = createCard('80000103-1746639410');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, policy, card);

        expect(result).toBeDefined();

        const nonDefaultOptions = result?.data?.filter((item) => item.value !== translateLocal('workspace.moreFeatures.companyCards.defaultCard')) ?? [];
        for (const option of nonDefaultOptions) {
            const matchingAccount = QBD_CREDIT_CARD_ACCOUNTS.find((account) => account.id === option.value);
            expect(matchingAccount).toBeDefined();
        }
    });
});

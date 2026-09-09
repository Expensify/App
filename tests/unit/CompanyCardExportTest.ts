import type {LocaleContextProps} from '@components/LocaleContextProvider';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type {ThemeStyles} from '@styles/index';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Card, CompanyCardFeedWithDomainID, Policy} from '@src/types/onyx';
import type {QBONonReimbursableExportAccountType, QBOReimbursableExportAccountType} from '@src/types/onyx/Policy';

import type {PartialDeep, ValueOf} from 'type-fest';

import {getCardExportAccountTitle, getCompanyCardDetailsBackPath, getExportMenuItem, getPolicyCardExportSettings} from '../../src/pages/workspace/companyCards/utils';
import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';

const MOCK_POLICY_ID = 'ABC123';
const FEED_A = 'oauth.wellsfargo.com#1' as CompanyCardFeedWithDomainID;
const FEED_B = 'oauth.wellsfargo.com#2' as CompanyCardFeedWithDomainID;
const CARD_A = '111';
const CARD_B = '222';
const ACCOUNT_ID_A = 96415001;
const ACCOUNT_ID_B = 96415002;

type TestSettingsRoute = {
    key: string;
    name: string;
    params?: Record<string, string | number | undefined>;
};

function createSettingsState(routes: TestSettingsRoute[]): PlatformStackNavigationState<SettingsNavigatorParamList> {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- unit tests intentionally build partial/malformed settings routes
        routes: routes as PlatformStackNavigationState<SettingsNavigatorParamList>['routes'],
        index: routes.length - 1,
        key: 'settings',
        routeNames: [],
        type: 'stack',
        stale: false,
        preloadedRoutes: [],
    };
}

const QBD_CREDIT_CARD_ACCOUNTS = [
    {id: '80000103-1746639410', name: 'American Express (91000)', currency: 'USD'},
    {id: '80000104-1746639411', name: 'Visa Business (92000)', currency: 'USD'},
];

function createQBDPolicy(overrides?: Partial<Policy>, nonReimbursableAccount = '80000103-1746639410'): Policy {
    return createMock<Policy>({
        id: MOCK_POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'test@qbdcc.com',
        ownerAccountID: 1,
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
                    },
                },
                data: {
                    creditCardAccounts: QBD_CREDIT_CARD_ACCOUNTS,
                },
            },
        },
        ...overrides,
    });
}

function createCard(nvpExportAccount?: string): Card {
    const nameValuePairs: Partial<NonNullable<Card['nameValuePairs']>> = {};
    if (nvpExportAccount !== undefined) {
        nameValuePairs.quickbooks_desktop_export_account_credit = nvpExportAccount;
    }

    return createMock<Card>({
        cardID: 1001,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        domainName: 'test.exfy',
        fraud: 'none',
        lastUpdated: '',
        nameValuePairs,
    });
}

const translate: LocaleContextProps['translate'] = translateLocal;
const themeStyles = createMock<ThemeStyles>({});
const basePath = ROUTES.POLICY_ACCOUNTING.getRoute(MOCK_POLICY_ID);

describe('getExportMenuItem - QBD credit card account resolution', () => {
    it('resolves account by ID when NVP contains a QBD ListID (Classic-saved)', () => {
        const policy = createQBDPolicy();
        const card = createCard('80000103-1746639410');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, themeStyles, policy, card);

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

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result).toBeDefined();
        expect(result?.title).toBe('American Express (91000)');

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption).toBeDefined();
        expect(selectedOption?.text).toBe('American Express (91000)');
    });

    it('selects default when NVP is not set', () => {
        const policy = createQBDPolicy();
        const card = createCard();

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, themeStyles, policy, card);

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

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result).toBeDefined();

        const defaultCard = translateLocal('workspace.moreFeatures.companyCards.defaultCard');
        expect(result?.title).toBe(defaultCard);
    });

    it('shows the default label even when no workspace default account is configured', () => {
        const policy = createQBDPolicy(undefined, '');
        const card = createCard();

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result).toBeDefined();

        const defaultCard = translateLocal('workspace.moreFeatures.companyCards.defaultCard');
        expect(result?.title).toBe(defaultCard);

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption?.text).toBe(defaultCard);
    });

    it('uses card.id (not card.name) as the option value for all items', () => {
        const policy = createQBDPolicy();
        const card = createCard('80000103-1746639410');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBD, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result).toBeDefined();

        const nonDefaultOptions = result?.data?.filter((item) => item.value !== translateLocal('workspace.moreFeatures.companyCards.defaultCard')) ?? [];
        for (const option of nonDefaultOptions) {
            const matchingAccount = QBD_CREDIT_CARD_ACCOUNTS.find((account) => account.id === option.value);
            expect(matchingAccount).toBeDefined();
        }
    });
});

const QBO_CREDIT_CARDS = [
    {id: 'qbo-cc-1', name: 'Amex Corporate', currency: 'USD'},
    {id: 'qbo-cc-2', name: 'Visa Platinum', currency: 'USD'},
];

const QBO_BANK_ACCOUNTS = [
    {id: 'qbo-bank-1', name: 'Checking 1234', currency: 'USD'},
    {id: 'qbo-bank-2', name: 'Savings 5678', currency: 'USD'},
];

const XERO_BANK_ACCOUNTS = [
    {id: 'xero-bank-1', name: 'Business Account', currency: 'USD'},
    {id: 'xero-bank-2', name: 'Petty Cash', currency: 'USD'},
];

const NETSUITE_VENDORS = [
    {id: 'ns-vendor-1', name: 'Acme Supplies'},
    {id: 'ns-vendor-2', name: 'Globex Rentals'},
];

const NETSUITE_PAYABLE_ACCOUNTS = [
    {id: 'ns-payable-1', name: 'Accounts Payable'},
    {id: 'ns-payable-2', name: 'Corporate Card Payable'},
];

const INTACCT_VENDORS = [
    {id: 'intacct-vendor-1', name: 'intacct-vendor-1', value: 'Acme Vendor'},
    {id: 'intacct-vendor-2', name: 'intacct-vendor-2', value: 'Umbrella Vendor'},
];

const INTACCT_CREDIT_CARDS = [
    {id: 'intacct-card-1', name: 'Intacct Amex'},
    {id: 'intacct-card-2', name: 'Intacct Visa'},
];

const RILLET_ACCOUNTS = [
    {
        id: 'rillet-1',
        code: '2100',
        name: 'Amex Payable',
        type: CONST.RILLET_ACCOUNT_TYPE.LIABILITY,
        subtype: CONST.RILLET_ACCOUNT_SUBTYPE.CREDIT_CARD,
        status: CONST.RILLET_ACCOUNT_STATUS.ACTIVE,
    },
    {
        id: 'rillet-2',
        code: '2200',
        name: 'Visa Payable',
        type: CONST.RILLET_ACCOUNT_TYPE.LIABILITY,
        subtype: CONST.RILLET_ACCOUNT_SUBTYPE.CREDIT_CARD,
        status: CONST.RILLET_ACCOUNT_STATUS.ACTIVE,
    },
    {
        id: 'rillet-3',
        code: '2300',
        name: 'Retired Card',
        type: CONST.RILLET_ACCOUNT_TYPE.LIABILITY,
        subtype: CONST.RILLET_ACCOUNT_SUBTYPE.CREDIT_CARD,
        status: CONST.RILLET_ACCOUNT_STATUS.INACTIVE,
    },
    {
        id: 'rillet-4',
        code: '6000',
        name: 'Office Expense',
        type: CONST.RILLET_ACCOUNT_TYPE.EXPENSE,
        subtype: 'Office',
        status: CONST.RILLET_ACCOUNT_STATUS.ACTIVE,
    },
];

const DUALENTRY_ACCOUNTS = [
    {id: 'de-1', number: '2100', name: 'Amex Payable', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD, isActive: true},
    {id: 'de-2', number: '2200', name: 'Visa Payable', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD, isActive: true},
    {id: 'de-3', number: '2300', name: 'Retired Card', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD, isActive: false},
    {id: 'de-4', number: '6000', name: 'Office Expense', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.EXPENSE, isActive: true},
];

function createBasePolicy(connections: PartialDeep<Policy['connections'], {recurseIntoArrays: true}>): Policy {
    return createMock<Policy>({
        id: MOCK_POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'test@export.com',
        ownerAccountID: 1,
        outputCurrency: 'USD',
        connections,
    });
}

/**
 * Builds a card carrying a single export NVP, so one helper covers every integration's NVP key. Passing `undefined`
 * leaves the NVP off entirely, which is what an unconfigured card looks like.
 */
function createCardWithExportNVP(nvpKey: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES>, nvpValue?: string, bank?: Card['bank']): Card {
    const nameValuePairs: Partial<NonNullable<Card['nameValuePairs']>> = {};
    if (nvpValue !== undefined) {
        nameValuePairs[nvpKey] = nvpValue;
    }

    return createMock<Card>({
        cardID: 2002,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        bank: bank ?? CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        domainName: 'test.exfy',
        fraud: 'none',
        lastUpdated: '',
        nameValuePairs,
    });
}

describe('getExportMenuItem - QBO', () => {
    function createQBOPolicy(nonReimbursableExpensesExportDestination: QBONonReimbursableExportAccountType, reimbursableExpensesExportDestination?: QBOReimbursableExportAccountType) {
        return createBasePolicy({
            quickbooksOnline: {
                config: {
                    nonReimbursableExpensesExportDestination,
                    reimbursableExpensesExportDestination,
                    nonReimbursableExpensesAccount: {id: 'qbo-cc-2', name: 'Visa Platinum', currency: 'USD'},
                },
                data: {
                    creditCards: QBO_CREDIT_CARDS,
                    bankAccounts: QBO_BANK_ACCOUNTS,
                },
            },
        });
    }

    it('resolves a credit card export against the credit card list', () => {
        const policy = createQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD);
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT, 'qbo-cc-1');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBO, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe('Amex Corporate');
        expect(result?.shouldShowMenuItem).toBe(true);
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT);
        expect(result?.exportPageLink).toBe(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.path, basePath));
        expect(result?.data).toHaveLength(QBO_CREDIT_CARDS.length + 1);

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption?.value).toBe('qbo-cc-1');
        expect(selectedOption?.text).toBe('Amex Corporate');
        expect(selectedOption?.keyForList).toBe('Amex Corporate');
    });

    it('resolves a debit card export against the bank account list and its own NVP', () => {
        const policy = createQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD);
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT, 'qbo-bank-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBO, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe('Savings 5678');
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT);
        expect(result?.data).toHaveLength(QBO_BANK_ACCOUNTS.length + 1);
    });

    it('hides the menu item for a vendor bill export', () => {
        const policy = createQBOPolicy(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL);
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT, 'qbo-cc-1');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBO, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.shouldShowMenuItem).toBe(false);
    });

    it.each([CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK])(
        'labels the default option as an account for a %s reimbursable export',
        (reimbursableExpensesExportDestination) => {
            const policy = createBasePolicy({
                quickbooksOnline: {
                    config: {reimbursableExpensesExportDestination},
                    data: {creditCards: QBO_CREDIT_CARDS},
                },
            });
            const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT);

            const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBO, MOCK_POLICY_ID, translate, themeStyles, policy, card);

            expect(result?.title).toBe(translateLocal('workspace.accounting.defaultAccount'));
        },
    );

    it('returns no options for an unrecognized export destination', () => {
        const policy = createBasePolicy({
            quickbooksOnline: {
                data: {creditCards: QBO_CREDIT_CARDS},
            },
        });
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.QBO, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.shouldShowMenuItem).toBe(false);
        expect(result?.data).toEqual([]);
    });
});

describe('getExportMenuItem - Xero', () => {
    function createXeroPolicy(nonReimbursableAccount: string) {
        return createBasePolicy({
            xero: {
                config: {export: {nonReimbursableAccount}},
                data: {bankAccounts: XERO_BANK_ACCOUNTS},
            },
        });
    }

    it('resolves the bank account named by the NVP and keys options by id', () => {
        const policy = createXeroPolicy('xero-bank-1');
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT, 'xero-bank-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.XERO, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe('Petty Cash');
        expect(result?.shouldShowMenuItem).toBe(true);
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT);
        expect(result?.data).toHaveLength(XERO_BANK_ACCOUNTS.length + 1);

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption?.value).toBe('xero-bank-2');
        expect(selectedOption?.keyForList).toBe('xero-bank-2');
    });

    it.each([undefined, CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE])('shows the default account label when the NVP is %s', (nvpValue) => {
        const policy = createXeroPolicy('xero-bank-1');
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT, nvpValue);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.XERO, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(translateLocal('workspace.accounting.defaultAccount'));
    });

    it('hides the menu item when the workspace has no non-reimbursable account', () => {
        const policy = createXeroPolicy('');
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT, 'xero-bank-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.XERO, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.shouldShowMenuItem).toBe(false);
    });
});

describe('getExportMenuItem - NetSuite', () => {
    function createNetSuitePolicy(nonreimbursableExpensesExportDestination: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>) {
        return createBasePolicy({
            netsuite: {
                options: {
                    config: {
                        nonreimbursableExpensesExportDestination,
                        defaultVendor: 'ns-vendor-1',
                        payableAcct: 'ns-payable-1',
                    },
                    data: {
                        vendors: NETSUITE_VENDORS,
                        payableList: NETSUITE_PAYABLE_ACCOUNTS,
                    },
                },
            },
        });
    }

    it('resolves a vendor bill export against the vendor list', () => {
        const policy = createNetSuitePolicy(CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL);
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR, 'ns-vendor-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe('Globex Rentals');
        expect(result?.shouldShowMenuItem).toBe(true);
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR);
        expect(result?.exportPageLink).toBe(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.path, basePath));
        expect(result?.data).toHaveLength(NETSUITE_VENDORS.length + 1);
    });

    it('shows the default vendor label for a vendor bill export with no NVP', () => {
        const policy = createNetSuitePolicy(CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL);
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(translateLocal('workspace.accounting.defaultVendor'));
    });

    it('resolves a journal entry export against the payable account list', () => {
        const policy = createNetSuitePolicy(CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY);
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_ACCOUNT, 'ns-payable-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe('Corporate Card Payable');
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_ACCOUNT);
        expect(result?.data).toHaveLength(NETSUITE_PAYABLE_ACCOUNTS.length + 1);
    });

    it('hides the menu item for an expense report export', () => {
        const policy = createNetSuitePolicy(CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT);
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR, 'ns-vendor-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.NETSUITE, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.shouldShowMenuItem).toBe(false);
        expect(result?.data).toEqual([]);
    });
});

describe('getExportMenuItem - Sage Intacct', () => {
    it("titles a vendor bill export from the vendor's value rather than its name", () => {
        const policy = createBasePolicy({
            intacct: {
                config: {
                    export: {
                        nonReimbursable: CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL,
                        nonReimbursableVendor: 'intacct-vendor-1',
                    },
                },
                data: {vendors: INTACCT_VENDORS},
            },
        });
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR, 'intacct-vendor-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe('Umbrella Vendor');
        expect(result?.shouldShowMenuItem).toBe(true);
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR);
        expect(result?.exportPageLink).toBe(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path, basePath));
        expect(result?.data).toHaveLength(INTACCT_VENDORS.length + 1);

        const selectedOption = result?.data?.find((item) => item.isSelected);
        expect(selectedOption?.value).toBe('intacct-vendor-2');
        expect(selectedOption?.text).toBe('Umbrella Vendor');
    });

    it('falls back to the reimbursable export type when no non-reimbursable one is set', () => {
        const policy = createBasePolicy({
            intacct: {
                config: {
                    export: {
                        reimbursable: CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL,
                        reimbursableExpenseReportDefaultVendor: 'intacct-vendor-1',
                    },
                },
                data: {vendors: INTACCT_VENDORS},
            },
        });
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR, 'intacct-vendor-1');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe('Acme Vendor');
        expect(result?.shouldShowMenuItem).toBe(true);
    });

    it("titles a credit card charge export from the card's name", () => {
        const policy = createBasePolicy({
            intacct: {
                config: {
                    export: {
                        nonReimbursable: CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE,
                        nonReimbursableAccount: 'intacct-card-1',
                    },
                },
                data: {vendors: INTACCT_VENDORS, creditCards: INTACCT_CREDIT_CARDS},
            },
        });
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_CHARGE_CARD, 'intacct-card-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe('Intacct Visa');
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_CHARGE_CARD);
        expect(result?.data).toHaveLength(INTACCT_CREDIT_CARDS.length + 1);
    });

    it('hides the menu item for an expense report export', () => {
        const policy = createBasePolicy({
            intacct: {
                config: {export: {reimbursable: CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT}},
                data: {vendors: INTACCT_VENDORS},
            },
        });
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.shouldShowMenuItem).toBe(false);
        expect(result?.data).toEqual([]);
    });
});

describe('getExportMenuItem - Rillet', () => {
    const exportsTo = translateLocal('common.exportsTo');
    const defaultSuffix = translateLocal('common.default').toLocaleLowerCase();

    function createRilletPolicy(exportOverrides?: {exportToMultipleAccounts?: boolean; cardProgramAccounts?: Record<string, string>}) {
        return createBasePolicy({
            rillet: {
                config: {
                    export: {
                        exportToMultipleAccounts: exportOverrides?.exportToMultipleAccounts ?? true,
                        reimbursable: CONST.RILLET_EXPORT_REIMBURSABLE.VENDOR_BILL,
                        nonReimbursable: CONST.RILLET_EXPORT_NON_REIMBURSABLE.CREDIT_CARD_CHARGE,
                        creditCardAccountCode: '2100',
                        cardProgramAccounts: exportOverrides?.cardProgramAccounts,
                    },
                },
                data: {accounts: RILLET_ACCOUNTS},
            },
        });
    }

    it('marks the workspace program account as the default in the title', () => {
        const policy = createRilletPolicy();
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.RILLET, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(`${exportsTo} 2100 Amex Payable (${defaultSuffix})`);
        expect(result?.shouldShowMenuItem).toBe(true);
        expect(result?.shouldHideMenuItemDescription).toBe(true);
        expect(result?.shouldShowMenuItemIcon).toBe(true);
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT);
    });

    it('drops the default suffix when the card names its own account', () => {
        const policy = createRilletPolicy();
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT, 'rillet-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.RILLET, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(`${exportsTo} 2200 Visa Payable`);
    });

    it("uses the card feed's program account override", () => {
        const policy = createRilletPolicy({cardProgramAccounts: {[CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: '2200'}});
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT, undefined, CONST.COMPANY_CARD.FEED_BANK_NAME.VISA);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.RILLET, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(`${exportsTo} 2200 Visa Payable (${defaultSuffix})`);

        const defaultOption = result?.data?.at(0);
        expect(defaultOption?.keyForList).toBe('rillet-2');
        expect(defaultOption?.value).toBe('');
        expect(defaultOption?.text).toBe(`${translateLocal('common.default')} - 2200 Visa Payable`);
    });

    it('offers only active credit card accounts while still resolving an inactive one as the title', () => {
        const policy = createRilletPolicy();
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT, 'rillet-3');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.RILLET, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(`${exportsTo} 2300 Retired Card`);
        expect(result?.data?.map((item) => item.keyForList)).toEqual(['rillet-1', 'rillet-2']);
    });

    it('hides the menu item when the workspace does not export to multiple accounts', () => {
        const policy = createRilletPolicy({exportToMultipleAccounts: false});
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.RILLET, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.shouldShowMenuItem).toBeFalsy();
    });
});

describe('getExportMenuItem - DualEntry', () => {
    const exportsTo = translateLocal('common.exportsTo');
    const defaultSuffix = translateLocal('common.default').toLocaleLowerCase();

    function createDualEntryPolicy(exportOverrides?: {exportToMultipleAccounts?: boolean; cardProgramAccounts?: Record<string, string>}) {
        return createBasePolicy({
            dualEntry: {
                config: {
                    export: {
                        exportToMultipleAccounts: exportOverrides?.exportToMultipleAccounts ?? true,
                        reimbursable: CONST.DUALENTRY_EXPORT_REIMBURSABLE.VENDOR_BILL,
                        nonReimbursable: CONST.DUALENTRY_EXPORT_NON_REIMBURSABLE.DIRECT_EXPENSE,
                        creditCardAccountID: 'de-1',
                        cardProgramAccounts: exportOverrides?.cardProgramAccounts,
                    },
                },
                data: {accounts: DUALENTRY_ACCOUNTS},
            },
        });
    }

    it('prefixes the title with the account id and marks the workspace default', () => {
        const policy = createDualEntryPolicy();
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.DUALENTRY, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(`${exportsTo} de-1 Amex Payable (${defaultSuffix})`);
        expect(result?.shouldShowMenuItem).toBe(true);
        expect(result?.exportType).toBe(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT);
    });

    it("matches the program account by id and uses the card feed's override", () => {
        const policy = createDualEntryPolicy({cardProgramAccounts: {[CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: 'de-2'}});
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT, undefined, CONST.COMPANY_CARD.FEED_BANK_NAME.VISA);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.DUALENTRY, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(`${exportsTo} de-2 Visa Payable (${defaultSuffix})`);
    });

    it('offers only active credit card and bank accounts', () => {
        const policy = createDualEntryPolicy();
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT, 'de-2');

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.DUALENTRY, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.title).toBe(`${exportsTo} de-2 Visa Payable`);
        expect(result?.data?.map((item) => item.keyForList)).toEqual(['de-1', 'de-2']);
    });

    it('hides the menu item when the workspace does not export to multiple accounts', () => {
        const policy = createDualEntryPolicy({exportToMultipleAccounts: false});
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT);

        const result = getExportMenuItem(CONST.POLICY.CONNECTIONS.NAME.DUALENTRY, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(result?.shouldShowMenuItem).toBeFalsy();
    });
});

describe('getExportMenuItem - unsupported connections', () => {
    it.each([CONST.POLICY.CONNECTIONS.NAME.CERTINIA, undefined])('returns undefined for %s', (connectionName) => {
        const policy = createBasePolicy({});
        const card = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_FINANCIALFORCE_EXPORT_VENDOR);

        expect(getExportMenuItem(connectionName, MOCK_POLICY_ID, translate, themeStyles, policy, card)).toBeUndefined();
    });
});

describe('getPolicyCardExportSettings + getCardExportAccountTitle', () => {
    const connectionsToTest = [
        {
            name: CONST.POLICY.CONNECTIONS.NAME.QBO,
            policy: createBasePolicy({
                quickbooksOnline: {
                    config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                    data: {creditCards: QBO_CREDIT_CARDS},
                },
            }),
            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT,
            matchingAccountID: 'qbo-cc-1',
        },
        {
            name: CONST.POLICY.CONNECTIONS.NAME.XERO,
            policy: createBasePolicy({xero: {config: {export: {nonReimbursableAccount: 'xero-bank-1'}}, data: {bankAccounts: XERO_BANK_ACCOUNTS}}}),
            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT,
            matchingAccountID: 'xero-bank-2',
        },
        {
            name: CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
            policy: createBasePolicy({
                netsuite: {options: {config: {nonreimbursableExpensesExportDestination: CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL}, data: {vendors: NETSUITE_VENDORS}}},
            }),
            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR,
            matchingAccountID: 'ns-vendor-2',
        },
        {
            name: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
            policy: createBasePolicy({
                intacct: {config: {export: {nonReimbursable: CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL}}, data: {vendors: INTACCT_VENDORS}},
            }),
            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR,
            matchingAccountID: 'intacct-vendor-2',
        },
        {
            name: CONST.POLICY.CONNECTIONS.NAME.QBD,
            policy: createQBDPolicy(),
            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_DESKTOP_EXPORT_ACCOUNT_CREDIT,
            matchingAccountID: '80000104-1746639411',
        },
        {
            name: CONST.POLICY.CONNECTIONS.NAME.RILLET,
            policy: createBasePolicy({
                rillet: {
                    config: {
                        export: {
                            exportToMultipleAccounts: true,
                            reimbursable: CONST.RILLET_EXPORT_REIMBURSABLE.VENDOR_BILL,
                            nonReimbursable: CONST.RILLET_EXPORT_NON_REIMBURSABLE.CREDIT_CARD_CHARGE,
                            creditCardAccountCode: '2100',
                        },
                    },
                    data: {accounts: RILLET_ACCOUNTS},
                },
            }),
            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT,
            matchingAccountID: 'rillet-2',
        },
        {
            name: CONST.POLICY.CONNECTIONS.NAME.DUALENTRY,
            policy: createBasePolicy({
                dualEntry: {
                    config: {
                        export: {
                            exportToMultipleAccounts: true,
                            reimbursable: CONST.DUALENTRY_EXPORT_REIMBURSABLE.VENDOR_BILL,
                            nonReimbursable: CONST.DUALENTRY_EXPORT_NON_REIMBURSABLE.DIRECT_EXPENSE,
                            creditCardAccountID: 'de-1',
                        },
                    },
                    data: {accounts: DUALENTRY_ACCOUNTS},
                },
            }),
            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT,
            matchingAccountID: 'de-2',
        },
    ] as const;

    it.each(
        connectionsToTest.flatMap(({name, policy, nvpKey, matchingAccountID}) => [
            {name, policy, card: createCardWithExportNVP(nvpKey, matchingAccountID), label: `${name} - matched NVP`},
            {name, policy, card: createCardWithExportNVP(nvpKey), label: `${name} - unset NVP (default)`},
            {name, policy, card: createCardWithExportNVP(nvpKey, CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE), label: `${name} - DEFAULT_EXPORT_TYPE`},
        ]),
    )('$label: getCardExportAccountTitle matches getExportMenuItem().title', ({name, policy, card}) => {
        const settings = getPolicyCardExportSettings(name, MOCK_POLICY_ID, translate, policy);
        const legacyResult = getExportMenuItem(name, MOCK_POLICY_ID, translate, themeStyles, policy, card);

        expect(getCardExportAccountTitle(settings, card)).toBe(legacyResult?.title);
        expect(settings?.shouldShowMenuItem).toBe(legacyResult?.shouldShowMenuItem);
    });

    it('resolves a different title per card feed when a single settings object is reused across Rillet cards', () => {
        const policy = createBasePolicy({
            rillet: {
                config: {
                    export: {
                        exportToMultipleAccounts: true,
                        reimbursable: CONST.RILLET_EXPORT_REIMBURSABLE.VENDOR_BILL,
                        nonReimbursable: CONST.RILLET_EXPORT_NON_REIMBURSABLE.CREDIT_CARD_CHARGE,
                        creditCardAccountCode: '2100',
                        cardProgramAccounts: {[CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: '2200'},
                    },
                },
                data: {accounts: RILLET_ACCOUNTS},
            },
        });
        const settings = getPolicyCardExportSettings(CONST.POLICY.CONNECTIONS.NAME.RILLET, MOCK_POLICY_ID, translate, policy);

        const visaCard = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT, undefined, CONST.COMPANY_CARD.FEED_BANK_NAME.VISA);
        const otherFeedCard = createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT, undefined, CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);

        expect(getCardExportAccountTitle(settings, visaCard)).toContain('2200 Visa Payable');
        expect(getCardExportAccountTitle(settings, otherFeedCard)).toContain('2100 Amex Payable');
    });

    it('returns undefined when there is no export settings for the card', () => {
        expect(getCardExportAccountTitle(undefined, createCardWithExportNVP(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT))).toBeUndefined();
    });
});

describe('getCompanyCardDetailsBackPath', () => {
    it('uses Members base when the matching details route has accountID', () => {
        const state = createSettingsState([
            {
                key: 'details-a',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: CARD_A, accountID: String(ACCOUNT_ID_A)},
            },
            {
                key: 'edit-a',
                name: SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: CARD_A},
            },
        ]);

        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_A, CARD_A, state)).toBe(
            createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(FEED_A, CARD_A), ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(MOCK_POLICY_ID, ACCOUNT_ID_A)),
        );
    });

    it('uses Company Cards base when no matching details route exists', () => {
        const state = createSettingsState([
            {
                key: 'edit-a',
                name: SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: CARD_A},
            },
        ]);

        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_A, CARD_A, state)).toBe(
            createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(FEED_A, CARD_A), ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(MOCK_POLICY_ID)),
        );
    });

    it('ignores a stale details route for a different card and keeps the current feed/cardID', () => {
        const state = createSettingsState([
            {
                key: 'details-a',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: CARD_A, accountID: String(ACCOUNT_ID_A)},
            },
            {
                key: 'edit-b',
                name: SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_B, cardID: CARD_B},
            },
        ]);

        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_B, CARD_B, state)).toBe(
            createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(FEED_B, CARD_B), ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(MOCK_POLICY_ID)),
        );
    });

    it('uses the matching details route accountID when a newer stale details route exists for another card', () => {
        const state = createSettingsState([
            {
                key: 'details-a',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: CARD_A, accountID: String(ACCOUNT_ID_A)},
            },
            {
                key: 'details-b',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_B, cardID: CARD_B, accountID: String(ACCOUNT_ID_B)},
            },
            {
                key: 'edit-a',
                name: SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: CARD_A},
            },
        ]);

        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_A, CARD_A, state)).toBe(
            createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(FEED_A, CARD_A), ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(MOCK_POLICY_ID, ACCOUNT_ID_A)),
        );
    });

    it('uses Company Cards base when accountID is empty or invalid', () => {
        const emptyAccountState = createSettingsState([
            {
                key: 'details-empty',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: CARD_A, accountID: ''},
            },
        ]);
        const invalidAccountState = createSettingsState([
            {
                key: 'details-invalid',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: CARD_A, accountID: '0'},
            },
        ]);
        const expected = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(FEED_A, CARD_A), ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(MOCK_POLICY_ID));

        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_A, CARD_A, emptyAccountState)).toBe(expected);
        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_A, CARD_A, invalidAccountState)).toBe(expected);
    });

    it('matches an encoded feed against the current feed', () => {
        const encodedFeed = encodeURIComponent(FEED_A);
        const state = createSettingsState([
            {
                key: 'details-encoded',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID, feed: encodedFeed, cardID: CARD_A, accountID: String(ACCOUNT_ID_A)},
            },
        ]);

        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_A, CARD_A, state)).toBe(
            createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(FEED_A, CARD_A), ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(MOCK_POLICY_ID, ACCOUNT_ID_A)),
        );
    });

    it('ignores details routes with missing or non-string feed/cardID params', () => {
        const expected = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(FEED_A, CARD_A), ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(MOCK_POLICY_ID));
        const missingParamsState = createSettingsState([
            {
                key: 'details-missing',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID},
            },
        ]);
        const nonStringParamsState = createSettingsState([
            {
                key: 'details-non-string',
                name: SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS,
                params: {policyID: MOCK_POLICY_ID, feed: FEED_A, cardID: 111},
            },
        ]);

        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_A, CARD_A, missingParamsState)).toBe(expected);
        expect(getCompanyCardDetailsBackPath(MOCK_POLICY_ID, FEED_A, CARD_A, nonStringParamsState)).toBe(expected);
    });
});

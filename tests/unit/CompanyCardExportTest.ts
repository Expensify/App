import type {LocaleContextProps} from '@components/LocaleContextProvider';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type {ThemeStyles} from '@styles/index';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Card, CompanyCardFeedWithDomainID, Policy} from '@src/types/onyx';

import {getCompanyCardDetailsBackPath, getExportMenuItem} from '../../src/pages/workspace/companyCards/utils';
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

describe('getExportMenuItem - QBD credit card account resolution', () => {
    const translate: LocaleContextProps['translate'] = translateLocal;
    const themeStyles = createMock<ThemeStyles>({});

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

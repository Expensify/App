import {renderHook} from '@testing-library/react-native';

import useConnectedAccountingIntegration from '@pages/workspace/accounting/useConnectedAccountingIntegration';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';

const mockSyncConnection = jest.fn();
let mockConnectedIntegration: ConnectionName | undefined;
let mockSynchronizationError: string | undefined;
let mockIsAuthenticationError = false;

jest.mock('@hooks/useCardFeeds', () => () => [undefined]);
jest.mock('@hooks/useCardsLists', () => () => [undefined]);
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));
jest.mock('@hooks/useEnvironment', () => () => ({environment: 'development'}));
jest.mock('@hooks/useExpensifyCardFeeds', () => () => ({}));
jest.mock('@hooks/useHasReusablePoliciesConnectedTo', () => () => false);
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    datetimeToRelative: () => '',
    getLocalDateFromDatetime: jest.fn(),
    dateFnsLocale: undefined,
}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true, showReadOnlyModal: jest.fn()}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useWorkspaceAccountID', () => () => undefined);
jest.mock('@libs/AccountingUtils', () => ({
    getQBORefreshTokenExpiryDate: () => undefined,
    getQBORefreshTokenExpiryStatus: () => undefined,
}));
jest.mock('@libs/actions/connections', () => ({
    isAuthenticationError: () => mockIsAuthenticationError,
    isConnectionInProgress: () => false,
    isConnectionUnverified: () => false,
    removePolicyConnection: jest.fn(),
    // Lazy wrapper so mockSyncConnection is resolved at call time
    syncConnection: (...args: unknown[]) => {
        mockSyncConnection(...args);
    },
}));
jest.mock('@libs/CardUtils', () => ({isExpensifyCardFullySetUp: () => false}));
jest.mock('@libs/DateUtils', () => ({formatToLongDateInUTC: jest.fn()}));
jest.mock('@libs/Environment/Environment', () => ({
    getEnvironmentURL: () => Promise.resolve(''),
    getOldDotURLFromEnvironment: () => '',
}));
jest.mock('@components/TextLink', () => ({__esModule: true, default: () => null}));
jest.mock('@libs/PolicyUtils', () => ({
    areSettingsInErrorFields: () => false,
    findCurrentXeroOrganization: () => undefined,
    getConnectedIntegration: () => mockConnectedIntegration,
    getCurrentSageIntacctEntityName: () => '',
    getCurrentXeroOrganizationName: () => '',
    getIntegrationLastSuccessfulDate: () => undefined,
    getXeroTenants: () => [],
    hasAccountingConnections: () => true,
    hasSupportedOnlyOnOldDotIntegration: () => false,
    settingsPendingAction: () => undefined,
    shouldShowReimbursableExportDestinationAccountError: () => false,
    shouldShowSyncError: () => false,
}));
jest.mock('@navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@userActions/Policy/Policy', () => ({openPolicyExpensifyCardsPage: jest.fn()}));
jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    useAccountingActions: () => ({startIntegrationFlow: jest.fn()}),
    useAccountingState: () => ({activeIntegration: undefined}),
}));
jest.mock('@pages/workspace/accounting/certinia/utils', () => ({
    getCertiniaSelectedCompanyID: () => undefined,
    isCertiniaFFAConnection: () => false,
}));
jest.mock('@pages/workspace/accounting/utils', () => ({
    getAccountingIntegrationData: () => undefined,
    getAccountingIntegrationDisplayName: () => '',
    getSynchronizationErrorMessage: () => mockSynchronizationError,
    isIntuitEnterpriseSuiteConnection: () => false,
}));

const policy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), id: 'policy-1'};

const zohoBooksPolicy: Policy = {
    ...policy,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The hook only reads the entity list and the selected entity, so the rest of the connection config is left out.
    connections: {
        [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: {
            config: {subsidiaryID: 'org-1'},
            data: {
                organizations: [
                    {id: 'org-1', name: 'Organization One', currency: 'USD'},
                    {id: 'org-2', name: 'Organization Two', currency: 'USD'},
                ],
            },
        },
    } as Policy['connections'],
};

const netSuitePolicy: Policy = {
    ...policy,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The hook only reads the selected subsidiary and the subsidiary list, so the rest of the connection config is left out.
    connections: {
        [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
            options: {
                config: {subsidiary: 'Subsidiary One'},
                data: {
                    subsidiaryList: [
                        {internalID: '1', name: 'Subsidiary One'},
                        {internalID: '2', name: 'Subsidiary Two'},
                    ],
                },
            },
        },
    } as Policy['connections'],
};

const campfirePolicy: Policy = {
    ...policy,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The hook only reads the entity list and the selected entity, so the rest of the connection config is left out.
    connections: {
        [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]: {
            config: {subsidiaryID: 'subsidiary-1'},
            data: {
                subsidiaries: [
                    {id: 'subsidiary-1', name: 'Subsidiary One', currency: 'USD'},
                    {id: 'subsidiary-2', name: 'Subsidiary Two', currency: 'USD'},
                ],
            },
        },
    } as Policy['connections'],
};

const DIGITS_COMPANY_NAME = 'Acme Inc.';

const digitsPolicy: Policy = {
    ...policy,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The hook only reads the connected company, so the rest of the connection is left out.
    connections: {
        [CONST.POLICY.CONNECTIONS.NAME.DIGITS]: {
            data: {company: {id: 'company-1', name: DIGITS_COMPANY_NAME, currency: CONST.CURRENCY.USD}},
        },
    } as Policy['connections'],
};

function createNetSuitePolicy(netSuiteConnection: Record<string, unknown>): Policy {
    return {
        ...policy,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The hook only reads the auth type of the NetSuite connection, so the rest of the connection is left out.
        connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: netSuiteConnection} as Policy['connections'],
    };
}

const netSuiteOAuthPolicy = createNetSuitePolicy({accountID: 'TSTDRV123', config: {authType: CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.OAUTH2}});
const netSuiteTBAPolicy = createNetSuitePolicy({accountID: 'TSTDRV123', tokenID: 'token-id', tokenSecret: 'token-secret', config: {}});

const credentialsMenuTextKeys = new Set(['workspace.accounting.enterCredentials', 'workspace.accounting.reconnect', 'workspace.accounting.updateCredentials']);

function getCredentialsItemText(policyToRender: Policy) {
    const {result} = renderHook(() => useConnectedAccountingIntegration(policyToRender));
    return result.current.overflowMenu.find((item) => credentialsMenuTextKeys.has(item.text))?.text;
}

function getSettingsMenuItemDescriptions(policyToRender: Policy) {
    const {result} = renderHook(() => useConnectedAccountingIntegration(policyToRender));
    return result.current.connectionDetails?.settingsMenuItems.map((item) => item.description);
}

function getSettingsMenuItem(policyToRender: Policy, description: string) {
    const {result} = renderHook(() => useConnectedAccountingIntegration(policyToRender));
    return result.current.connectionDetails?.settingsMenuItems.find((item) => item.description === description);
}

function getSettingsMenuItemTitles(policyToRender: Policy) {
    const {result} = renderHook(() => useConnectedAccountingIntegration(policyToRender));
    return result.current.connectionDetails?.settingsMenuItems.map((item) => item.title);
}

function getSyncNowItem() {
    const {result} = renderHook(() => useConnectedAccountingIntegration(policy));
    return result.current.overflowMenu.find((item) => item.text === 'workspace.accounting.syncNow');
}

describe('useConnectedAccountingIntegration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockConnectedIntegration = undefined;
        mockSynchronizationError = undefined;
        mockIsAuthenticationError = false;
    });

    describe('Sync now menu item', () => {
        it('should call syncConnection with forceDataRefresh true when connected to QBD', () => {
            // Given a workspace connected to QuickBooks Desktop
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBD;

            // When the user selects "Sync now"
            getSyncNowItem()?.onSelected?.();

            // Then syncConnection is called with forceDataRefresh true so IS forces a full data refresh from Codat
            expect(mockSyncConnection).toHaveBeenCalledWith(policy, CONST.POLICY.CONNECTIONS.NAME.QBD, true);
        });

        it('should call syncConnection with forceDataRefresh false for non-QBD integrations', () => {
            // Given a workspace connected to QuickBooks Online
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;

            // When the user selects "Sync now"
            getSyncNowItem()?.onSelected?.();

            // Then syncConnection is called with forceDataRefresh false since only QBD uses Codat's cached data
            expect(mockSyncConnection).toHaveBeenCalledWith(policy, CONST.POLICY.CONNECTIONS.NAME.QBO, false);
        });
    });

    describe('Integration-specific settings row on a failed sync', () => {
        it('should keep the Zoho Books organization row when the last sync failed', () => {
            // Given a workspace connected to Zoho Books with two organizations whose last sync failed
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS;
            mockSynchronizationError = 'Sync failed';

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(zohoBooksPolicy);

            // Then the organization row is still shown, because the selected organization can be what broke the sync and admins need the row to switch it
            expect(descriptions).toContain('workspace.zohoBooks.organization');
        });

        it('should keep the NetSuite subsidiary row when the last sync failed without an authentication error', () => {
            // Given a workspace connected to NetSuite with two subsidiaries whose last sync failed for a reason other than authentication
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
            mockSynchronizationError = 'Sync failed';

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(netSuitePolicy);

            // Then the subsidiary row is still shown, because the selected subsidiary can be what broke the sync and admins need the row to switch it
            expect(descriptions).toContain('workspace.netsuite.subsidiary');
        });

        it('should keep the integration-specific row for other connectors when the last sync failed without an authentication error', () => {
            // Given a workspace connected to Campfire with two entities whose last sync failed for a reason other than authentication
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE;
            mockSynchronizationError = 'Sync failed';

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(campfirePolicy);

            // Then the entity row is still shown, since the rule is shared by every connector with an entity selector
            expect(descriptions).toContain('workspace.campfire.entity');
        });

        it('should drop the integration-specific row when the last sync failed with an authentication error', () => {
            // Given a workspace connected to NetSuite whose last sync failed because the credentials are no longer valid
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
            mockSynchronizationError = 'Authentication failed';
            mockIsAuthenticationError = true;

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(netSuitePolicy);

            // Then the subsidiary row is hidden, since switching the subsidiary cannot fix invalid credentials
            expect(descriptions).not.toContain('workspace.netsuite.subsidiary');
        });

        it('should keep the Zoho Books organization row when the last sync failed with an authentication error', () => {
            // Given a workspace connected to Zoho Books with two organizations whose last sync failed because the credentials are no longer valid
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS;
            mockSynchronizationError = 'Authentication failed';
            mockIsAuthenticationError = true;

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(zohoBooksPolicy);

            // Then the organization row is still shown, since the authentication rule leaves Zoho Books' existing behavior unchanged
            expect(descriptions).toContain('workspace.zohoBooks.organization');
        });
    });

    describe('Credentials menu item on a NetSuite authentication error', () => {
        beforeEach(() => {
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
            mockSynchronizationError = 'Authentication failed';
            mockIsAuthenticationError = true;
        });

        it('should say Reconnect for an OAuth connection', () => {
            // Given a NetSuite OAuth connection whose last sync failed to authenticate

            // When the overflow menu is built
            const text = getCredentialsItemText(netSuiteOAuthPolicy);

            // Then the item says Reconnect, because the admin authorizes Expensify again in NetSuite instead of typing new credentials
            expect(text).toBe('workspace.accounting.reconnect');
        });

        it('should keep Enter your credentials for a Token-Based Authentication connection', () => {
            // Given a NetSuite Token-Based Authentication connection whose last sync failed to authenticate

            // When the overflow menu is built
            const text = getCredentialsItemText(netSuiteTBAPolicy);

            // Then the item keeps the Enter your credentials label, since only OAuth connections say Reconnect
            expect(text).toBe('workspace.accounting.enterCredentials');
        });
    });

    describe('Configuration rows for Digits', () => {
        it('should show the Import and Export rows but not the Advanced row', () => {
            // Given a workspace connected to Digits, which has its Import and Export pages but no Advanced page yet
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.DIGITS;

            // When the connected integration's settings rows are built
            const titles = getSettingsMenuItemTitles(policy);

            // Then Advanced is left out, because its page arrives in a later release and the row would lead nowhere
            expect(titles).toContain('workspace.accounting.import');
            expect(titles).toContain('workspace.accounting.export');
            expect(titles).not.toContain('workspace.accounting.advanced');
        });

        it('should keep the Advanced row for other connectors', () => {
            // Given a workspace connected to Campfire, which has every configuration page
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE;

            // When the connected integration's settings rows are built
            const titles = getSettingsMenuItemTitles(campfirePolicy);

            // Then all three rows show, since only Digits hides the row for a page it doesn't have yet
            expect(titles).toEqual(expect.arrayContaining(['workspace.accounting.import', 'workspace.accounting.export', 'workspace.accounting.advanced']));
        });
    });

    describe('Entity row for Digits', () => {
        it('should show the connected company in a read-only Entity row', () => {
            // Given a workspace connected to Digits whose sync saved the company the admin signed in to
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.DIGITS;

            // When the connected integration's settings rows are built
            const entityRow = getSettingsMenuItem(digitsPolicy, 'workspace.digits.entity');

            // Then the row names the company and can't be pressed, because a Digits sign-in covers exactly one company and there is nothing to switch to
            expect(entityRow?.title).toBe(DIGITS_COMPANY_NAME);
            expect(entityRow?.interactive).toBe(false);
            expect(entityRow?.onPress).toBeUndefined();
        });

        it('should leave out the Entity row until the first sync saves the company', () => {
            // Given a workspace connected to Digits whose first sync hasn't saved the company yet
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.DIGITS;

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(policy);

            // Then there is no Entity row, so the card never shows a row with an empty company name
            expect(descriptions).not.toContain('workspace.digits.entity');
        });

        it('should drop the Entity row when the last sync failed with an authentication error', () => {
            // Given a workspace connected to Digits whose last sync failed because the Digits access was revoked
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.DIGITS;
            mockSynchronizationError = 'Authentication failed';
            mockIsAuthenticationError = true;

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(digitsPolicy);

            // Then the Entity row is hidden like other connectors' rows, since the admin has to sign in to Digits again first
            expect(descriptions).not.toContain('workspace.digits.entity');
        });
    });
});

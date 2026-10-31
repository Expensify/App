import {renderHook} from '@testing-library/react-native';

import Navigation from '@navigation/Navigation';

import useConnectedAccountingIntegration from '@pages/workspace/accounting/useConnectedAccountingIntegration';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {GestureResponderEvent} from 'react-native';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

const mockSyncConnection = jest.fn();
let mockConnectedIntegration: ConnectionName | undefined;
let mockSynchronizationError: string | undefined;
let mockIsAuthenticationError = false;
let mockCanWriteAccounting = true;
let mockHasAccountingConnection = true;

jest.mock('@hooks/useCardFeeds', () => () => [undefined]);
jest.mock('@hooks/useCardsLists', () => () => [undefined]);
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));
jest.mock('@hooks/useEnvironment', () => () => ({environment: 'development'}));
jest.mock('@hooks/useExpensifyCardFeeds', () => () => ({}));
jest.mock('@hooks/useHasReusablePoliciesConnectedTo', () => () => false);
jest.mock('@hooks/useIsUnifiedConnectionsBetaEnabled', () => () => false);
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
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: mockCanWriteAccounting, showReadOnlyModal: jest.fn()}));
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
jest.mock('@libs/DateUtils', () => ({formatWithUTCTimeZone: jest.fn()}));
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
    hasAccountingConnections: () => mockHasAccountingConnection,
    hasSupportedOnlyOnOldDotIntegration: () => false,
    settingsPendingAction: () => undefined,
    shouldShowQBOReimbursableExportDestinationAccountError: () => false,
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

function createNetSuitePolicy(subsidiaries = ['Subsidiary One', 'Subsidiary Two'], selectedSubsidiary = 'Subsidiary One'): Policy {
    return {
        ...policy,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Only the subsidiary config and cached list are needed to exercise the settings row.
        connections: {
            netsuite: {
                verified: true,
                options: {
                    config: {subsidiary: selectedSubsidiary},
                    data: {subsidiaryList: subsidiaries.map((name, index) => ({name, internalID: String(index + 1)}))},
                },
            },
        } as Policy['connections'],
    };
}

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

function getSettingsMenuItemDescriptions(policyToRender: Policy) {
    const {result} = renderHook(() => useConnectedAccountingIntegration(policyToRender));
    return result.current.connectionDetails?.settingsMenuItems.map((item) => item.description);
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
        mockCanWriteAccounting = true;
        mockHasAccountingConnection = true;
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

        it('should keep the integration-specific row for other connectors when the last sync failed', () => {
            // Given a workspace connected to Campfire with two entities whose last sync failed
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE;
            mockSynchronizationError = 'Sync failed';

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(campfirePolicy);

            // Then the entity selector remains available to correct the configuration that caused the sync failure
            expect(descriptions).toContain('workspace.campfire.entity');
        });

        it('should allow changing NetSuite subsidiaries during a non-authentication sync error', () => {
            // Given a verified NetSuite connection with two subsidiaries and a recoverable sync failure
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
            mockSynchronizationError = 'Invalid subsidiary';

            // When the admin opens the subsidiary row while the error is still displayed
            const {result} = renderHook(() => useConnectedAccountingIntegration(createNetSuitePolicy()));
            const subsidiaryRow = result.current.connectionDetails?.settingsMenuItems.find((item) => item.description === 'workspace.netsuite.subsidiary');
            expect(subsidiaryRow).toBeDefined();
            subsidiaryRow?.onPress?.(createMock<GestureResponderEvent>({}));

            // Then the existing selector opens for this workspace without dismissing the synchronization error
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.getRoute(policy.id));
            expect(result.current.synchronizationError).toBe(mockSynchronizationError);
        });

        it('should require credential recovery for an authentication error on a verified NetSuite connection', () => {
            // Given a previously verified connection whose credentials have since failed
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
            mockSynchronizationError = 'Authentication failed';
            mockIsAuthenticationError = true;

            // When the accounting menu is built independently of the connection verification state
            const {result} = renderHook(() => useConnectedAccountingIntegration(createNetSuitePolicy()));

            // Then the subsidiary row is hidden and the credentials action remains available
            expect(result.current.connectionDetails?.settingsMenuItems.map((item) => item.description)).not.toContain('workspace.netsuite.subsidiary');
            expect(result.current.overflowMenu.some((item) => item.text === 'workspace.accounting.enterCredentials')).toBe(true);
        });

        it('should preserve the Zoho Books organization row during an authentication error', () => {
            // Given the existing Zoho Books recovery flow which permits organization selection on every error
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS;
            mockSynchronizationError = 'Authentication failed';
            mockIsAuthenticationError = true;

            // When its settings are built with invalid credentials
            const descriptions = getSettingsMenuItemDescriptions(zohoBooksPolicy);

            // Then the shared change does not remove the existing organization recovery option
            expect(descriptions).toContain('workspace.zohoBooks.organization');
        });

        it.each([
            {canWrite: false, subsidiaries: ['Subsidiary One', 'Subsidiary Two']},
            {canWrite: true, subsidiaries: ['Subsidiary One']},
        ])('should keep the NetSuite row read-only with canWrite=$canWrite and subsidiaries=$subsidiaries', ({canWrite, subsidiaries}) => {
            // Given a sync failure where permissions or the available choices prevent changing subsidiaries
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
            mockSynchronizationError = 'Sync failed';
            mockCanWriteAccounting = canWrite;

            // When the subsidiary row is built
            const {result} = renderHook(() => useConnectedAccountingIntegration(createNetSuitePolicy(subsidiaries)));
            const subsidiaryRow = result.current.connectionDetails?.settingsMenuItems.find((item) => item.description === 'workspace.netsuite.subsidiary');

            // Then the selected subsidiary is visible without an action that bypasses the existing restrictions
            expect(subsidiaryRow?.title).toBe('Subsidiary One');
            expect(subsidiaryRow?.shouldShowRightIcon).toBe(false);
            expect(subsidiaryRow?.onPress).toBeUndefined();
        });

        it('should not introduce a NetSuite row before a subsidiary has been selected', () => {
            // Given initial setup with no selected subsidiary and a failed sync
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
            mockSynchronizationError = 'Sync failed';

            // When the settings are built before the subsidiary data is ready
            const descriptions = getSettingsMenuItemDescriptions(createNetSuitePolicy([], ''));

            // Then initial setup does not gain an empty subsidiary row
            expect(descriptions).not.toContain('workspace.netsuite.subsidiary');
        });

        it('should not expose NetSuite settings after the accounting connection is removed', () => {
            // Given cached subsidiary data and an old sync error after disconnecting
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
            mockSynchronizationError = 'Sync failed';
            mockHasAccountingConnection = false;

            // When the menu is built with that stale data
            const descriptions = getSettingsMenuItemDescriptions(createNetSuitePolicy());

            // Then the connection check still excludes all accounting settings
            expect(descriptions).toEqual([]);
        });
    });
});

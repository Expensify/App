import {renderHook} from '@testing-library/react-native';

import useConnectedAccountingIntegration from '@pages/workspace/accounting/useConnectedAccountingIntegration';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';

const mockSyncConnection = jest.fn();
let mockConnectedIntegration: ConnectionName | undefined;
let mockSynchronizationError: string | undefined;

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
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true, showReadOnlyModal: jest.fn()}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useWorkspaceAccountID', () => () => undefined);
jest.mock('@libs/AccountingUtils', () => ({
    getQBORefreshTokenExpiryDate: () => undefined,
    getQBORefreshTokenExpiryStatus: () => undefined,
}));
jest.mock('@libs/actions/connections', () => ({
    isAuthenticationError: () => false,
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
    hasAccountingConnections: () => true,
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

        it('should drop the integration-specific row for other connectors when the last sync failed', () => {
            // Given a workspace connected to Campfire with two entities whose last sync failed
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE;
            mockSynchronizationError = 'Sync failed';

            // When the connected integration's settings rows are built
            const descriptions = getSettingsMenuItemDescriptions(campfirePolicy);

            // Then the entity row is hidden, since only Zoho Books keeps its row through a sync error
            expect(descriptions).not.toContain('workspace.campfire.entity');
        });
    });
});

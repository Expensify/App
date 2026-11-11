import {renderHook} from '@testing-library/react-native';

import useAccountingConnectionListings from '@pages/workspace/connections/useAccountingConnectionListings';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';

const mockStartIntegrationFlow = jest.fn();
const mockShowReadOnlyModal = jest.fn();
let mockCanWrite = true;
let mockConnectedIntegration: ConnectionName | undefined;

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, datetimeToRelative: () => '', getLocalDateFromDatetime: jest.fn()}));
let mockEnabledBetas: string[] = [];
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: (beta: string) => mockEnabledBetas.includes(beta)}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: mockCanWrite, showReadOnlyModal: mockShowReadOnlyModal}));
jest.mock('@libs/actions/connections', () => ({isConnectionInProgress: () => false, isConnectionUnverified: () => false}));

jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@libs/PolicyUtils', () => ({
    getConnectedIntegration: () => mockConnectedIntegration,
    getIntegrationLastSuccessfulDate: () => undefined,
    shouldShowReimbursableExportDestinationAccountError: () => false,
}));
jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    useAccountingActions: () => ({startIntegrationFlow: mockStartIntegrationFlow}),
    useAccountingState: () => ({activeIntegration: undefined, popoverAnchorRefs: {current: {}}}),
}));
jest.mock('@pages/workspace/accounting/utils', () => ({
    getAccountingIntegrationData: (name: string) => ({title: name}),
    getSynchronizationErrorMessage: () => undefined,
    isIntuitEnterpriseSuiteConnection: () => false,
}));

const policy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), id: 'policy-1'};

function findListing(key: string, policyOverride: Policy = policy) {
    const {result} = renderHook(() => useAccountingConnectionListings(policyOverride));
    return result.current.find((listing) => listing.key === key);
}

describe('useAccountingConnectionListings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCanWrite = true;
        mockConnectedIntegration = undefined;
        mockEnabledBetas = [];
    });

    it('should start the connect flow for a workspace with no accounting integration', () => {
        // Given a workspace with nothing connected
        const xero = findListing(CONST.POLICY.CONNECTIONS.NAME.XERO);

        // When the admin connects Xero
        xero?.onConnect?.();

        // Then Xero's flow starts with nothing to disconnect
        expect(mockStartIntegrationFlow).toHaveBeenCalledWith({name: CONST.POLICY.CONNECTIONS.NAME.XERO, isIntuitEnterpriseSuite: undefined});
    });

    it('should replace the connected integration when the admin connects another one', () => {
        // Given a workspace already connected to QuickBooks Online, since only one accounting integration can be connected
        mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;
        const xero = findListing(CONST.POLICY.CONNECTIONS.NAME.XERO);

        // When the admin connects Xero
        xero?.onConnect?.();

        // Then the flow is told to disconnect QuickBooks Online first, which asks the admin before replacing it
        expect(mockStartIntegrationFlow).toHaveBeenCalledWith({
            name: CONST.POLICY.CONNECTIONS.NAME.XERO,
            isIntuitEnterpriseSuite: undefined,
            integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.QBO,
            shouldDisconnectIntegrationBeforeConnecting: true,
        });
    });

    it('should only show the read-only modal to a member who cannot edit accounting', () => {
        // Given a member without write access to accounting
        mockCanWrite = false;
        const xero = findListing(CONST.POLICY.CONNECTIONS.NAME.XERO);

        // When they try to connect Xero
        xero?.onConnect?.();

        // Then they are told they can't, and no flow starts
        expect(mockShowReadOnlyModal).toHaveBeenCalledTimes(1);
        expect(mockStartIntegrationFlow).not.toHaveBeenCalled();
    });

    it('should show the connected integration with its status', () => {
        // Given a workspace connected to QuickBooks Online
        mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;

        // When the listings are built
        const qbo = findListing(CONST.POLICY.CONNECTIONS.NAME.QBO);

        // Then QuickBooks Online carries a healthy status, so it shows in the connected section with Configure
        expect(qbo?.status?.isBroken).toBe(false);
    });
    it.each([{enabledBetas: []}, {enabledBetas: ['campfire']}])('should offer Campfire with beta enrollment $enabledBetas', ({enabledBetas}) => {
        // Given a workspace with no accounting connection
        mockEnabledBetas = enabledBetas;

        // When the accounting listings are built
        const campfire = findListing(CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE);

        // Then Campfire is offered, because it no longer needs a beta, and Business Central stays hidden without its beta
        expect(campfire).toBeDefined();
        expect(findListing(CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL)).toBeUndefined();
    });

    it('should offer the Sage Accounting waitlist right after Sage Intacct', () => {
        // Given a workspace with no accounting integration
        const {result} = renderHook(() => useAccountingConnectionListings(policy));

        // When the accounting listings are built
        const keys = result.current.map((listing) => listing.key);

        // Then Sage Accounting follows Sage Intacct and offers its waitlist instead of a connect flow
        expect(keys.indexOf(CONST.POLICY.CONNECTIONS.NAME.SAGE_ACCOUNTING)).toBe(keys.indexOf(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT) + 1);
        expect(findListing(CONST.POLICY.CONNECTIONS.NAME.SAGE_ACCOUNTING)?.onConnect).toBeUndefined();
    });

    it('should offer the Sage Accounting waitlist to users in the beta too', () => {
        // Given a user in the Sage Accounting beta, which has no connector to offer until a later release
        mockEnabledBetas = [CONST.BETAS.SAGE_ACCOUNTING];

        // When the accounting listings are built
        const sageAccounting = findListing(CONST.POLICY.CONNECTIONS.NAME.SAGE_ACCOUNTING);

        // Then they see the same waitlist card as everyone else
        expect(sageAccounting).toBeDefined();
        expect(sageAccounting?.onConnect).toBeUndefined();
    });

    it('should offer Business Central alongside Campfire to a workspace in the Business Central beta', () => {
        // Given a workspace enrolled in the Business Central beta
        mockEnabledBetas = [CONST.BETAS.BUSINESS_CENTRAL];

        // When the accounting listings are built
        const businessCentral = findListing(CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL);

        // Then both integrations are available
        expect(businessCentral).toBeDefined();
        expect(findListing(CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE)).toBeDefined();
    });

    it('should pass a failed Zoho Books connect error to the Zoho Books card', () => {
        // Given the Zoho Books OAuth flow failed after leaving the app, so the backend left its error on the policy
        mockEnabledBetas = [CONST.BETAS.ZOHO_BOOKS];
        const connectError = 'Zoho Books organizations with multiple locations are not supported yet.';
        const policyWithConnectError: Policy = {...policy, connectErrors: {[CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: connectError}};

        // When the accounting listings are built
        const zohoBooks = findListing(CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS, policyWithConnectError);

        // Then the Zoho Books card carries the error, so the admin sees why it didn't connect, and other cards carry none
        expect(zohoBooks?.connectError).toBe(connectError);
        expect(findListing(CONST.POLICY.CONNECTIONS.NAME.XERO, policyWithConnectError)?.connectError).toBeUndefined();
    });

    it('should hide a failed Zoho Books connect error once another accounting integration is connected', () => {
        // Given Zoho Books failed to connect, and the admin then connected Campfire instead, which leaves the saved Zoho Books error in place
        mockEnabledBetas = [CONST.BETAS.ZOHO_BOOKS];
        mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE;
        const policyWithConnectError: Policy = {
            ...policy,
            connectErrors: {[CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS]: 'Zoho Books organizations with multiple locations are not supported yet.'},
        };

        // When the accounting listings are built
        const zohoBooks = findListing(CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS, policyWithConnectError);

        // Then the Zoho Books card shows no error, because the workspace is already connected to accounting and the old failure no longer applies
        expect(zohoBooks?.connectError).toBeUndefined();
    });
});

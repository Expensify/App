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
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/useIsUnifiedConnectionsBetaEnabled', () => () => true);
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: mockCanWrite, showReadOnlyModal: mockShowReadOnlyModal}));
jest.mock('@libs/actions/connections', () => ({isConnectionInProgress: () => false, isConnectionUnverified: () => false}));
jest.mock('@libs/actions/connections/QuickbooksOnline', () => ({shouldShowQBOReimbursableExportDestinationAccountError: () => false}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@libs/PolicyUtils', () => ({getConnectedIntegration: () => mockConnectedIntegration, getIntegrationLastSuccessfulDate: () => undefined}));
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

function findListing(key: string) {
    const {result} = renderHook(() => useAccountingConnectionListings(policy));
    return result.current.find((listing) => listing.key === key);
}

describe('useAccountingConnectionListings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCanWrite = true;
        mockConnectedIntegration = undefined;
    });

    it('should start the connect flow for a workspace with no accounting integration', () => {
        // Given a workspace with nothing connected
        const xero = findListing(CONST.POLICY.CONNECTIONS.NAME.XERO);

        // When the admin connects Xero
        xero?.onConnect();

        // Then Xero's flow starts with nothing to disconnect
        expect(mockStartIntegrationFlow).toHaveBeenCalledWith({name: CONST.POLICY.CONNECTIONS.NAME.XERO, isIntuitEnterpriseSuite: undefined});
    });

    it('should replace the connected integration when the admin connects another one', () => {
        // Given a workspace already connected to QuickBooks Online, since only one accounting integration can be connected
        mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;
        const xero = findListing(CONST.POLICY.CONNECTIONS.NAME.XERO);

        // When the admin connects Xero
        xero?.onConnect();

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
        xero?.onConnect();

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
});

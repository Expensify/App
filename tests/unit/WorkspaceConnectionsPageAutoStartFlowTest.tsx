import {render} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceConnectionsPage from '@pages/workspace/connections/WorkspaceConnectionsPage';

import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy-1';

type RouteParams = {
    newConnectionName?: ConnectionName;
    integrationToDisconnect?: ConnectionName;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    isIntuitEnterpriseSuite?: string;
};

let mockRouteParams: RouteParams = {};

const mockStartIntegrationFlow = jest.fn();

// The real `useFocusEffect` re-runs its callback whenever the callback's identity changes while the screen is focused.
// `useEffect(cb, [cb])` reproduces exactly that, which is the behaviour the guard under test has to survive.
jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    const {useEffect: mockUseEffect} = jest.requireActual<typeof React>('react');
    return {
        ...actualNavigation,
        useFocusEffect: (callback: () => void) => {
            mockUseEffect(callback, [callback]);
        },
        useRoute: () => ({params: mockRouteParams}),
        useNavigation: () => ({}),
        useIsFocused: () => true,
    };
});

// `Navigation.setParams` clears `newConnectionName` through react-navigation's state update, which lands in a later
// render than the synchronous call. The mock therefore only records the requested params; each test applies them when
// it wants that state update to land, which is what lets the two orderings below be told apart.
let mockPendingParams: RouteParams | undefined;
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: jest.fn((params: RouteParams) => {
            mockPendingParams = params;
        }),
        navigate: jest.fn(),
        goBack: jest.fn(),
        isNavigationReady: () => Promise.resolve(),
    },
}));

/** Lands the pending `Navigation.setParams` update, as a real navigation state change eventually would. */
function landPendingParamsUpdate() {
    mockRouteParams = {...mockRouteParams, ...mockPendingParams};
    mockPendingParams = undefined;
}

jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    __esModule: true,
    AccountingContextProvider: ({children}: {children: React.ReactNode}) => children,
    useAccountingActions: () => ({startIntegrationFlow: mockStartIntegrationFlow}),
    useAccountingState: () => ({activeIntegration: undefined, popoverAnchorRefs: {current: {}}}),
}));

jest.mock('@pages/workspace/withPolicyConnections', () => ({
    __esModule: true,
    default: (Component: React.ComponentType<{policy: Policy}>) => Component,
}));

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/ScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/ScrollView', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/HeaderWithBackButton', () => ({__esModule: true, default: () => null}));
jest.mock('@components/SearchBar/CompactSearchBar', () => ({__esModule: true, default: () => null}));
jest.mock('@components/TabSelector/TabSelectorBase', () => ({__esModule: true, default: () => null}));
jest.mock('@components/TextLink', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/workspace/connections/ConnectionsGrid', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/workspace/connections/useAccountingConnectionListings', () => ({__esModule: true, default: () => []}));
jest.mock('@pages/workspace/connections/useMergeConnectionListings', () => ({__esModule: true, default: () => []}));
jest.mock('@pages/workspace/connections/useReceiptPartnerConnectionListings', () => ({__esModule: true, default: () => []}));
jest.mock('@pages/workspace/connections/useMCPConnectionListings', () => ({__esModule: true, default: () => []}));
jest.mock('@libs/actions/PolicyConnections', () => ({openPolicyHRPage: jest.fn(), openPolicyRecruitingPage: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({openPolicyReceiptPartnersPage: jest.fn()}));

jest.mock('@libs/PolicyUtils', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils');
    return {
        ...actual,
        isControlPolicy: () => true,
    };
});

jest.mock('@hooks/usePolicyFeatureWriteAccess', () => ({
    __esModule: true,
    default: () => ({canWrite: true, showReadOnlyModal: () => {}}),
}));

// The real `withPolicyConnections` HOC reads `policy` from Onyx and strips it from the component's public props. It is
// mocked to an identity wrapper above, so the component under test takes `policy` directly.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the HOC that would inject `policy` is mocked out, so it is passed as a prop here
const WorkspaceConnectionsPageUnderTest = WorkspaceConnectionsPage as unknown as React.ComponentType<{policy: Policy}>;

function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test workspace'), id: POLICY_ID, ...overrides};
}

describe('WorkspaceConnectionsPage auto-started connect flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPendingParams = undefined;
        mockRouteParams = {
            newConnectionName: CONST.POLICY.CONNECTIONS.NAME.QBO,
            integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.XERO,
            shouldDisconnectIntegrationBeforeConnecting: true,
        };
    });

    it('should start the flow once when the effect re-runs before the cleared param has landed', async () => {
        // Given the page opened by a route that asks for a connect flow, which starts it and asks for the param to be
        // cleared so it cannot be acted on twice
        const {rerender} = render(<WorkspaceConnectionsPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);
        expect(Navigation.setParams).toHaveBeenCalled();

        // When anything re-creates `startIntegrationFlow` and re-runs the effect before that clear has landed, which a
        // policy update does. This is the window the guard exists for: `newConnectionName` is still set here.
        rerender(<WorkspaceConnectionsPageUnderTest policy={buildPolicy({name: 'Renamed workspace'})} />);
        await waitForBatchedUpdates();

        // Then the flow is not started again, because a second start is what used to stack a second confirmation
        // prompt the user had to dismiss twice
        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);
    });

    it('should start the flow again for a later round-trip that asks for the same integration', async () => {
        // Given a connect flow that was started from the route param and then let the clear land, so nothing is
        // pending any more
        const {rerender} = render(<WorkspaceConnectionsPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);

        landPendingParamsUpdate();
        rerender(<WorkspaceConnectionsPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);

        // When the user comes back later and asks for the very same integration again
        mockRouteParams = {
            newConnectionName: CONST.POLICY.CONNECTIONS.NAME.QBO,
            integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.XERO,
            shouldDisconnectIntegrationBeforeConnecting: true,
        };
        rerender(<WorkspaceConnectionsPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        // Then it is honoured rather than swallowed as a repeat of the first run, or the connect flow would silently
        // do nothing the second time round
        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(2);
    });
});

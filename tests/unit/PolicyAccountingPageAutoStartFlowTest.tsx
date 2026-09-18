import {render} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import PolicyAccountingPage from '@pages/workspace/accounting/PolicyAccountingPage';

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
jest.mock('@components/MenuItemList', () => ({__esModule: true, default: () => null}));
jest.mock('@components/MenuItem', () => ({__esModule: true, default: () => null}));
jest.mock('@components/Section', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => children}));
jest.mock('@components/CollapsibleSection', () => ({__esModule: true, default: () => null}));
jest.mock('@components/ThreeDotsMenu', () => ({__esModule: true, default: () => null}));
jest.mock('@components/ActivityIndicator', () => ({__esModule: true, default: () => null}));

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
const PolicyAccountingPageUnderTest = PolicyAccountingPage as unknown as React.ComponentType<{policy: Policy}>;

function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test workspace'), id: POLICY_ID, ...overrides};
}

describe('PolicyAccountingPage auto-started connect flow', () => {
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
        const {rerender} = render(<PolicyAccountingPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);
        expect(Navigation.setParams).toHaveBeenCalled();

        // A new policy object re-creates `startIntegrationFlow`, re-running the effect. `newConnectionName` is still
        // set here because the setParams update has not landed yet, so only the guard stops a second flow start -
        // which is what used to stack a second confirmation prompt.
        rerender(<PolicyAccountingPageUnderTest policy={buildPolicy({name: 'Renamed workspace'})} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);
    });

    it('should start the flow again for a later round-trip that asks for the same integration', async () => {
        const {rerender} = render(<PolicyAccountingPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);

        // Let the cleared param land, which is what re-arms the guard.
        landPendingParamsUpdate();
        rerender(<PolicyAccountingPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);

        // Asking for the same integration again has to be honoured rather than swallowed as a repeat of the run
        // above, or the connect flow silently does nothing the second time round.
        mockRouteParams = {
            newConnectionName: CONST.POLICY.CONNECTIONS.NAME.QBO,
            integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.XERO,
            shouldDisconnectIntegrationBeforeConnecting: true,
        };
        rerender(<PolicyAccountingPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(2);
    });
});

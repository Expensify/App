import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import Collapsible from '@components/CollapsibleSection/Collapsible';
import type CollapsibleProps from '@components/CollapsibleSection/Collapsible/types';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type * as MenuItemModule from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import PolicyAccountingPage from '@pages/workspace/accounting/PolicyAccountingPage';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

import type * as ReactNavigation from '@react-navigation/native';
import type {View} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
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
const mockShowReadOnlyModal = jest.fn();
const mockPopoverAnchorRefs = {
    current: Object.fromEntries(
        [...CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES, ...Object.values(CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES)].map((name) => [name, {current: null}]),
    ),
};
let mockCanWriteAccounting = true;
let mockEnabledBetas: string[] = [];

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: (beta: string) => mockEnabledBetas.includes(beta)}),
}));

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
    useAccountingState: () => ({activeIntegration: undefined, popoverAnchorRefs: mockPopoverAnchorRefs}),
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
jest.mock('@components/MenuItem', () => {
    const {View: MockView} = jest.requireActual<{View: typeof View}>('react-native');
    const {default: ActualMenuItem} = jest.requireActual<typeof MenuItemModule>('@components/MenuItem');
    return {
        __esModule: true,
        default: Object.assign(({title, rightComponent}: MenuItemModule.MenuItemProps) => <MockView testID={title}>{rightComponent}</MockView>, ActualMenuItem),
    };
});
jest.mock('@components/Section', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => children}));
// Jest resolves the native entry point by default; exercise the web wrapper's focus protection here.
jest.mock('@components/CollapsibleSection/Collapsible', () => jest.requireActual<{default: React.ComponentType<CollapsibleProps>}>('@components/CollapsibleSection/Collapsible/index.tsx'));
jest.mock('react-collapse', () => {
    const {View: MockView} = jest.requireActual<{View: typeof View}>('react-native');
    return {
        Collapse: ({isOpened, children}: CollapsibleProps) => <MockView aria-hidden={!isOpened}>{children}</MockView>,
    };
});
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
    default: () => ({canWrite: mockCanWriteAccounting, showReadOnlyModal: mockShowReadOnlyModal}),
}));

// The real `withPolicyConnections` HOC reads `policy` from Onyx and strips it from the component's public props. It is
// mocked to an identity wrapper above, so the component under test takes `policy` directly.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the HOC that would inject `policy` is mocked out, so it is passed as a prop here
const PolicyAccountingPageUnderTest = PolicyAccountingPage as unknown as React.ComponentType<{policy: Policy}>;

function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test workspace'), id: POLICY_ID, ...overrides};
}

function AccountingTestWrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

describe('PolicyAccountingPage auto-started connect flow', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

    beforeEach(() => {
        jest.clearAllMocks();
        mockCanWriteAccounting = true;
        mockEnabledBetas = [];
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
        const {rerender} = render(<PolicyAccountingPageUnderTest policy={buildPolicy()} />, {wrapper: AccountingTestWrapper});
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);
        expect(Navigation.setParams).toHaveBeenCalled();

        // When anything re-creates `startIntegrationFlow` and re-runs the effect before that clear has landed, which a
        // policy update does. This is the window the guard exists for: `newConnectionName` is still set here.
        rerender(<PolicyAccountingPageUnderTest policy={buildPolicy({name: 'Renamed workspace'})} />);
        await waitForBatchedUpdates();

        // Then the flow is not started again, because a second start is what used to stack a second confirmation
        // prompt the user had to dismiss twice
        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);
    });

    it('should start the flow again for a later round-trip that asks for the same integration', async () => {
        // Given a connect flow that was started from the route param and then let the clear land, so nothing is
        // pending any more
        const {rerender} = render(<PolicyAccountingPageUnderTest policy={buildPolicy()} />, {wrapper: AccountingTestWrapper});
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);

        landPendingParamsUpdate();
        rerender(<PolicyAccountingPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(1);

        // When the user comes back later and asks for the very same integration again
        mockRouteParams = {
            newConnectionName: CONST.POLICY.CONNECTIONS.NAME.QBO,
            integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.XERO,
            shouldDisconnectIntegrationBeforeConnecting: true,
        };
        rerender(<PolicyAccountingPageUnderTest policy={buildPolicy()} />);
        await waitForBatchedUpdates();

        // Then it is honoured rather than swallowed as a repeat of the first run, or the connect flow would silently
        // do nothing the second time round
        expect(mockStartIntegrationFlow).toHaveBeenCalledTimes(2);
    });

    it.each([{enabledBetas: []}, {enabledBetas: ['campfire']}])('should offer Campfire with beta enrollment $enabledBetas', async ({enabledBetas}) => {
        // Given an eligible workspace with no accounting connection
        mockEnabledBetas = enabledBetas;
        mockRouteParams = {};

        // When the admin connects Campfire from the accounting page
        render(<PolicyAccountingPageUnderTest policy={buildPolicy({connections: {}})} />, {wrapper: AccountingTestWrapper});
        await waitForBatchedUpdates();
        fireEvent.press(within(screen.getByTestId('Campfire')).getByRole('button'));

        // Then Campfire starts without enabling other integrations
        expect(mockStartIntegrationFlow).toHaveBeenCalledWith({name: CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE, isIntuitEnterpriseSuite: undefined});
        expect(screen.queryByTestId(CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.businessCentral)).toBeNull();
    });

    it('should keep Campfire connection changes read-only without accounting write access', async () => {
        // Given a workspace whose accounting settings are read-only
        mockCanWriteAccounting = false;
        mockRouteParams = {};

        // When the user presses the Campfire connect button
        render(<PolicyAccountingPageUnderTest policy={buildPolicy({connections: {}})} />, {wrapper: AccountingTestWrapper});
        await waitForBatchedUpdates();
        fireEvent.press(within(screen.getByTestId('Campfire')).getByRole('button'));

        // Then the read-only explanation appears without starting a connection
        expect(mockShowReadOnlyModal).toHaveBeenCalledTimes(1);
        expect(mockStartIntegrationFlow).not.toHaveBeenCalled();
    });

    it('should preserve Business Central beta access alongside Campfire', async () => {
        // Given an eligible workspace enrolled in the Business Central beta
        mockEnabledBetas = [CONST.BETAS.BUSINESS_CENTRAL];
        mockRouteParams = {};

        // When viewing the available accounting integrations
        render(<PolicyAccountingPageUnderTest policy={buildPolicy({connections: {}})} />, {wrapper: AccountingTestWrapper});
        await waitForBatchedUpdates();

        // Then the enrolled integration and Campfire are both available
        expect(screen.getByTestId(CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.businessCentral)).toBeOnTheScreen();
        expect(screen.getByTestId('Campfire')).toBeOnTheScreen();
    });

    it('keeps Exact Online inside Other integrations when an accounting connection exists', async () => {
        // Given a workspace connected to Sage Intacct
        mockRouteParams = {};
        const policy = buildPolicy({
            connections: createMock<Policy['connections']>({
                intacct: {
                    data: {},
                    lastSync: {isConnected: true, isSuccessful: true, source: 'NEWEXPENSIFY'},
                },
            }),
        });

        // When the Accounting page opens with Other integrations collapsed
        render(<PolicyAccountingPageUnderTest policy={policy} />, {wrapper: AccountingTestWrapper});
        await waitForBatchedUpdates();

        // Then Exact Online is hidden along with the other available integrations
        const waitlistTitle = screen.getByText('Exact Online', {includeHiddenElements: true});
        expect(screen.queryByText('Exact Online')).toBeNull();
        expect(screen.queryByRole('button', {name: 'Join waitlist'})).toBeNull();
        expect(screen.UNSAFE_getByType(Collapsible).find((node) => node.type === 'div').props.inert).toBe(true);

        // When Other integrations is expanded
        fireEvent.press(screen.getByRole('button', {name: 'Other'}));

        // Then the waitlist is available once within the expanded section
        expect(screen.getAllByText('Exact Online')).toHaveLength(1);
        expect(screen.getByRole('button', {name: 'Join waitlist'})).toBeOnTheScreen();
        expect(screen.getByText('Exact Online')).toBe(waitlistTitle);
        expect(screen.UNSAFE_getByType(Collapsible).find((node) => node.type === 'div').props.inert).toBe(false);

        // When Other integrations is collapsed again
        fireEvent.press(screen.getByRole('button', {name: 'Other'}));

        // Then Exact Online is hidden again
        expect(screen.queryByText('Exact Online')).toBeNull();
        expect(screen.getByText('Exact Online', {includeHiddenElements: true})).toBe(waitlistTitle);
        expect(screen.queryByRole('button', {name: 'Join waitlist'})).toBeNull();
        expect(screen.UNSAFE_getByType(Collapsible).find((node) => node.type === 'div').props.inert).toBe(true);
    });

    it.each([{enabledBetas: []}, {enabledBetas: [CONST.BETAS.EXACT_ONLINE]}])('offers the Exact Online waitlist with beta enrollment $enabledBetas', async ({enabledBetas}) => {
        // Given an eligible workspace and a user who may have the future Exact connector beta
        mockEnabledBetas = enabledBetas;
        mockRouteParams = {};

        // When the Accounting page lists its integrations
        render(<PolicyAccountingPageUnderTest policy={buildPolicy({connections: {}})} />, {wrapper: AccountingTestWrapper});
        await waitForBatchedUpdates();

        // Then Exact Online offers the waitlist without starting an unimplemented connector flow
        expect(screen.getByText('Exact Online')).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: 'Join waitlist'})).toBeOnTheScreen();
        expect(mockStartIntegrationFlow).not.toHaveBeenCalled();
        expect(screen.getByLabelText('Exact Online, Coming soon')).toBeOnTheScreen();

        await act(() => Onyx.set(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, '2026-10-15 10:00:00'));
        expect(screen.getByLabelText('Exact Online, Coming soon, You’re on the waitlist')).toBeOnTheScreen();

        await act(() => Onyx.set(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, null));
        expect(screen.getByLabelText('Exact Online, Coming soon')).toBeOnTheScreen();
    });
});

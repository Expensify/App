import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import type * as PolicyConnectionUtils from '@libs/PolicyUtils/connections';

import type {ActiveIntegration} from '@pages/workspace/accounting/AccountingContext/types';
import ConnectAccountingIntegrationPage from '@pages/workspace/accounting/ConnectAccountingIntegrationPage';
import type * as AccountingUtils from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import React from 'react';
import {View as MockView} from 'react-native';

import createRandomPolicy from '../utils/collections/policies';

const POLICY_ID = 'policy-1';

const mockStartIntegrationFlow = jest.fn();
let mockActiveIntegration: ActiveIntegration | undefined;
let mockConnectedIntegration: ConnectionName | undefined;
let mockValidConnectedIntegration: ConnectionName | undefined;
let mockIsSyncInProgress = false;

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn(), goBack: jest.fn(), dismissModal: jest.fn()},
}));
jest.mock('@hooks/useEnvironment', () => () => ({environment: 'production'}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@libs/actions/connections', () => ({isConnectionInProgress: () => mockIsSyncInProgress}));
jest.mock('@libs/PolicyUtils', () => ({
    getValidConnectedIntegration: () => mockValidConnectedIntegration,
    isConnectPageConnectionName: jest.requireActual<typeof PolicyConnectionUtils>('@libs/PolicyUtils/connections').isConnectPageConnectionName,
}));
jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    __esModule: true,
    AccountingContextProvider: ({children}: {children: React.ReactNode}) => children,
    useAccountingActions: () => ({startIntegrationFlow: mockStartIntegrationFlow}),
    useAccountingState: () => ({activeIntegration: mockActiveIntegration, popoverAnchorRefs: {current: {}}}),
}));
jest.mock('@pages/workspace/accounting/utils', () => ({
    getActiveIntegrationToConnect: jest.requireActual<typeof AccountingUtils>('@pages/workspace/accounting/utils').getActiveIntegrationToConnect,
    getAvailableAccountingIntegrations: () => [],
    getConnectedAndSyncingIntegrations: () => ({connectedIntegration: mockConnectedIntegration, syncingIntegration: mockIsSyncInProgress ? mockConnectedIntegration : undefined}),
    isIntuitEnterpriseSuiteConnectionOrSync: jest.requireActual<typeof AccountingUtils>('@pages/workspace/accounting/utils').isIntuitEnterpriseSuiteConnectionOrSync,
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
jest.mock('@components/FixedFooter', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('@components/ConnectionOrbitAnimation', () => ({__esModule: true, default: () => null}));
jest.mock('@components/Button/composed/ButtonDisabledWhenOffline', () => ({
    __esModule: true,
    default: ({sentryLabel, onPress}: {sentryLabel: string; onPress: () => void}) => (
        <MockView
            testID={sentryLabel}
            onPress={onPress}
        />
    ),
}));

// The real `withPolicyConnections` HOC reads `policy` from Onyx and takes `route` from the navigator. It is mocked to an
// identity wrapper above, so the page under test takes both directly.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the HOC and navigator that would pass these props are mocked out
const ConnectAccountingIntegrationPageUnderTest = ConnectAccountingIntegrationPage as unknown as React.ComponentType<{
    policy: Policy;
    route: {params: {policyID: string; connectionName: ConnectionName; isIntuitEnterpriseSuite?: string}};
}>;

const policy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), id: POLICY_ID, connections: undefined};

function renderPage(connectionName: ConnectionName, isIntuitEnterpriseSuite?: boolean) {
    render(
        <ConnectAccountingIntegrationPageUnderTest
            policy={policy}
            route={{params: {policyID: POLICY_ID, connectionName, isIntuitEnterpriseSuite: isIntuitEnterpriseSuite ? 'true' : undefined}}}
        />,
    );
}

function pressConnect() {
    fireEvent.press(screen.getByTestId(CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.CONNECT_PAGE_CONNECT));
}

describe('ConnectAccountingIntegrationPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockActiveIntegration = undefined;
        mockConnectedIntegration = undefined;
        mockValidConnectedIntegration = undefined;
        mockIsSyncInProgress = false;
    });

    it('asks to replace the integration the workspace is connected to', () => {
        // Given a workspace connected to NetSuite, since only one accounting integration can be connected
        mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
        mockValidConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
        renderPage(CONST.POLICY.CONNECTIONS.NAME.XERO);

        // When the admin presses Connect on the Xero Connect page
        pressConnect();

        // Then the flow is told to disconnect NetSuite first, which asks the admin before replacing it
        expect(mockStartIntegrationFlow).toHaveBeenCalledWith({
            name: CONST.POLICY.CONNECTIONS.NAME.XERO,
            isIntuitEnterpriseSuite: false,
            isSandbox: false,
            integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
            shouldDisconnectIntegrationBeforeConnecting: true,
        });
    });

    it('reconnects an unverified connection to the same integration without asking to replace it', () => {
        // Given a failed first Xero attempt, which leaves a Xero connection that isn't verified
        mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.XERO;
        renderPage(CONST.POLICY.CONNECTIONS.NAME.XERO);

        // When the admin presses Connect on the Xero Connect page again
        pressConnect();

        // Then Xero connects again without a prompt, since replacing Xero with Xero would only disconnect it
        expect(mockStartIntegrationFlow).toHaveBeenCalledWith({name: CONST.POLICY.CONNECTIONS.NAME.XERO, isIntuitEnterpriseSuite: false, isSandbox: false});
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('closes once the Intuit Enterprise Suite sync it started is running, before the connection has the Intuit Enterprise Suite scope', () => {
        // Given a QBO sync that this page started for Intuit Enterprise Suite, while the saved connection doesn't have the scope yet
        mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;
        mockIsSyncInProgress = true;
        mockActiveIntegration = {name: CONST.POLICY.CONNECTIONS.NAME.QBO, isIntuitEnterpriseSuite: true};

        // When the Intuit Enterprise Suite Connect page renders
        renderPage(CONST.POLICY.CONNECTIONS.NAME.QBO, true);

        // Then it closes, so the admin can't press Connect again and be asked to replace QuickBooks Online
        expect(Navigation.dismissModal).toHaveBeenCalled();
    });

    it('stays open for Intuit Enterprise Suite while a QuickBooks Online sync runs', () => {
        // Given a QBO sync that wasn't started for Intuit Enterprise Suite
        mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;
        mockIsSyncInProgress = true;
        mockActiveIntegration = {name: CONST.POLICY.CONNECTIONS.NAME.QBO, isIntuitEnterpriseSuite: false};

        // When the Intuit Enterprise Suite Connect page renders
        renderPage(CONST.POLICY.CONNECTIONS.NAME.QBO, true);

        // Then it stays open, since the workspace is connecting QuickBooks Online rather than Intuit Enterprise Suite
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });
});

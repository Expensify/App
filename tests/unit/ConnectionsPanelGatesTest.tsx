import {render, screen} from '@testing-library/react-native';

import type TextComponent from '@components/Text';

import ConnectionsAccountingPage from '@pages/workspace/connections/ConnectionsAccountingPage';
import ConnectionsMergePageBase from '@pages/workspace/connections/ConnectionsMergePageBase';
import ConnectionsReceiptPartnersPage from '@pages/workspace/connections/ConnectionsReceiptPartnersPage';
import type {MergeProviderCardDescriptor} from '@pages/workspace/merge/types';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import React from 'react';

import createRandomPolicy from '../utils/collections/policies';

const NOT_FOUND = 'Not found';
const POLICY_ID = 'policy-1';

let mockIsUnifiedConnectionsBetaEnabled = true;
let mockConnectedIntegration: string | undefined;
let mockIsUberConnected = false;

// The gates under test are the props each panel passes here, so the wrapper only shows whether the panel is blocked
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => {
    const {default: MockText} = jest.requireActual<{default: typeof TextComponent}>('@components/Text');
    return {
        __esModule: true,
        default: ({children, shouldBeBlocked}: {children: React.ReactNode; shouldBeBlocked?: boolean}) => (shouldBeBlocked ? <MockText>Not found</MockText> : children),
    };
});
jest.mock('@components/ScreenWrapper', () => ({__esModule: true, default: () => null}));
jest.mock('@components/FullscreenLoadingIndicator', () => ({__esModule: true, default: () => null}));
jest.mock('@hooks/useIsUnifiedConnectionsBetaEnabled', () => () => mockIsUnifiedConnectionsBetaEnabled);
jest.mock('@hooks/useWorkspaceDocumentTitle', () => () => {});
jest.mock('@hooks/useScreenBoundDynamicRoute', () => () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/usePolicy', () => () => undefined);
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true, showReadOnlyModal: jest.fn()}));
jest.mock('@libs/actions/PolicyConnections', () => ({openPolicyHRPage: jest.fn(), openPolicyRecruitingPage: jest.fn()}));
jest.mock('@pages/workspace/withPolicyConnections', () => ({
    __esModule: true,
    default: (Component: React.ComponentType<{policy: Policy}>) => Component,
}));
jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    AccountingContextProvider: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('@pages/workspace/accounting/useConnectedAccountingIntegration', () => ({
    __esModule: true,
    default: () => ({connectedIntegration: mockConnectedIntegration, hasUnsupportedNDIntegration: false}),
}));
jest.mock('@pages/workspace/receiptPartners/useReceiptPartnersSettings', () => ({
    __esModule: true,
    default: () => ({
        policy: {isLoading: false},
        isUberConnected: mockIsUberConnected,
        shouldShowEnterCredentialsError: false,
        getReceiptPartnersIntegrationData: () => undefined,
        canWriteMoreFeatures: true,
        withReadOnlyFallback: () => undefined,
        toggleUberAutoInvite: jest.fn(),
        toggleUberAutoRemove: jest.fn(),
        getOverflowMenu: () => [],
    }),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the HOC that would inject `policy` is mocked out, so it is passed as a prop here
const ConnectionsAccountingPageUnderTest = ConnectionsAccountingPage as unknown as React.ComponentType<{policy: Policy}>;
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the panel only reads the policy ID from its route
const ConnectionsReceiptPartnersPageUnderTest = ConnectionsReceiptPartnersPage as unknown as React.ComponentType<{route: {params: {policyID: string}}}>;

const policy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), id: POLICY_ID};

function buildHRCard(isConnected: boolean): MergeProviderCardDescriptor {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the gate only reads isConnected
    return {connectionName: 'gusto', displayName: 'Gusto', category: CONST.POLICY.CONNECTIONS.CATEGORY.HR, isConnected} as MergeProviderCardDescriptor;
}

describe('Connections panel gates', () => {
    beforeEach(() => {
        mockIsUnifiedConnectionsBetaEnabled = true;
        mockConnectedIntegration = undefined;
        mockIsUberConnected = false;
    });

    describe('ConnectionsAccountingPage', () => {
        it('should block the panel for a user without the beta, even with an integration connected', () => {
            // Given a connected workspace viewed by a user without the unified Connections beta
            mockIsUnifiedConnectionsBetaEnabled = false;
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;

            // When the panel opens from a link
            render(<ConnectionsAccountingPageUnderTest policy={policy} />);

            // Then it shows Not Found, since this user still has the Accounting page
            expect(screen.getByText(NOT_FOUND)).toBeOnTheScreen();
        });

        it('should block the panel when no accounting integration is connected', () => {
            // Given a beta user on a workspace with nothing connected
            render(<ConnectionsAccountingPageUnderTest policy={policy} />);

            // Then the panel shows Not Found, since it only holds a connected integration's settings
            expect(screen.getByText(NOT_FOUND)).toBeOnTheScreen();
        });

        it('should open the panel for a beta user with an integration connected', () => {
            // Given a beta user on a workspace connected to QuickBooks Online
            mockConnectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;

            // When the panel opens
            render(<ConnectionsAccountingPageUnderTest policy={policy} />);

            // Then its settings render
            expect(screen.queryByText(NOT_FOUND)).not.toBeOnTheScreen();
        });
    });

    describe('ConnectionsMergePageBase', () => {
        it('should block the panel when no provider of the category is connected', () => {
            // Given a beta user on a workspace with no HR provider connected
            render(
                <ConnectionsMergePageBase
                    policyID={POLICY_ID}
                    category={CONST.POLICY.CONNECTIONS.CATEGORY.HR}
                    cards={[buildHRCard(false)]}
                />,
            );

            // Then the panel shows Not Found
            expect(screen.getByText(NOT_FOUND)).toBeOnTheScreen();
        });

        it('should open the panel once a provider is connected', () => {
            // Given a beta user on a workspace with Gusto connected
            render(
                <ConnectionsMergePageBase
                    policyID={POLICY_ID}
                    category={CONST.POLICY.CONNECTIONS.CATEGORY.HR}
                    cards={[buildHRCard(true)]}
                />,
            );

            // Then its settings render
            expect(screen.queryByText(NOT_FOUND)).not.toBeOnTheScreen();
        });
    });

    describe('ConnectionsReceiptPartnersPage', () => {
        it('should block the panel when Uber is not connected', () => {
            // Given a beta user on a workspace without Uber
            render(<ConnectionsReceiptPartnersPageUnderTest route={{params: {policyID: POLICY_ID}}} />);

            // Then the panel shows Not Found
            expect(screen.getByText(NOT_FOUND)).toBeOnTheScreen();
        });

        it('should block the panel for a user without the beta', () => {
            // Given Uber is connected but the user doesn't have the beta
            mockIsUnifiedConnectionsBetaEnabled = false;
            mockIsUberConnected = true;
            render(<ConnectionsReceiptPartnersPageUnderTest route={{params: {policyID: POLICY_ID}}} />);

            // Then the panel shows Not Found, since this user still has the Receipt partners page
            expect(screen.getByText(NOT_FOUND)).toBeOnTheScreen();
        });
    });
});

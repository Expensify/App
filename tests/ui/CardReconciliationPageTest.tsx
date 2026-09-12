import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import CardReconciliationPage from '@pages/workspace/accounting/reconciliation/CardReconciliationPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Test constants - these values MUST match the literals used in jest.mock() below
// because jest.mock() is hoisted before variable declarations are evaluated
const POLICY_ID = 'policy123';
const WORKSPACE_ACCOUNT_ID = 424242;
const PAYMENT_BANK_ACCOUNT_ID = 987654;
const RECONCILIATION_BANK_ACCOUNT_ID = 'bank-account-1';
const RECONCILIATION_BANK_ACCOUNT_NAME = 'Reconciliation checking';

jest.mock('@src/hooks/useResponsiveLayout');

// The default fund ID falls back to the workspace account ID when there is no last-selected feed.
jest.mock('@hooks/useWorkspaceAccountID', () => ({
    __esModule: true,
    default: () => 424242, // Must match WORKSPACE_ACCOUNT_ID
}));

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

// Bypass the policy access gate so the tests can focus on the reconciliation content itself.
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

// The page is exported wrapped in `withPolicyConnections`, which reads the policy from Onyx via the navigator.
// Passing it through lets the tests hand the policy in as a prop instead of standing up a navigator.
jest.mock('@pages/workspace/withPolicyConnections', () => ({
    __esModule: true,
    default: (WrappedComponent: React.ComponentType<never>) => WrappedComponent,
}));

// The page fetches accounting data on mount when continuous reconciliation has not loaded yet.
jest.mock('@libs/actions/PolicyConnections', () => ({
    openPolicyAccountingPage: jest.fn(),
}));

// The auto-sync explainer is rendered as HTML, which needs a render engine these tests have no reason to stand up.
jest.mock('@components/RenderHTML', () => {
    const Text = jest.requireActual<{default: React.ComponentType<{children: React.ReactNode}>}>('@components/Text').default;
    return {
        __esModule: true,
        default: ({html}: {html: string}) => <Text>{html}</Text>,
    };
});

const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${WORKSPACE_ACCOUNT_ID}` as const;
const continuousReconciliationKey = `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${WORKSPACE_ACCOUNT_ID}` as const;
const reconciliationBankAccountKey = `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_RECONCILIATION_BANK_ACCOUNT_ID}${WORKSPACE_ACCOUNT_ID}` as const;

const route: PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION>['route'] = {
    key: 'workspace-accounting-card-reconciliation',
    name: SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION,
    params: {policyID: POLICY_ID, connection: CONST.POLICY.CONNECTIONS.ROUTE.QBO},
};

// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION>['navigation'];

/**
 * The QuickBooks Online connection the page reads: auto-sync unlocks the toggle, and the bank accounts name the row.
 * A full QBOConnectionConfig and QBOConnectionData carry around forty fields covering sync, export and mapping
 * settings. The page reads only these three, so the fixture is asserted rather than filled out with meaningless values.
 */
const buildQuickBooksOnlineConnection = (isAutoSyncEnabled: boolean) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    ({
        quickbooksOnline: {
            config: {autoSync: {jobID: 'qbo-auto-sync-job', enabled: isAutoSyncEnabled}},
            data: {bankAccounts: [{id: RECONCILIATION_BANK_ACCOUNT_ID, name: RECONCILIATION_BANK_ACCOUNT_NAME, currency: CONST.CURRENCY.USD}]},
        },
    }) as Policy['connections'];

/** A policy with Expensify Cards on, built from the shared factory so every required field is present. */
function buildPolicy(isAutoSyncEnabled = true): Policy {
    return {
        ...createRandomPolicy(0),
        id: POLICY_ID,
        policyAccountID: WORKSPACE_ACCOUNT_ID,
        areExpensifyCardsEnabled: true,
        connections: buildQuickBooksOnlineConnection(isAutoSyncEnabled),
    };
}

// `withPolicyConnections` is mocked to a passthrough above, so what actually renders is the unwrapped page, which
// still takes the props the HOC would otherwise inject. The export's type reflects the real HOC and omits them, so
// it is re-typed here to match what the mock renders.
type CardReconciliationPageTestProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const UnwrappedCardReconciliationPage = CardReconciliationPage as unknown as React.ComponentType<CardReconciliationPageTestProps>;

const renderCardReconciliationPage = (policy: Policy) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <UnwrappedCardReconciliationPage
                policy={policy}
                policyDraft={undefined}
                isLoadingPolicy={false}
                isConnectionDataFetchNeeded={false}
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );

/** Seeds a card feed that `isExpensifyCardFullySetUp` accepts: it needs a payment bank account and more than one key. */
async function seedFullySetUpCardFeed() {
    await act(async () => {
        await Onyx.merge(cardSettingsKey, {
            paymentBankAccountID: PAYMENT_BANK_ACCOUNT_ID,
            monthlySettlementDate: 10,
        });
        await waitForBatchedUpdatesWithAct();
    });
}

describe('CardReconciliationPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('shows the continuous reconciliation toggle for a fully set up card feed', async () => {
        // Given a workspace whose Expensify Card feed has a settlement bank account and a day-of-month settlement day
        await seedFullySetUpCardFeed();

        // When the reconciliation page is rendered
        renderCardReconciliationPage(buildPolicy());
        await waitForBatchedUpdatesWithAct();

        // Then the continuous reconciliation row is shown
        expect(screen.getByText('Continuous Reconciliation')).toBeTruthy();
    });

    it('falls back to a placeholder feed when no card feed is fully set up', async () => {
        // Given a workspace with no Expensify Card feed at all, so the page falls back to the placeholder feed it
        // builds itself. That placeholder carries today's day of the month as the settlement day — the same
        // day-of-month shape a real feed uses, so it can never be handed to `new Date()` and read as milliseconds.
        renderCardReconciliationPage(buildPolicy());
        await waitForBatchedUpdatesWithAct();

        // Then the page still renders, and the placeholder's zero bank account means there is no account row
        expect(screen.getByText('Continuous Reconciliation')).toBeTruthy();
        expect(screen.queryByText('Reconciliation account')).toBeNull();
    });

    it('shows the reconciliation account once continuous reconciliation is on', async () => {
        // Given a fully set up feed with continuous reconciliation enabled and an account chosen
        await seedFullySetUpCardFeed();
        await act(async () => {
            await Onyx.merge(continuousReconciliationKey, true);
            await Onyx.merge(reconciliationBankAccountKey, RECONCILIATION_BANK_ACCOUNT_ID);
            await waitForBatchedUpdatesWithAct();
        });

        // When the page is rendered
        renderCardReconciliationPage(buildPolicy());
        await waitForBatchedUpdatesWithAct();

        // Then the chosen account is shown by name
        expect(screen.getByText('Reconciliation account')).toBeTruthy();
        expect(screen.getByText(RECONCILIATION_BANK_ACCOUNT_NAME)).toBeTruthy();
    });

    it('hides the reconciliation account while continuous reconciliation is off', async () => {
        // Given a fully set up feed with continuous reconciliation explicitly disabled
        await seedFullySetUpCardFeed();
        await act(async () => {
            await Onyx.merge(continuousReconciliationKey, false);
            await waitForBatchedUpdatesWithAct();
        });

        renderCardReconciliationPage(buildPolicy());
        await waitForBatchedUpdatesWithAct();

        // Then there is no account row to press
        expect(screen.queryByText('Reconciliation account')).toBeNull();
    });

    it('explains how to enable continuous reconciliation when auto-sync is off', async () => {
        // Given a workspace whose accounting connection does not auto-sync
        await seedFullySetUpCardFeed();

        renderCardReconciliationPage(buildPolicy(false));
        await waitForBatchedUpdatesWithAct();

        // Then the toggle is still listed, alongside the explanation of what has to be turned on first
        expect(screen.getByText('Continuous Reconciliation')).toBeTruthy();
        expect(screen.getByText(/auto-sync/)).toBeTruthy();
    });
});

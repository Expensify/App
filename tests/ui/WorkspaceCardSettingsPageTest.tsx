import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceCardSettingsPage from '@pages/workspace/expensifyCard/WorkspaceCardSettingsPage';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Test constants - these values MUST match the literals used in jest.mock() below
// because jest.mock() is hoisted before variable declarations are evaluated
const POLICY_ID = 'policy123';
const WORKSPACE_ACCOUNT_ID = 424242;

// jest.mock() factories are hoisted and run before imports/variables are defined, so they cannot
// reference the constants above. Keep the literals in both places in sync.
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_ExpensifyCard_Settings',
            params: {policyID: 'policy123'}, // Must match POLICY_ID
        }),
        usePreventRemove: jest.fn(),
    };
});

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

// Bypass the policy access gate so the test can focus on the settlement-frequency row.
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${WORKSPACE_ACCOUNT_ID}` as const;

const route: PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS>['route'] = {
    key: 'workspace-expensify-card-settings',
    name: SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS,
    params: {policyID: POLICY_ID},
};
// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS>['navigation'];

const renderWorkspaceCardSettingsPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceCardSettingsPage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );

describe('WorkspaceCardSettingsPage', () => {
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

    describe('Settlement frequency row', () => {
        it('shows the monthly settlement date hint when the card settles monthly', async () => {
            // Given a card whose settlement frequency is Monthly with a known settlement date
            await act(async () => {
                await Onyx.merge(cardSettingsKey, {
                    isMonthlySettlementAllowed: true,
                    monthlySettlementDate: new Date('2024-01-27'),
                });
                await waitForBatchedUpdatesWithAct();
            });

            // When the card settings page is rendered
            renderWorkspaceCardSettingsPage();
            await waitForBatchedUpdatesWithAct();

            // Then the settlement frequency row shows "Monthly" with the settlement-date hint below it
            expect(screen.getByText('Settlement frequency')).toBeTruthy();
            expect(screen.getByText('Monthly')).toBeTruthy();
            expect(screen.getByText('Expensify cards will settle on the 27th of each month.')).toBeTruthy();
        });

        it('does not show the monthly settlement date hint when the card settles daily', async () => {
            // Given a card that settles daily (no monthlySettlementDate) and can switch to monthly
            await act(async () => {
                await Onyx.merge(cardSettingsKey, {
                    isMonthlySettlementAllowed: true,
                });
                await waitForBatchedUpdatesWithAct();
            });

            // When the card settings page is rendered
            renderWorkspaceCardSettingsPage();
            await waitForBatchedUpdatesWithAct();

            // Then the row shows "Daily" and no settlement-date hint is rendered
            expect(screen.getByText('Settlement frequency')).toBeTruthy();
            expect(screen.getByText('Daily')).toBeTruthy();
            expect(screen.queryByText(/Expensify cards will settle on the .* of each month\./)).toBeNull();
        });
    });
});

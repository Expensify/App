import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceSettleBalanceConfirmationPage from '@pages/workspace/expensifyCard/WorkspaceSettleBalanceConfirmationPage';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import Navigation from '@src/libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// These values MUST match the literals used in jest.mock() below, because jest.mock() is hoisted before variable declarations are evaluated
const POLICY_ID = 'policy123';
const WORKSPACE_ACCOUNT_ID = 424242;

// Whether the page is the focused screen. Closing the pane takes the focus off it while it stays mounted for the closing animation.
let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => mockIsFocused,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_ExpensifyCard_Settle_Balance_Confirmation',
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
        goBack: jest.fn(),
        navigate: jest.fn(),
        dismissModal: jest.fn(() => {
            mockIsFocused = false;
        }),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${WORKSPACE_ACCOUNT_ID}` as const;
const manualBillingKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${WORKSPACE_ACCOUNT_ID}` as const;
const programKey = CONST.COUNTRY.US;

const route: PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTLE_BALANCE_CONFIRMATION>['route'] = {
    key: 'workspace-expensify-card-settle-balance-confirmation',
    name: SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTLE_BALANCE_CONFIRMATION,
    params: {policyID: POLICY_ID},
};
// The screen does not read navigation. This inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTLE_BALANCE_CONFIRMATION>['navigation'];

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <WorkspaceSettleBalanceConfirmationPage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );

OnyxUpdateManager();
describe('WorkspaceSettleBalanceConfirmationPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(async () => {
        mockIsFocused = true;
        mockFetch.succeed();
        await act(async () => {
            await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        });
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {[programKey]: {monthlySettlementDate: 10, currentBalance: 1700, currency: 'USD'}});
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('explains the rounding of a partial settlement and queues the rounded amount', async () => {
        // Given the backend rounded the $3.50 the admin entered up to $4.00, and the amount page kept that entry as a draft
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.SETTLE_EXPENSIFY_CARD_BALANCE_DRAFT_FORM, {settlementType: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL, amount: '3.50'});
            await Onyx.set(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW, {
                settlementType: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL,
                requestedAmount: 350,
                roundedAmount: 400,
                maximumAmount: 1700,
                transactionCount: 2,
                isAboveMaximum: false,
                isEverythingEligible: false,
            });
            await waitForBatchedUpdatesWithAct();
        });

        // When the confirmation page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it shows the amount that will really be billed and why it differs from what was entered
        expect(screen.getByText('$4.00')).toBeTruthy();
        expect(screen.getByText('We rounded $3.50 up to $4.00 so the settlement matches whole transactions.')).toBeTruthy();

        // When the settlement is confirmed
        fireEvent.press(screen.getByRole('button', {name: 'Settle balance'}));
        await waitForBatchedUpdatesWithAct();

        // Then the rounded amount is queued, the preview and the draft are gone and the pane closes
        await expect(getOnyxValue(manualBillingKey)).resolves.toEqual({type: 'partial', amount: 400, requestedAmount: 350, feedCountry: programKey});
        await expect(getOnyxValue(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW)).resolves.toBeFalsy();
        await expect(getOnyxValue(ONYXKEYS.FORMS.SETTLE_EXPENSIFY_CARD_BALANCE_DRAFT_FORM)).resolves.toBeFalsy();
        expect(Navigation.dismissModal).toHaveBeenCalled();

        // Then the cleared preview does not send the closing pane back to the amount page, which would reopen it on the
        // not-found view the amount page shows once a settlement is queued
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('shows the full settlement copy without an amount', async () => {
        // Given the admin chose to settle the full balance
        await act(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW, {settlementType: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.FULL});
            await waitForBatchedUpdatesWithAct();
        });

        // When the confirmation page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then no amount is promised, because the full balance is whatever is outstanding when billing runs
        expect(screen.getByText('This will settle your current balance on the next business day. Once successful, the amount will be added back to your remaining limit.')).toBeTruthy();
        expect(screen.queryByText('$17.00')).toBeNull();
    });

    it('still queues a full settlement offline, since nothing about it depends on the backend', async () => {
        // Given an admin who is offline and chose to settle the full balance
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            await Onyx.set(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW, {settlementType: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.FULL});
            await waitForBatchedUpdatesWithAct();
        });

        // When the confirmation page opens and the settlement is confirmed
        renderPage();
        await waitForBatchedUpdatesWithAct();
        const settleButton = screen.getByRole('button', {name: 'Settle balance'});
        expect(settleButton).toBeEnabled();
        fireEvent.press(settleButton);
        await waitForBatchedUpdatesWithAct();

        // Then the full settlement is queued optimistically, like any other write made offline
        await expect(getOnyxValue(manualBillingKey)).resolves.toBe('true');
        expect(Navigation.dismissModal).toHaveBeenCalled();
    });

    it('does not let a partial settlement be confirmed offline, since its rounded amount came from a preview that may be stale', async () => {
        // Given an admin who is offline with a partial settlement previewed earlier
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            await Onyx.set(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW, {
                settlementType: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL,
                requestedAmount: 350,
                roundedAmount: 400,
                maximumAmount: 1700,
                transactionCount: 2,
                isAboveMaximum: false,
                isEverythingEligible: false,
            });
            await waitForBatchedUpdatesWithAct();
        });

        // When the confirmation page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the amount is shown but cannot be confirmed until the connection is back
        expect(screen.getByText('$4.00')).toBeTruthy();
        expect(screen.getByRole('button', {name: 'Settle balance'})).toBeDisabled();
    });

    it('goes back to the amount page when there is nothing to confirm', async () => {
        // Given no preview, which is what a refresh or a deep link lands on since the preview only lives in memory
        // When the confirmation page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it sends the admin back to make the choice again
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTLE_BALANCE.getRoute(POLICY_ID));
    });
});

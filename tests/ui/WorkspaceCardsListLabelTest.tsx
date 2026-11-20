import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import WorkspaceCardsListLabel from '@pages/workspace/expensifyCard/WorkspaceCardsListLabel';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const WORKSPACE_ACCOUNT_ID = 424242;

// jest.mock() factories are hoisted above the constants, so they repeat the literals
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_ExpensifyCard',
            params: {policyID: 'policy123'},
        }),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

// The default fund ID falls back to the workspace account ID when there is no last selected feed
jest.mock('@hooks/useWorkspaceAccountID', () => ({
    __esModule: true,
    default: () => 424242,
}));

const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${WORKSPACE_ACCOUNT_ID}` as const;

describe('WorkspaceCardsListLabel', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('shows a failed settlement error even when the card program has its own errors, and lets the admin dismiss it', async () => {
        // Given a failed settlement, stored with the card settings, next to an error the program keeps for its settlement account
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {
                errorFields: {settleBalance: {failedSettlement: 'We couldn’t queue the settlement. Please try again.'}},
                [CONST.COUNTRY.GB]: {monthlySettlementDate: 5, errorFields: {paymentBankAccountID: {settlementAccount: 'Settlement account error'}}},
            });
            await waitForBatchedUpdatesWithAct();
        });

        // When the admin opens the Expensify Card page
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                    value={100000}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the settlement error shows, since the program's errors must not replace it
        expect(screen.getByText('We couldn’t queue the settlement. Please try again.')).toBeTruthy();

        // When the admin dismisses it
        fireEvent.press(screen.getByLabelText('Dismiss'));
        await waitForBatchedUpdatesWithAct();

        // Then it is gone, and it stays gone after a reload because the stored error is cleared too
        expect(screen.queryByText('We couldn’t queue the settlement. Please try again.')).toBeNull();
        const cardSettings = await getOnyxValue(cardSettingsKey);
        expect(cardSettings?.errorFields?.settleBalance).toBeUndefined();
    });

    it('hides Request limit increase from an admin who is not shared on the Plaid settlement account', async () => {
        // Given a Plaid settlement account that is not in the admin's bank account list
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {US: {paymentBankAccountID: 1234, isPaymentBankAccountConnectedWithPlaid: true}});
            await waitForBatchedUpdatesWithAct();
        });

        // When the admin opens the remaining limit info
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                    value={100000}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('Remaining limit'));
        await waitForBatchedUpdatesWithAct();

        // Then there is no Request limit increase button
        expect(screen.getByText(/available cash in your business bank account/)).toBeTruthy();
        expect(screen.queryByText('Request limit increase')).toBeNull();
    });

    it('shows Request limit increase when the settlement account is not connected with Plaid', async () => {
        // Given a settlement account that is not connected with Plaid
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {US: {paymentBankAccountID: 1234, isPaymentBankAccountConnectedWithPlaid: false}});
            await waitForBatchedUpdatesWithAct();
        });

        // When the admin opens the remaining limit info
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                    value={100000}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('Remaining limit'));
        await waitForBatchedUpdatesWithAct();

        // Then the Request limit increase button is there
        expect(screen.getByText('Request limit increase')).toBeTruthy();
    });
});

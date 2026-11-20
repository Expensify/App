import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import WorkspaceCardsListLabel from '@pages/workspace/expensifyCard/WorkspaceCardsListLabel';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

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

const mockOpenReport = jest.fn();
jest.mock('@userActions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns any
    const actual = jest.requireActual('@userActions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spreads the actual module, which is typed any
    return {
        ...actual,
        openReport: (...args: unknown[]): void => {
            mockOpenReport(...args);
        },
        navigateToConciergeChat: () => Promise.resolve(),
    };
});

const mockRequestExpensifyCardLimitIncrease = jest.fn();
jest.mock('@userActions/Policy/Policy', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns any
    const actual = jest.requireActual('@userActions/Policy/Policy');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spreads the actual module, which is typed any
    return {
        ...actual,
        requestExpensifyCardLimitIncrease: (...args: unknown[]): void => {
            mockRequestExpensifyCardLimitIncrease(...args);
        },
    };
});

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

    it('sends the existing Concierge chat to OpenReport before requesting the limit increase while onboarding is pending', async () => {
        // Given pending guided setup, an existing Concierge chat and a settlement account not connected with Plaid
        const conciergeChat = {reportID: '999'};
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {US: {paymentBankAccountID: 1234, isPaymentBankAccountConnectedWithPlaid: false}});
            await Onyx.multiSet({
                [ONYXKEYS.NVP_INTRO_SELECTED]: {choice: CONST.ONBOARDING_CHOICES.ADMIN},
                [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: false},
                [ONYXKEYS.CONCIERGE_REPORT_ID]: '999',
                [ONYXKEYS.IS_LOADING_APP]: false,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}999`, conciergeChat);
            await waitForBatchedUpdatesWithAct();
        });

        // When the admin requests a limit increase from the remaining limit info
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
        fireEvent.press(screen.getByText('Request limit increase'));
        await waitForBatchedUpdatesWithAct();

        // Then OpenReport gets the stored Concierge chat and is enqueued before the limit increase, so Concierge replies last
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: '999', conciergeChat: expect.objectContaining({reportID: '999'})}));
        expect(mockOpenReport.mock.invocationCallOrder.at(0)).toBeLessThan(mockRequestExpensifyCardLimitIncrease.mock.invocationCallOrder.at(0) ?? 0);
    });
});

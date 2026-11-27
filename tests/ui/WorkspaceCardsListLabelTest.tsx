import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {WRITE_COMMANDS} from '@libs/API/types';

import WorkspaceCardsListLabel from '@pages/workspace/expensifyCard/WorkspaceCardsListLabel';

import type * as PolicyActions from '@userActions/Policy/Policy';
import type * as ReportActions from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as ConfirmModalMock from '../utils/mockUseConfirmModal';

import {resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import * as TestHelper from '../utils/TestHelper';
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
const mockNavigateToConciergeChat = jest.fn<Promise<void>, unknown[]>(() => Promise.resolve());
jest.mock('@userActions/Report', () => {
    return {
        ...jest.requireActual<typeof ReportActions>('@userActions/Report'),
        openReport: (...args: unknown[]): void => {
            mockOpenReport(...args);
        },
        navigateToConciergeChat: (...args: unknown[]) => mockNavigateToConciergeChat(...args),
    };
});

const mockRequestExpensifyCardLimitIncrease = jest.fn();
jest.mock('@userActions/Policy/Policy', () => {
    return {
        ...jest.requireActual<typeof PolicyActions>('@userActions/Policy/Policy'),
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

jest.mock('@hooks/useConfirmModal', () => jest.requireActual<typeof ConfirmModalMock>('../utils/mockUseConfirmModal').default);

TestHelper.setupGlobalFetchMock();

const conciergeChatKey = `${ONYXKEYS.COLLECTION.REPORT}999` as const;
const SIGNED_IN_ACCOUNT_ID = 7;
const INTRO_SELECTED = {choice: CONST.ONBOARDING_CHOICES.ADMIN};

const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${WORKSPACE_ACCOUNT_ID}` as const;

describe('WorkspaceCardsListLabel', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        resetMockConfirmModal();
        mockOpenReport.mockClear();
        mockNavigateToConciergeChat.mockClear();
        mockRequestExpensifyCardLimitIncrease.mockClear();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('settles the balance of the card program the workspace is on', async () => {
        // Given a UK/EU workspace on monthly settlement, whose card settings live under the GB program
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {[CONST.COUNTRY.GB]: {monthlySettlementDate: 5}});
            await waitForBatchedUpdatesWithAct();
        });

        // When the admin presses Settle balance and confirms
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                    value={100000}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Settle balance'));
        await act(async () => {
            resolveShowConfirmModal();
            await waitForBatchedUpdatesWithAct();
        });

        // Then the request names the GB program instead of US
        TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_FOR_BILLING, 0, {feedCountry: CONST.COUNTRY.GB, domainAccountID: WORKSPACE_ACCOUNT_ID});
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

    const requestLimitIncreaseWithPendingOnboarding = async (onyxData: OnyxMultiSetInput) => {
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {US: {paymentBankAccountID: 1234, isPaymentBankAccountConnectedWithPlaid: false}});
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: SIGNED_IN_ACCOUNT_ID},
                [ONYXKEYS.NVP_INTRO_SELECTED]: INTRO_SELECTED,
                [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: false, selfTourViewed: true},
                ...onyxData,
            });
            await waitForBatchedUpdatesWithAct();
        });
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
    };

    it('sends the existing Concierge chat to OpenReport before requesting the limit increase', async () => {
        // Given pending onboarding and an existing Concierge chat
        // When the admin requests a limit increase
        await requestLimitIncreaseWithPendingOnboarding({
            [ONYXKEYS.CONCIERGE_REPORT_ID]: '999',
            [conciergeChatKey]: {reportID: '999'},
        });

        // Then OpenReport gets the stored chat and onboarding data and is enqueued first, so Concierge replies last
        expect(mockOpenReport).toHaveBeenCalledWith(
            expect.objectContaining({
                reportID: '999',
                conciergeChat: expect.objectContaining({reportID: '999'}),
                introSelected: INTRO_SELECTED,
                currentUserAccountID: SIGNED_IN_ACCOUNT_ID,
                isSelfTourViewed: true,
                hasCompletedGuidedSetupFlow: false,
            }),
        );
        expect(mockOpenReport.mock.invocationCallOrder.at(0)).toBeLessThan(mockRequestExpensifyCardLimitIncrease.mock.invocationCallOrder.at(0) ?? 0);
    });

    it('creates the Concierge chat instead of calling OpenReport when none exists yet', async () => {
        // Given pending onboarding, no Concierge chat, and a chat creation that has not finished yet
        let finishCreatingChat = () => {};
        mockNavigateToConciergeChat.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    finishCreatingChat = resolve;
                }),
        );

        // When the admin requests a limit increase
        await requestLimitIncreaseWithPendingOnboarding({});

        // Then the chat is created with the onboarding data, and the limit increase waits for it
        expect(mockNavigateToConciergeChat).toHaveBeenCalledWith(
            expect.objectContaining({
                introSelected: INTRO_SELECTED,
                currentUserAccountID: SIGNED_IN_ACCOUNT_ID,
                isSelfTourViewed: true,
                hasCompletedGuidedSetupFlow: false,
            }),
        );
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(mockRequestExpensifyCardLimitIncrease).not.toHaveBeenCalled();

        await act(async () => {
            finishCreatingChat();
            await waitForBatchedUpdatesWithAct();
        });
        expect(mockRequestExpensifyCardLimitIncrease).toHaveBeenCalledTimes(1);
    });

    it('skips OpenReport but still requests the limit increase while the app is loading', async () => {
        // Given pending onboarding, an existing Concierge chat and an app that is still loading
        // When the admin requests a limit increase
        await requestLimitIncreaseWithPendingOnboarding({
            [ONYXKEYS.CONCIERGE_REPORT_ID]: '999',
            [conciergeChatKey]: {reportID: '999'},
            [ONYXKEYS.IS_LOADING_APP]: true,
        });

        // Then OpenReport is left to ReportFetchHandler, and the limit increase is still requested
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(mockRequestExpensifyCardLimitIncrease).toHaveBeenCalledTimes(1);
    });
});

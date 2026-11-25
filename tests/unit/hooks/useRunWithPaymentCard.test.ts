import {act, renderHook} from '@testing-library/react-native';

import useRunWithPaymentCardOnMobile from '@hooks/useRunWithPaymentCard';

import Navigation from '@libs/Navigation/Navigation';
import type TransitionTracker from '@libs/Navigation/TransitionTracker';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type * as ReactNavigationNative from '@react-navigation/native';
import type React from 'react';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const BILLING_FUND_ID = 1234;
const ACTIVE_ROUTE = 'settings/domain/1/admins/settings';

// Mirrors `useFocusEffect`: runs the effect while the screen is focused, and again whenever the effect changes.
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    return {
        ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
        useIsFocused: () => mockIsFocused,
        useFocusEffect: (effect: () => void | (() => void)) => {
            const isFocused = mockIsFocused;
            useEffect(() => (isFocused ? effect() : undefined), [effect, isFocused]);
        },
    };
});

// Run the post-transition work right away, since no screen actually animates in a unit test.
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: ({callback}: Parameters<typeof TransitionTracker.runAfterTransitions>[0]): ReturnType<typeof TransitionTracker.runAfterTransitions> => {
        callback();
        return {cancel: () => {}};
    },
}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn((suffix: string) => `${ACTIVE_ROUTE}/${suffix}`));

// Jest resolves the native variant by default, so the web hook is loaded from its own file.
const useRunWithPaymentCard = jest.requireActual<{default: typeof useRunWithPaymentCardOnMobile}>('@hooks/useRunWithPaymentCard/index.ts').default;

async function setBillingFundID(billingFundID: number) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_BILLING_FUND_ID, billingFundID);
    });
}

async function setCardSetupComplete(setupComplete: boolean) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM, {setupComplete});
    });
}

async function renderAndRunAction(action: () => void, useHook = useRunWithPaymentCard) {
    const hook = renderHook(() => useHook());
    await waitForBatchedUpdatesWithAct();
    act(() => hook.result.current(action));
    return hook;
}

function setIsFocused(isFocused: boolean, rerender: (props: object) => void) {
    mockIsFocused = isFocused;
    rerender({});
}

describe('useRunWithPaymentCard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsFocused = true;
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('runs the action right away when the user has a payment card', async () => {
        // Given a user with a payment card
        await setBillingFundID(BILLING_FUND_ID);
        const action = jest.fn();

        // When the action runs
        await renderAndRunAction(action);

        // Then it runs without opening the add payment card flow
        expect(action).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('opens the add payment card flow and runs the action when the user comes back with a card', async () => {
        // Given a user without a payment card
        const action = jest.fn();

        // When the action runs
        const {rerender} = await renderAndRunAction(action);

        // Then the add payment card flow opens and the action waits for it
        expect(Navigation.navigate).toHaveBeenCalledWith(`${ACTIVE_ROUTE}/${DYNAMIC_ROUTES.ADD_PAYMENT_CARD.path}`);
        expect(action).not.toHaveBeenCalled();

        // When the user adds a card in that flow, which resets its form as it closes
        setIsFocused(false, rerender);
        await setBillingFundID(BILLING_FUND_ID);
        await setCardSetupComplete(true);
        await setCardSetupComplete(false);

        // Then the action still waits until the user is back on the screen
        expect(action).not.toHaveBeenCalled();

        // When the user comes back
        setIsFocused(true, rerender);

        // Then the action runs once
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('drops the action when the user comes back without a card', async () => {
        // Given a user without a payment card who starts the action
        const action = jest.fn();
        const {rerender} = await renderAndRunAction(action);

        // When the user leaves the add payment card flow without adding a card
        setIsFocused(false, rerender);
        setIsFocused(true, rerender);

        // Then the action does not run, even if a card is added later
        expect(action).not.toHaveBeenCalled();
        await setBillingFundID(BILLING_FUND_ID);
        expect(action).not.toHaveBeenCalled();
    });

    it('drops the action when the user backs out of verifying their card', async () => {
        // Given a user without a payment card who starts the action
        const action = jest.fn();
        const {rerender} = await renderAndRunAction(action);

        // When the card is saved but the user leaves before verifying it
        setIsFocused(false, rerender);
        await setBillingFundID(BILLING_FUND_ID);
        setIsFocused(true, rerender);

        // Then the action does not run
        expect(action).not.toHaveBeenCalled();
    });

    it('runs the action right away on iOS and Android, where the add payment card flow is not available', async () => {
        // Given a user without a payment card on a mobile app
        const action = jest.fn();

        // When the action runs
        await renderAndRunAction(action, useRunWithPaymentCardOnMobile);

        // Then it runs without opening the add payment card flow
        expect(action).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});

import {act, renderHook} from '@testing-library/react-native';

import useRunWithPaymentCard from '@hooks/useRunWithPaymentCard';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type * as ReactNavigationNative from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const BILLING_FUND_ID = 1234;
const ACTIVE_ROUTE = 'settings/domain/1/admins/settings';

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn((suffix: string) => `${ACTIVE_ROUTE}/${suffix}`));

async function setBillingFundID(billingFundID: number) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_BILLING_FUND_ID, billingFundID);
    });
}

async function renderAndRunAction(action: () => void) {
    const hook = renderHook(() => useRunWithPaymentCard());
    await waitForBatchedUpdatesWithAct();
    act(() => hook.result.current(action));
    return hook;
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

        // When the user adds a card in that flow
        mockIsFocused = false;
        rerender({});
        await setBillingFundID(BILLING_FUND_ID);

        // Then the action still waits until the user is back on the screen
        expect(action).not.toHaveBeenCalled();

        // When the user comes back
        mockIsFocused = true;
        rerender({});

        // Then the action runs once
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('drops the action when the user comes back without a card', async () => {
        // Given a user without a payment card who starts the action
        const action = jest.fn();
        const {rerender} = await renderAndRunAction(action);

        // When the user leaves the add payment card flow without adding a card
        mockIsFocused = false;
        rerender({});
        mockIsFocused = true;
        rerender({});

        // Then the action does not run, even if a card is added later
        expect(action).not.toHaveBeenCalled();
        await setBillingFundID(BILLING_FUND_ID);
        expect(action).not.toHaveBeenCalled();
    });
});

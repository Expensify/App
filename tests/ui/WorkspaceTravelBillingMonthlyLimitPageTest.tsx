import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalActions, ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {updateTravelBillingMonthlyLimit} from '@libs/actions/TravelBilling';
import type * as TravelBillingActions from '@libs/actions/TravelBilling';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceTravelBillingMonthlyLimitPage from '@pages/workspace/travel/WorkspaceTravelBillingMonthlyLimitPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'testPolicy123';
const FUND_ID = 999888; // Must match the literal returned by the useDefaultFundID mock below.
const CURRENT_LIMIT_CENTS = 10000; // $100.00 current monthly limit.
const REDUCED_LIMIT_CENTS = 5000; // $50.00, a lower value that triggers the "Reduce limit" confirmation.

// jest.mock() factories are hoisted, so they can only reference literal values (not the constants above).
jest.mock('@hooks/useDefaultFundID', () => ({
    __esModule: true,
    default: () => 999888, // Must match FUND_ID.
}));

jest.mock('@libs/actions/TravelBilling', () => {
    const actual = jest.requireActual<typeof TravelBillingActions>('@libs/actions/TravelBilling');
    return {
        ...actual,
        updateTravelBillingMonthlyLimit: jest.fn(),
    };
});

const mockShowConfirmModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () =>
    jest.fn().mockImplementation(() => ({
        showConfirmModal: mockShowConfirmModal,
        closeModal: jest.fn(),
    })),
);

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const getAmountLabel = () => TestHelper.translateLocal('iou.amount');
const getSaveLabel = () => TestHelper.translateLocal('common.save');

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.TRAVEL_SETTINGS_MONTHLY_LIMIT}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.TRAVEL_SETTINGS_MONTHLY_LIMIT}
                                component={WorkspaceTravelBillingMonthlyLimitPage}
                                initialParams={{policyID: POLICY_ID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

/** Waits for the form to be interactive (Save button rendered), then returns the enabled Save button. */
const waitForSaveButton = async () => {
    await waitForBatchedUpdatesWithAct();
    await waitFor(() => {
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()})).toBeOnTheScreen();
    });
    return screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()});
};

/** Enter a lower monthly limit and press Save, which opens the (mocked) "Reduce limit" confirmation. */
const reduceLimitAndSave = async () => {
    const input = screen.getByLabelText(getAmountLabel());
    fireEvent.changeText(input, '50'); // $50.00, below the $100.00 current limit.
    await waitForBatchedUpdatesWithAct();

    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()}));
    await waitForBatchedUpdatesWithAct();
};

describe('WorkspaceTravelBillingMonthlyLimitPage', () => {
    let goBackSpy: jest.SpyInstance;
    let microtaskQueueSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        // A real navigation stack is used so the goBack reference passed to the microtask queue is the spied one.
        goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        microtaskQueueSpy = jest.spyOn(Navigation, 'setNavigationActionToMicrotaskQueue').mockImplementation((callback) => callback?.());

        // Seed a current monthly spend limit of $100.00 so reducing to $50.00 triggers the confirmation.
        await act(async () => {
            await Onyx.merge(getTravelBillingCardSettingsKey(FUND_ID), {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {monthlySpendLimitPerUser: CURRENT_LIMIT_CENTS},
            });
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('leaves the Save button enabled and does not update the limit when the reduce-limit confirmation is cancelled', async () => {
        // Given the confirmation resolves as cancelled (any action other than CONFIRM)
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});

        renderPage();
        await waitForSaveButton();

        // When the user reduces the limit, presses Save, and cancels the confirmation
        await reduceLimitAndSave();

        // Then the limit is not updated and the page does not navigate away
        expect(updateTravelBillingMonthlyLimit).not.toHaveBeenCalled();
        expect(microtaskQueueSpy).not.toHaveBeenCalled();
        expect(goBackSpy).not.toHaveBeenCalled();

        // And the Save button remains on screen and enabled (no stuck loading spinner)
        const saveButton = screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()});
        expect(saveButton).toBeOnTheScreen();
        expect(saveButton).toBeEnabled();
    });

    it('updates the limit and navigates back when the reduce-limit confirmation is confirmed', async () => {
        // Given the confirmation resolves as confirmed
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});

        renderPage();
        await waitForSaveButton();

        // When the user reduces the limit, presses Save, and confirms the reduction
        await reduceLimitAndSave();

        // Then the limit is updated with the reduced value (passing the previous limit) and the page navigates back
        expect(updateTravelBillingMonthlyLimit).toHaveBeenCalledWith(FUND_ID, REDUCED_LIMIT_CENTS, CURRENT_LIMIT_CENTS);
        expect(microtaskQueueSpy).toHaveBeenCalledWith(goBackSpy);
    });
});

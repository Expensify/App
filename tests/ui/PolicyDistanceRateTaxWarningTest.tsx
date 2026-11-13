/** Covers the warning's page-to-action wiring using the real error row and close button. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import PolicyDistanceRateDetailsPage from '@pages/workspace/distanceRates/PolicyDistanceRateDetailsPage';
import PolicyDistanceRatesSettingsPage from '@pages/workspace/distanceRates/PolicyDistanceRatesSettingsPage';

import * as PolicyActions from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createUKFuelRateTaxPolicy from '../utils/createUKFuelRateTaxPolicy';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();
const POLICY_ID = 'fuel-warning-workspace';

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.restoreAllMocks();
});

describe.each([SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS, SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS])('%s fuel VAT warning', (page) => {
    it('renders the warning and dismisses it through the workspace action', async () => {
        // Given an admin workspace with tax tracking and an enabled fuel band without a VAT mapping
        await TestHelper.signInWithTestUser();
        const policy = {...LHNTestUtils.getFakePolicy(POLICY_ID), ...createUKFuelRateTaxPolicy(), id: POLICY_ID};
        const unit = policy.customUnits?.distance;
        if (!unit) {
            throw new Error('Expected the distance custom unit');
        }
        unit.enabled = true;
        unit.rates.fuel = {...unit.rates.fuel, name: 'Petrol', rate: 55, currency: CONST.CURRENCY.GBP};
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        });
        const dismiss = jest.spyOn(PolicyActions, 'dismissUKFuelRateTaxError').mockImplementation(() => {});

        // When the actual page renders its fuel warning and the admin presses the error row's X
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
                <PortalProvider>
                    <ModalProvider>
                        <NavigationContainer>
                            <Stack.Navigator initialRouteName={page}>
                                <Stack.Screen
                                    name={SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS}
                                    component={PolicyDistanceRateDetailsPage}
                                    initialParams={{policyID: POLICY_ID, rateID: 'fuel'}}
                                />
                                <Stack.Screen
                                    name={SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS}
                                    component={PolicyDistanceRatesSettingsPage}
                                    initialParams={{policyID: POLICY_ID}}
                                />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </ModalProvider>
                </PortalProvider>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(await screen.findByText(TestHelper.translateLocal('workspace.distanceRates.ukFuelRateTaxError'))).toBeOnTheScreen();
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.dismiss')}));

        // Then both pages wire the close button to the same workspace-wide dismissal action
        expect(dismiss).toHaveBeenCalledTimes(1);
        expect(dismiss).toHaveBeenCalledWith(POLICY_ID, unit);
    });
});

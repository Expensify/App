/** Covers the values the Distance rates settings page reads when its switches are pressed. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import PolicyDistanceRatesSettingsPage from '@pages/workspace/distanceRates/PolicyDistanceRatesSettingsPage';

import * as PolicyActions from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type GovernmentMileageRate from '@src/types/onyx/GovernmentMileageRate';

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
const POLICY_ID = 'track-tax-workspace';

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.restoreAllMocks();
});

describe('PolicyDistanceRatesSettingsPage', () => {
    it('passes the stored government mileage rates to the track tax action', async () => {
        // Given an admin workspace with tax tracking on and stored government mileage rates
        await TestHelper.signInWithTestUser();
        const policy = {...LHNTestUtils.getFakePolicy(POLICY_ID), ...createUKFuelRateTaxPolicy(), id: POLICY_ID};
        const governmentMileageRates: GovernmentMileageRate[] = [
            {sourceRateID: 'GB_2026-01-01', currency: CONST.CURRENCY.GBP, name: '2026 United Kingdom', rate: 45, startDate: '2026-01-01'},
        ];
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.set(ONYXKEYS.GOVERNMENT_MILEAGE_RATES, governmentMileageRates);
        });
        const enableDistanceRequestTax = jest.spyOn(PolicyActions, 'enableDistanceRequestTax').mockImplementation(() => {});
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
                <PortalProvider>
                    <ModalProvider>
                        <NavigationContainer>
                            <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS}>
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

        // When the admin turns the track tax switch off
        fireEvent.press(await screen.findByRole('switch', {name: TestHelper.translateLocal('workspace.distanceRates.trackTax')}));
        await waitForBatchedUpdatesWithAct();

        // Then the action gets the stored government mileage rates read at press time, along with the new tax setting
        expect(enableDistanceRequestTax).toHaveBeenCalledTimes(1);
        expect(enableDistanceRequestTax).toHaveBeenCalledWith(
            expect.objectContaining({id: POLICY_ID}),
            CONST.CUSTOM_UNITS.NAME_DISTANCE,
            'distance',
            expect.objectContaining({taxEnabled: false}),
            expect.objectContaining({taxEnabled: true}),
            governmentMileageRates,
        );
    });
});

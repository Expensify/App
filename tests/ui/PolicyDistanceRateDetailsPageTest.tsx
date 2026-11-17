import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import PolicyDistanceRateDetailsPage from '@pages/workspace/distanceRates/PolicyDistanceRateDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {Rate} from '@src/types/onyx/Policy';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const POLICY_ID = 'policy-1';
const CUSTOM_UNIT_ID = 'unit-1';
const RATE_ID = 'cars';
const TAX_RATE_ID = 'id_VAT';

/** The page wrapper needs an admin on a paid workspace with distance rates on. Both tax settings are on. */
async function setupPolicy(rate: Rate) {
    await TestHelper.signInWithTestUser();
    const policy: Policy = {
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        outputCurrency: CONST.CURRENCY.USD,
        areDistanceRatesEnabled: true,
        tax: {trackingEnabled: true},
        taxRates: {name: 'Tax', defaultExternalID: TAX_RATE_ID, defaultValue: '20%', foreignTaxDefault: TAX_RATE_ID, taxes: {[TAX_RATE_ID]: {name: 'VAT', value: '20%'}}},
        customUnits: {
            [CUSTOM_UNIT_ID]: {
                customUnitID: CUSTOM_UNIT_ID,
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, taxEnabled: true},
                enabled: true,
                rates: {[RATE_ID]: rate},
            },
        },
    };
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    });
}

async function renderPage() {
    const result = render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS}
                                component={PolicyDistanceRateDetailsPage}
                                initialParams={{policyID: POLICY_ID, rateID: RATE_ID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();

    // Waits until the page is past the access wrapper's loading state
    await waitFor(() => {
        expect(screen.getByText(TestHelper.translateLocal('workspace.taxes.taxRate'))).toBeOnTheScreen();
    });
    return result;
}

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.clearAllMocks();
});

describe('PolicyDistanceRateDetailsPage tax reclaimable on', () => {
    it('shows the amount for a rate with a percentage but no tax rate', async () => {
        // Given a $10.00 rate where 50% is tax reclaimable, but no tax rate is set on the rate
        await setupPolicy({customUnitRateID: RATE_ID, name: 'Cars', rate: 1000, currency: CONST.CURRENCY.USD, enabled: true, attributes: {taxClaimablePercentage: 0.5}});
        const {unmount} = await renderPage();

        // Then the field and its amount are shown, because expenses still apply the percentage when the rate has no tax rate
        expect(screen.getByText(TestHelper.translateLocal('workspace.taxes.taxReclaimableOn'))).toBeOnTheScreen();
        expect(screen.getByText('$5.00')).toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('hides the field for a rate with neither a percentage nor a tax rate', async () => {
        // Given a rate without any tax set up
        await setupPolicy({customUnitRateID: RATE_ID, name: 'Cars', rate: 1000, currency: CONST.CURRENCY.USD, enabled: true});
        const {unmount} = await renderPage();

        // Then the field is hidden, since there is no amount to show and no tax rate to set it against
        expect(screen.queryByText(TestHelper.translateLocal('workspace.taxes.taxReclaimableOn'))).toBeNull();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});

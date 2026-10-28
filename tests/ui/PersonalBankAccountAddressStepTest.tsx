import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddressStep from '@pages/AddPersonalBankAccountPage/substeps/AddressStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function AddressPage() {
    return (
        <AddressStep
            onNext={jest.fn()}
            onMove={jest.fn()}
            isEditing={false}
        />
    );
}

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.ADDRESS}
                            component={AddressPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('Personal bank account address step', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('keeps a manually selected country when the account has no saved address', async () => {
        // Given a new bank account with no saved address or form draft
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the country picker returns the selected country to the address form
        act(() => Navigation.setParams({country: 'US'}));
        await waitForBatchedUpdatesWithAct();

        // Then the selection remains visible instead of being reset to the empty saved address
        expect(screen.getByText('United States')).toBeOnTheScreen();
    });

    it('keeps a manually entered province instead of restoring the saved province', async () => {
        // Given a non-US address whose province is edited as text
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: [{street: '', country: 'CA', state: ''}]});
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the user enters their province
        fireEvent.changeText(screen.getByLabelText('State / Province'), 'Ontario');
        await waitForBatchedUpdatesWithAct();

        // Then the controlled field retains the entered value after the step re-renders
        expect(screen.getByLabelText('State / Province')).toHaveDisplayValue('Ontario');
    });
});

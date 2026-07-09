import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {setTravelProvisioningTaxID} from '@libs/actions/Travel';
import type * as TravelActions from '@libs/actions/Travel';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import TaxIDStep from '@pages/Travel/EnableTravel/subPages/TaxIDStep';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Travel', () => ({
    ...jest.requireActual<typeof TravelActions>('@libs/actions/Travel'),
    setTravelProvisioningTaxID: jest.fn(),
}));

const mockSetTravelProvisioningTaxID = jest.mocked(setTravelProvisioningTaxID);
const mockOnNext = jest.fn();

const Stack = createPlatformStackNavigator();

function TaxIDStepScreen() {
    return (
        <TaxIDStep
            isEditing={false}
            onNext={mockOnNext}
            onMove={jest.fn()}
            policy={undefined}
            policyID="policy-1"
            resolvedDomain="example.com"
        />
    );
}

function renderStep() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="TaxIDStepScreen"
                        component={TaxIDStepScreen}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

describe('TaxIDStep', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('renders the tax ID prompt', async () => {
        renderStep();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('travel.taxID.subtitle'))).toBeTruthy();
    });

    it('shows a validation error and does not advance when the tax ID is empty', async () => {
        renderStep();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('travel.taxID.error.required'))).toBeTruthy();
        });
        expect(mockSetTravelProvisioningTaxID).not.toHaveBeenCalled();
        expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('stores the trimmed tax ID and advances to the next step on submit', async () => {
        renderStep();
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('travel.taxID.inputLabel')), '  DE123456789  ');
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(mockSetTravelProvisioningTaxID).toHaveBeenCalledWith('DE123456789');
        });
        expect(mockOnNext).toHaveBeenCalled();
    });
});

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {updateLegalName} from '@libs/actions/PersonalDetails';
import type * as PersonalDetailsActions from '@libs/actions/PersonalDetails';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import LegalNameStep from '@pages/Travel/EnableTravel/subPages/LegalNameStep';

import ONYXKEYS from '@src/ONYXKEYS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockFormatPhoneNumber = jest.fn((phoneNumber: string) => `formatted:${phoneNumber}`);
const mockOnNext = jest.fn();
const mockCurrentUserPersonalDetails = {
    accountID: 1,
    email: '+15555550100@expensify.sms',
    firstName: '',
    lastName: '',
};

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => mockCurrentUserPersonalDetails);

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    formatPhoneNumber: mockFormatPhoneNumber,
}));

jest.mock('@libs/actions/PersonalDetails', () => ({
    ...jest.requireActual<typeof PersonalDetailsActions>('@libs/actions/PersonalDetails'),
    updateLegalName: jest.fn(),
}));

const mockUpdateLegalName = jest.mocked(updateLegalName);

const Stack = createPlatformStackNavigator();

function LegalNameStepScreen() {
    return (
        <LegalNameStep
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
        <ComposeProviders components={[OnyxListItemProvider]}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="LegalNameStepScreen"
                        component={LegalNameStepScreen}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

describe('LegalNameStep', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('submits trimmed legal names with the localized phone-number formatter and advances', async () => {
        renderStep();
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByLabelText('privatePersonalDetails.legalFirstName'), '  Jane  ');
        fireEvent.changeText(screen.getByLabelText('privatePersonalDetails.legalLastName'), '  Doe  ');
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(mockUpdateLegalName).toHaveBeenCalledWith('Jane', 'Doe', mockFormatPhoneNumber, mockCurrentUserPersonalDetails, false);
        });
        expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
});

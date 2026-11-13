import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import {WRITE_COMMANDS} from '@libs/API/types';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ActivatePhysicalCardPageBase from '@pages/settings/Wallet/ActivatePhysicalCardPageBase';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Card} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

const CARD_ID = 5555;
const WRONG_DIGITS_ERROR = "That didn't match the last four digits on the card. Please try again.";

const card: Card = {
    cardID: CARD_ID,
    state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED,
    bank: CONST.EXPENSIFY_CARD.BANK,
    fundID: '1234',
    domainName: 'example.com',
    lastUpdated: '',
    fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
    nameValuePairs: {
        shippingAddress: {
            legalFirstName: 'Test',
            legalLastName: 'Card',
            addressStreet: '123 Pike Street',
            addressCity: 'Seattle',
            addressState: 'WA',
            addressZip: '98101',
            addressCountry: CONST.COUNTRY.US,
        },
    },
};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function ActivateScreen() {
    return <ActivatePhysicalCardPageBase cardID={String(CARD_ID)} />;
}

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_ACTIVATE}
                            component={ActivateScreen}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function enterLastFourDigits() {
    fireEvent.changeText(screen.getByLabelText(`${TestHelper.translateLocal('common.securityCode')}, 4 ${TestHelper.translateLocal('common.digits')}`), '1234');
    await waitForBatchedUpdatesWithAct();
}

describe('ActivatePhysicalCardPageBase', () => {
    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockFetch.succeed();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: card});
        });
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();
    });

    it('activates right away when the cardholder already has their details on file', async () => {
        // Given a card shipped to an address the admin entered, for a cardholder whose details are already saved
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                legalFirstName: 'Test',
                legalLastName: 'Card',
                dob: '1988-05-19',
                phoneNumber: '+13466666666',
                addresses: [{street: '123 Pike Street', city: 'Seattle', state: 'WA', zip: '98101', country: CONST.COUNTRY.US, current: true}],
            });
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When they enter the last four digits
        await enterLastFourDigits();

        // Then the card is activated without asking for details or a magic code, since nothing needs saving
        expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD)).toHaveLength(1);
        expect(screen.queryByText(TestHelper.translateLocal('activateCardPage.fillInAllDetails'))).toBeNull();
    });

    it('shows wrong digits on the last four step and waits for Next before trying again', async () => {
        // Given a cardholder with no saved details who entered the last four digits and got to the details step
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await enterLastFourDigits();
        expect(screen.getByText(TestHelper.translateLocal('activateCardPage.fillInAllDetails'))).toBeOnTheScreen();

        // When the request comes back saying the digits didn't match
        await act(async () => {
            await Onyx.merge(ONYXKEYS.CARD_LIST, {[CARD_ID]: {errors: {1: WRONG_DIGITS_ERROR}}});
        });
        await waitForBatchedUpdatesWithAct();

        // Then they are back on the last four step with the error, where the digits are checked
        expect(screen.getByText(WRONG_DIGITS_ERROR)).toBeOnTheScreen();
        expect(screen.queryByText(TestHelper.translateLocal('activateCardPage.fillInAllDetails'))).toBeNull();

        // When they enter the digits again
        await enterLastFourDigits();

        // Then nothing moves on until they press Next, like after a wrong entry without the details step
        expect(screen.queryByText(TestHelper.translateLocal('activateCardPage.fillInAllDetails'))).toBeNull();
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.next')));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(TestHelper.translateLocal('activateCardPage.fillInAllDetails'))).toBeOnTheScreen();
    });

    it('asks for the details when the cardholder has none on file', async () => {
        // Given a card shipped to an address the admin entered, for a cardholder with no saved details
        renderPage();
        await waitForBatchedUpdatesWithAct();
        const activateCallCount = TestHelper.getFetchMockCalls(WRITE_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD).length;

        // When they enter the last four digits
        await enterLastFourDigits();

        // Then they are asked for their details before anything is sent
        expect(screen.getByText(TestHelper.translateLocal('activateCardPage.fillInAllDetails'))).toBeOnTheScreen();
        expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD)).toHaveLength(activateCallCount);
    });
});

import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import {WRITE_COMMANDS} from '@libs/API/types';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ActivatePhysicalCardPersonalDetails from '@pages/settings/Wallet/ActivatePhysicalCardPersonalDetails';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Card} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

// The magic code screen is checked through the props it gets, the screen itself has its own tests
jest.mock('@components/ValidateCodeActionModal/ValidateCodeActionContent', () => jest.fn(() => null));

const CARD_ID = 5555;
const LAST_FOUR_DIGITS = '1234';

const card: Card = {
    cardID: CARD_ID,
    state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED,
    bank: CONST.EXPENSIFY_CARD.BANK,
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
    return (
        <ActivatePhysicalCardPersonalDetails
            card={card}
            lastFourDigits={LAST_FOUR_DIGITS}
            onBackButtonPress={() => {}}
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
                            name={SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_ACTIVATE}
                            component={ActivateScreen}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('ActivatePhysicalCardPersonalDetails', () => {
    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(ValidateCodeActionContent).mockClear();
        mockFetch.succeed();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {dob: '1988-05-19', phoneNumber: '+13466666666'});
        });
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();
    });

    it('asks for a magic code before saving the details and activating the card', async () => {
        // Given a cardholder confirming their details for a card shipped to the address their admin entered
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When they submit the details
        fireEvent.press(screen.getByText(TestHelper.translateLocal('activateCardPage.activatePhysicalCard')));
        await waitForBatchedUpdatesWithAct();

        // Then they are asked for a magic code first, because saving details needs one, and nothing is sent yet
        const magicCodeProps = jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0];
        expect(magicCodeProps?.validateCodeReasonCode).toBe(COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS);
        expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_ACTIVATE_EXPENSIFY_CARD)).toHaveLength(0);

        // When they enter the magic code
        await act(async () => {
            magicCodeProps?.handleSubmitForm('123456');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the details, the last four digits and the code go out together
        const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_ACTIVATE_EXPENSIFY_CARD).at(-1)?.[1]?.body;
        expect(body instanceof FormData ? Object.fromEntries(body) : {}).toEqual(
            expect.objectContaining({
                cardID: String(CARD_ID),
                cardLastFourDigits: LAST_FOUR_DIGITS,
                validateCode: '123456',
                phoneNumber: '+13466666666',
                addressStreet: '123 Pike Street',
                addressZip: '98101',
                dob: '1988-05-19',
            }),
        );
        expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD)).toHaveLength(0);
    });
});

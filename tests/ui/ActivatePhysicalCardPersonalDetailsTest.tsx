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
            legalFirstName: 'Anne-Marie',
            legalLastName: "O'Connor",
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
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {dob: '1988-05-19'});
        });
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();
    });

    it('asks for a validateCode before saving a new phone number and activating the card', async () => {
        // Given a cardholder with no phone number on file, confirming their details for a card shipped to the name and address their admin entered
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When they add a phone number and submit the details
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.phoneNumber')), '+13466666666');
        fireEvent.press(screen.getByText(TestHelper.translateLocal('activateCardPage.activatePhysicalCard')));
        await waitForBatchedUpdatesWithAct();

        // Then they are asked for a validateCode first, because the phone number is used for card 3DS verification, and nothing is sent yet
        const validateCodeProps = jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0];
        expect(validateCodeProps?.validateCodeReasonCode).toBe(CONST.EXPENSIFY_CARD.ACTIVATE_CARD_VALIDATE_CODE_REASON);
        expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_ACTIVATE_EXPENSIFY_CARD)).toHaveLength(0);

        // When they enter the validateCode
        await act(async () => {
            validateCodeProps?.handleSubmitForm('123456');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the details go out with the digits and the code, with the legal name the admin shipped the card to
        const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_ACTIVATE_EXPENSIFY_CARD).at(-1)?.[1]?.body;
        expect(body instanceof FormData ? Object.fromEntries(body) : {}).toEqual(
            expect.objectContaining({
                cardID: String(CARD_ID),
                cardLastFourDigits: LAST_FOUR_DIGITS,
                validateCode: '123456',
                legalFirstName: 'Anne-Marie',
                legalLastName: "O'Connor",
                phoneNumber: '+13466666666',
                addressStreet: '123 Pike Street',
                addressZip: '98101',
                dob: '1988-05-19',
            }),
        );
        expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD)).toHaveLength(0);
    });

    it('reads a phone number without a country code as one from the address country', async () => {
        // Given a cardholder in Singapore confirming a US address
        await act(async () => {
            await Onyx.set(ONYXKEYS.COUNTRY_CODE, 65);
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When they enter a US number without the country code and submit
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.phoneNumber')), '(585) 752-7441');
        fireEvent.press(screen.getByText(TestHelper.translateLocal('activateCardPage.activatePhysicalCard')));
        await waitForBatchedUpdatesWithAct();
        await act(async () => {
            jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0]?.handleSubmitForm('123456');
        });
        await waitForBatchedUpdatesWithAct();

        // Then it's sent as a US number, the same way the admin shipping form reads it
        const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_ACTIVATE_EXPENSIFY_CARD).at(-1)?.[1]?.body;
        expect(body instanceof FormData ? Object.fromEntries(body) : {}).toEqual(expect.objectContaining({phoneNumber: '+15857527441'}));
    });

    it('activates the card without a validateCode when the phone number on file is kept', async () => {
        // Given a cardholder who already has a phone number on file but no address
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {phoneNumber: '+13466666666'});
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When they submit the details without changing the phone number
        fireEvent.press(screen.getByText(TestHelper.translateLocal('activateCardPage.activatePhysicalCard')));
        await waitForBatchedUpdatesWithAct();

        // Then the details go out right away without a validateCode, since only a new phone number needs one
        expect(ValidateCodeActionContent).not.toHaveBeenCalled();
        const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_ACTIVATE_EXPENSIFY_CARD).at(-1)?.[1]?.body;
        const sentParams = body instanceof FormData ? Object.fromEntries(body) : {};
        expect(sentParams).toEqual(
            expect.objectContaining({
                cardID: String(CARD_ID),
                cardLastFourDigits: LAST_FOUR_DIGITS,
                phoneNumber: '+13466666666',
                addressStreet: '123 Pike Street',
            }),
        );
        expect(sentParams).not.toHaveProperty('validateCode');
    });
});

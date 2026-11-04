import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import InternationalDepositAccount from '@pages/settings/Wallet/InternationalDepositAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import wiseBankAccountFieldsGB from '../../../../data/wise/wiseBankAccountFieldsGB';
import getOnyxValue from '../../../../utils/getOnyxValue';
import * as TestHelper from '../../../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderScreen(subPage?: string) {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.ADD_BANK_ACCOUNT}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.ADD_BANK_ACCOUNT}
                        component={InternationalDepositAccount}
                        initialParams={{subPage}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('WiseDepositAccountContent', () => {
    let navigateSpy: jest.SpyInstance;

    beforeAll(() => {
        // Registered as the app does, so the tests see the form only in memory
        Onyx.init({keys: ONYXKEYS, ramOnlyKeys: [ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS]});
    });

    beforeEach(async () => {
        await Onyx.clear();
        global.fetch = TestHelper.getGlobalFetchMock();
        // The flow moves between its pages by route, which this single screen stack cannot follow
        navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
    });

    afterEach(() => {
        navigateSpy.mockRestore();
        jest.useRealTimers();
    });

    it("keeps the user's currency pick while the server still holds the old one", async () => {
        // Given the GBP form the server sent, which seeds the currency select
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, wiseBankAccountFieldsGB);
        await renderScreen();
        expect((await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT))?.currency).toBe('GBP');

        // When the user picks USD and the new form has not arrived yet
        await Onyx.merge(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, {currency: 'USD'});
        await waitForBatchedUpdatesWithAct();

        // Then the pick stays, instead of being written back to the server's GBP
        expect((await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT))?.currency).toBe('USD');

        // When the server sends a form for another currency
        await Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, {currency: 'EUR'});
        await waitForBatchedUpdatesWithAct();

        // Then the new server choice seeds the select again
        expect((await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT))?.currency).toBe('EUR');
    });

    it("keeps the user's currency pick on the next page after a refresh that failed", async () => {
        // Given the GBP form the server sent, and a USD pick the failed refresh left in the draft
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, wiseBankAccountFieldsGB);
        await Onyx.merge(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, {currency: 'USD'});

        // When the next page opens, which mounts a new screen
        await renderScreen('accountHolderDetails');

        // Then the pick stays, since the server sent nothing new
        expect((await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT))?.currency).toBe('USD');
    });

    it('returns to the country list when the URL points at a form page with no form', async () => {
        // Given no form, as after a reload, since the form is only kept in memory
        // When a form page opens
        await renderScreen('accountDetails');

        // Then the URL is replaced with the country list it shows
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(undefined), {forceReplace: true});
    });

    it('stays on the URL while the form for a page is loading', async () => {
        // Given a form page whose form is still being fetched
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, {isLoading: true});

        // When the screen opens
        await renderScreen('accountDetails');

        // Then it waits for the form instead of sending the user back to the country list
        expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(undefined), {forceReplace: true});
    });

    it('does not open the flow again when the user leaves it while a form page is loading', async () => {
        // Given a form page whose new form is still being fetched, with the loader's go back button shown
        jest.useFakeTimers({advanceTimers: true});
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, {...wiseBankAccountFieldsGB, isLoading: true});
        await renderScreen('accountDetails');
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // When the user leaves the flow, which clears the form while the screen is still closing
        fireEvent.press(screen.getByText('common.goBack'));
        await waitForBatchedUpdatesWithAct();

        // Then the screen goes back only, without replacing the URL with the country list again
        expect(goBackSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(undefined), {forceReplace: true});
        goBackSpy.mockRestore();
    });

    it('returns to the country list when the user goes back from the first form page', async () => {
        // Given the first page of the GBP form
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, wiseBankAccountFieldsGB);
        await renderScreen('accountDetails');

        // When the user goes back
        fireEvent.press(screen.getByLabelText('common.back'));
        await waitForBatchedUpdatesWithAct();

        // Then the form is dropped and the URL is replaced with the country list it shows
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS)).toBeUndefined();
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(undefined), {forceReplace: true});
    });
});

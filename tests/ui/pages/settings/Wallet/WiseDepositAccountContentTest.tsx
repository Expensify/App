import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {getPages} from '@components/DynamicForm/utils/paginate';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {READ_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import InternationalDepositAccount from '@pages/settings/Wallet/InternationalDepositAccount';

import {createWiseBankAccount} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
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

// The flow names its pages by the schema's keys in lower case, so a page opens only under that name
const FIRST_PAGE_NAME = getPages(wiseBankAccountFieldsGB.schema).at(0)?.key;

async function renderScreen(subPage?: string, backTo?: Route) {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.ADD_BANK_ACCOUNT}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.ADD_BANK_ACCOUNT}
                        component={InternationalDepositAccount}
                        initialParams={{subPage, backTo}}
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
        // Given a form page whose first form is still being fetched, with the loader's go back button shown
        jest.useFakeTimers({advanceTimers: true});
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, {isLoading: true});
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

    describe('after the bank account is added', () => {
        let goBackSpy: jest.SpyInstance;

        beforeEach(() => {
            // The flow leaves by going back, which this single screen stack cannot follow
            goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        });

        afterEach(() => {
            goBackSpy.mockRestore();
        });

        async function renderAddedAccount(backTo?: Route) {
            await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, wiseBankAccountFieldsGB);
            await Onyx.merge(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, {accountNumber: '87654321'});
            await renderScreen(CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY, backTo);

            // The server answered the submit from the confirmation page with a success
            createWiseBankAccount('GB', 'GBP', {accountNumber: '87654321'});
            await waitForBatchedUpdatesWithAct();
        }

        it('shows that the bank account was added, so the user knows the submit went through', async () => {
            // Given the user submitted the form
            // When the server reports the account was created
            await renderAddedAccount();

            // Then the success screen replaces the confirmation page
            expect(screen.getByText('addPersonalBankAccountPage.bankAccountAddedTitle')).toBeOnTheScreen();
        });

        it('returns to the wallet and drops the bank details when the user continues', async () => {
            // Given the success screen
            await renderAddedAccount();

            // When the user continues
            fireEvent.press(screen.getByText('common.continue'));
            await waitForBatchedUpdatesWithAct();

            // Then the flow closes, so a new visit starts from the country list without the old bank details or a success left over
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
            expect(await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT)).toBeUndefined();
            expect((await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM))?.isSuccess).toBeFalsy();
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS)).toBeUndefined();

            // And the wallet asks for its bank accounts again, since it stays open under the flow and does not refetch by itself
            TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.OPEN_PAYMENTS_PAGE, 1);
        });

        it('returns to the report the user came from when they continue', async () => {
            // Given the flow opened from a report
            await renderAddedAccount(ROUTES.REPORT_WITH_ID.getRoute('123'));

            // When the user continues
            fireEvent.press(screen.getByText('common.continue'));
            await waitForBatchedUpdatesWithAct();

            // Then they are back on that report
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('123'));
        });

        it('returns to the wallet instead of the purpose page when the user continues', async () => {
            // Given the flow opened from the bank account purpose page
            await renderAddedAccount(ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);

            // When the user continues
            fireEvent.press(screen.getByText('common.continue'));
            await waitForBatchedUpdatesWithAct();

            // Then they land on the wallet with the new account, since the purpose question is already answered
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        });

        it('goes on with the payment that asked for a bank account when the user continues', async () => {
            // Given the flow opened from a payment, which saves where to go on once the account exists
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS});
            await renderAddedAccount(ROUTES.REPORT_WITH_ID.getRoute('123'));

            // When the user continues
            fireEvent.press(screen.getByText('common.continue'));
            await waitForBatchedUpdatesWithAct();

            // Then the payment goes on, and its saved route is dropped so a later visit does not follow it
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.ENABLE_PAYMENTS);
            expect(goBackSpy).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('123'));
            expect(await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT)).toBeUndefined();
        });
    });

    it('keeps what the user typed on the page while the form refreshes', async () => {
        // Given the first page of the GBP form with a sort code typed but not saved yet
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, wiseBankAccountFieldsGB);
        await renderScreen(FIRST_PAGE_NAME);
        fireEvent.changeText(screen.getByLabelText('Sort code', {exact: false}), '403020');

        // When a currency change asks the server for a new form, and it arrives
        await Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, {isLoading: true});
        await waitForBatchedUpdatesWithAct();
        const isPageShownWhileLoading = !!screen.queryByLabelText('Sort code', {exact: false});
        await Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, {isLoading: false});
        await waitForBatchedUpdatesWithAct();

        // Then the page stays on screen the whole time, so the typed sort code is still there instead of the form starting over
        expect(isPageShownWhileLoading).toBe(true);
        expect(screen.getByLabelText('Sort code', {exact: false}).props.value).toBe('403020');
    });

    it('locks the currency offline while the bank details stay editable', async () => {
        // Given the first page of the GBP form
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, wiseBankAccountFieldsGB);
        await renderScreen(FIRST_PAGE_NAME);

        // When the connection drops
        await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await waitForBatchedUpdatesWithAct();

        // Then the currency cannot change, since a new currency asks the server for a new form that would only wait in the queue
        expect(screen.getByRole('button', {name: /common\.currency/})).toBeDisabled();

        // And the user can still type the sort code and go on, since only Confirm sends the answers
        expect(screen.getByLabelText('Sort code', {exact: false})).not.toBeDisabled();
        expect(screen.getByRole('button', {name: 'common.next'})).not.toBeDisabled();

        // When the connection comes back
        await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: false});
        await waitForBatchedUpdatesWithAct();

        // Then the currency can be changed again
        expect(screen.getByRole('button', {name: /common\.currency/})).not.toBeDisabled();
    });

    it('shows a failed refresh on the form page and hides it on the next attempt', async () => {
        // Given the first page of the GBP form
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, wiseBankAccountFieldsGB);
        await renderScreen(FIRST_PAGE_NAME);

        // When the refresh fails
        await Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, {errors: {refreshError: 'The form could not be refreshed'}});
        await waitForBatchedUpdatesWithAct();

        // Then the user sees why the fields did not change, on the page they are on
        expect(screen.getByText('The form could not be refreshed')).toBeOnTheScreen();

        // When the user tries again, which clears the error while the request runs
        await Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, {isLoading: true, errors: null});
        await waitForBatchedUpdatesWithAct();

        // Then the old error is gone
        expect(screen.queryByText('The form could not be refreshed')).not.toBeOnTheScreen();
    });

    it('opens the new form instead of the success screen after a success from an earlier visit', async () => {
        // Given a success the device kept from an earlier visit, while the form itself was only in memory, as after a reload
        createWiseBankAccount('GB', 'GBP', {accountNumber: '87654321'});
        await waitForBatchedUpdatesWithAct();
        await Onyx.set(ONYXKEYS.COUNTRY, 'GB');
        await renderScreen();

        // When the user confirms a country and its form arrives
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS, wiseBankAccountFieldsGB);
        await waitForBatchedUpdatesWithAct();

        // Then the user fills in the new form, rather than being told an account they have not sent yet was added
        expect(screen.queryByText('addPersonalBankAccountPage.bankAccountAddedTitle')).not.toBeOnTheScreen();
        expect((await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM))?.isSuccess).toBeFalsy();
    });

    it('returns to the wallet instead of the purpose page when the user leaves the country list', async () => {
        // Given the country list, opened from the bank account purpose page
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderScreen(undefined, ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);

        // When the user leaves the flow
        fireEvent.press(screen.getByLabelText('common.back'));
        await waitForBatchedUpdatesWithAct();

        // Then they land on the wallet, as the Corpay flow does, since the purpose page was only a step on the way in
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        goBackSpy.mockRestore();
    });
});

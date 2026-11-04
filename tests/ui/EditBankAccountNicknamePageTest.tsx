import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import EditBankAccountNicknamePage from '@pages/settings/Wallet/EditBankAccountNicknamePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 1234;
const BANK_NAME = CONST.BANK_NAMES.CHASE;
const MASKED_TITLE = `${CONST.MASKED_PAN_PREFIX}1111`;

// Only updateBankAccountName is stubbed. Spreading requireActual here would run while BankAccounts is still mid-import.
const mockUpdateBankAccountName = jest.fn<void, [number, string, string | undefined]>();
jest.mock('@libs/actions/BankAccounts', () => ({
    __esModule: true,
    updateBankAccountName: (bankAccountID: number, newName: string, oldName?: string) => {
        mockUpdateBankAccountName(bankAccountID, newName, oldName);
    },
}));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const getNicknameLabel = () => TestHelper.translateLocal('walletPage.nickname');
const getSaveLabel = () => TestHelper.translateLocal('common.save');

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.EDIT_BANK_ACCOUNT_NICKNAME}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.WALLET.EDIT_BANK_ACCOUNT_NICKNAME}
                            component={EditBankAccountNicknamePage}
                            initialParams={{bankAccountID: `${BANK_ACCOUNT_ID}`}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );

/** Waits for the form to be interactive, then returns the Save button. */
const waitForSaveButton = async () => {
    await waitForBatchedUpdatesWithAct();
    await waitFor(() => {
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()})).toBeOnTheScreen();
    });
    return screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()});
};

describe('EditBankAccountNicknamePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});

        // A bank account whose title is a masked account number, so the Wallet row and the input show the bank name instead
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [BANK_ACCOUNT_ID]: {
                    title: MASKED_TITLE,
                    methodID: BANK_ACCOUNT_ID,
                    accountData: {bankAccountID: BANK_ACCOUNT_ID, state: CONST.BANK_ACCOUNT.STATE.OPEN, additionalData: {bankName: BANK_NAME}},
                },
            });
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('does not rename the bank account when it is saved without changes', async () => {
        // Given the page is prefilled with the bank name rather than the masked title
        renderPage();
        const saveButton = await waitForSaveButton();
        expect(screen.getByLabelText(getNicknameLabel())).toHaveDisplayValue(BANK_NAME);

        // When the user presses Save without editing the name
        fireEvent.press(saveButton);
        await waitForBatchedUpdatesWithAct();

        // Then no rename is sent, so the original name is not replaced with the bank name
        expect(mockUpdateBankAccountName).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('renames the bank account when the user enters a new name', async () => {
        renderPage();
        await waitForSaveButton();

        // When the user enters a new name and presses Save
        fireEvent.changeText(screen.getByLabelText(getNicknameLabel()), 'Payroll account');
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()}));
        await waitForBatchedUpdatesWithAct();

        // Then the rename is sent with the previous title so it can be restored if the request fails
        expect(mockUpdateBankAccountName).toHaveBeenCalledWith(BANK_ACCOUNT_ID, 'Payroll account', MASKED_TITLE);
    });
});

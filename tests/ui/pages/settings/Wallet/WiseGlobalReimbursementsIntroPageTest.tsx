import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WiseGlobalReimbursementsIntroPage from '@pages/settings/Wallet/WiseGlobalReimbursementsIntroPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {BankAccount} from '@src/types/onyx';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const PRIMARY_BUTTON_TEST_ID = 'confirmation-primary-button';

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function createBusinessBankAccount(globalReimbursementProvider: BankAccountAdditionalData['globalReimbursementProvider'], wise: BankAccountAdditionalData['wise']): BankAccount {
    return {
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
        accountData: {
            bankAccountID: BANK_ACCOUNT_ID,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {currency: CONST.CURRENCY.USD, isGlobalReimbursementEnabled: false, globalReimbursementProvider, wise},
        },
    };
}

async function renderPage(bankAccount: BankAccount) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
        await Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, false);
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: bankAccount});
    });
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_GLOBAL_REIMBURSEMENTS_INTRO}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_GLOBAL_REIMBURSEMENTS_INTRO}
                        component={WiseGlobalReimbursementsIntroPage}
                        initialParams={{bankAccountID: String(BANK_ACCOUNT_ID)}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('WiseGlobalReimbursementsIntroPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        await act(async () => {
            await Onyx.clear();
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        ['starts the onboarding with Get started for an account that has not started', undefined, undefined, 'walletPage.wiseGlobalReimbursementsIntro.getStarted', '/business-onboarding'],
        ['continues the onboarding the admin left before Submit', CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE, undefined, 'common.continue', '/business-onboarding'],
        [
            'continues to the status page when Wise needs more info',
            CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE,
            {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED},
            'common.continue',
            '/status',
        ],
        [
            'continues to the status page while Wise reviews the business',
            CONST.GLOBAL_REIMBURSEMENT_PROVIDER.WISE,
            {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW},
            'common.continue',
            '/status',
        ],
    ])('%s', async (_label, globalReimbursementProvider, wise, buttonText, pageSuffix) => {
        // Given the intro for a bank account at some point of its Wise onboarding
        await renderPage(createBusinessBankAccount(globalReimbursementProvider, wise));

        // When the admin presses the intro's button
        expect(screen.getByTestId(PRIMARY_BUTTON_TEST_ID)).toHaveTextContent(buttonText);
        fireEvent.press(screen.getByTestId(PRIMARY_BUTTON_TEST_ID));

        // Then the button names what it does, and it opens the page where the admin left off, or the onboarding's first page for a new setup
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`${pageSuffix}$`)));
    });
});

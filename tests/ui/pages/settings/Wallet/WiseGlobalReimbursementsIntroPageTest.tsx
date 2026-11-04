import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WiseGlobalReimbursementsIntroPage from '@pages/settings/Wallet/WiseGlobalReimbursementsIntroPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {AccountData} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const GET_STARTED_BUTTON_TEST_ID = 'confirmation-primary-button';

// The real helper prepends the focused route, which only a full linking config resolves
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn((suffix: string) => suffix));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function setUpEligibleBankAccount(additionalData: AccountData['additionalData']) {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    await Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, false);
    await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
        [BANK_ACCOUNT_ID]: {
            bankCurrency: CONST.CURRENCY.USD,
            accountData: {bankAccountID: BANK_ACCOUNT_ID, type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, additionalData},
        },
    });
}

describe('WiseGlobalReimbursementsIntroPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('opens the more info needed page on Get started when the business was already sent to Wise', async () => {
        // Given an eligible business account that Wise already has a status for, as when the user left Wise's form and came back
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        await setUpEligibleBankAccount({wise: {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}});
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

        // When the user presses Get started
        fireEvent.press(screen.getByTestId(GET_STARTED_BUTTON_TEST_ID));

        // Then Wise's form is offered again instead of the onboarding, whose terms would have nothing left to submit
        expect(navigateSpy).toHaveBeenCalledWith(DYNAMIC_ROUTES.WISE_MORE_INFO_NEEDED.path);
        navigateSpy.mockRestore();
    });
});

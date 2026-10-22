import {act, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WiseBusinessOnboardingPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseBusinessOnboardingPage';

import {saveDraftAnswers} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {BankAccount, PrivatePersonalDetails} from '@src/types/onyx';

import type ReactNative from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const FLOW_TEST_ID = 'DynamicFormFlow';
const LOADER_TEST_ID = 'FullScreenLoadingIndicator';
const NOT_FOUND_TEST_ID = 'NotFoundPage';
const BANK_ACCOUNT_ID = 1;

const mockFlowMount = jest.fn();

jest.mock('@components/DynamicForm', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    function MockDynamicFormFlow() {
        useEffect(() => {
            mockFlowMount();
        }, []);
        return <reactNative.View testID="DynamicFormFlow" />;
    }
    return {__esModule: true, default: MockDynamicFormFlow};
});
jest.mock('@components/FullscreenLoadingIndicator', () => {
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: () => <reactNative.View testID="FullScreenLoadingIndicator" />};
});
jest.mock('@pages/ErrorPage/NotFoundPage', () => {
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: () => <reactNative.View testID="NotFoundPage" />};
});
jest.mock('@userActions/DynamicForm', () => ({saveDraftAnswers: jest.fn()}));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/1'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const ELIGIBLE_BANK_ACCOUNT: BankAccount = {
    bankCurrency: CONST.CURRENCY.USD,
    bankCountry: CONST.COUNTRY.US,
    accountData: {bankAccountID: BANK_ACCOUNT_ID, type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, addressName: 'Boulder Development Inc.'},
};

const PRIVATE_PERSONAL_DETAILS: PrivatePersonalDetails = {
    legalFirstName: 'Alice',
    legalLastName: 'Nguyen',
    dob: '1985-04-12',
    addresses: [{street: '42 Oak Ave', city: 'Austin', state: 'TX', zip: '78704', country: CONST.COUNTRY.US, current: true}],
};

const {saveDraftAnswers: saveDraftAnswersToOnyx} = jest.requireActual<{saveDraftAnswers: typeof saveDraftAnswers}>('@userActions/DynamicForm');

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage(bankAccount: BankAccount = ELIGIBLE_BANK_ACCOUNT) {
    await Onyx.multiSet({
        [ONYXKEYS.BETAS]: [CONST.BETAS.WISE_REIMBURSEMENTS],
        [ONYXKEYS.BANK_ACCOUNT_LIST]: {[BANK_ACCOUNT_ID]: bankAccount},
        [ONYXKEYS.IS_LOADING_PAYMENT_METHODS]: false,
        [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: PRIVATE_PERSONAL_DETAILS,
    });
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING}
                        component={WiseBusinessOnboardingPage}
                        initialParams={{bankAccountID: String(BANK_ACCOUNT_ID)}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('WiseBusinessOnboardingPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(saveDraftAnswers).mockImplementation(saveDraftAnswersToOnyx);
        await Onyx.clear();
    });

    it('shows a loader until the prefill is in the draft, then the flow', async () => {
        // Given a draft that the prefill has not reached yet, since its save is held back
        jest.mocked(saveDraftAnswers).mockImplementation(() => {});

        // When the page opens for an eligible business account
        await renderPage();

        // Then the loader stays while the prefill is only asked for, since the flow's inputs read the draft once when they mount
        expect(saveDraftAnswers).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, expect.objectContaining({firstName: 'Alice', companyName: 'Boulder Development Inc.'}));
        expect(screen.getByTestId(LOADER_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(FLOW_TEST_ID)).not.toBeOnTheScreen();

        // When the prefill lands in the draft
        const prefill = jest.mocked(saveDraftAnswers).mock.lastCall?.[1];
        if (!prefill) {
            throw new Error('The page did not ask for a prefill');
        }
        act(() => saveDraftAnswersToOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, prefill));
        await waitForBatchedUpdatesWithAct();

        // Then the flow replaces the loader
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(LOADER_TEST_ID)).not.toBeOnTheScreen();
    });

    it('keeps the flow mounted when private details change after the prefill', async () => {
        // Given the flow open after the prefill, with no phone number on file
        await renderPage();
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();

        // When a phone number is added to the private details during the visit
        await act(() => Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {phoneNumber: '+15125550199'}));
        await waitForBatchedUpdatesWithAct();

        // Then the flow is not swapped for the loader and remounted, since that would drop an SSN the user is typing
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
        expect(mockFlowMount).toHaveBeenCalledTimes(1);
        expect(saveDraftAnswers).toHaveBeenCalledTimes(1);
    });

    it('shows not found for a bank account that cannot use global reimbursements', async () => {
        // Given a business account in euros, which Wise reimbursements do not cover
        const euroBankAccount: BankAccount = {...ELIGIBLE_BANK_ACCOUNT, bankCurrency: CONST.CURRENCY.EUR};

        // When the page opens for it
        await renderPage(euroBankAccount);

        // Then the user sees not found instead of the form
        expect(screen.getByTestId(NOT_FOUND_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(FLOW_TEST_ID)).not.toBeOnTheScreen();
    });
});

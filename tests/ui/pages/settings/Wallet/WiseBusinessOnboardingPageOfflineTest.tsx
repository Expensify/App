import {fireEvent, render, screen} from '@testing-library/react-native';
import type {RenderResult} from '@testing-library/react-native';

import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {toSavedFile} from '@libs/getWiseOnboardingPageParams';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';

import WiseBusinessOnboardingPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseBusinessOnboardingPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {BankAccount} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../../../../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/BankAccounts', () => ({hideBankAccountErrors: jest.fn(), openReimbursementAccountPage: jest.fn()}));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/1'));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        preferredLocale: 'en',
    })),
);

const BANK_ACCOUNT_ID = 1;

const ELIGIBLE_BANK_ACCOUNT: BankAccount = {
    bankCurrency: CONST.CURRENCY.USD,
    bankCountry: CONST.COUNTRY.US,
    accountData: {bankAccountID: BANK_ACCOUNT_ID, type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, addressName: 'Main checking'},
};

const ADDRESS_KEYS = getAddressInputKeys('address');

/** Answers that pass both intake pages, so only the connection decides whether Next saves */
const COMPLETE_DRAFT = {
    bankAccountID: String(BANK_ACCOUNT_ID),
    firstName: 'Alice',
    lastName: 'Nguyen',
    phoneNumber: '+15125550199',
    dateOfBirth: '1985-04-12',
    [ADDRESS_KEYS.street]: '42 Oak Ave',
    [ADDRESS_KEYS.city]: 'Austin',
    [ADDRESS_KEYS.state]: 'TX',
    [ADDRESS_KEYS.zipCode]: '78704',
    [ADDRESS_KEYS.country]: CONST.COUNTRY.US,
    hasNoSSN: false,
    idDocument: [toSavedFile('wise/id.png')],
    companyName: 'Boulder Development Inc.',
    companyType: CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION,
    companyRole: CONST.WISE.COMPANY_ROLE.OWNER,
    industryCategories: [CONST.WISE.INDUSTRY_CATEGORIES[0]],
    description: 'We sell bikes',
};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const SSN = '123456789';

/** The SSN input's label, which screen readers hear followed by the example hint */
const SSN_LABEL = /^walletPage\.wiseOnboarding\.representative\.ssn,/;

/** Mounts the page on one of its pages with whatever Onyx holds, as opening the app on that page does */
async function mountPage(subPage: string): Promise<RenderResult> {
    const result = render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING}
                        component={WiseBusinessOnboardingPage}
                        initialParams={{bankAccountID: String(BANK_ACCOUNT_ID), subPage}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
    return result;
}

/** Opens a page of a started visit. The SSN typed on the representative page is kept in memory only, unless the test leaves it out. */
async function renderPage(subPage: string, sensitiveAnswers: Record<string, string> = {ssn: SSN}): Promise<RenderResult> {
    await Onyx.multiSet({
        [ONYXKEYS.BETAS]: [CONST.BETAS.WISE_REIMBURSEMENTS],
        [ONYXKEYS.BANK_ACCOUNT_LIST]: {[BANK_ACCOUNT_ID]: ELIGIBLE_BANK_ACCOUNT},
        [ONYXKEYS.IS_LOADING_PAYMENT_METHODS]: false,
        [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {achData: {bankAccountID: BANK_ACCOUNT_ID, companyName: 'Boulder Development Inc.'}},
        [ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT]: COMPLETE_DRAFT,
        [ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS]: {[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]: sensitiveAnswers},
    });
    return mountPage(subPage);
}

// The tests spy on several API methods, which this rule counts as API calls
/* eslint-disable rulesdir/no-multiple-api-calls */
describe('WiseBusinessOnboardingPage offline', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        setHasRadio(true);
        await Onyx.clear();
    });

    it.each([
        [CONST.WISE.ONBOARDING_STEP.REPRESENTATIVE, 'makeRequestWithSideEffects'],
        [CONST.WISE.ONBOARDING_STEP.BUSINESS, 'write'],
    ] as const)('saves the %s page online when the user presses Next', async (subPage, saveMethod) => {
        // Given an online device on an intake page whose answers are complete
        const saveSpy = jest.spyOn(API, saveMethod).mockImplementation(() => Promise.resolve());
        await renderPage(subPage);

        // When the user presses Next
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then the page is saved to Wise, the SSN page outside the queue, which shows that only the connection keeps the offline save from going out
        expect(saveSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({step: subPage}), expect.anything());
    });

    it.each([CONST.WISE.ONBOARDING_STEP.REPRESENTATIVE, CONST.WISE.ONBOARDING_STEP.BUSINESS])('disables Next offline on the %s page and saves nothing', async (subPage) => {
        // Given an offline device on an intake page, which is saved to Wise as the user leaves it
        const writeSpy = jest.spyOn(API, 'write');
        const sideEffectSpy = jest.spyOn(API, 'makeRequestWithSideEffects');
        setHasRadio(false);
        await renderPage(subPage);

        // When the user presses Next
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then Next is disabled and no save goes out, so no page waits in the queue and an SSN never fails for want of a connection
        expect(screen.getByRole('button', {name: 'common.next'})).toBeDisabled();
        expect(writeSpy).not.toHaveBeenCalled();
        expect(sideEffectSpy).not.toHaveBeenCalled();
    });

    it('keeps an SSN typed offline out of everything a refresh keeps', async () => {
        // Given an offline device on the representative page of a started visit, with no SSN typed yet
        setHasRadio(false);
        const {unmount} = await renderPage(CONST.WISE.ONBOARDING_STEP.REPRESENTATIVE, {});

        // When the user types an SSN and presses Next, which waits for a connection
        fireEvent.changeText(screen.getByLabelText(SSN_LABEL), SSN);
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByLabelText(SSN_LABEL)).toHaveDisplayValue(SSN);

        // Then the SSN is not in the draft or the request queue, which are written to disk, and not even in the memory-only answers, since the page never submitted
        const draft = await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT);
        const persistedRequests = await getOnyxValue(ONYXKEYS.PERSISTED_REQUESTS);
        const sensitiveAnswers = await getOnyxValue(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS);
        expect(draft).not.toHaveProperty('ssn');
        expect(JSON.stringify(persistedRequests ?? [])).not.toContain(SSN);
        expect(sensitiveAnswers?.[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]).not.toHaveProperty('ssn');

        // When the app is refreshed, which drops what is held in memory, and opens on the same page
        unmount();
        await Onyx.set(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, null);
        await mountPage(CONST.WISE.ONBOARDING_STEP.REPRESENTATIVE);

        // Then the SSN field starts empty
        expect(screen.getByLabelText(SSN_LABEL)).toHaveDisplayValue('');
    });
});

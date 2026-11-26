import {act, fireEvent, render, screen} from '@testing-library/react-native';
import type {RenderResult} from '@testing-library/react-native';

import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {toSavedFile} from '@libs/getWiseOnboardingPageParams';
import Log from '@libs/Log';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as NetworkState from '@libs/NetworkState';
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

/** Each modal the page opens, with a way to answer it as the user would. A modal nobody answers stays open. */
const mockShownModals: Array<{title: unknown; answer: (action: ModalStateChangePayload['action']) => void}> = [];
jest.mock('@hooks/useDecisionModal', () =>
    jest.fn(() => ({
        showDecisionModal: (options: {title: unknown}) =>
            new Promise<ModalStateChangePayload>((resolve) => {
                mockShownModals.push({title: options.title, answer: (action) => resolve({action})});
            }),
    })),
);
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
    companyRole: CONST.WISE.COMPANY_ROLE.OWNER,
    industryCategories: [CONST.WISE.INDUSTRY_CATEGORIES[0]],
    description: 'We sell bikes',
};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const SSN = '123456789';

const INTRO_PATH = 'settings/wallet/global-reimbursements/1';

/** Form.submit ignores a second press within this many ms, so a retry in a test waits it out as a user reading the modal does */
const SUBMIT_DEBOUNCE_MS = 1100;

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
        mockShownModals.length = 0;
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

    it.each([CONST.WISE.ONBOARDING_STEP.REPRESENTATIVE, CONST.WISE.ONBOARDING_STEP.BUSINESS])(
        'keeps Next enabled offline on the %s page, explains the connection and saves nothing',
        async (subPage) => {
            // Given an offline device on an intake page, which is saved to Wise as the user leaves it
            const writeSpy = jest.spyOn(API, 'write');
            const sideEffectSpy = jest.spyOn(API, 'makeRequestWithSideEffects');
            setHasRadio(false);
            await renderPage(subPage);

            // When the user presses Next
            fireEvent.press(screen.getByText('common.next'));
            await waitForBatchedUpdatesWithAct();

            // Then Next stays enabled and opens the modal that says the form needs a connection, and no save goes out, so no page waits in the queue
            expect(screen.getByRole('button', {name: 'common.next'})).toBeEnabled();
            expect(mockShownModals.map((modal) => modal.title)).toEqual(['dynamicForm.continueOffline.title']);
            expect(writeSpy).not.toHaveBeenCalled();
            expect(sideEffectSpy).not.toHaveBeenCalled();
        },
    );

    it('checks the page before opening the modal offline, so an unfinished page marks its fields right away', async () => {
        // Given an offline device on the representative page with no SSN typed, which fails the page's checks
        setHasRadio(false);
        await renderPage(CONST.WISE.ONBOARDING_STEP.REPRESENTATIVE, {});

        // When the user presses Next
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then only the missing SSN is marked, since the rest of the draft is complete, and no modal opens, since the checks need no connection and the user
        // would otherwise meet them only once back online
        expect(mockShownModals).toHaveLength(0);
        expect(screen.getAllByText('common.error.fieldRequired')).toHaveLength(1);
        expect(screen.getByLabelText(SSN_LABEL)).toHaveDisplayValue('');
    });

    it('opens the modal offline once the user fixes the page', async () => {
        // Given an offline device on the representative page whose Next marked the missing SSN
        const sideEffectSpy = jest.spyOn(API, 'makeRequestWithSideEffects');
        setHasRadio(false);
        await renderPage(CONST.WISE.ONBOARDING_STEP.REPRESENTATIVE, {});
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();
        await new Promise((resolve) => {
            setTimeout(resolve, SUBMIT_DEBOUNCE_MS);
        });

        // When the user types the SSN and presses Next again
        fireEvent.changeText(screen.getByLabelText(SSN_LABEL), SSN);
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then the error is gone and the modal opens, since only the connection stops the user now, and nothing is saved
        expect(screen.queryByText('common.error.fieldRequired')).not.toBeOnTheScreen();
        expect(mockShownModals.map((modal) => modal.title)).toEqual(['dynamicForm.continueOffline.title']);
        expect(sideEffectSpy).not.toHaveBeenCalled();
    });

    it('leaves the flow with the answers kept when the user picks to fill the form out later', async () => {
        // Given an offline device on the business page, whose Next opened the offline modal
        const goBackSpy = jest.spyOn(Navigation, 'goBack');
        setHasRadio(false);
        await renderPage(CONST.WISE.ONBOARDING_STEP.BUSINESS);
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // When the user picks Save and fill out later
        mockShownModals.at(0)?.answer(ModalActions.CONFIRM);
        await waitForBatchedUpdatesWithAct();

        // Then the flow closes to the intro as Back from the first page does, the draft still holds the answers for the next visit,
        // and the business page is marked unsaved, since Wise never got it, so the next visit opens on it instead of skipping it
        expect(goBackSpy).toHaveBeenCalledWith(INTRO_PATH);
        const draft = await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT);
        expect(draft).toEqual(expect.objectContaining({companyName: COMPLETE_DRAFT.companyName}));
        expect(await getOnyxValue(ONYXKEYS.WISE_ONBOARDING_UNSAVED_PAGES)).toEqual({leftOffline: {[CONST.WISE.ONBOARDING_STEP.BUSINESS]: true}});
    });

    it('asks again when Try again finds the device still offline', async () => {
        // Given an offline device on the business page, whose Next opened the offline modal
        const writeSpy = jest.spyOn(API, 'write');
        setHasRadio(false);
        await renderPage(CONST.WISE.ONBOARDING_STEP.BUSINESS);
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // When the user presses Try again while the connection is still down
        mockShownModals.at(0)?.answer(ModalActions.CLOSE);
        await waitForBatchedUpdatesWithAct();

        // Then the modal opens again and nothing is saved
        expect(mockShownModals).toHaveLength(2);
        expect(writeSpy).not.toHaveBeenCalled();
    });

    it('saves the page when Try again finds the connection back', async () => {
        // Given an offline device on the business page, whose Next opened the offline modal
        const writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
        setHasRadio(false);
        await renderPage(CONST.WISE.ONBOARDING_STEP.BUSINESS);
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();
        await new Promise((resolve) => {
            setTimeout(resolve, SUBMIT_DEBOUNCE_MS);
        });

        // When the connection returns and the user presses Try again
        act(() => setHasRadio(true));
        mockShownModals.at(0)?.answer(ModalActions.CLOSE);
        await waitForBatchedUpdatesWithAct();

        // Then Next goes through as it does online, so the page is saved to Wise, and no second modal opens
        expect(writeSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({step: CONST.WISE.ONBOARDING_STEP.BUSINESS}), expect.anything());
        expect(mockShownModals).toHaveLength(1);
    });

    it('opens no second modal when Next is pressed while Try again checks the connection', async () => {
        // Given an offline device on the business page, whose Next opened the offline modal, and a connection check that has not answered yet
        const writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
        let answerConnectionCheck: (isOffline: boolean) => void = () => {};
        const connectionCheckSpy = jest.spyOn(NetworkState, 'refreshAndCheckIsOffline').mockImplementation(
            () =>
                new Promise<boolean>((resolve) => {
                    answerConnectionCheck = resolve;
                }),
        );
        setHasRadio(false);
        await renderPage(CONST.WISE.ONBOARDING_STEP.BUSINESS);
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();
        mockShownModals.at(0)?.answer(ModalActions.CLOSE);
        await waitForBatchedUpdatesWithAct();
        await new Promise((resolve) => {
            setTimeout(resolve, SUBMIT_DEBOUNCE_MS);
        });

        // When the user presses Next again during the check
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then no second modal opens, since a modal left open after the check goes on would act on a page that is gone
        expect(mockShownModals).toHaveLength(1);

        // When the check finds the connection back
        act(() => setHasRadio(true));
        answerConnectionCheck(false);
        await waitForBatchedUpdatesWithAct();

        // Then the page is saved once, as Try again does online, and still no second modal opens
        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(mockShownModals).toHaveLength(1);
        connectionCheckSpy.mockRestore();
    });

    it('asks again and logs why when the connection check of Try again fails', async () => {
        // Given an offline device on the business page, whose Next opened the offline modal, and a connection check that fails
        const writeSpy = jest.spyOn(API, 'write');
        const warnSpy = jest.spyOn(Log, 'warn');
        const connectionCheckSpy = jest.spyOn(NetworkState, 'refreshAndCheckIsOffline').mockRejectedValue(new Error('NetInfo unavailable'));
        setHasRadio(false);
        await renderPage(CONST.WISE.ONBOARDING_STEP.BUSINESS);
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // When the user presses Try again
        mockShownModals.at(0)?.answer(ModalActions.CLOSE);
        await waitForBatchedUpdatesWithAct();

        // Then the failed check counts as still offline, so the modal opens again and nothing is saved, and the failure is logged, since the user only sees the modal
        expect(mockShownModals).toHaveLength(2);
        expect(writeSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith('[DynamicForm] The connection check of Try again failed', {error: 'NetInfo unavailable'});
        connectionCheckSpy.mockRestore();
        warnSpy.mockRestore();
    });

    it('keeps an SSN typed offline out of everything a refresh keeps', async () => {
        // Given an offline device on the representative page of a started visit, with no SSN typed yet
        setHasRadio(false);
        const {unmount} = await renderPage(CONST.WISE.ONBOARDING_STEP.REPRESENTATIVE, {});

        // When the user types an SSN and presses Next, which opens the offline modal instead of saving
        fireEvent.changeText(screen.getByLabelText(SSN_LABEL), SSN);
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();
        expect(mockShownModals).toHaveLength(1);
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

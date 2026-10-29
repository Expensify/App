import {act, render, screen} from '@testing-library/react-native';

import type {DynamicFormFlowProps} from '@components/DynamicForm/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';

import type {WiseBusinessAccountData} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseBusinessOnboardingPrefill';
import {toSavedFile} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseOnboardingPageParams';
import WiseBusinessOnboardingPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseBusinessOnboardingPage';

import {openReimbursementAccountPage} from '@userActions/BankAccounts';
import {saveDraftAnswers} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {WiseBusinessOnboardingForm} from '@src/types/form';
import type {BankAccount, PrivatePersonalDetails} from '@src/types/onyx';

import type ReactNative from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const FLOW_TEST_ID = 'DynamicFormFlow';
const LOADER_TEST_ID = 'FullScreenLoadingIndicator';
const NOT_FOUND_TEST_ID = 'NotFoundPage';
const BANK_ACCOUNT_ID = 1;

const mockFlowMount = jest.fn();
const mockFlowProps = jest.fn<void, [DynamicFormFlowProps]>();

jest.mock('@components/DynamicForm', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    function MockDynamicFormFlow(props: DynamicFormFlowProps) {
        mockFlowProps(props);
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
jest.mock('@userActions/DynamicForm', () => ({...jest.requireActual<Record<string, unknown>>('@userActions/DynamicForm'), saveDraftAnswers: jest.fn()}));
jest.mock('@userActions/BankAccounts', () => ({hideBankAccountErrors: jest.fn(), openReimbursementAccountPage: jest.fn()}));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/1'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const ELIGIBLE_BANK_ACCOUNT: BankAccount = {
    bankCurrency: CONST.CURRENCY.USD,
    bankCountry: CONST.COUNTRY.US,
    accountData: {bankAccountID: BANK_ACCOUNT_ID, type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, addressName: 'Main checking'},
};

/** The part of the reimbursement account the page reads */
type BusinessReimbursementAccount = {achData: WiseBusinessAccountData; wiseOnboardingFailedPages?: Record<string, boolean>};

const REIMBURSEMENT_ACCOUNT: BusinessReimbursementAccount = {
    achData: {
        bankAccountID: BANK_ACCOUNT_ID,
        companyName: 'Boulder Development Inc.',
        incorporationType: CONST.INCORPORATION_TYPES.CORPORATION,
    },
};

const PRIVATE_PERSONAL_DETAILS: PrivatePersonalDetails = {
    legalFirstName: 'Alice',
    legalLastName: 'Nguyen',
    dob: '1985-04-12',
    addresses: [{street: '42 Oak Ave', city: 'Austin', state: 'TX', zip: '78704', country: CONST.COUNTRY.US, current: true}],
};

const {saveDraftAnswers: saveDraftAnswersToOnyx} = jest.requireActual<{saveDraftAnswers: typeof saveDraftAnswers}>('@userActions/DynamicForm');

function readDraft() {
    return new Promise<OnyxEntry<WiseBusinessOnboardingForm>>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

type RenderOptions = {
    bankAccount?: BankAccount;

    /** What the reimbursement account holds when the page opens */
    reimbursementAccount?: BusinessReimbursementAccount;

    /** What the page's read of the reimbursement account returns */
    readResponse?: BusinessReimbursementAccount;

    /** The read never returns, as while the request is in flight */
    shouldLeaveReadRunning?: boolean;

    subPage?: string;
};

async function renderPage({bankAccount = ELIGIBLE_BANK_ACCOUNT, reimbursementAccount, readResponse = REIMBURSEMENT_ACCOUNT, shouldLeaveReadRunning = false, subPage}: RenderOptions = {}) {
    await Onyx.multiSet({
        [ONYXKEYS.BETAS]: [CONST.BETAS.WISE_REIMBURSEMENTS],
        [ONYXKEYS.BANK_ACCOUNT_LIST]: {[BANK_ACCOUNT_ID]: bankAccount},
        [ONYXKEYS.IS_LOADING_PAYMENT_METHODS]: false,
        [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: PRIVATE_PERSONAL_DETAILS,
        ...(reimbursementAccount ? {[ONYXKEYS.REIMBURSEMENT_ACCOUNT]: reimbursementAccount} : {}),
    });
    render(
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
    if (shouldLeaveReadRunning || !jest.mocked(openReimbursementAccountPage).mock.calls.length) {
        return;
    }

    // The read sets the loading flag right away and clears it with the server's answer
    await act(() => Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true}));
    await waitForBatchedUpdatesWithAct();
    await act(() => Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {...readResponse, isLoading: false}));
    await waitForBatchedUpdatesWithAct();
}

describe('WiseBusinessOnboardingPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(saveDraftAnswers).mockImplementation(saveDraftAnswersToOnyx);
        setHasRadio(true);
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

    it('reads the bank account details when the visit opens and waits for them before the prefill', async () => {
        // Given a reimbursement account that holds nothing yet

        // When the visit opens without a page and the read has not returned
        await renderPage({shouldLeaveReadRunning: true});

        // Then the page reads this bank account and keeps the loader, since the read-only rows come from the answer
        expect(openReimbursementAccountPage).toHaveBeenCalledWith({bankAccountID: BANK_ACCOUNT_ID});
        expect(screen.getByTestId(LOADER_TEST_ID)).toBeOnTheScreen();
        expect(saveDraftAnswers).not.toHaveBeenCalled();

        // When the read starts and returns the bank account details
        await act(() => Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true}));
        await waitForBatchedUpdatesWithAct();
        await act(() => Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {...REIMBURSEMENT_ACCOUNT, isLoading: false}));
        await waitForBatchedUpdatesWithAct();

        // Then the business rows are prefilled under the bank account's own keys, the corporation starts on its Wise company type, and the flow shows
        expect(saveDraftAnswers).toHaveBeenCalledWith(
            ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM,
            expect.objectContaining({
                companyName: 'Boulder Development Inc.',
                companyType: CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION,
            }),
        );
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
        expect(openReimbursementAccountPage).toHaveBeenCalledTimes(1);
    });

    it('does not read again when Next or Back mounts the page on one of its pages', async () => {
        // Given the details read earlier in the visit
        // When the page mounts on the business page, as Next does
        await renderPage({reimbursementAccount: REIMBURSEMENT_ACCOUNT, subPage: 'business'});

        // Then it prefills from the details on the device without another read or loader
        expect(openReimbursementAccountPage).not.toHaveBeenCalled();
        expect(saveDraftAnswers).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, expect.objectContaining({companyName: 'Boulder Development Inc.'}));
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('opens the flow offline from the details on the device instead of waiting for a read', async () => {
        // Given an offline device, where a read is not sent until the connection returns
        setHasRadio(false);

        // When the visit opens with the bank account details already on the device
        await renderPage({reimbursementAccount: REIMBURSEMENT_ACCOUNT});

        // Then the flow shows with those details, and no read keeps the loader up
        expect(openReimbursementAccountPage).not.toHaveBeenCalled();
        expect(saveDraftAnswers).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, expect.objectContaining({companyName: 'Boulder Development Inc.'}));
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('stops waiting for the read when the device goes offline, so the loader does not stay', async () => {
        // Given the details of this bank account already on the device, and a read that has started but not returned
        await renderPage({reimbursementAccount: REIMBURSEMENT_ACCOUNT, shouldLeaveReadRunning: true});
        await act(() => Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true}));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId(LOADER_TEST_ID)).toBeOnTheScreen();

        // When the device goes offline, which holds the read until the connection returns
        act(() => setHasRadio(false));
        await waitForBatchedUpdatesWithAct();

        // Then the flow opens from the details on the device
        expect(saveDraftAnswers).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, expect.objectContaining({companyName: 'Boulder Development Inc.'}));
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('leaves the read-only rows empty when the details on the device belong to another bank account', async () => {
        // Given a reimbursement account whose details the read leaves on another bank account, as for an admin who shares this account but does not own it
        const otherAccount: BusinessReimbursementAccount = {achData: {...REIMBURSEMENT_ACCOUNT.achData, bankAccountID: 2}};

        // When the visit opens and the read returns
        await renderPage({readResponse: otherAccount});

        // Then no detail of the other account reaches the draft, and the flow still opens
        const prefill = jest.mocked(saveDraftAnswers).mock.lastCall?.[1];
        expect(prefill).toMatchObject({bankAccountID: String(BANK_ACCOUNT_ID)});
        expect(prefill).not.toHaveProperty('companyName');
        expect(prefill).not.toHaveProperty('companyType');
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('starts the draft over when it was started for another bank account', async () => {
        // Given a draft with answers the user gave for another bank account, and a sensitive answer and a failed page save from that visit
        await Onyx.multiSet({
            [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {wiseOnboardingFailedPages: {representative: true}},
            [ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT]: {
                bankAccountID: '2',
                companyName: 'Other Business LLC',
                companyType: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY,
                companyRole: 'OWNER',
                description: 'Sells furniture',
            },
            [ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS]: {[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]: {ssnLast4: '1234'}},
        });

        // When the visit opens for this bank account
        await renderPage();

        // Then the draft holds only this account's prefill, since the other business's answers do not apply to this one
        const draft = await readDraft();
        expect(draft).toMatchObject({
            bankAccountID: String(BANK_ACCOUNT_ID),
            companyName: 'Boulder Development Inc.',
            companyType: CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION,
        });
        expect(draft).not.toHaveProperty('companyRole');
        expect(draft).not.toHaveProperty('description');
        const sensitiveAnswers = await new Promise<OnyxEntry<Record<string, unknown>>>((resolve) => {
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });
        expect(sensitiveAnswers?.[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]).toBeFalsy();
        const reimbursementAccount = await new Promise<OnyxEntry<Record<string, unknown>>>((resolve) => {
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });
        expect(reimbursementAccount?.wiseOnboardingFailedPages).toBeFalsy();
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('keeps the draft started for this bank account', async () => {
        // Given a draft the user started for this bank account
        await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {bankAccountID: String(BANK_ACCOUNT_ID), companyRole: 'OWNER'});

        // When the visit opens again
        await renderPage();

        // Then the user's answer stays next to the prefill
        expect(await readDraft()).toMatchObject({bankAccountID: String(BANK_ACCOUNT_ID), companyRole: 'OWNER', companyName: 'Boulder Development Inc.'});
        expect(screen.getByTestId(FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('shows not found for a bank account that cannot use global reimbursements', async () => {
        // Given a business account in euros, which Wise reimbursements do not cover
        const euroBankAccount: BankAccount = {...ELIGIBLE_BANK_ACCOUNT, bankCurrency: CONST.CURRENCY.EUR};

        // When the page opens for it
        await renderPage({bankAccount: euroBankAccount});

        // Then the user sees not found instead of the form
        expect(screen.getByTestId(NOT_FOUND_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(FLOW_TEST_ID)).not.toBeOnTheScreen();
    });

    it('puts the saved file keys in the draft once a page save returns them', async () => {
        // Given an open flow whose draft holds an ID document picked on this device and sent with a page save
        await renderPage();
        act(() => saveDraftAnswersToOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {idDocument: [{name: 'passport.jpg', uri: 'file://passport.jpg'}]}));
        await act(() => Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isSavingWiseOnboardingPage: true}));
        await waitForBatchedUpdatesWithAct();

        // When the save returns the key the server stored the file under
        await act(() =>
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
                isSavingWiseOnboardingPage: false,
                achData: {wise: {documents: {representative: {idDocument: ['kyc/1/passport.jpg']}}}},
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Then the draft holds the saved file, so saving the page again lists its key instead of uploading the file again
        expect((await readDraft())?.idDocument).toEqual([toSavedFile('kyc/1/passport.jpg')]);
    });

    it('keeps the user on the confirmation page while a page that failed to save has not saved since', async () => {
        // Given the representative page failed to save, and the business page saved after it, which cleared the shared error
        await renderPage({reimbursementAccount: {...REIMBURSEMENT_ACCOUNT, wiseOnboardingFailedPages: {representative: true}}});
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        // When the user taps Confirm
        const flowProps = mockFlowProps.mock.lastCall?.[0];
        act(() => flowProps?.onSubmit({}));

        // Then they stay on the confirmation page with an error, since Wise does not have the representative details yet
        expect(navigateSpy).not.toHaveBeenCalled();
        expect(flowProps?.submitError).toBe('common.genericErrorMessage');
    });
});

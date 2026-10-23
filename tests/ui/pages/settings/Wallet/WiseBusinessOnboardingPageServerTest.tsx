import {act, render} from '@testing-library/react-native';

import DynamicFormFlow from '@components/DynamicForm';
import type {DynamicFormFlowProps} from '@components/DynamicForm/types';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';

import useNetwork from '@hooks/useNetwork';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import WiseBusinessOnboardingPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseBusinessOnboardingPage';

import {openReimbursementAccountPage} from '@userActions/BankAccounts';
import {updateWiseOnboardingAdditionalData} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {DynamicFormPage} from '@src/types/onyx';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../../utils/createMock';
import getOnyxValue from '../../../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const INTRO_PATH = `settings/wallet/global-reimbursements/${BANK_ACCOUNT_ID}`;
const ERROR_KEY = 1;
const ZIP_CODE_KEY = getAddressInputKeys('address').zipCode;

jest.mock('@components/DynamicForm', () => jest.fn(() => null));
jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@userActions/BankAccounts', () => ({openReimbursementAccountPage: jest.fn()}));
jest.mock('@userActions/Wise', () => ({updateWiseOnboardingAdditionalData: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@hooks/useDynamicBackPath', () => () => 'settings/wallet/global-reimbursements/9053192');
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabledOrUnknown: () => true}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@react-navigation/native', () => ({...jest.requireActual<Record<string, unknown>>('@react-navigation/native'), useIsFocused: jest.fn(() => true)}));

type PageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING>;

const BANK_ACCOUNT = {
    bankCurrency: CONST.CURRENCY.USD,
    accountData: {
        bankAccountID: BANK_ACCOUNT_ID,
        addressName: 'Boulder Development Inc.',
        state: CONST.BANK_ACCOUNT.STATE.OPEN,
        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
        additionalData: {currency: CONST.CURRENCY.USD, country: CONST.COUNTRY.US},
    },
};

const SAVED_BUSINESS = {
    companyType: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY,
    companyRole: CONST.WISE.COMPANY_ROLE.DIRECTOR,
    industryCategories: [],
    description: 'Saved on another device',
};

function getPage(subPage?: string) {
    return (
        <WiseBusinessOnboardingPage
            route={createMock<PageProps['route']>({params: {bankAccountID: String(BANK_ACCOUNT_ID), subPage}})}
            navigation={createMock<PageProps['navigation']>({})}
        />
    );
}

function renderPage(subPage?: string) {
    return render(getPage(subPage));
}

/** The props of the last flow rendered, or undefined while the page shows its loader */
function getFlowProps(): DynamicFormFlowProps | undefined {
    return jest.mocked(DynamicFormFlow).mock.calls.at(-1)?.[0];
}

/** The read the page makes on mount: loading at once, then the server's reimbursement account */
function answerReadWith(achData: Partial<ACHDataReimbursementAccount>) {
    jest.mocked(openReimbursementAccountPage).mockImplementation(() => {
        Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true});
    });
    return () => Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: false, achData});
}

/** Onyx notifies the page as it writes, so the write and its renders run inside act */
async function applyInAct(update: () => Promise<void>) {
    await act(async () => {
        await update();
        await waitForBatchedUpdates();
    });
}

describe('WiseBusinessOnboardingPage with the server', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        jest.mocked(useIsFocused).mockReturnValue(true);
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: BANK_ACCOUNT});
        await Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, false);
        await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {legalFirstName: 'Alice'});
    });

    it('waits for the saved answers, then fills the draft with them before the flow renders', async () => {
        // Given a draft from this device that the server has newer business answers for
        await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {companyRole: CONST.WISE.COMPANY_ROLE.OWNER, description: 'Typed earlier'});
        const finishRead = answerReadWith({bankAccountID: BANK_ACCOUNT_ID, wise: {step: 'business', business: SAVED_BUSINESS}});

        // When the page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it reads the account by its ID and holds the flow back while the read runs
        expect(openReimbursementAccountPage).toHaveBeenCalledWith({bankAccountID: BANK_ACCOUNT_ID});
        expect(DynamicFormFlow).not.toHaveBeenCalled();

        // When the server answers
        await applyInAct(finishRead);

        // Then the flow starts from what the server saved, since it may come from another device, and the prefill fills what neither had
        expect(getFlowProps()).toBeDefined();
        expect(await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT)).toMatchObject({
            companyRole: CONST.WISE.COMPANY_ROLE.DIRECTOR,
            industryCategories: [],
            description: 'Saved on another device',
            firstName: 'Alice',
        });
    });

    it("keeps the draft when the reimbursement account holds another bank account's answers", async () => {
        // Given a draft, and a server answer for a different bank account
        await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {description: 'Typed earlier'});
        const finishRead = answerReadWith({bankAccountID: 1, wise: {step: 'business', business: SAVED_BUSINESS}});

        // When the page opens and the read returns
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await applyInAct(finishRead);

        // Then the draft keeps the user's answer, since those answers belong to the other account
        expect(getFlowProps()).toBeDefined();
        expect(await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT)).toMatchObject({description: 'Typed earlier'});
    });

    it('opens from the draft offline, where the saved answers can be older than its queued page saves', async () => {
        // Given an offline device whose reimbursement account holds older answers for this bank account
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});
        await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {description: 'Saved offline'});
        await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {bankAccountID: BANK_ACCOUNT_ID, wise: {step: 'business', business: SAVED_BUSINESS}}});

        // When the page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the flow opens without a read, from the draft
        expect(openReimbursementAccountPage).not.toHaveBeenCalled();
        expect(getFlowProps()).toBeDefined();
        expect(await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT)).toMatchObject({description: 'Saved offline'});
    });

    it('opens from the draft when the connection drops before the read returns', async () => {
        // Given a read that never returns
        await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {description: 'Typed earlier'});
        answerReadWith({bankAccountID: BANK_ACCOUNT_ID, wise: {step: 'business', business: SAVED_BUSINESS}});
        const {rerender} = renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(DynamicFormFlow).not.toHaveBeenCalled();

        // When the device goes offline
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});
        rerender(getPage());
        await waitForBatchedUpdatesWithAct();

        // Then the loader is not left up forever, and the flow opens from the draft
        expect(getFlowProps()).toBeDefined();
        expect(await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT)).toMatchObject({description: 'Typed earlier'});
    });

    it('does not read the server again when the connection comes back on the first page', async () => {
        // Given a visit that opened offline, so its flow started from the draft
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});
        const {rerender} = renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(getFlowProps()).toBeDefined();

        // When the connection comes back while the first page, which the redirect to it keeps mounted, is still open
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        rerender(getPage());
        await waitForBatchedUpdatesWithAct();

        // Then no read is made, since its answers could no longer reach the open page
        expect(openReimbursementAccountPage).not.toHaveBeenCalled();
    });

    it('does not read the server again on a page change, which mounts the page again', async () => {
        // Given the server holding answers that differ from the draft
        await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {description: 'Typed on the business page'});
        await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {bankAccountID: BANK_ACCOUNT_ID, wise: {step: 'representative', business: SAVED_BUSINESS}}});

        // When the flow moves to the business page
        renderPage('business');
        await waitForBatchedUpdatesWithAct();

        // Then the flow shows at once, and what the user typed in this visit stays
        expect(openReimbursementAccountPage).not.toHaveBeenCalled();
        expect(getFlowProps()).toBeDefined();
        expect(await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT)).toMatchObject({description: 'Typed on the business page'});
    });

    it('saves each page on the server with the bank account when the user leaves it with Next', async () => {
        // Given the flow open after the read
        const finishRead = answerReadWith({bankAccountID: BANK_ACCOUNT_ID});
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await applyInAct(finishRead);

        // When the flow reports a finished page
        const page: DynamicFormPage = {key: 'business', content: []};
        getFlowProps()?.onPageSubmit?.(page, {companyRole: CONST.WISE.COMPANY_ROLE.OWNER});

        // Then that page is saved for this bank account
        expect(updateWiseOnboardingAdditionalData).toHaveBeenCalledWith(BANK_ACCOUNT_ID, page, {companyRole: CONST.WISE.COMPANY_ROLE.OWNER});
    });

    it("drops an earlier visit's failed save and keeps the server's field errors", async () => {
        // Given a save that failed in an earlier visit, next to a field error from the server
        await Onyx.merge(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {errors: {[ERROR_KEY]: 'Something went wrong'}, errorFields: {companyRole: {[ERROR_KEY]: 'Invalid role'}}});

        // When the page opens again
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the general error is gone, so it does not block Next on a page that did not fail, and the field error is left for its page
        const form = await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        expect(form?.errors).toBeUndefined();
        expect(form?.errorFields?.companyRole).toEqual({[ERROR_KEY]: 'Invalid role'});
    });

    it('takes the user back to the page whose answers the server rejected', async () => {
        // Given the flow open on the business page
        renderPage('business');
        await waitForBatchedUpdatesWithAct();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the save of the representative page comes back with an error on the address
        await applyInAct(() => Onyx.merge(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {errorFields: {[ZIP_CODE_KEY]: {[ERROR_KEY]: 'Invalid ZIP'}}}));

        // Then the flow replaces the business page with the representative page, where the error shows under the field
        expect(Navigation.navigate).toHaveBeenCalledWith(`${INTRO_PATH}/business-onboarding/representative`, {forceReplace: true});
    });

    it('stays put while another screen, such as the terms page, is on top', async () => {
        // Given the business page under another screen
        jest.mocked(useIsFocused).mockReturnValue(false);
        renderPage('business');
        await waitForBatchedUpdatesWithAct();

        // When a field error for the representative page arrives
        await applyInAct(() => Onyx.merge(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {errorFields: {[ZIP_CODE_KEY]: {[ERROR_KEY]: 'Invalid ZIP'}}}));

        // Then the page does not navigate under the screen on top, which handles the error itself
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('waits for the read before it goes to the page with a rejected answer', async () => {
        // Given a read still running
        const finishRead = answerReadWith({bankAccountID: BANK_ACCOUNT_ID});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a field error arrives before the read returns
        await applyInAct(() => Onyx.merge(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {errorFields: {description: {[ERROR_KEY]: 'Too short'}}}));

        // Then nothing navigates while the loader is up, since the draft is not filled yet
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the read returns
        await applyInAct(finishRead);

        // Then the flow opens the business page, which holds the rejected answer
        expect(Navigation.navigate).toHaveBeenCalledWith(`${INTRO_PATH}/business-onboarding/business`, {forceReplace: true});
    });
});

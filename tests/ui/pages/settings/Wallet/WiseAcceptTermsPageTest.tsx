import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import WiseAcceptTermsPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseAcceptTermsPage';

import {submitWiseBusinessOnboarding} from '@userActions/Wise';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../../utils/createMock';
import * as TestHelper from '../../../../utils/TestHelper';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const mockTranslate = TestHelper.translateLocal;

// The real useFocusEffect throws outside a navigator
jest.mock('@react-navigation/native', () => ({...jest.requireActual<Record<string, unknown>>('@react-navigation/native'), useFocusEffect: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({dismissModal: jest.fn(), goBack: jest.fn()}));
jest.mock('@userActions/Wise', () => ({submitWiseBusinessOnboarding: jest.fn()}));
jest.mock('@hooks/useDynamicBackPath', () => () => 'settings/wallet/global-reimbursements/1/business-onboarding/confirm');
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabledOrUnknown: () => true}));
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@components/ScreenWrapper', () => {
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: ({children}: {children: React.ReactNode}) => <reactNative.View>{children}</reactNative.View>};
});
jest.mock('@components/Header', () => {
    const Header = ({children}: {children: React.ReactNode}) => children;
    Header.BackButton = () => null;
    Header.Title = () => null;
    return {__esModule: true, default: Header};
});
jest.mock('@components/RenderHTML', () => ({__esModule: true, default: () => null}));
jest.mock('@components/CheckboxWithLabel', () => {
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({accessibilityLabel, isChecked, onInputChange}: {accessibilityLabel: string; isChecked: boolean; onInputChange: (isChecked: boolean) => void}) => (
            <reactNative.Pressable
                accessibilityLabel={accessibilityLabel}
                onPress={() => onInputChange(!isChecked)}
            />
        ),
    };
});

type PageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ACCEPT_TERMS>;

const BANK_ACCOUNT_ID = 1;
const POLICY_ID = 'ABCDEF1234567890';
const SSN = '123456789';
const ERROR_KEY = 1;
const CONFIRMATION_PATH = 'settings/wallet/global-reimbursements/1/business-onboarding/confirm';
const SERVER_ERROR = 'Wise could not create the business profile.';
const ERROR = mockTranslate('walletPage.wiseOnboarding.terms.error');
const CONFIRM = mockTranslate('common.confirm');
const TERM_LABELS = [
    mockTranslate('walletPage.wiseOnboarding.terms.certify'),
    mockTranslate('walletPage.wiseOnboarding.terms.expensifyTermsAccessibilityLabel'),
    mockTranslate('walletPage.wiseOnboarding.terms.wiseTermsAccessibilityLabel'),
];

async function renderPage(policyID?: string) {
    render(
        <WiseAcceptTermsPage
            route={createMock<PageProps['route']>({params: {bankAccountID: String(BANK_ACCOUNT_ID), policyID}})}
            navigation={createMock<PageProps['navigation']>({})}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

function pressConfirm() {
    fireEvent.press(screen.getByText(CONFIRM));
}

function tickEveryBox() {
    for (const label of TERM_LABELS) {
        fireEvent.press(screen.getByLabelText(label));
    }
}

/** Onyx notifies the page as it writes, so the write and its renders run inside act */
async function applyInAct(update: () => Promise<void>) {
    await act(async () => {
        await update();
        await waitForBatchedUpdates();
    });
}

/** Confirm starts the request, whose loading reaches Onyx right after the press */
async function confirmAndStartSubmitting() {
    jest.mocked(submitWiseBusinessOnboarding).mockImplementation(() => {
        Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT, {isLoading: true, errors: null});
    });
    tickEveryBox();
    pressConfirm();
    await waitForBatchedUpdatesWithAct();
}

describe('WiseAcceptTermsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]: {ssn: SSN}});
    });

    it('keeps the page open with an error until every box is ticked, then submits with the SSN kept in memory', async () => {
        // Given the terms page with only two of the three boxes ticked
        await renderPage();
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(0) ?? ''));
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(1) ?? ''));

        // When the user presses Confirm
        pressConfirm();

        // Then the page asks for every term and submits nothing, since the doc requires all of them
        expect(screen.getByText(ERROR)).toBeOnTheScreen();
        expect(submitWiseBusinessOnboarding).not.toHaveBeenCalled();

        // When the last box is ticked and Confirm is pressed again
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(2) ?? ''));
        pressConfirm();

        // Then the button still works after the error, and the business is submitted with the SSN, the one answer the page saves did not send
        expect(submitWiseBusinessOnboarding).toHaveBeenCalledWith({bankAccountID: BANK_ACCOUNT_ID, policyID: undefined, termsAccepted: true, ssn: SSN});
    });

    it('hides the error once the user changes a box', async () => {
        // Given the error shown after Confirm with nothing ticked
        await renderPage();
        pressConfirm();
        expect(screen.getByText(ERROR)).toBeOnTheScreen();

        // When the user ticks a box
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(0) ?? ''));

        // Then the error goes away until the next Confirm
        expect(screen.queryByText(ERROR)).not.toBeOnTheScreen();
    });

    it('sends the workspace the onboarding started from', async () => {
        // Given the terms page opened from Workspace Workflows, whose policyID the route inherits
        await renderPage(POLICY_ID);
        tickEveryBox();

        // When the user confirms
        pressConfirm();

        // Then the server learns which workspace asked
        expect(submitWiseBusinessOnboarding).toHaveBeenCalledWith(expect.objectContaining({policyID: POLICY_ID}));
    });

    it('closes the flow once the submission succeeds, and not before', async () => {
        // Given a submission running after Confirm
        await renderPage();
        await confirmAndStartSubmitting();

        // When the user presses Confirm again while the request runs
        pressConfirm();

        // Then the second press sends nothing, and the flow stays open
        expect(submitWiseBusinessOnboarding).toHaveBeenCalledTimes(1);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();

        // When the request succeeds
        await applyInAct(() => Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT, {isLoading: false}));

        // Then the flow closes
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });

    it('stays open with the server error when the submission fails', async () => {
        // Given a submission running after Confirm
        await renderPage();
        await confirmAndStartSubmitting();

        // When the request fails without field errors
        await applyInAct(() => Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT, {isLoading: false, errors: {[ERROR_KEY]: SERVER_ERROR}}));

        // Then the error shows above Confirm for the user to try again, and the flow stays open
        expect(screen.getByText(SERVER_ERROR)).toBeOnTheScreen();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('goes back to the onboarding when Wise rejects an answer, so its page can show the error', async () => {
        // Given a submission running after Confirm
        await renderPage();
        await confirmAndStartSubmitting();

        // When the request fails with an error on the business description
        await applyInAct(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {errorFields: {description: {[ERROR_KEY]: 'Too vague'}}});
            await Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT, {isLoading: false, errors: {[ERROR_KEY]: SERVER_ERROR}});
        });

        // Then the page returns to the onboarding, which opens the page with the rejected answer
        expect(Navigation.goBack).toHaveBeenCalledWith(CONFIRMATION_PATH);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it.each([
        ['a key no onboarding page collects', 'registrationNumber'],
        ['the read-only legal name, which the user cannot change', 'companyName'],
    ])('stays open with the error when Wise rejects %s', async (_label, errorKey) => {
        // Given a submission running after Confirm
        await renderPage();
        await confirmAndStartSubmitting();

        // When the request fails with a field error no onboarding page lets the user fix
        await applyInAct(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {errorFields: {[errorKey]: {[ERROR_KEY]: 'Rejected'}}});
            await Onyx.merge(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT, {isLoading: false, errors: {[ERROR_KEY]: SERVER_ERROR}});
        });

        // Then the error shows above Confirm, since going back would land on a page with nothing to fix
        expect(screen.getByText(SERVER_ERROR)).toBeOnTheScreen();
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('sends the user back for the SSN when memory lost it, such as after a reload', async () => {
        // Given no SSN in memory
        await Onyx.set(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {});
        await renderPage();
        tickEveryBox();

        // When the user confirms
        pressConfirm();

        // Then nothing is submitted, and the confirmation page takes the user to the SSN
        expect(submitWiseBusinessOnboarding).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(CONFIRMATION_PATH);
    });
});

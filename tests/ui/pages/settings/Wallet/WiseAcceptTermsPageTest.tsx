import {fireEvent, render, screen} from '@testing-library/react-native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import WiseAcceptTermsPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseAcceptTermsPage';

import {clearSensitiveAnswers} from '@userActions/DynamicForm';
import {clearDraftValues, clearErrorFields} from '@userActions/FormActions';
import {clearWiseOnboardingUnsavedPages, submitWiseBusinessOnboarding} from '@userActions/WiseOnboarding';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type ReactNative from 'react-native';

import React from 'react';

import * as TestHelper from '../../../../utils/TestHelper';

const mockTranslate = TestHelper.translateLocal;

const mockOnyxValues: Record<string, unknown> = {};

const INTRO_PATH = 'settings/wallet/global-reimbursements/1';

// The real hook reads the focused route, so the path changes once the page navigates away
let mockFocusedPath = INTRO_PATH;

// The real useFocusEffect throws outside a navigator
jest.mock('@react-navigation/native', () => ({...jest.requireActual<Record<string, unknown>>('@react-navigation/native'), useFocusEffect: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@userActions/DynamicForm', () => ({clearSensitiveAnswers: jest.fn()}));
jest.mock('@userActions/FormActions', () => ({clearDraftValues: jest.fn(), clearErrorFields: jest.fn()}));
jest.mock('@userActions/BankAccounts', () => ({hideBankAccountErrors: jest.fn()}));
jest.mock('@userActions/WiseOnboarding', () => ({
    submitWiseBusinessOnboarding: jest.fn(),
    clearWiseBusinessOnboardingSubmission: jest.fn(),
    clearWiseOnboardingUnsavedPages: jest.fn(),
}));
jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = mockOnyxValues[key];
    return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
});
jest.mock('@hooks/useDynamicBackPath', () => () => mockFocusedPath);
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

const BANK_ACCOUNT_ID = 1;
const ERROR_TIMESTAMP = '1793657199501652';
const ERROR = mockTranslate('walletPage.wiseOnboarding.terms.error');
const CONFIRM = mockTranslate('common.confirm');
const TERM_LABELS = [
    mockTranslate('walletPage.wiseOnboarding.terms.certify'),
    mockTranslate('walletPage.wiseOnboarding.terms.expensifyTermsAccessibilityLabel'),
    mockTranslate('walletPage.wiseOnboarding.terms.wiseTermsAccessibilityLabel'),
];

type WiseAcceptTermsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ACCEPT_TERMS>;

// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as WiseAcceptTermsPageProps['navigation'];

function renderPage(policyID?: string) {
    const route: WiseAcceptTermsPageProps['route'] = {
        key: 'wise-accept-terms',
        name: SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ACCEPT_TERMS,
        params: {bankAccountID: String(BANK_ACCOUNT_ID), policyID},
    };
    const getPage = () => (
        <WiseAcceptTermsPage
            route={route}
            navigation={navigation}
        />
    );
    const result = render(getPage());
    return {rerender: () => result.rerender(getPage())};
}

function pressConfirm() {
    fireEvent.press(screen.getByText(CONFIRM));
}

function tickEveryBox() {
    for (const label of TERM_LABELS) {
        fireEvent.press(screen.getByLabelText(label));
    }
}

/** Plays the request's loading, as the action's Onyx data would, then its answer */
function answerSubmission(rerender: () => void, answer: Record<string, unknown>) {
    mockOnyxValues[ONYXKEYS.REIMBURSEMENT_ACCOUNT] = {isSubmittingWiseBusinessOnboarding: true};
    rerender();
    mockOnyxValues[ONYXKEYS.REIMBURSEMENT_ACCOUNT] = {isSubmittingWiseBusinessOnboarding: false, ...answer};
    rerender();
}

describe('WiseAcceptTermsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFocusedPath = INTRO_PATH;
        for (const key of Object.keys(mockOnyxValues)) {
            delete mockOnyxValues[key];
        }
    });

    it('submits the business only once every box is ticked', () => {
        // Given the terms page opened from a workspace, with two of the three boxes ticked
        renderPage('ABC123');
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(0) ?? ''));
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(1) ?? ''));

        // When the user presses Confirm
        pressConfirm();

        // Then the page asks for every term and sends nothing, since the doc requires all of them
        expect(screen.getByText(ERROR)).toBeOnTheScreen();
        expect(submitWiseBusinessOnboarding).not.toHaveBeenCalled();

        // When the last box is ticked and Confirm is pressed again
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(2) ?? ''));
        pressConfirm();

        // Then the business is submitted with both acceptances and the workspace, after the field errors of an earlier attempt are dropped
        expect(clearErrorFields).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        expect(submitWiseBusinessOnboarding).toHaveBeenCalledWith({bankAccountID: BANK_ACCOUNT_ID, policyID: 'ABC123', termsAccepted: true, mandateAccepted: true});
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('hides the error once the user changes a box', () => {
        // Given the error shown after Confirm with nothing ticked
        renderPage();
        pressConfirm();
        expect(screen.getByText(ERROR)).toBeOnTheScreen();

        // When the user ticks a box
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(0) ?? ''));

        // Then the error goes away until the next Confirm
        expect(screen.queryByText(ERROR)).not.toBeOnTheScreen();
    });

    it('drops the onboarding answers and opens the status page once Wise has the business', () => {
        // Given a submission sent from the terms page
        const {rerender} = renderPage();
        tickEveryBox();
        pressConfirm();

        // When the request succeeds
        answerSubmission(rerender, {isWiseBusinessOnboardingSubmitSuccessful: true});

        // Then the draft, the SSN in memory and the unsaved pages go, since the server holds the business now, and the status page replaces the terms
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        expect(clearSensitiveAnswers).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        expect(clearWiseOnboardingUnsavedPages).toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith('settings/wallet/global-reimbursements/1/status', {forceReplace: true});
    });

    it('opens the status page only once while the terms page is still mounted under it', () => {
        // Given a submission that succeeded and opened the status page
        const {rerender} = renderPage();
        tickEveryBox();
        pressConfirm();
        answerSubmission(rerender, {isWiseBusinessOnboardingSubmitSuccessful: true});

        // When the terms page renders again with the status page focused, as it does until the replace finishes
        mockFocusedPath = `${INTRO_PATH}/status`;
        rerender();

        // Then it does not navigate again, since the focused path is no longer the terms page and would point at a route that does not exist
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('opens the page with a rejected answer only once while the terms page is still mounted under it', () => {
        // Given a submission whose rejected answer opened the business page
        const {rerender} = renderPage();
        tickEveryBox();
        pressConfirm();
        mockOnyxValues[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM] = {errorFields: {description: {[ERROR_TIMESTAMP]: 'Too vague'}}};
        answerSubmission(rerender, {isWiseBusinessOnboardingSubmitSuccessful: false, errors: {[ERROR_TIMESTAMP]: 'Validation failed'}});

        // When the terms page renders again with the business page focused
        mockFocusedPath = `${INTRO_PATH}/business-onboarding/business`;
        rerender();

        // Then it does not navigate again, since the focused path is no longer the terms page
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('keeps the user on the terms page with the error when the submission fails', () => {
        // Given a submission sent from the terms page
        const {rerender} = renderPage();
        tickEveryBox();
        pressConfirm();

        // When the request fails with an error no page can fix
        answerSubmission(rerender, {isWiseBusinessOnboardingSubmitSuccessful: false, errors: {[ERROR_TIMESTAMP]: 'Something went wrong'}});

        // Then the error shows above Confirm and the user can try again from here
        expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('sends the user to the page that collected an answer Wise rejected', () => {
        // Given a submission sent from the terms page
        const {rerender} = renderPage();
        tickEveryBox();
        pressConfirm();

        // When Wise rejects the business description, which the business page collects
        mockOnyxValues[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM] = {errorFields: {description: {[ERROR_TIMESTAMP]: 'Too vague'}}};
        answerSubmission(rerender, {isWiseBusinessOnboardingSubmitSuccessful: false, errors: {[ERROR_TIMESTAMP]: 'Validation failed'}});

        // Then the flow goes back to the business page, where the error shows under the field
        expect(Navigation.navigate).toHaveBeenCalledWith('settings/wallet/global-reimbursements/1/business-onboarding/business', {forceReplace: true});
    });

    it('keeps an error on a read-only answer on the terms page, since no page can change it', () => {
        // Given a submission sent from the terms page
        const {rerender} = renderPage();
        tickEveryBox();
        pressConfirm();

        // When Wise rejects the legal business name, which comes from the bank account
        mockOnyxValues[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM] = {errorFields: {companyName: {[ERROR_TIMESTAMP]: 'Name mismatch'}}};
        answerSubmission(rerender, {isWiseBusinessOnboardingSubmitSuccessful: false, errors: {[ERROR_TIMESTAMP]: 'Validation failed'}});

        // Then the user stays here with the error above Confirm
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(screen.getByText('Validation failed')).toBeOnTheScreen();
    });

    it('opens the status page instead of the terms once the business is submitted', () => {
        // Given a bank account whose business is already submitted to Wise
        mockOnyxValues[ONYXKEYS.BANK_ACCOUNT_LIST] = {[BANK_ACCOUNT_ID]: {accountData: {additionalData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW}}}}};

        // When the terms page opens for it
        renderPage();

        // Then nothing is sent again, the answers left on the device go and the status page replaces the terms
        expect(submitWiseBusinessOnboarding).not.toHaveBeenCalled();
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        expect(Navigation.navigate).toHaveBeenCalledWith('settings/wallet/global-reimbursements/1/status', {forceReplace: true});
    });

    it('waits for the intro path before opening the status page from a deep link', () => {
        // Given a submitted business and a deep link that renders the page before the root state holds it, so the back path is empty
        mockOnyxValues[ONYXKEYS.BANK_ACCOUNT_LIST] = {[BANK_ACCOUNT_ID]: {accountData: {additionalData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}}}}};
        mockFocusedPath = '';
        const {rerender} = renderPage();

        // Then it does not navigate yet, since a status route built on an empty path does not exist
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the root state catches up and the back path becomes the intro
        mockFocusedPath = INTRO_PATH;
        rerender();

        // Then the status page replaces the terms over the intro
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith('settings/wallet/global-reimbursements/1/status', {forceReplace: true});
    });

    it('opens the status page only once when the server sends the submitted business after the submission succeeded', () => {
        // Given a submission that succeeded and opened the status page
        const {rerender} = renderPage();
        tickEveryBox();
        pressConfirm();
        answerSubmission(rerender, {isWiseBusinessOnboardingSubmitSuccessful: true});

        // When the bank account with Wise's status arrives while the terms page is still mounted
        mockOnyxValues[ONYXKEYS.BANK_ACCOUNT_LIST] = {[BANK_ACCOUNT_ID]: {accountData: {additionalData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}}}}};
        mockFocusedPath = `${INTRO_PATH}/status`;
        rerender();

        // Then it does not navigate again, since the status page is already open
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });
});

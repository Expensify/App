import {fireEvent, render, screen} from '@testing-library/react-native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import WiseAcceptTermsPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseAcceptTermsPage';

import {clearSensitiveAnswers} from '@userActions/DynamicForm';
import {submitWiseBusinessOnboarding} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {ReimbursementAccount} from '@src/types/onyx';

import type ReactNative from 'react-native';
import type {PartialDeep} from 'type-fest';

import React from 'react';

import createMock from '../../../../utils/createMock';
import * as TestHelper from '../../../../utils/TestHelper';

const mockTranslate = TestHelper.translateLocal;
let mockReimbursementAccount: ReimbursementAccount | undefined;

// The real useFocusEffect throws outside a navigator
jest.mock('@react-navigation/native', () => ({...jest.requireActual<Record<string, unknown>>('@react-navigation/native'), useFocusEffect: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn(), dismissModal: jest.fn()}));
jest.mock(
    '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute',
    () => (suffix: string) => `settings/wallet/global-reimbursements/1/business-onboarding/confirm/accept-terms/${suffix}`,
);
jest.mock('@userActions/DynamicForm', () => ({clearSensitiveAnswers: jest.fn()}));
jest.mock('@userActions/Wise', () => ({submitWiseBusinessOnboarding: jest.fn()}));
jest.mock('@hooks/useOnyx', () => () => [mockReimbursementAccount]);
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

type WiseAcceptTermsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ACCEPT_TERMS>;

const BANK_ACCOUNT_ID = 1;
const ERROR_KEY = 1793631091391000;
const KYC_REVIEW_ROUTE = `settings/wallet/global-reimbursements/1/business-onboarding/confirm/accept-terms/${DYNAMIC_ROUTES.WISE_KYC_REVIEW.path}`;
const ERROR = mockTranslate('walletPage.wiseOnboarding.terms.error');
const CONFIRM = mockTranslate('common.confirm');
const TERM_LABELS = [
    mockTranslate('walletPage.wiseOnboarding.terms.certify'),
    mockTranslate('walletPage.wiseOnboarding.terms.expensifyTermsAccessibilityLabel'),
    mockTranslate('walletPage.wiseOnboarding.terms.wiseTermsAccessibilityLabel'),
];

function pressConfirm() {
    fireEvent.press(screen.getByText(CONFIRM));
}

function WiseAcceptTermsPageScreen() {
    return (
        <WiseAcceptTermsPage
            route={createMock<WiseAcceptTermsPageProps['route']>({name: SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ACCEPT_TERMS, params: {bankAccountID: String(BANK_ACCOUNT_ID)}})}
            navigation={createMock<WiseAcceptTermsPageProps['navigation']>({})}
        />
    );
}

function acceptAllTerms() {
    for (const label of TERM_LABELS) {
        fireEvent.press(screen.getByLabelText(label));
    }
}

// The submit answers through reimbursementAccount: loading first, then the status or an error
function answerSubmit(rerender: (element: React.ReactElement) => void, answer: PartialDeep<ReimbursementAccount>) {
    mockReimbursementAccount = {isLoading: true};
    rerender(<WiseAcceptTermsPageScreen />);
    mockReimbursementAccount = createMock<ReimbursementAccount>({isLoading: false, ...answer});
    rerender(<WiseAcceptTermsPageScreen />);
}

describe('WiseAcceptTermsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockReimbursementAccount = undefined;
    });

    it('keeps the page open with an error until every box is ticked, then submits the business to Wise', () => {
        // Given the terms page with only two of the three boxes ticked
        render(<WiseAcceptTermsPageScreen />);
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(0) ?? ''));
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(1) ?? ''));

        // When the user presses Confirm
        pressConfirm();

        // Then the page asks for every term and stays open, since the doc requires all of them
        expect(screen.getByText(ERROR)).toBeOnTheScreen();
        expect(submitWiseBusinessOnboarding).not.toHaveBeenCalled();

        // When the last box is ticked and Confirm is pressed again
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(2) ?? ''));
        pressConfirm();

        // Then the button still works after the error, the SSN kept in memory for this page is dropped, and the business is submitted for the bank account
        expect(clearSensitiveAnswers).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        expect(submitWiseBusinessOnboarding).toHaveBeenCalledWith(BANK_ACCOUNT_ID);

        // And the page waits for Wise's answer before moving on
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('opens the KYC review when Wise needs more details', () => {
        // Given the user submitted the business
        const {rerender} = render(<WiseAcceptTermsPageScreen />);
        acceptAllTerms();
        pressConfirm();

        // When Wise answers that it needs more details
        answerSubmit(rerender, {achData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}}});

        // Then the KYC review opens on top of the terms
        expect(Navigation.navigate).toHaveBeenCalledWith(KYC_REVIEW_ROUTE);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('closes the flow when the business goes straight to review', () => {
        // Given the user submitted the business
        const {rerender} = render(<WiseAcceptTermsPageScreen />);
        acceptAllTerms();
        pressConfirm();

        // When Wise answers that the business is in review
        answerSubmit(rerender, {achData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW}}});

        // Then the flow closes, since there is no In review page yet
        expect(Navigation.dismissModal).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('shows the submit error under Confirm and stays on the page', () => {
        // Given the user submitted the business
        const {rerender} = render(<WiseAcceptTermsPageScreen />);
        acceptAllTerms();
        pressConfirm();

        // When the submit fails, while a status from an earlier submit is still on the account
        answerSubmit(rerender, {achData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}}, errors: {[ERROR_KEY]: 'Validation failed at Wise'}});

        // Then the error shows and the old status does not move the flow on
        expect(screen.getByText('Validation failed at Wise')).toBeOnTheScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('hides the error once the user changes a box', () => {
        // Given the error shown after Confirm with nothing ticked
        render(<WiseAcceptTermsPageScreen />);
        pressConfirm();
        expect(screen.getByText(ERROR)).toBeOnTheScreen();

        // When the user ticks a box
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(0) ?? ''));

        // Then the error goes away until the next Confirm
        expect(screen.queryByText(ERROR)).not.toBeOnTheScreen();
    });
});

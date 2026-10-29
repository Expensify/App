import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@navigation/Navigation';

import WiseAcceptTermsPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseAcceptTermsPage';

import {clearSensitiveAnswers} from '@userActions/DynamicForm';

import ONYXKEYS from '@src/ONYXKEYS';

import type ReactNative from 'react-native';

import React from 'react';

import * as TestHelper from '../../../../utils/TestHelper';

const mockTranslate = TestHelper.translateLocal;

// The real useFocusEffect throws outside a navigator
jest.mock('@react-navigation/native', () => ({...jest.requireActual<Record<string, unknown>>('@react-navigation/native'), useFocusEffect: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({dismissModal: jest.fn(), goBack: jest.fn()}));
jest.mock('@userActions/DynamicForm', () => ({clearSensitiveAnswers: jest.fn()}));
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

describe('WiseAcceptTermsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps the page open with an error until every box is ticked, then closes the flow', () => {
        // Given the terms page with only two of the three boxes ticked
        render(<WiseAcceptTermsPage />);
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(0) ?? ''));
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(1) ?? ''));

        // When the user presses Confirm
        pressConfirm();

        // Then the page asks for every term and stays open, since the doc requires all of them
        expect(screen.getByText(ERROR)).toBeOnTheScreen();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();

        // When the last box is ticked and Confirm is pressed again
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(2) ?? ''));
        pressConfirm();

        // Then the button still works after the error, the SSN kept in memory for this page is dropped, and the flow closes
        expect(clearSensitiveAnswers).toHaveBeenCalledWith(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });

    it('hides the error once the user changes a box', () => {
        // Given the error shown after Confirm with nothing ticked
        render(<WiseAcceptTermsPage />);
        pressConfirm();
        expect(screen.getByText(ERROR)).toBeOnTheScreen();

        // When the user ticks a box
        fireEvent.press(screen.getByLabelText(TERM_LABELS.at(0) ?? ''));

        // Then the error goes away until the next Confirm
        expect(screen.queryByText(ERROR)).not.toBeOnTheScreen();
    });
});

import type * as ReactNavigationNative from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React, {createRef} from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseTwoFactorAuthForm from '@components/TwoFactorAuthForm/BaseTwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from '@components/TwoFactorAuthForm/types';
import ToggleTwoFactorAuthForm from '@pages/settings/Security/TwoFactorAuth/ToggleTwoFactorAuthForm';
import {toggleTwoFactorAuth, validateTwoFactorAuth} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: (callback: () => void) => {
            callback();
        },
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => {
            switch (key) {
                case 'recoveryCodeForm.useRecoveryCode':
                    return 'Use recovery code';
                case 'recoveryCodeForm.use2fa':
                    return 'Use two-factor authentication code';
                case 'recoveryCodeForm.error.pleaseFillRecoveryCode':
                    return 'Please enter your recovery code';
                case 'twoFactorAuthForm.error.pleaseFillTwoFactorAuth':
                    return 'Please enter your two-factor authentication code';
                case 'twoFactorAuthForm.error.incorrect2fa':
                    return 'Incorrect two-factor authentication code. Please try again.';
                case 'twoFactorAuth.explainProcessToRemove':
                    return 'In order to disable two-factor authentication (2FA), please enter a valid code from your authentication app.';
                case 'twoFactorAuth.explainProcessToRemoveWithRecovery':
                    return 'In order to disable two-factor authentication (2FA), please enter a valid recovery code.';
                default:
                    return key;
            }
        }),
        numberFormat: jest.fn(),
    })),
);

jest.mock('@userActions/Session', () => ({
    toggleTwoFactorAuth: jest.fn(),
    validateTwoFactorAuth: jest.fn(),
}));

const mockToggleTwoFactorAuth = toggleTwoFactorAuth as jest.MockedFunction<typeof toggleTwoFactorAuth>;
const mockValidateTwoFactorAuth = validateTwoFactorAuth as jest.MockedFunction<typeof validateTwoFactorAuth>;

const RECOVERY_TOGGLE_LABEL = 'Use recovery code';
const RECOVERY_BACK_LABEL = 'Use two-factor authentication code';
const RECOVERY_ERROR_TEXT = 'Please enter your recovery code';
const TWO_FACTOR_ERROR_TEXT = 'Please enter your two-factor authentication code';
const AUTH_HELP_TEXT = 'In order to disable two-factor authentication (2FA), please enter a valid code from your authentication app.';
const RECOVERY_HELP_TEXT = 'In order to disable two-factor authentication (2FA), please enter a valid recovery code.';

const renderForm = () => {
    const formRef = createRef<BaseTwoFactorAuthFormRef>();

    render(
        <OnyxListItemProvider>
            <ToggleTwoFactorAuthForm
                ref={formRef}
                validateInsteadOfDisable={false}
                shouldAutoFocusOnMobile={false}
            />
        </OnyxListItemProvider>,
    );

    return {formRef};
};

describe('BaseTwoFactorAuthForm', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.ACCOUNT, {
            requiresTwoFactorAuth: true,
            errors: null,
            isLoading: false,
            errorFields: {},
        });
        await waitForBatchedUpdates();
    });

    it('submits the two-factor authenticator code when provided', () => {
        const {formRef} = renderForm();
        expect(screen.getByText(AUTH_HELP_TEXT)).toBeTruthy();
        const authenticatorInput = screen.getByTestId('twoFactorAuthCodeInput');

        fireEvent.changeText(authenticatorInput, '123456');
        act(() => {
            formRef.current?.validateAndSubmitForm();
        });

        expect(mockValidateTwoFactorAuth).not.toHaveBeenCalled();
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledWith(false, '123456');
    });

    it('allows submitting a recovery code after toggling inputs', async () => {
        const {formRef} = renderForm();

        fireEvent.press(screen.getByText(RECOVERY_TOGGLE_LABEL));

        const recoveryInput = await screen.findByTestId('recoveryCodeInput');
        expect(screen.getByText(RECOVERY_HELP_TEXT)).toBeTruthy();

        fireEvent.changeText(recoveryInput, 'abc12345');
        act(() => {
            formRef.current?.validateAndSubmitForm();
        });

        expect(mockToggleTwoFactorAuth).toHaveBeenLastCalledWith(false, 'abc12345');
    });

    it('validates empty authenticator codes and clears the error when switching to recovery mode', async () => {
        const {formRef} = renderForm();

        act(() => {
            formRef.current?.validateAndSubmitForm();
        });

        expect(screen.getByText(TWO_FACTOR_ERROR_TEXT)).toBeTruthy();

        fireEvent.press(screen.getByText(RECOVERY_TOGGLE_LABEL));

        await screen.findByTestId('recoveryCodeInput');
        expect(screen.queryByText(TWO_FACTOR_ERROR_TEXT)).toBeNull();
        expect(screen.getByText(RECOVERY_HELP_TEXT)).toBeTruthy();
    });

    it('shows validation feedback when recovery code is missing', async () => {
        const {formRef} = renderForm();

        fireEvent.press(screen.getByText(RECOVERY_TOGGLE_LABEL));

        await screen.findByTestId('recoveryCodeInput');

        act(() => {
            formRef.current?.validateAndSubmitForm();
        });

        await waitFor(() => {
            expect(screen.getByText(RECOVERY_ERROR_TEXT)).toBeTruthy();
        });

        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();

        // Switch back to authenticator mode to ensure toggle works in both directions.
        fireEvent.press(screen.getByText(RECOVERY_BACK_LABEL));

        expect(screen.queryByTestId('recoveryCodeInput')).toBeNull();
        expect(screen.getByTestId('twoFactorAuthCodeInput')).toBeTruthy();
        expect(screen.queryByText(RECOVERY_ERROR_TEXT)).toBeNull();
        expect(screen.getByText(AUTH_HELP_TEXT)).toBeTruthy();
    });
});

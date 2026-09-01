import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import {LoginProvider} from '@pages/signin/SignInLoginContext';

import {beginSignIn, clearAccountMessages} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigationNative from '@react-navigation/native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
    };
});

const AGENT_ERROR = "Agent accounts can't be signed into directly. To use an agent, sign in with your own account and access it via Copilot.";
const INVALID_EMAIL_ERROR = 'The email entered is invalid. Please fix the format and try again.';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => {
            switch (key) {
                case 'loginForm.error.agentSignInBlocked':
                    return AGENT_ERROR;
                case 'loginForm.error.invalidFormatEmailLogin':
                    return INVALID_EMAIL_ERROR;
                case 'loginForm.phoneOrEmail':
                    return 'Phone or email';
                case 'loginForm.loginForm':
                    return 'Login form';
                case 'common.continue':
                    return 'Continue';
                case 'common.signInWith':
                    return 'Sign in with';
                case 'common.pleaseEnterEmailOrPhoneNumber':
                    return 'Please enter an email or phone number';
                default:
                    return key;
            }
        }),
        numberFormat: jest.fn(),
    })),
);

jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: false,
        isInNarrowPaneModal: false,
    })),
);

jest.mock('@userActions/Session', () => ({
    beginSignIn: jest.fn(),
    clearAccountMessages: jest.fn(),
    clearSignInData: jest.fn(),
}));

jest.mock('@userActions/CloseAccount', () => ({
    setDefaultData: jest.fn(),
}));

// Use require to get the default export after all jest.mock calls are hoisted
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const BaseLoginForm = require('@pages/signin/LoginForm/BaseLoginForm').default;

const mockBeginSignIn = jest.mocked(beginSignIn);
const Stack = createStackNavigator();

function renderForm() {
    return render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.SIGN_IN_ROOT}>
                    {() => (
                        <LoginProvider>
                            <BaseLoginForm isVisible />
                        </LoginProvider>
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>,
    );
}

describe('BaseLoginForm', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.ACCOUNT, {
            isLoading: false,
            errors: null,
        });
        await waitForBatchedUpdates();
    });

    it('shows agent sign-in blocked error when an agent email is entered', async () => {
        renderForm();

        const input = screen.getByTestId('username');
        fireEvent.changeText(input, 'agent_123@expensify.ai');

        const continueButton = screen.getByText('Continue');
        fireEvent.press(continueButton);

        await waitFor(() => {
            expect(screen.getByText(AGENT_ERROR)).toBeTruthy();
        });
        expect(mockBeginSignIn).not.toHaveBeenCalled();
    });

    it('blocks agent email regardless of case', async () => {
        renderForm();

        const input = screen.getByTestId('username');
        fireEvent.changeText(input, 'AGENT_123@EXPENSIFY.AI');

        const continueButton = screen.getByText('Continue');
        fireEvent.press(continueButton);

        await waitFor(() => {
            expect(screen.getByText(AGENT_ERROR)).toBeTruthy();
        });
        expect(mockBeginSignIn).not.toHaveBeenCalled();
    });

    it('proceeds with sign-in for a normal email', async () => {
        renderForm();

        const input = screen.getByTestId('username');
        fireEvent.changeText(input, 'user@expensify.com');

        const continueButton = screen.getByText('Continue');
        fireEvent.press(continueButton);

        await waitFor(() => {
            expect(mockBeginSignIn).toHaveBeenCalledWith('user@expensify.com');
        });
    });

    it('does not clear the account message on mount when it is a freshly-set unlink success message', async () => {
        // UnlinkLoginPage resets the stack to the sign-in page as soon as the unlink settles, so this
        // mount is the one that has to render the result — clearing it here would show nothing.
        await Onyx.set(ONYXKEYS.ACCOUNT, {
            isLoading: false,
            errors: null,
            message: 'unlinkLoginForm.successfullyUnlinkedLogin',
        });
        await waitForBatchedUpdates();

        renderForm();
        await waitFor(() => {
            expect(screen.getByText('unlinkLoginForm.successfullyUnlinkedLogin')).toBeTruthy();
        });

        expect(clearAccountMessages).not.toHaveBeenCalled();
    });

    it('still clears a stale account message on an ordinary mount (control case)', async () => {
        // Regression guard: the skip above must be scoped to the unlink success value only — any other
        // leftover message (e.g. from an earlier flow) must still be cleared as before.
        await Onyx.set(ONYXKEYS.ACCOUNT, {
            isLoading: false,
            errors: null,
            message: 'closeAccountPage.reasonForLeavingPrompt',
        });
        await waitForBatchedUpdates();

        renderForm();

        await waitFor(() => {
            expect(clearAccountMessages).toHaveBeenCalled();
        });
    });
});

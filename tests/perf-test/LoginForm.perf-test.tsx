import type * as NativeNavigation from '@react-navigation/native';
import {fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import LoginForm from '@pages/signin/LoginForm';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import userAccount from '../utils/collections/userAccount';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('../../src/libs/Log');

jest.mock('../../src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

type LoginFormWrapperProps = Partial<typeof LoginForm>;

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
        createNavigationContainerRef: jest.fn(),
    } as typeof NativeNavigation;
});

function LoginFormWrapper(args: LoginFormWrapperProps) {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider]}>
            <LoginForm
                isVisible
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...args}
            />
        </ComposeProviders>
    );
}

const login = 'test@mail.com';

describe('LoginForm', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    // Initialize the network key for OfflineWithFeedback
    beforeEach(() => {
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean state
    afterEach(() => {
        Onyx.clear();
    });

    test('[LoginForm] should type phone or email', () => {
        const scenario = async () => {
            const loginForm = Localize.translateLocal('loginForm.loginForm');
            await screen.findByLabelText(loginForm);

            const usernameInput = screen.getByTestId('username');
            fireEvent.changeText(usernameInput, login);
        };

        return waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    [ONYXKEYS.ACCOUNT]: userAccount,
                }),
            )
            .then(() => measurePerformance(<LoginFormWrapper />, {scenario}));
    });

    test('[LoginForm] should click continue button', () => {
        const scenario = async () => {
            const loginForm = Localize.translateLocal('loginForm.loginForm');
            await screen.findByLabelText(loginForm);

            const hintContinueButtonText = Localize.translateLocal('common.continue');
            const continueButton = await screen.findByText(hintContinueButtonText);
            fireEvent.press(continueButton);
        };

        return waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    [ONYXKEYS.ACCOUNT]: userAccount,
                }),
            )
            .then(() => measurePerformance(<LoginFormWrapper />, {scenario}));
    });
});

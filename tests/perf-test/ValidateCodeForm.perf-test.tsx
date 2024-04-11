import type * as NativeNavigation from '@react-navigation/native';
import {fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import ValidateCodeForm from '@pages/signin/ValidateCodeForm';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import getValidCodeCredentials from '../utils/collections/getValidCodeCredentials';
import {getValidAccount} from '../utils/collections/userAccount';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('../../src/libs/Log');

jest.mock('../../src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
        createNavigationContainerRef: jest.fn(),
    } as typeof NativeNavigation;
});

function ValidateCodeFormWrapper() {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider]}>
            <ValidateCodeForm
                isUsingRecoveryCode
                setIsUsingRecoveryCode={() => {}}
                isVisible
            />
        </ComposeProviders>
    );
}
const login = 'test@mail.com';

describe('ValidateCodeForm', () => {
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

    test('[ValidateCodeForm] type magic code', () => {
        const scenario = async () => {
            await screen.findByTestId('no-2FA-validate-code-form');
            const magicCodeInput = screen.getByTestId('validateCode');

            fireEvent.changeText(magicCodeInput, '123456');
            fireEvent.changeText(magicCodeInput, '123');
            fireEvent.changeText(magicCodeInput, '123456');
        };

        return waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    [ONYXKEYS.ACCOUNT]: getValidAccount(login),
                    [ONYXKEYS.CREDENTIALS]: getValidCodeCredentials(login),
                }),
            )
            .then(() => measurePerformance(<ValidateCodeFormWrapper />, {scenario}));
    });

    test('[ValidateCodeForm] should click Sign In button', () => {
        const scenario = async () => {
            const signInButtonText = Localize.translateLocal('common.signIn');
            const signInButton = await screen.findByText(signInButtonText);

            fireEvent.press(signInButton);
        };

        return waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    [ONYXKEYS.ACCOUNT]: getValidAccount(login),
                    [ONYXKEYS.CREDENTIALS]: getValidCodeCredentials(login),
                }),
            )
            .then(() => measurePerformance(<ValidateCodeFormWrapper />, {scenario}));
    });
});

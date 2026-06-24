import {act, render} from '@testing-library/react-native';
import {openAuthSessionAsync} from 'expo-web-browser';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import * as Session from '@libs/actions/Session';
import SAMLSignInPage from '@pages/signin/SAMLSignInPage';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn(() => Promise.resolve({type: 'cancel'})),
}));

jest.mock('@libs/LoginUtils', () => ({
    postSAMLLogin: jest.fn(() => Promise.resolve({url: 'https://idp.example.com/saml'})),
    handleSAMLLoginError: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    isNavigationReady: jest.fn(() => Promise.resolve()),
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

// Stub the presentational wrappers — SAMLSignInPage's effects (which is what we're testing) run on mount
// regardless of what these render, and stubbing them avoids pulling in the navigation-heavy render tree.
jest.mock('@components/ScreenWrapper', () => ({__esModule: true, default: () => null}));
jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => ({__esModule: true, default: () => null}));
jest.mock('@components/HeaderWithBackButton', () => ({__esModule: true, default: () => null}));
jest.mock('@components/SAMLLoadingIndicator', () => ({__esModule: true, default: () => null}));

const mockedOpenAuthSessionAsync = jest.mocked(openAuthSessionAsync);

async function setCredentials() {
    await act(async () => {
        await Onyx.set(ONYXKEYS.CREDENTIALS, {login: 'test@example.com'});
        await Onyx.set(ONYXKEYS.ACCOUNT, {isLoading: false});
        await Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, false);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('SAMLSignInPage (native)', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    test('sets the short-lived-token guard before opening the SAML browser (prevents the resume-after-idle teardown)', async () => {
        const setGuardSpy = jest.spyOn(Session, 'setIsAuthenticatingWithShortLivedToken');
        await setCredentials();

        render(
            <OnyxListItemProvider>
                <SAMLSignInPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // The in-app browser was opened, and the guard was set to true BEFORE that call, so a reconnectApp()
        // 407 firing while the app is backgrounded aborts reauthenticate() instead of tearing down the session.
        expect(mockedOpenAuthSessionAsync).toHaveBeenCalledTimes(1);
        expect(setGuardSpy).toHaveBeenCalledWith(true);
        const setTrueOrder = setGuardSpy.mock.calls.findIndex((call) => call.at(0) === true);
        expect(setGuardSpy.mock.invocationCallOrder.at(setTrueOrder)).toBeLessThan(mockedOpenAuthSessionAsync.mock.invocationCallOrder.at(0) ?? Infinity);
    });

    test('clears the guard when the SAML browser is cancelled so future reauthentication is not blocked', async () => {
        let guard: OnyxEntry<boolean>;
        Onyx.connect({
            key: ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN,
            callback: (value) => {
                guard = value;
            },
        });
        // openAuthSessionAsync is mocked to resolve as a cancellation by default (see top of file)
        await setCredentials();

        render(
            <OnyxListItemProvider>
                <SAMLSignInPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockedOpenAuthSessionAsync).toHaveBeenCalledTimes(1);
        // After the user cancels, the guard must be cleared (otherwise reauthenticate stays blocked forever)
        expect(guard).toBe(false);
    });
});

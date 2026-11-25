import {act, render, screen} from '@testing-library/react-native';

import {openClassicSignIn} from '@libs/ClassicSignIn';
import {setHasRadio} from '@libs/NetworkState';

import {SignInPage} from '@pages/signin/SignInPage';

import type {useSyncExternalStore} from 'react';

import React from 'react';

const LOADING_INDICATOR_TEST_ID = 'ClassicSignInLoadingIndicator';

// The state lives in a store, so the screen re-renders when a test changes it
let mockShouldSignInThroughClassic = true;
const mockShouldSignInThroughClassicListeners = new Set<() => void>();
jest.mock('@hooks/useShouldSignInThroughClassic', () => {
    const {useSyncExternalStore: useStore} = jest.requireActual<{useSyncExternalStore: typeof useSyncExternalStore}>('react');
    const subscribe = (listener: () => void) => {
        mockShouldSignInThroughClassicListeners.add(listener);
        return () => mockShouldSignInThroughClassicListeners.delete(listener);
    };
    function useMockShouldSignInThroughClassic() {
        return useStore(subscribe, () => mockShouldSignInThroughClassic);
    }
    return {__esModule: true, default: useMockShouldSignInThroughClassic};
});

function setShouldSignInThroughClassic(shouldSignInThroughClassic: boolean) {
    act(() => {
        mockShouldSignInThroughClassic = shouldSignInThroughClassic;
        for (const listener of mockShouldSignInThroughClassicListeners) {
            listener();
        }
    });
}

function setIsOffline(isOffline: boolean) {
    act(() => setHasRadio(!isOffline));
}

const mockWithdrawClassicSignIn = jest.fn();
jest.mock('@libs/ClassicSignIn', () => ({
    openClassicSignIn: jest.fn(() => mockWithdrawClassicSignIn),
}));

// The sign-in form and its layout don't take part in handing the sign-in over to Classic
jest.mock('@pages/signin/SignInPageLayout', () => 'SignInPageLayout');
jest.mock('@pages/signin/LoginForm', () => 'LoginForm');
jest.mock('@components/ColorSchemeWrapper', () => 'ColorSchemeWrapper');
jest.mock('@components/CustomStatusBarAndBackground', () => 'CustomStatusBarAndBackground');

describe('SignInPage on the shared product host', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShouldSignInThroughClassic = true;
        setIsOffline(false);
    });

    it('opens the Classic sign-in page and shows a loading indicator instead of the form', () => {
        // Given a signed-out user who has to sign in through Classic

        // When the sign-in screen renders
        render(<SignInPage />);

        // Then the Classic sign-in page is requested, and the form the user can't use stays hidden while the browser loads it
        expect(openClassicSignIn).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId(LOADING_INDICATOR_TEST_ID)).toBeOnTheScreen();
    });

    it('waits for the connection before opening the Classic sign-in page', () => {
        // Given an offline browser, which would replace the screen with its own error page
        setIsOffline(true);

        // When the sign-in screen renders
        render(<SignInPage />);

        // Then the screen stays and the Classic sign-in page isn't requested
        expect(openClassicSignIn).not.toHaveBeenCalled();
        expect(screen.queryByTestId(LOADING_INDICATOR_TEST_ID)).toBeNull();

        // When the connection is back
        setIsOffline(false);

        // Then the Classic sign-in page is requested
        expect(openClassicSignIn).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId(LOADING_INDICATOR_TEST_ID)).toBeOnTheScreen();
    });

    it('withdraws the request when a sign-in starts in New Expensify', () => {
        // Given a sign-in screen that requested the Classic sign-in page, which hasn't opened yet
        render(<SignInPage />);
        expect(mockWithdrawClassicSignIn).not.toHaveBeenCalled();

        // When a sign-in starts on this screen
        setShouldSignInThroughClassic(false);

        // Then the request is withdrawn, so the Classic page can't interrupt it later
        expect(mockWithdrawClassicSignIn).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId(LOADING_INDICATOR_TEST_ID)).toBeNull();
    });

    it('keeps the New Expensify form when signing in happens on this screen', () => {
        // Given a host or a sign-in step that New Expensify handles itself
        mockShouldSignInThroughClassic = false;

        // When the sign-in screen renders
        render(<SignInPage />);

        // Then nothing is requested from Classic
        expect(openClassicSignIn).not.toHaveBeenCalled();
        expect(screen.queryByTestId(LOADING_INDICATOR_TEST_ID)).toBeNull();
    });
});

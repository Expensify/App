import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-imports, no-restricted-syntax
import * as Session from '@libs/actions/Session';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import LogOutPreviousUserPage from '@pages/LogOutPreviousUserPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const AGENT_EMAIL = 'agent@expensify.com';
const TARGET_EMAIL = 'target@example.com';

// The transition URL that OldDot's supportLoginNewDot.php generates when the agent
// clicks "New Expensify". It always contains the TARGET user's email.
const SUPPORTAL_TRANSITION_URL = `https://new.expensify.com/transition?shortLivedAuthToken=abc123&authTokenType=support&email=${TARGET_EMAIL}&exitTo=%2Fhome`;

let mockInitialURL: string | null = SUPPORTAL_TRANSITION_URL;

jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: () => ({
        initialURL: mockInitialURL,
    }),
}));

jest.mock('@navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

const RootStack = createPlatformStackNavigator<AuthScreensParamList>();

function renderPage(params: AuthScreensParamList[typeof SCREENS.TRANSITION_BETWEEN_APPS]) {
    return render(
        <NavigationContainer>
            <RootStack.Navigator>
                <RootStack.Screen
                    name={SCREENS.TRANSITION_BETWEEN_APPS}
                    component={LogOutPreviousUserPage}
                    initialParams={params}
                />
            </RootStack.Navigator>
        </NavigationContainer>,
    );
}

describe('LogOutPreviousUserPage', () => {
    let signOutSpy: jest.SpyInstance;
    let signInSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        // @ts-expect-error Need to mock the implementation to prevent actual sign out/sign in logic from running during tests
        signOutSpy = jest.spyOn(Session, 'signOutAndRedirectToSignIn').mockImplementation(() => {});
        signInSpy = jest.spyOn(Session, 'signInWithShortLivedAuthToken').mockImplementation(() => {});
        mockInitialURL = SUPPORTAL_TRANSITION_URL;
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('should clear Onyx on re-supportal even when transition email matches session email', async () => {
        // Given: An agent previously supportal'd into target@example.com.
        // SignInWithSupportAuthToken set session.email to the target's email.
        // The agent now clicks "New Expensify" in OldDot again for the same user.
        // isLoggingInAsNewUser returns false because transition email === session.email,
        // but isSupportalLogin is true because authTokenType === 'support'.
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                authToken: 'existing-support-token',
                accountID: 12345,
                email: TARGET_EMAIL,
                authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT,
            });
        });

        // When: The page renders with supportal route params
        renderPage({
            authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT,
            shortLivedAuthToken: 'new-short-lived-token',
            // @ts-expect-error exitTo is expected to be a string, but the actual value is URLSearchParams-encoded in the real app
            exitTo: '/home',
            shouldForceLogin: '',
        });

        await waitForBatchedUpdatesWithAct();

        // Then: signOutAndRedirectToSignIn is called to clear stale Onyx data.
        // Without the fix, the code would skip this and call signInWithShortLivedAuthToken
        // directly — leaving stale policies from the previous supportal session in Onyx.
        expect(signOutSpy).toHaveBeenCalledWith(false, true);
        expect(signInSpy).not.toHaveBeenCalled();
    });

    it('should clear Onyx on first-time supportal when emails differ', async () => {
        // Given: Agent is logged into NewDot as themselves
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                authToken: 'agent-auth-token',
                accountID: 99999,
                email: AGENT_EMAIL,
            });
        });

        // When: Agent supportals into a different user for the first time
        renderPage({
            authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT,
            shortLivedAuthToken: 'new-short-lived-token',
            // @ts-expect-error exitTo is expected to be a string, but the actual value is URLSearchParams-encoded in the real app
            exitTo: '/home',
            shouldForceLogin: '',
        });

        await waitForBatchedUpdatesWithAct();

        // Then: signOutAndRedirectToSignIn is called (both isLoggingInAsNewUser and isSupportalLogin are true)
        expect(signOutSpy).toHaveBeenCalledWith(false, true);
        expect(signInSpy).not.toHaveBeenCalled();
    });

    it('should sign in directly for non-supportal transition when emails match', async () => {
        // Given: A normal (non-supportal) OldDot-to-NewDot transition for the same user
        mockInitialURL = `https://new.expensify.com/transition?shortLivedAuthToken=abc123&email=${TARGET_EMAIL}&exitTo=%2Fhome`;

        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                authToken: 'existing-token',
                accountID: 12345,
                email: TARGET_EMAIL,
            });
        });

        // When: The page renders without supportal authTokenType
        renderPage({
            shortLivedAuthToken: 'new-short-lived-token',
            // @ts-expect-error exitTo is expected to be a string, but the actual value is URLSearchParams-encoded in the real app
            exitTo: '/home',
            shouldForceLogin: '',
        });

        await waitForBatchedUpdatesWithAct();

        // Then: signInWithShortLivedAuthToken is called directly (no signOut needed)
        expect(signInSpy).toHaveBeenCalledWith('new-short-lived-token');
        expect(signOutSpy).not.toHaveBeenCalled();
    });
});

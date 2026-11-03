import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AuthScreensParamList} from '@libs/Navigation/types';

import Navigation from '@navigation/Navigation';

import LogOutPreviousUserPage from '@pages/LogOutPreviousUserPage';

import {signInWithSupportAuthToken, signOutAndRedirectToSignIn} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockReanimatedModalModule from '../utils/mockReanimatedModal';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CUSTOMER_EMAIL = 'customer@example.com';
const REPORT_ROUTE = ROUTES.REPORT_WITH_ID.getRoute('123', '456');
const SUPPORT_TRANSITION_URL = `https://dev.new.expensify.com:8082/transition?shortLivedAuthToken=token&authTokenType=support&email=customer%40example.com&exitTo=r%2F123%2F456`;

// The account signed in to NewDot, and the different account the OldDot link belongs to.
const OUTGOING_ACCOUNT_ID = 456;
const OUTGOING_EMAIL = 'outgoing@test.com';
// cspell:disable-next-line
const OUTGOING_AUTH_TOKEN = 'outgoingauthtoken';
const INCOMING_ACCOUNT_ID = 123;
const INCOMING_EMAIL = 'incoming@test.com';
const OTHER_ACCOUNT_TRANSITION_URL = `${CONST.DEEPLINK_BASE_URL}/${ROUTES.TRANSITION_BETWEEN_APPS}?${new URLSearchParams({
    accountID: String(INCOMING_ACCOUNT_ID),
    email: INCOMING_EMAIL,
    shortLivedAuthToken: 'token',
    exitTo: ROUTES.HOME,
}).toString()}`;

let mockInitialURL = SUPPORT_TRANSITION_URL;

jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: () => ({
        initialURL: mockInitialURL,
    }),
}));

jest.mock('@navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@userActions/Session', () => ({
    isAnonymousUser: jest.fn(() => false),
    isDelegateSession: jest.fn(() => false),
    signInWithShortLivedAuthToken: jest.fn(),
    signInWithSupportAuthToken: jest.fn(),
    signOutAndRedirectToSignIn: jest.fn(),
}));

jest.mock('@components/Modal/ReanimatedModal', () => {
    const {default: MockReanimatedModal} = jest.requireActual<typeof MockReanimatedModalModule>('../utils/mockReanimatedModal');
    return MockReanimatedModal;
});

const RootStack = createPlatformStackNavigator<AuthScreensParamList>();

function EmptyScreen() {
    return null;
}

/**
 * Renders the transition page as the root route. With `shouldOpenModalOnTop`, another root route sits above it, as when the
 * signed-in account opens a modal over the transition page while the switch prompt is open.
 */
const renderPage = (initialParams: AuthScreensParamList[typeof SCREENS.TRANSITION_BETWEEN_APPS], shouldOpenModalOnTop = false) => {
    const initialState = shouldOpenModalOnTop ? {index: 1, routes: [{name: SCREENS.TRANSITION_BETWEEN_APPS, params: initialParams}, {name: SCREENS.CONCIERGE}]} : undefined;
    return render(
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
        >
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, ModalProvider]}>
                <RootStack.Navigator>
                    <RootStack.Screen
                        name={SCREENS.TRANSITION_BETWEEN_APPS}
                        component={LogOutPreviousUserPage}
                        initialParams={initialParams}
                    />
                    {/* Stands in for the modal opened over the transition page. Only its route name matters, because the page pops by name. */}
                    <RootStack.Screen
                        name={SCREENS.CONCIERGE}
                        component={EmptyScreen}
                    />
                </RootStack.Navigator>
            </ComposeProviders>
        </NavigationContainer>,
    );
};

describe('LogOutPreviousUserPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockInitialURL = SUPPORT_TRANSITION_URL;
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('opens the exitTo route, not Home, for a support link into the account the agent already supports', async () => {
        // Given an agent who is already support-logged into the customer's account
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: CUSTOMER_EMAIL});
        });

        // When a supportal link for that customer names a report action
        renderPage({shortLivedAuthToken: 'token', authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT, email: CUSTOMER_EMAIL, exitTo: REPORT_ROUTE, shouldForceLogin: ''});
        await waitForBatchedUpdatesWithAct();

        // Then the page signs in with the new token and goes straight to the report action, without a stop on Home
        expect(signInWithSupportAuthToken).toHaveBeenCalledWith('token');
        expect(Navigation.navigate).toHaveBeenCalledWith(REPORT_ROUTE);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.HOME);
    });

    it('goes Home, not to workspace/new, for a support link that names workspace/new', async () => {
        // Given an agent who is already support-logged into the customer's account
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: CUSTOMER_EMAIL});
        });

        // When an edited supportal link names workspace/new, which App.setUpPoliciesAndNavigate creates and opens
        renderPage({shortLivedAuthToken: 'token', authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT, email: CUSTOMER_EMAIL, exitTo: ROUTES.WORKSPACE_NEW, shouldForceLogin: ''});
        await waitForBatchedUpdatesWithAct();

        // Then the page goes Home and leaves the workspace route to the workspace setup
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.WORKSPACE_NEW);
    });

    it('keeps the transition route on top when signing out for a link into another account', async () => {
        // Given an account signed in to NewDot and a transition link for a different account
        mockInitialURL = OTHER_ACCOUNT_TRANSITION_URL;
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: OUTGOING_EMAIL, accountID: OUTGOING_ACCOUNT_ID, authToken: OUTGOING_AUTH_TOKEN});
        });

        // The sign-out keeps only the top root route, so record which route is on top when it runs
        let topRouteAtSignOut: string | undefined;
        jest.mocked(signOutAndRedirectToSignIn).mockImplementationOnce(() => {
            topRouteAtSignOut = navigationRef.getRootState()?.routes.at(-1)?.name;
            return undefined;
        });

        // Given nothing opened over the transition page while the prompt was open, which is the usual case
        renderPage({shortLivedAuthToken: 'token', email: INCOMING_EMAIL, exitTo: ROUTES.HOME, shouldForceLogin: ''});
        await waitForBatchedUpdatesWithAct();

        // When the switch is confirmed
        fireEvent.press(await screen.findByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('deeplinkWrapper.switchAccount.confirm')}));
        await waitForBatchedUpdatesWithAct();

        // Then the transition route is still on top when the previous account is signed out, so nothing pops the page itself
        expect(signOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
        expect(topRouteAtSignOut).toBe(SCREENS.TRANSITION_BETWEEN_APPS);
    });

    it('keeps the transition route, not the modal opened over it, on top when signing out for a link into another account', async () => {
        // Given an account signed in to NewDot and a transition link for a different account
        mockInitialURL = OTHER_ACCOUNT_TRANSITION_URL;
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: OUTGOING_EMAIL, accountID: OUTGOING_ACCOUNT_ID, authToken: OUTGOING_AUTH_TOKEN});
        });

        // The sign-out keeps only the top root route, so record which route is on top when it runs
        let topRouteAtSignOut: string | undefined;
        jest.mocked(signOutAndRedirectToSignIn).mockImplementationOnce(() => {
            topRouteAtSignOut = navigationRef.getRootState()?.routes.at(-1)?.name;
            return undefined;
        });

        // Given a modal the signed-in account opened on its own over the transition page while the prompt was open
        renderPage({shortLivedAuthToken: 'token', email: INCOMING_EMAIL, exitTo: ROUTES.HOME, shouldForceLogin: ''}, true);
        await waitForBatchedUpdatesWithAct();
        expect(navigationRef.getRootState()?.routes.at(-1)?.name).toBe(SCREENS.CONCIERGE);

        // When the switch is confirmed
        fireEvent.press(await screen.findByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('deeplinkWrapper.switchAccount.confirm')}));
        await waitForBatchedUpdatesWithAct();

        // Then the transition route is on top when the previous account is signed out, so the public transition page can redeem the token from its params
        expect(signOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
        expect(topRouteAtSignOut).toBe(SCREENS.TRANSITION_BETWEEN_APPS);
    });
});

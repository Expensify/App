import {act, render} from '@testing-library/react-native';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AuthScreensParamList} from '@libs/Navigation/types';

import Navigation from '@navigation/Navigation';

import LogOutPreviousUserPage from '@pages/LogOutPreviousUserPage';

import {signInWithSupportAuthToken} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CUSTOMER_EMAIL = 'customer@example.com';
const REPORT_ROUTE = ROUTES.REPORT_WITH_ID.getRoute('123', '456');

jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: () => ({
        initialURL: `https://dev.new.expensify.com:8082/transition?shortLivedAuthToken=token&authTokenType=support&email=customer%40example.com&exitTo=r%2F123%2F456`,
    }),
}));

jest.mock('@navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@userActions/Session', () => ({
    isDelegateSession: jest.fn(() => false),
    signInWithShortLivedAuthToken: jest.fn(),
    signInWithSupportAuthToken: jest.fn(),
    signOutAndRedirectToSignIn: jest.fn(),
}));

const RootStack = createPlatformStackNavigator<AuthScreensParamList>();

const renderPage = (initialParams: AuthScreensParamList[typeof SCREENS.TRANSITION_BETWEEN_APPS]) => {
    return render(
        <NavigationContainer>
            <RootStack.Navigator>
                <RootStack.Screen
                    name={SCREENS.TRANSITION_BETWEEN_APPS}
                    component={LogOutPreviousUserPage}
                    initialParams={initialParams}
                />
            </RootStack.Navigator>
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
        await act(async () => {
            await Onyx.clear();
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
});

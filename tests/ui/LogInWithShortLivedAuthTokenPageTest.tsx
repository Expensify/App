import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';

import LogInWithShortLivedAuthTokenPage from '@pages/LogInWithShortLivedAuthTokenPage';

import {signInWithShortLivedAuthToken} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@userActions/Session', () => ({
    signInWithShortLivedAuthToken: jest.fn(),
    signInWithSupportAuthToken: jest.fn(),
    setAccountError: jest.fn(),
}));

const RootStack = createPlatformStackNavigator<PublicScreensParamList>();

const renderPage = (initialParams: PublicScreensParamList[typeof SCREENS.TRANSITION_BETWEEN_APPS]) => {
    return render(
        <LocaleContextProvider>
            <NavigationContainer>
                <RootStack.Navigator>
                    <RootStack.Screen
                        name={SCREENS.TRANSITION_BETWEEN_APPS}
                        component={LogInWithShortLivedAuthTokenPage}
                        initialParams={initialParams}
                    />
                </RootStack.Navigator>
            </NavigationContainer>
        </LocaleContextProvider>,
    );
};

describe('LogInWithShortLivedAuthTokenPage', () => {
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

    it('sends a SAML sign-in back to the page a forced re-auth kept', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.LAST_VISITED_PATH, '/search?q=status:outstanding');
        });

        renderPage({shortLivedAuthToken: 'token', isSAML: true, shouldForceLogin: ''});
        await waitForBatchedUpdatesWithAct();

        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', true, '/search?q=status:outstanding');
    });

    it('signs in with SAML without a landing page when nothing was kept', async () => {
        renderPage({shortLivedAuthToken: 'token', isSAML: true, shouldForceLogin: ''});
        await waitForBatchedUpdatesWithAct();

        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', true, undefined);
    });

    it('signs in with a SAML token while the account is still marked loading by a forced re-auth', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {isLoading: true});
            await Onyx.set(ONYXKEYS.LAST_VISITED_PATH, '/search?q=status:outstanding');
        });

        renderPage({shortLivedAuthToken: 'token', isSAML: true, shouldForceLogin: ''});
        await waitForBatchedUpdatesWithAct();

        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', true, '/search?q=status:outstanding');
    });

    it('waits for the account while it is loading for a non-SAML sign-in', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {isLoading: true});
        });

        renderPage({shortLivedAuthToken: 'token', shouldForceLogin: ''});
        await waitForBatchedUpdatesWithAct();

        expect(signInWithShortLivedAuthToken).not.toHaveBeenCalled();
    });

    it('leaves the landing page to the transition link for a non-SAML sign-in', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.LAST_VISITED_PATH, '/search?q=status:outstanding');
        });

        renderPage({shortLivedAuthToken: 'token', shouldForceLogin: ''});
        await waitForBatchedUpdatesWithAct();

        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', false, undefined);
    });
});

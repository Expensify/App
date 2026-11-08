/**
 * Tests the native ValidateLoginPage, which signs in from a magic link and hands the stored session to the sign-in.
 */
import {render} from '@testing-library/react-native';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';

import ValidateLoginPage from '@pages/ValidateLoginPage';

import {signInWithValidateCodeAndNavigate} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    isNavigationReady: jest.fn(() => Promise.resolve()),
    goBack: jest.fn(),
}));

jest.mock('@userActions/Session', () => ({
    handleExitToNavigation: jest.fn(),
    signInWithValidateCodeAndNavigate: jest.fn(),
}));

const PublicStack = createPlatformStackNavigator<PublicScreensParamList>();

describe('ValidateLoginPage (native)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('passes the stored session to the sign-in', async () => {
        // Given an anonymous session is stored, as when a public room viewer opens a magic link
        const anonymousSession = {authToken: 'anonymousToken', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS, accountID: 99};
        await Onyx.set(ONYXKEYS.SESSION, anonymousSession);
        await waitForBatchedUpdatesWithAct();

        // When the page opens from the magic link
        render(
            <NavigationContainer>
                <PublicStack.Navigator>
                    <PublicStack.Screen
                        name={SCREENS.VALIDATE_LOGIN}
                        component={ValidateLoginPage}
                        initialParams={{accountID: '1', validateCode: '123456'}}
                    />
                </PublicStack.Navigator>
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the sign-in gets that session, so it can clear the anonymous account without reading the session itself
        expect(signInWithValidateCodeAndNavigate).toHaveBeenCalledWith(1, '123456', undefined, anonymousSession, undefined);
    });
});

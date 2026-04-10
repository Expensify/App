import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import ValidateLoginPage from '@pages/ValidateLoginPage/index.website';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const RootStack = createPlatformStackNavigator<PublicScreensParamList>();

const renderPage = (initialParams: PublicScreensParamList[typeof SCREENS.VALIDATE_LOGIN]) => {
    return render(
        <NavigationContainer>
            <RootStack.Navigator>
                <RootStack.Screen
                    name={SCREENS.VALIDATE_LOGIN}
                    component={ValidateLoginPage}
                    initialParams={initialParams}
                />
            </RootStack.Navigator>
        </NavigationContainer>,
    );
};

describe('ValidateLoginPage', () => {
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

    it('Should show not found view when the magic code is invalid and there is an exitTo param', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                autoAuthState: CONST.AUTO_AUTH_STATE.NOT_STARTED,
            });
        });

        renderPage({accountID: '1', validateCode: 'ABCDEF', exitTo: 'concierge'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('validate-code-not-found')).not.toBeNull();
    });

    it('Should not show ValidateCodeModal when signed in and there is an exitTo param', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                authToken: 'abcd',
                autoAuthState: CONST.AUTO_AUTH_STATE.NOT_STARTED,
            });
        });

        renderPage({accountID: '1', validateCode: '123456', exitTo: 'concierge'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('validate-code')).toBeNull();
    });
});

import {NavigationContainer} from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import createResponsiveStackNavigator from '@libs/Navigation/AppNavigator/createResponsiveStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import ValidateLoginPage from '@pages/ValidateLoginPage/index.website';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/fileDownload/FileUtils', () => ({
    readFileAsync: jest.fn(),
}));

const RootStack = createResponsiveStackNavigator<PublicScreensParamList>();

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
    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
    });

    it('Should show not found view when the magic code is invalid and there is an exitTo param', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            autoAuthState: CONST.AUTO_AUTH_STATE.NOT_STARTED,
        });

        renderPage({accountID: '1', validateCode: 'ABCDEF', exitTo: 'concierge'});

        expect(screen.getByTestId('validate-code-not-found')).not.toBeNull();
    });

    it('Should not show ValidateCodeModal when signed in and there is an exitTo param', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {
            authToken: 'abcd',
            autoAuthState: CONST.AUTO_AUTH_STATE.NOT_STARTED,
        });

        renderPage({accountID: '1', validateCode: '123456', exitTo: 'concierge'});

        expect(screen.queryByTestId('validate-code')).toBeNull();
    });
});

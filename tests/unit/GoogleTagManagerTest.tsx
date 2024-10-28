import {NavigationContainer} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import GoogleTagManager from '@libs/GoogleTagManager';
import OnboardingModalNavigator from '@libs/Navigation/AppNavigator/Navigators/OnboardingModalNavigator';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/GoogleTagManager');

// Mock the Overlay since it doesn't work in tests
jest.mock('@libs/Navigation/AppNavigator/Navigators/Overlay');

describe('GoogleTagManagerTest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    it('publishes a sign_up event during onboarding', async () => {
        // Given a new signed in account
        const accountID = 123456;
        await Onyx.merge(ONYXKEYS.SESSION, {accountID});

        // When we render the OnboardingModal a few times
        const {rerender} = render(
            <NavigationContainer>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );
        rerender(
            <NavigationContainer>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );
        rerender(
            <NavigationContainer>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );

        // Then we publish the sign_up event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith('sign_up', accountID);
    });
});

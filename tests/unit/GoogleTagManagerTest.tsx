import {NavigationContainer} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import * as Policy from '@libs/actions/Policy/Policy';
import GoogleTagManager from '@libs/GoogleTagManager';
import OnboardingModalNavigator from '@libs/Navigation/AppNavigator/Navigators/OnboardingModalNavigator';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/GoogleTagManager');

// Mock the Overlay since it doesn't work in tests
jest.mock('@libs/Navigation/AppNavigator/Navigators/Overlay');

describe('GoogleTagManagerTest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear();
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

    it('publishes a workspace_created event when the user creates their first one', async () => {
        // Given a new signed in account
        const accountID = 123456;
        await Onyx.merge(ONYXKEYS.SESSION, {accountID});

        // When we run the createWorkspace action a few times
        Policy.createWorkspace();
        await waitForBatchedUpdates();
        Policy.createWorkspace();
        await waitForBatchedUpdates();
        Policy.createWorkspace();

        // Then we publish the sign_up event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith('workspace_created', accountID);
    });
});

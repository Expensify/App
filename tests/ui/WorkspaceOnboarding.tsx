import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingWorkspaces from '@pages/OnboardingWorkspaces';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

const navigate = jest.spyOn(Navigation, 'navigate');

const renderOnboardingWorkspacesPage = (initialRouteName: typeof SCREENS.ONBOARDING.WORKSPACES, initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.WORKSPACES]) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.WORKSPACES}
                            component={OnboardingWorkspaces}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('OnboardingWorkspaces Page', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should navigate to Onboarding employee page when skip is pressed and user is routed app via SMB', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const skipButton = screen.getByTestId('onboardingWorkSpaceSkipButton');

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: skipButton,
            currentTarget: skipButton,
        };

        fireEvent.press(skipButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute());
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding accounting page when skip is pressed and user is routed app via VSB', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const skipButton = screen.getByTestId('onboardingWorkSpaceSkipButton');

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: skipButton,
            currentTarget: skipButton,
        };

        fireEvent.press(skipButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_ACCOUNTING.getRoute());
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});

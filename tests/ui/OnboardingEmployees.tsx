import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@navigation/types';
import OnboardingEmployees from '@pages/OnboardingEmployees';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Link', () => ({
    openOldDotLink: jest.fn(),
}));

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

const renderOnboardingEmployeesPage = (initialRouteName: typeof SCREENS.ONBOARDING.EMPLOYEES, initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.EMPLOYEES]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.EMPLOYEES}
                            component={OnboardingEmployees}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('OnboardingEmployees Page', () => {
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

    it('should display 1-10 option when the signupQualifier is not smb', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
        });

        const {unmount} = renderOnboardingEmployeesPage(SCREENS.ONBOARDING.EMPLOYEES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.employees.1-10'))).toBeOnTheScreen();
        });

        unmount();

        await waitForBatchedUpdatesWithAct();
    });

    it('should hide 1-10 option when the signupQualifier is smb', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
            });
        });

        const {unmount} = renderOnboardingEmployeesPage(SCREENS.ONBOARDING.EMPLOYEES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByText(TestHelper.translateLocal('onboarding.employees.1-10'))).not.toBeOnTheScreen();
        });

        unmount();

        await waitForBatchedUpdatesWithAct();
    });
});

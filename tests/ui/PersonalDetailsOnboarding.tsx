import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@navigation/types';
import OnboardingPersonalDetails from '@pages/OnboardingPersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

const navigate = jest.spyOn(Navigation, 'navigate');

const fakeEmail = 'fake@gmail.com';
const mockLoginList = {
    [fakeEmail]: {
        partnerName: 'expensify.com',
        partnerUserID: fakeEmail,
        validatedDate: 'fake-validatedDate',
    },
};

const renderOnboardingPersonalDetailsPage = (
    initialRouteName: typeof SCREENS.ONBOARDING.PERSONAL_DETAILS,
    initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.PERSONAL_DETAILS],
) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                            component={OnboardingPersonalDetails}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('OnboardingPersonalDetails Page', () => {
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

    it('should navigate to Onboarding Private Domain page when submitting form and user is routed app via VSB with unvalidated account and private domain', async () => {
        await TestHelper.signInWithTestUser();

        // Setup account as private domain and has accessible policies
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: false,
                hasAccessibleDomainPolicies: true,
            });
            await Onyx.merge(ONYXKEYS.LOGIN_LIST, mockLoginList);
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
            });
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        });

        const {unmount} = renderOnboardingPersonalDetailsPage(SCREENS.ONBOARDING.PERSONAL_DETAILS, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        // Submit the form
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute());
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding workspaces page when submitting form and user is routed app via SMB with unvalidated account and private domain', async () => {
        await TestHelper.signInWithTestUser();

        // Setup account as private domain and has accessible policies
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: false,
                hasAccessibleDomainPolicies: true,
            });
            await Onyx.merge(ONYXKEYS.LOGIN_LIST, mockLoginList);
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
            });
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        });

        const {unmount} = renderOnboardingPersonalDetailsPage(SCREENS.ONBOARDING.PERSONAL_DETAILS, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        // Submit the form
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute());
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});

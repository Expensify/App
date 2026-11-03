import {act, render, screen, userEvent, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import OnboardingPersonalTrackGoal from '@pages/OnboardingPersonalTrackGoal';

import {completeOnboarding} from '@userActions/Report';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockCompleteOnboarding = jest.mocked(completeOnboarding);

jest.mock('@userActions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        completeOnboarding: jest.fn(),
    };
});

jest.mock('@userActions/Policy/Policy', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Policy/Policy');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        createWorkspace: jest.fn().mockReturnValue({
            policyID: 'test-policy-id',
            adminsChatReportID: 'test-admins-report-id',
        }),
    };
});

TestHelper.setupGlobalFetchMock();

const translateGoal = (goal: ValueOf<typeof CONST.ONBOARDING_PERSONAL_TRACK_GOALS>) => TestHelper.translateLocal(`onboarding.personalTrackGoal.${goal}`);

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

const navigate = jest.spyOn(Navigation, 'navigate');

const renderOnboardingPersonalTrackGoalPage = (
    initialRouteName: typeof SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL,
    initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL],
) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL}
                            component={OnboardingPersonalTrackGoal}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('OnboardingPersonalTrackGoal Page', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: false,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: false,
            isInLandscapeMode: false,
        } satisfies ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should navigate to personal details page when user selects a goal and is from public domain', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
                hasAccessibleDomainPolicies: false,
            });
        });

        const {unmount} = renderOnboardingPersonalTrackGoalPage(SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const user = userEvent.setup();
        const goalLabel = translateGoal(CONST.ONBOARDING_PERSONAL_TRACK_GOALS.INVESTMENT_TRACKING);
        await user.press(screen.getByLabelText(goalLabel));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(''));
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should complete the track workspace with the selected goal when user is from private domain with name set', async () => {
        jest.spyOn(Navigation, 'dismissModal').mockImplementation(() => {});
        jest.spyOn(Navigation, 'setNavigationActionToMicrotaskQueue').mockImplementation((callback: () => void) => callback());

        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: false,
                hasAccessibleDomainPolicies: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {
                firstName: 'Test',
                lastName: 'User',
            });
        });

        const {unmount} = renderOnboardingPersonalTrackGoalPage(SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const user = userEvent.setup();
        const goalLabel = translateGoal(CONST.ONBOARDING_PERSONAL_TRACK_GOALS.INVESTMENT_TRACKING);
        await user.press(screen.getByLabelText(goalLabel));

        await waitFor(() => {
            expect(mockCompleteOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL,
                    firstName: 'Test',
                    lastName: 'User',
                    personalTrackGoal: CONST.ONBOARDING_PERSONAL_TRACK_GOALS.INVESTMENT_TRACKING,
                }),
            );
        });

        // Private-domain users already entered their name, so they should not be sent back to the personal details screen.
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(''));

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should restore a previously entered "Something else" value from Onyx', async () => {
        await TestHelper.signInWithTestUser();

        const customGoal = 'My custom tracking goal';
        await act(async () => {
            await Onyx.set(ONYXKEYS.ONBOARDING_PERSONAL_TRACK_GOAL, customGoal);
        });

        const {unmount} = renderOnboardingPersonalTrackGoalPage(SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByDisplayValue(customGoal)).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});

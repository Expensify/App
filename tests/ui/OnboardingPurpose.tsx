import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen, userEvent, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import {completeOnboarding} from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
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

TestHelper.setupGlobalFetchMock();

// Helper to translate onboarding purpose keys that use dynamic CONST values
const translatePurpose = (choice: string) => TestHelper.translateLocal(`onboarding.purpose.${choice}` as TranslationPaths);

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

const navigate = jest.spyOn(Navigation, 'navigate');

const renderOnboardingPurposePage = (initialRouteName: typeof SCREENS.ONBOARDING.PURPOSE, initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.PURPOSE]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PURPOSE}
                            component={OnboardingPurpose}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('OnboardingPurpose Page', () => {
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

    it('should navigate to personal details page when user selects a purpose and is from public domain', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: true,
                hasAccessibleDomainPolicies: false,
            });
        });

        const {unmount} = renderOnboardingPurposePage(SCREENS.ONBOARDING.PURPOSE, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const user = userEvent.setup();
        const chatSplitLabel = translatePurpose(CONST.ONBOARDING_CHOICES.CHAT_SPLIT);
        const chatSplitOption = screen.getByLabelText(chatSplitLabel);
        await user.press(chatSplitOption);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(''));
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to employees page when user selects MANAGE_TEAM', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: false,
                hasAccessibleDomainPolicies: true,
            });
        });

        const {unmount} = renderOnboardingPurposePage(SCREENS.ONBOARDING.PURPOSE, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const user = userEvent.setup();
        const manageTeamLabel = translatePurpose(CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        const manageTeamOption = screen.getByLabelText(manageTeamLabel);
        await user.press(manageTeamOption);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(''));
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should call completeOnboarding with introSelected when user is from private domain and selects a direct-complete choice', async () => {
        await TestHelper.signInWithTestUser();

        const introSelectedValue = {
            choice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.CHAT,
            companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                isFromPublicDomain: false,
                hasAccessibleDomainPolicies: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {
                firstName: 'Test',
                lastName: 'User',
            });
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, introSelectedValue);
        });

        const {unmount} = renderOnboardingPurposePage(SCREENS.ONBOARDING.PURPOSE, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        // Select CHAT_SPLIT which triggers completeOnboarding directly for private domain users
        const user = userEvent.setup();
        const chatSplitLabel = translatePurpose(CONST.ONBOARDING_CHOICES.CHAT_SPLIT);
        const chatSplitOption = screen.getByLabelText(chatSplitLabel);
        await user.press(chatSplitOption);

        await waitFor(() => {
            expect(mockCompleteOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                    firstName: 'Test',
                    lastName: 'User',
                    introSelected: introSelectedValue,
                }),
            );
        });

        mockCompleteOnboarding.mockClear();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TextInput from '@components/TextInput';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import Navigation from '@libs/Navigation/Navigation';
import BaseOnboardingAccounting from '@pages/OnboardingAccounting/BaseOnboardingAccounting';
import BaseOnboardingInterestedFeatures from '@pages/OnboardingInterestedFeatures/BaseOnboardingInterestedFeatures';
import CONST from '@src/CONST';
import type {OnboardingModalNavigatorParamList} from '@src/libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockCompleteOnboardingParams = {
    featuresMap: Array<{id: string; enabled: boolean}>;
    userReportedIntegration?: string | null;
};

const mockCompleteOnboardingFlow = jest.fn<void, [MockCompleteOnboardingParams]>();

jest.mock('@hooks/useCompleteOnboarding', () => () => ({
    completeOnboardingFlow: mockCompleteOnboardingFlow,
    isLoading: false,
}));

TestHelper.setupGlobalFetchMock();

const Stack = createStackNavigator<OnboardingModalNavigatorParamList>();
const navigate = jest.spyOn(Navigation, 'navigate');
const goBack = jest.spyOn(Navigation, 'goBack');
jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(undefined);

function renderInterestedFeaturesPage(backTo = '') {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.ONBOARDING.INTERESTED_FEATURES}>
                    <Stack.Screen
                        name={SCREENS.ONBOARDING.INTERESTED_FEATURES}
                        initialParams={{backTo}}
                    >
                        {(props) => (
                            <BaseOnboardingInterestedFeatures
                                {...props}
                                shouldUseNativeStyles={false}
                            />
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

function renderAccountingPage(backTo = '') {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.ONBOARDING.ACCOUNTING}>
                    <Stack.Screen
                        name={SCREENS.ONBOARDING.ACCOUNTING}
                        initialParams={{backTo}}
                    >
                        {(props) => (
                            <BaseOnboardingAccounting
                                {...props}
                                shouldUseNativeStyles={false}
                            />
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

describe('Onboarding interested features and accounting pages', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        } satisfies ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('navigates to accounting with backTo when accounting remains enabled', async () => {
        renderInterestedFeaturesPage('/home');

        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_ACCOUNTING.getRoute('/home'));
        });
        expect(mockCompleteOnboardingFlow).not.toHaveBeenCalled();
    });

    it('completes onboarding immediately when accounting is disabled', async () => {
        renderInterestedFeaturesPage();

        await waitForBatchedUpdatesWithAct();
        const accountingCheckbox = screen.getAllByLabelText(TestHelper.translateLocal('workspace.moreFeatures.connections.title')).at(0);
        if (!accountingCheckbox) {
            throw new Error('Accounting checkbox not found');
        }
        fireEvent.press(accountingCheckbox);
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(mockCompleteOnboardingFlow).toHaveBeenCalledTimes(1);
        });
        const featuresMap = mockCompleteOnboardingFlow.mock.calls.at(0)?.at(0)?.featuresMap;
        expect(featuresMap?.find((feature) => feature.id === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED)?.enabled).toBe(false);
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.ONBOARDING_ACCOUNTING.getRoute());
    });

    it('requires a custom name for Other and completes direct accounting access with fallback features', async () => {
        renderAccountingPage();

        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(TestHelper.translateLocal('onboarding.accounting.none'))).not.toBeOnTheScreen();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.other')));
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));
        expect(mockCompleteOnboardingFlow).not.toHaveBeenCalled();

        fireEvent.changeText(screen.UNSAFE_getByType(TextInput), 'Wave');
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith({
                featuresMap: expect.arrayContaining([{id: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED, enabled: true, enabledByDefault: true}]),
                userReportedIntegration: 'Wave',
            });
        });
    });

    it('preserves backTo when returning from accounting', async () => {
        renderAccountingPage('/home');

        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));

        expect(goBack).toHaveBeenCalledWith(ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute(undefined, '/home'));
    });
});

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import * as Browser from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';

import BaseOnboardingAccounting from '@pages/OnboardingAccounting/BaseOnboardingAccounting';
import BaseOnboardingInterestedFeatures from '@pages/OnboardingInterestedFeatures/BaseOnboardingInterestedFeatures';

import CONST from '@src/CONST';
import type {OnboardingModalNavigatorParamList} from '@src/libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports -- React Native primitives are imported directly to inspect their test instances
import {ScrollView} from 'react-native';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockCompleteOnboardingParams = {
    featuresMap: Array<{id: string; enabled: boolean}>;
    userReportedIntegration?: string | null;
    userReportedIntegrationName?: string;
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
const isMobileSafari = jest.spyOn(Browser, 'isMobileSafari');
jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(undefined);

function renderInterestedFeaturesPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.ONBOARDING.INTERESTED_FEATURES}>
                    <Stack.Screen name={SCREENS.ONBOARDING.INTERESTED_FEATURES}>
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

function renderAccountingPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.ONBOARDING.ACCOUNTING}>
                    <Stack.Screen name={SCREENS.ONBOARDING.ACCOUNTING}>
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
        isMobileSafari.mockReturnValue(false);
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

    it('navigates to accounting when accounting remains enabled', async () => {
        renderInterestedFeaturesPage();

        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_ACCOUNTING.getRoute());
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

    it('keeps Other half-width, auto-focuses its input, and completes with a trimmed integration name', async () => {
        const scrollToEndSpy = jest.spyOn(ScrollView.prototype, 'scrollToEnd');
        const renderResult = renderAccountingPage();

        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(TestHelper.translateLocal('onboarding.accounting.none'))).not.toBeOnTheScreen();
        expect(screen.getByTestId('onboarding-accounting-wide-layout-spacer')).toHaveStyle({backgroundColor: 'transparent', flexBasis: '35%', flexGrow: 1});

        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.other')));
        const otherAccountingSoftwareLabel = TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware');
        const otherAccountingSoftwareInput = screen.getByLabelText(otherAccountingSoftwareLabel);
        expect(otherAccountingSoftwareInput.props.autoFocus).toBe(true);
        expect(renderResult.UNSAFE_getByType(TextInput).props.forceActiveLabel).toBeFalsy();
        const accountingScrollView = renderResult.UNSAFE_getByType(ScrollView);
        fireEvent(accountingScrollView, 'onContentSizeChange', 0, 0);
        expect(scrollToEndSpy).toHaveBeenCalledWith({animated: false});
        fireEvent(accountingScrollView, 'onContentSizeChange', 0, 0);
        expect(scrollToEndSpy).toHaveBeenCalledTimes(1);
        fireEvent.changeText(otherAccountingSoftwareInput, '  Acme Books  ');
        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.other')));
        expect(screen.getByLabelText(otherAccountingSoftwareLabel).props.value).toBe('  Acme Books  ');
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith({
                featuresMap: expect.arrayContaining([{id: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED, enabled: true, enabledByDefault: true}]),
                userReportedIntegration: 'other',
                userReportedIntegrationName: 'Acme Books',
            });
        });
    });

    it('disables max-height and virtual-viewport scroll suppression on mobile Safari', async () => {
        isMobileSafari.mockReturnValue(true);
        const renderResult = renderAccountingPage();

        await waitForBatchedUpdatesWithAct();
        const screenWrapper = renderResult.UNSAFE_getByType(ScreenWrapper);
        expect(screenWrapper.props.shouldEnableMaxHeight).toBe(false);
        expect(screenWrapper.props.shouldAvoidScrollOnVirtualViewport).toBe(false);
    });

    it('omits a whitespace-only Other integration name', async () => {
        renderAccountingPage();

        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.other')));
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware')), '   ');
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith({
                featuresMap: expect.arrayContaining([{id: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED, enabled: true, enabledByDefault: true}]),
                userReportedIntegration: 'other',
                userReportedIntegrationName: undefined,
            });
        });
    });

    it('clears the Other integration name when a supported integration is selected', async () => {
        renderAccountingPage();

        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.other')));
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware')), 'Acme Books');
        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.qbo')));

        expect(screen.queryByLabelText(TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware'))).not.toBeOnTheScreen();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith({
                featuresMap: expect.arrayContaining([{id: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED, enabled: true, enabledByDefault: true}]),
                userReportedIntegration: 'quickbooksOnline',
                userReportedIntegrationName: undefined,
            });
        });
    });

    it('returns to interested features from accounting', async () => {
        renderAccountingPage();

        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));

        expect(goBack).toHaveBeenCalledWith(ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute());
    });
});

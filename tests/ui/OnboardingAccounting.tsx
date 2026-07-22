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

import OnboardingAccounting from '@pages/OnboardingAccounting';
import OnboardingInterestedFeatures from '@pages/OnboardingInterestedFeatures';

import {createWorkspace} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';

import type {OnboardingAccounting as OnboardingAccountingValue} from '@src/CONST';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockCreateWorkspace = jest.mocked(createWorkspace);
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

jest.mock('@libs/navigateAfterOnboarding', () => ({
    navigateAfterOnboardingWithMicrotaskQueue: jest.fn(),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(),
    },
}));

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();
const navigate = jest.spyOn(Navigation, 'navigate');

function renderOnboardingPage(screenName: typeof SCREENS.ONBOARDING.ACCOUNTING | typeof SCREENS.ONBOARDING.INTERESTED_FEATURES) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={screenName}>
                        {screenName === SCREENS.ONBOARDING.ACCOUNTING ? (
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.ACCOUNTING}
                                component={OnboardingAccounting}
                            />
                        ) : (
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.INTERESTED_FEATURES}
                                component={OnboardingInterestedFeatures}
                            />
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function setInterestedFeaturesOnyxState(integration: OnboardingAccountingValue | null, integrationName?: string) {
    await TestHelper.signInWithTestUser();
    await act(async () => {
        await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        await Onyx.set(ONYXKEYS.ONBOARDING_COMPANY_SIZE, CONST.ONBOARDING_COMPANY_SIZE.MICRO);
        await Onyx.set(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, integration);
        await Onyx.set(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION_NAME, integrationName ?? null);
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
    });
}

describe('Onboarding accounting software name', () => {
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

    it('shows the input for Other and saves a trimmed name separately from the integration value', async () => {
        await TestHelper.signInWithTestUser();
        const {unmount} = renderOnboardingPage(SCREENS.ONBOARDING.ACCOUNTING);
        await waitForBatchedUpdatesWithAct();

        const user = userEvent.setup();
        await user.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.other')));

        const inputLabel = TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware');
        const input = await screen.findByLabelText(inputLabel);
        await user.type(input, '  Acme Books  ');
        await user.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute());
        });
        expect(await getOnyxValue(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION)).toBe('other');
        expect(await getOnyxValue(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION_NAME)).toBe('Acme Books');

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('clears the custom name when a supported integration is selected', async () => {
        await TestHelper.signInWithTestUser();
        const {unmount} = renderOnboardingPage(SCREENS.ONBOARDING.ACCOUNTING);
        await waitForBatchedUpdatesWithAct();

        const user = userEvent.setup();
        await user.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.other')));
        const inputLabel = TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware');
        await user.type(await screen.findByLabelText(inputLabel), 'Acme Books');
        await user.press(screen.getByText(TestHelper.translateLocal('workspace.accounting.qbo')));
        expect(screen.queryByLabelText(inputLabel)).not.toBeOnTheScreen();
        await user.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        expect(await getOnyxValue(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION)).toBe('quickbooksOnline');
        expect(await getOnyxValue(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION_NAME)).toBeUndefined();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        {integration: 'other' as const, integrationName: '  Acme Books  ', expectedIntegration: 'other', expectedName: 'Acme Books'},
        {integration: 'other' as const, integrationName: '   ', expectedIntegration: 'other', expectedName: undefined},
        {integration: 'quickbooksOnline' as const, integrationName: 'Stale name', expectedIntegration: 'quickbooksOnline', expectedName: undefined},
        {integration: null, integrationName: 'Stale name', expectedIntegration: undefined, expectedName: undefined},
    ])('sends the custom name only for a non-empty Other selection: $integration / "$integrationName"', async ({integration, integrationName, expectedIntegration, expectedName}) => {
        await setInterestedFeaturesOnyxState(integration, integrationName);
        const {unmount} = renderOnboardingPage(SCREENS.ONBOARDING.INTERESTED_FEATURES);
        await waitForBatchedUpdatesWithAct();

        const user = userEvent.setup();
        await user.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(mockCreateWorkspace).toHaveBeenCalledWith(
                expect.objectContaining({
                    userReportedIntegration: expectedIntegration,
                    userReportedIntegrationName: expectedName,
                }),
            );
            expect(mockCompleteOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({
                    userReportedIntegration: expectedIntegration,
                    userReportedIntegrationName: expectedName,
                }),
            );
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('omits the integration and custom name when Connections is disabled', async () => {
        await setInterestedFeaturesOnyxState('other', 'Acme Books');
        const {unmount} = renderOnboardingPage(SCREENS.ONBOARDING.INTERESTED_FEATURES);
        await waitForBatchedUpdatesWithAct();

        const user = userEvent.setup();
        await user.press(screen.getByText(TestHelper.translateLocal('workspace.moreFeatures.connections.title')));
        await user.press(screen.getByText(TestHelper.translateLocal('common.continue')));

        await waitFor(() => {
            expect(mockCreateWorkspace).toHaveBeenCalledWith(
                expect.objectContaining({
                    userReportedIntegration: undefined,
                    userReportedIntegrationName: undefined,
                }),
            );
            expect(mockCompleteOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({
                    userReportedIntegration: undefined,
                    userReportedIntegrationName: undefined,
                }),
            );
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});

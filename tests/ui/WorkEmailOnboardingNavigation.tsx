import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {AddWorkEmail, MergeIntoAccountAndLogin} from '@libs/actions/Session';
import HttpUtils from '@libs/HttpUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import OnboardingWorkEmail from '@pages/OnboardingWorkEmail';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation';
import OnboardingWorkspaces from '@pages/OnboardingWorkspaces';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Onboarding, Response as OnyxResponse} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

const RootStack = createPlatformStackNavigator<{[NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]: undefined}>();
const OnboardingStack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

const workEmail = 'testprivateemail@privateEmail.com';

// The real "Join a workspace" screen is not under test here, only how many times it ends up on the stack, so a stub
// keeps this test about navigation instead of about SelectionList and the getAccessiblePolicies request.
function OnboardingWorkspacesStub() {
    return <View testID="onboarding-workspaces-stub" />;
}

// Stands in for whatever screen precedes a later visit to "Join a workspace"; only its presence on the stack matters.
function OnboardingPersonalDetailsStub() {
    return <View testID="onboarding-personal-details-stub" />;
}

function OnboardingModalNavigator() {
    return (
        <OnboardingStack.Navigator screenOptions={{headerShown: false}}>
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.WORK_EMAIL}
                component={OnboardingWorkEmail}
            />
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION}
                component={OnboardingWorkEmailValidation}
            />
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.WORKSPACES}
                component={OnboardingWorkspacesStub}
            />
        </OnboardingStack.Navigator>
    );
}

// The back button is what is under test in the second-visit case, so that one navigator renders the real screen.
function OnboardingModalNavigatorWithWorkspaces() {
    return (
        <OnboardingStack.Navigator screenOptions={{headerShown: false}}>
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                component={OnboardingPersonalDetailsStub}
            />
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.WORKSPACES}
                component={OnboardingWorkspaces}
            />
        </OnboardingStack.Navigator>
    );
}

function HTMLProviderWrapper({children}: {children: React.ReactNode}) {
    return <HTMLEngineProvider>{children}</HTMLEngineProvider>;
}

/**
 * Renders the onboarding screens behind a real `navigationRef`, so `Navigation.navigate` and `Navigation.goBack` act on
 * an actual navigation state. The per-screen tests in `WorkEmailOnboarding.tsx` spy on `Navigation.navigate` and render
 * one screen at a time, so they structurally cannot see a screen that is still mounted underneath another one.
 */
function renderOnboardingStack(initialRouteNames: Array<keyof OnboardingModalNavigatorParamList>, navigator: React.ComponentType = OnboardingModalNavigator) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer
                    ref={navigationRef}
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
                                state: {
                                    index: initialRouteNames.length - 1,
                                    routes: initialRouteNames.map((name) => ({name})),
                                },
                            },
                        ],
                    }}
                >
                    <RootStack.Navigator screenOptions={{headerShown: false}}>
                        <RootStack.Screen
                            name={NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}
                            component={navigator}
                        />
                    </RootStack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
        {wrapper: HTMLProviderWrapper},
    );
}

function getOnboardingRouteNames() {
    const rootState = navigationRef.getRootState();
    return rootState?.routes.at(0)?.state?.routes.map((route) => route.name) ?? [];
}

function mockResponseOnce(value: Partial<Onboarding>) {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: 200,
            onyxData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_ONBOARDING,
                    value,
                },
            ],
        };

        return Promise.resolve(mockedResponse);
    });
    return () => {
        HttpUtils.xhr = originalXhr;
    };
}

describe('Onboarding work email navigation', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should leave exactly one Join a workspace route on the stack after merging a work email', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
            // AddWorkEmail is gated on an unvalidated caller; signInWithTestUser sets validated:true by default.
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
        });

        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL]);

        await waitForBatchedUpdatesWithAct();

        // Submitting a work email that needs validation must replace the work email screen, not push on top of it.
        let restoreXhr = mockResponseOnce({shouldValidate: true});
        await act(async () => {
            AddWorkEmail(workEmail);
            await waitForBatchedUpdates();
        });
        restoreXhr();

        await waitForBatchedUpdatesWithAct();

        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);

        // The merge succeeds and moves the flow on to "Join a workspace".
        restoreXhr = mockResponseOnce({isMergeAccountStepCompleted: true});
        await act(async () => {
            MergeIntoAccountAndLogin(workEmail, '123456', 1);
            await waitForBatchedUpdates();
        });
        restoreXhr();

        await waitForBatchedUpdatesWithAct();

        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORKSPACES]);

        // OpenApp lands after the merge and flips the account fields the work email screen's effect depends on. When
        // that screen was pushed rather than replaced it was still mounted here, re-ran its effect, and stacked a
        // second copy of the flow, which is what made Back on "Join a workspace" look dead.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, isFromPublicDomain: false});
        });

        await waitForBatchedUpdatesWithAct();

        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORKSPACES]);
    });

    it('should land back on the work email screen even though the force replace removed it from the stack', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
            // Keeps both screens' navigate-away effects from firing, so the only navigation under test is the Back press.
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
        });

        // The stack BaseOnboardingWorkEmail leaves behind once it force-replaces itself: validation is the only route.
        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);

        await waitForBatchedUpdatesWithAct();

        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);

        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));

        await waitForBatchedUpdatesWithAct();

        // `goBack` was given an explicit ONBOARDING_WORK_EMAIL fallback, and `goUp` replaces into a fallback route that
        // is no longer on the stack rather than popping, so the user still lands on the work email screen.
        await waitFor(() => {
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL]);
        });

        // Leaving the validation screen clears `shouldValidate`, otherwise the work email screen would immediately
        // bounce forward again.
        let onboardingValues: OnyxEntry<Onboarding>;
        await TestHelper.getOnyxData({
            key: ONYXKEYS.NVP_ONBOARDING,
            callback: (value) => {
                onboardingValues = value;
            },
        });
        expect(onboardingValues?.shouldValidate).toBeUndefined();
    });

    it('should keep Back working on a later visit to Join a workspace after the merge', async () => {
        await TestHelper.signInWithTestUser();

        // The merge already happened, so its Onyx flags stay set for the rest of onboarding. They cannot tell the
        // post-merge entry point apart from this later visit, which is why the entry point is flagged by route param.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                isMergeAccountStepCompleted: true,
                isMergeAccountStepSkipped: false,
            });
        });

        // Skip for now -> Employer -> Personal Details -> forward to here again, so a real screen sits behind it.
        renderOnboardingStack([SCREENS.ONBOARDING.PERSONAL_DETAILS, SCREENS.ONBOARDING.WORKSPACES], OnboardingModalNavigatorWithWorkspaces);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('common.back'))).toBeOnTheScreen();
        });

        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PERSONAL_DETAILS]);
        });
    });
});

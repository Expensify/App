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
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import OnboardingPrivateDomain from '@pages/OnboardingPrivateDomain';
import OnboardingWorkEmail from '@pages/OnboardingWorkEmail';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation';
import OnboardingWorkspaces from '@pages/OnboardingWorkspaces';

import {completeOnboarding} from '@userActions/Report';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

jest.mock('@userActions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        completeOnboarding: jest.fn(),
    };
});

const mockCompleteOnboarding = jest.mocked(completeOnboarding);

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

// Drives the whole merge like `OnboardingModalNavigator`, but with the real "Join a workspace" screen, so the absence
// of its Back button can be asserted against the stack the merge actually leaves behind.
function OnboardingModalNavigatorWithRealWorkspaces() {
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
                component={OnboardingWorkspaces}
            />
        </OnboardingStack.Navigator>
    );
}

// Stands in for the intent list; only whether Back lands on it matters.
function OnboardingPurposeStub() {
    return <View testID="onboarding-purpose-stub" />;
}

function OnboardingModalNavigatorWithPurpose() {
    return (
        <OnboardingStack.Navigator screenOptions={{headerShown: false}}>
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.PURPOSE}
                component={OnboardingPurposeStub}
            />
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.WORK_EMAIL}
                component={OnboardingWorkEmail}
            />
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION}
                component={OnboardingWorkEmailValidation}
            />
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.PRIVATE_DOMAIN}
                component={OnboardingPrivateDomain}
            />
            <OnboardingStack.Screen
                name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                component={OnboardingPersonalDetailsStub}
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

        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL], OnboardingModalNavigatorWithRealWorkspaces);

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

        // Nothing is left behind this screen, so it must not offer Back. Asserted here, on the stack the real merge
        // produced, rather than against an injected prop: this is the only place the whole chain is exercised.
        await waitFor(() => {
            expect(screen.queryByLabelText(TestHelper.translateLocal('common.back'))).not.toBeOnTheScreen();
        });

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

    it('should return to the intent list when Back is pressed on the work email screen after a refresh', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
        });

        // Given a refresh rebuilt the stack from the URL, so the intent list is no longer behind the work email screen
        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL], OnboardingModalNavigatorWithPurpose);

        await waitForBatchedUpdatesWithAct();

        // When the user presses Back
        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('common.back'))).toBeOnTheScreen();
        });
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));

        await waitForBatchedUpdatesWithAct();

        // Then the explicit ONBOARDING_PURPOSE fallback replaces the work email screen inside the modal instead of
        // popping the whole onboarding modal
        await waitFor(() => {
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE]);
        });
    });

    it('should clear the work email error when Back is pressed so the intent list does not show it', async () => {
        await TestHelper.signInWithTestUser();

        // Given AddWorkEmail failed with the domain-controlled error while joining a company workspace
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                isMergingAccountBlocked: true,
            });
            await Onyx.merge(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, 'onboarding.mergeBlockScreen.domainControlledSubtitle');
            await Onyx.merge(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
        });

        renderOnboardingStack([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL], OnboardingModalNavigatorWithPurpose);

        await waitForBatchedUpdatesWithAct();

        // When the user presses Back instead of confirming the blocked screen
        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('common.back'))).toBeOnTheScreen();
        });
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE]);
        });

        // Then the error is cleared, because the intent list translates it without the work email and would show
        // "undefined is a domain controlled login"
        let errorMessageTranslationKey: OnyxEntry<string>;
        await TestHelper.getOnyxData({
            key: ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
            callback: (value) => {
                errorMessageTranslationKey = value ?? undefined;
            },
        });
        expect(errorMessageTranslationKey).toBeFalsy();

        let onboardingValues: OnyxEntry<Onboarding>;
        await TestHelper.getOnyxData({
            key: ONYXKEYS.NVP_ONBOARDING,
            callback: (value) => {
                onboardingValues = value;
            },
        });
        expect(onboardingValues?.isMergingAccountBlocked).toBe(false);
    });

    it('should reopen magic code after skipping an existing work email and submitting it again', async () => {
        // Given a public-domain user joining a workspace with an existing work account
        await TestHelper.signInWithTestUser(1, 'test@gmail.com');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
        });
        renderOnboardingStack([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL], OnboardingModalNavigatorWithPurpose);
        await waitForBatchedUpdatesWithAct();

        const restoreXhr = mockResponseOnce({shouldValidate: true});
        try {
            fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.workEmail')), workEmail);
            fireEvent.press(screen.getByText(TestHelper.translateLocal('onboarding.workEmail.addWorkEmail')));
            await waitForBatchedUpdatesWithAct();
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);

            // When they skip validation, return to the intent list, and submit the same email on a new visit
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.skip')));
            await waitForBatchedUpdatesWithAct();
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.PERSONAL_DETAILS]);
            act(() => Navigation.goBack(ROUTES.ONBOARDING_PURPOSE.getRoute()));
            await waitForBatchedUpdatesWithAct();
            act(() => Navigation.navigate(ROUTES.ONBOARDING_WORK_EMAIL.getRoute()));
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByText(TestHelper.translateLocal('onboarding.workEmail.addWorkEmail')));
            await waitForBatchedUpdatesWithAct();

            // Then stale completion flags must not immediately skip the newly opened validation screen
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);
            expect(screen.queryByTestId('onboarding-personal-details-stub')).not.toBeOnTheScreen();
        } finally {
            restoreXhr();
        }
    });

    it('should complete onboarding with the saved name when the work email step is skipped', async () => {
        // Given a public-domain Join Workspace user who entered their name earlier in onboarding
        const dismissModal = jest.spyOn(Navigation, 'dismissModal').mockImplementation(() => {});
        await TestHelper.signInWithTestUser(1, 'test@gmail.com');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {firstName: 'Test', lastName: 'User'});
        });
        renderOnboardingStack([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL], OnboardingModalNavigatorWithPurpose);
        await waitForBatchedUpdatesWithAct();

        // When they skip adding a work email
        fireEvent.press(screen.getByTestId('onboardingPrivateEmailSkipButton'));
        await waitForBatchedUpdatesWithAct();

        // Then onboarding completes with that name instead of asking for it again
        expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
        expect(mockCompleteOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({
                engagementChoice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
                firstName: 'Test',
                lastName: 'User',
            }),
        );
        expect(getOnboardingRouteNames()).not.toContain(SCREENS.ONBOARDING.PERSONAL_DETAILS);
        expect(dismissModal).toHaveBeenCalled();
        dismissModal.mockRestore();
    });

    it('should complete onboarding with the saved name when work email validation is skipped', async () => {
        // Given a public-domain Join Workspace user with a saved name who reached validation for an existing work account
        const dismissModal = jest.spyOn(Navigation, 'dismissModal').mockImplementation(() => {});
        await TestHelper.signInWithTestUser(1, 'test@gmail.com');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false, shouldValidate: true});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {firstName: 'Test', lastName: 'User'});
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {onboardingWorkEmail: workEmail});
        });
        renderOnboardingStack([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION], OnboardingModalNavigatorWithPurpose);
        await waitForBatchedUpdatesWithAct();

        // When they skip validating the work email
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.skip')));
        await waitForBatchedUpdatesWithAct();

        // Then onboarding completes with that name instead of asking for it again
        expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
        expect(mockCompleteOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({
                engagementChoice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
                firstName: 'Test',
            }),
        );
        expect(getOnboardingRouteNames()).not.toContain(SCREENS.ONBOARDING.PERSONAL_DETAILS);
        expect(dismissModal).toHaveBeenCalled();
        dismissModal.mockRestore();
    });

    it('should resume primary work email validation after going back and resubmitting', async () => {
        // Given a work email that became the unvalidated primary login on the first AddWorkEmail request
        await TestHelper.signInWithTestUser(1, workEmail);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: false});
            await Onyx.set(ONYXKEYS.LOGINS, {[workEmail]: {validatedDate: ''}});
        });
        renderOnboardingStack([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL], OnboardingModalNavigatorWithPurpose);
        await waitForBatchedUpdatesWithAct();

        // When the same primary email is submitted, including with different casing
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.workEmail')), workEmail.toUpperCase());
        fireEvent.press(screen.getByText(TestHelper.translateLocal('onboarding.workEmail.addWorkEmail')));
        await waitForBatchedUpdatesWithAct();

        // Then it opens validation, and Back still restores the work-email form for another submission
        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.PRIVATE_DOMAIN]);
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));
        await waitForBatchedUpdatesWithAct();
        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL]);
        fireEvent.press(screen.getByText(TestHelper.translateLocal('onboarding.workEmail.addWorkEmail')));
        await waitForBatchedUpdatesWithAct();
        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.PRIVATE_DOMAIN]);
    });

    it('should return directly to purpose when private-domain validation was opened from the intent list', async () => {
        // Given an unvalidated private-domain user whose earlier direct add left shouldValidate false
        await TestHelper.signInWithTestUser(1, workEmail);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false, shouldValidate: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: false});
            await Onyx.set(ONYXKEYS.LOGINS, {[workEmail]: {validatedDate: ''}});
        });
        renderOnboardingStack([SCREENS.ONBOARDING.PURPOSE], OnboardingModalNavigatorWithPurpose);
        await waitForBatchedUpdatesWithAct();
        act(() => Navigation.navigate(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(ROUTES.ONBOARDING_PURPOSE.getRoute())));
        await waitForBatchedUpdatesWithAct();

        // When Back is pressed on the screen reached directly from Join my company workspace
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));
        await waitForBatchedUpdatesWithAct();

        // Then it returns to the actual origin without inserting a work-email screen
        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE]);
        expect(screen.getByTestId('onboarding-purpose-stub')).toBeOnTheScreen();
    });

    it('should keep Back working on a later visit to Join a workspace after the merge', async () => {
        await TestHelper.signInWithTestUser();

        // The merge already happened, so its Onyx flags stay set for the rest of onboarding. They cannot tell the
        // post-merge entry point apart from this later visit; the stack behind the screen is what distinguishes them.
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

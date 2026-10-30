import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import OnboardingWorkEmail from '@pages/OnboardingWorkEmail/index.native';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation/index.native';
import OnboardingWorkspaces from '@pages/OnboardingWorkspaces/index.native';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Onboarding} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {HardwareBackPressEvent} from 'react-native/Libraries/Utilities/BackHandler';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import React from 'react';
import {BackHandler, View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

// Jest resolves the platform-neutral no-op variant, so use the Android one that actually registers the handler.
jest.mock('@hooks/useAndroidBackButtonHandler', () => jest.requireActual<Record<string, unknown>>('@hooks/useAndroidBackButtonHandler/index.android'));

TestHelper.setupGlobalFetchMock();

const RootStack = createPlatformStackNavigator<{[NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]: undefined}>();
const OnboardingStack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

const workEmail = 'testprivateemail@privateEmail.com';
const mockHardwareBackPressEvent: HardwareBackPressEvent = {type: 'hardwareBackPress', timeStamp: 0};

// Stands in for whatever screen precedes a later visit to "Join a workspace"; only its presence on the stack matters.
function OnboardingPersonalDetailsStub() {
    return <View testID="onboarding-personal-details-stub" />;
}

// Stands in for the intent list; only whether back lands on it matters.
function OnboardingPurposeStub() {
    return <View testID="onboarding-purpose-stub" />;
}

// The native (`index.native.tsx`) screens are imported directly: only those register the hardware back handler under
// test, and Jest resolves the web `index.tsx` for a bare `@pages/...` import.
function OnboardingModalNavigator() {
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

/** Renders the onboarding screens behind a real `navigationRef`, so the back press acts on an actual navigation state. */
function renderOnboardingStack(initialRouteNames: Array<keyof OnboardingModalNavigatorParamList>) {
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
                            component={OnboardingModalNavigator}
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

async function getOnboardingValues() {
    let onboardingValues: OnyxEntry<Onboarding>;
    await TestHelper.getOnyxData({
        key: ONYXKEYS.NVP_ONBOARDING,
        callback: (value) => {
            onboardingValues = value;
        },
    });
    return onboardingValues;
}

describe('Onboarding work email validation (Android system back)', () => {
    let backHandlerSpy: jest.SpyInstance;
    const hardwareBackHandlers: Array<(event: HardwareBackPressEvent) => boolean | null | undefined> = [];

    /**
     * React Native calls `hardwareBackPress` subscribers newest first and stops at the first one that returns true, so
     * this does the same. NavigationContainer subscribes too (it pops the stack when it can go back), and asserting
     * against a single captured handler would only ever test whichever one happened to subscribe last.
     */
    const pressHardwareBack = (): boolean => {
        let consumed = false;
        act(() => {
            consumed = [...hardwareBackHandlers].reverse().some((handler) => handler(mockHardwareBackPressEvent) === true);
        });
        return consumed;
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        hardwareBackHandlers.length = 0;
        backHandlerSpy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((event, handler) => {
            hardwareBackHandlers.push(handler);
            return {
                remove: () => {
                    const index = hardwareBackHandlers.indexOf(handler);
                    if (index < 0) {
                        return;
                    }
                    hardwareBackHandlers.splice(index, 1);
                },
            };
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        backHandlerSpy.mockRestore();
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should clear shouldValidate and return to the work email screen on a system back press', async () => {
        // Given the stack BaseOnboardingWorkEmail leaves behind once it force-replaces itself: validation is the only
        // route, so an unhandled system back would escape the onboarding modal entirely.
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
            // Keeps both screens' navigate-away effects from firing, so the only navigation under test is the back press.
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
        });

        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);

        await waitForBatchedUpdatesWithAct();

        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);
        expect((await getOnboardingValues())?.shouldValidate).toBe(true);

        // When Android's system back button is pressed
        const consumed = pressHardwareBack();

        await waitForBatchedUpdatesWithAct();

        // Then the press is handled here rather than bubbling to the parent stack and popping the onboarding modal
        expect(consumed).toBe(true);

        // Then it runs the same fallback as the header back button and lands on the work email screen
        await waitFor(() => {
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL]);
        });

        // Then `shouldValidate` is cleared, otherwise validation reopens as soon as onboarding resumes
        expect((await getOnboardingValues())?.shouldValidate).toBeUndefined();
    });

    it('should ignore a system back press while the magic code is being submitted', async () => {
        // Given the validation screen with a merge request in flight. The request cannot be cancelled, so leaving now
        // would let the work email screen consume its success and skip "Join a workspace".
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isLoading: true, loadingForm: CONST.FORMS.VALIDATE_CODE_FORM});
        });

        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);

        await waitForBatchedUpdatesWithAct();

        // When Android's system back button is pressed
        const consumed = pressHardwareBack();

        await waitForBatchedUpdatesWithAct();

        // Then the press is consumed so it cannot pop the onboarding modal either
        expect(consumed).toBe(true);

        // Then the user stays on validation and `shouldValidate` is untouched, so the merge response routes as normal
        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);
        expect((await getOnboardingValues())?.shouldValidate).toBe(true);
    });

    it('should swallow a system back press on the post-merge Join a workspace screen', async () => {
        // Given the stack the merge leaves behind: "Join a workspace" is the only onboarding route, so an unhandled
        // system back would bubble to the root stack and pop the whole onboarding modal mid-flow
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                isMergeAccountStepCompleted: true,
                isMergeAccountStepSkipped: false,
            });
        });

        renderOnboardingStack([SCREENS.ONBOARDING.WORKSPACES]);

        await waitForBatchedUpdatesWithAct();

        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORKSPACES]);

        // When Android's system back button is pressed
        const consumed = pressHardwareBack();

        await waitForBatchedUpdatesWithAct();

        // Then the press is consumed and the user stays in onboarding, matching the hidden header back button
        expect(consumed).toBe(true);
        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORKSPACES]);
    });

    it('should let a system back press through on a later visit to Join a workspace', async () => {
        // Given the same merge flags but a real screen behind this one, which is the state a later visit leaves
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                isMergeAccountStepCompleted: true,
                isMergeAccountStepSkipped: false,
            });
        });

        renderOnboardingStack([SCREENS.ONBOARDING.PERSONAL_DETAILS, SCREENS.ONBOARDING.WORKSPACES]);

        await waitForBatchedUpdatesWithAct();

        // When Android's system back button is pressed
        pressHardwareBack();

        await waitForBatchedUpdatesWithAct();

        // Then no handler swallows it and the onboarding stack pops as normal
        await waitFor(() => {
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PERSONAL_DETAILS]);
        });
    });

    it('should show the back button message once and still send the work email after a system back press on the work email screen', async () => {
        // Given an unvalidated public-domain user on the work email screen with a work email typed
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
        });

        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL]);

        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.workEmail')), workEmail);

        await waitForBatchedUpdatesWithAct();

        const xhrSpy = jest.spyOn(HttpUtils, 'xhr').mockImplementation(() => Promise.resolve({jsonCode: 200}));
        try {
            // When Android's system back button is pressed
            const consumed = pressHardwareBack();

            await waitForBatchedUpdatesWithAct();

            // Then the screen keeps the press, and the message it sets shows once without becoming an error on the form
            expect(consumed).toBe(true);
            expect(screen.getAllByText(TestHelper.translateLocal('onboarding.purpose.errorBackButton'))).toHaveLength(1);
            expect((await getOnyxValue(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM))?.errors).toBeFalsy();

            // When the user presses "Add work email" without editing the email
            fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('onboarding.workEmail.addWorkEmail')}));

            await waitForBatchedUpdatesWithAct();

            // Then the work email is sent, because the back button message doesn't block the submit
            await waitFor(() => {
                expect(xhrSpy.mock.calls.filter(([command]) => command === SIDE_EFFECT_REQUEST_COMMANDS.ADD_WORK_EMAIL)).toHaveLength(1);
            });
        } finally {
            xhrSpy.mockRestore();
        }
    });

    it('should swallow a system back press and show the error when work email is the first onboarding screen', async () => {
        // Given work email is the only onboarding route, which is where a public-domain account starts onboarding
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
        });

        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL]);

        await waitForBatchedUpdatesWithAct();

        // When Android's system back button is pressed
        const consumed = pressHardwareBack();

        await waitForBatchedUpdatesWithAct();

        // Then the press is consumed so it cannot pop the onboarding modal, and the user is told to finish setup
        expect(consumed).toBe(true);
        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL]);
        let errorMessage: OnyxEntry<string>;
        await TestHelper.getOnyxData({
            key: ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
            callback: (value) => {
                errorMessage = value ?? undefined;
            },
        });
        expect(errorMessage).toBe('onboarding.purpose.errorBackButton');
    });

    it('should go back to the intent list when the join workspace intent opened work email', async () => {
        // Given the intent list sent the user to work email after they picked "Join my company workspace", so the
        // intent list is behind this screen
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
        });

        renderOnboardingStack([SCREENS.ONBOARDING.PURPOSE]);

        await waitForBatchedUpdatesWithAct();

        // Push work email after mount like the intent list does, so its back handler subscribes after the
        // NavigationContainer's one and gets the press first, as it does in the app
        act(() => {
            navigationRef.dispatch(StackActions.push(SCREENS.ONBOARDING.WORK_EMAIL));
        });

        await waitForBatchedUpdatesWithAct();

        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK_EMAIL]);

        // Given adding the work email failed, leaving errors that the intent list would render if they followed the user back
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {isMergingAccountBlocked: true});
            await Onyx.set(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, 'onboarding.purpose.errorBackButton');
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {errors: {error: 'Work email error'}});
        });

        await waitForBatchedUpdatesWithAct();

        // When Android's system back button is pressed
        const consumed = pressHardwareBack();

        await waitForBatchedUpdatesWithAct();

        // Then the screen handles the press like the header back button: it returns to the intent list and no error is left behind
        expect(consumed).toBe(true);
        await waitFor(() => {
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE]);
        });
        let errorMessage: OnyxEntry<string>;
        await TestHelper.getOnyxData({
            key: ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
            callback: (value) => {
                errorMessage = value ?? undefined;
            },
        });
        expect(errorMessage).toBeUndefined();
        expect((await getOnboardingValues())?.isMergingAccountBlocked).toBe(false);
        expect((await getOnyxValue(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM))?.errors).toBeFalsy();
    });

    it('should replace work email with the intent list when the join workspace intent is saved but work email is the only route', async () => {
        // Given the user picked "Join my company workspace" and then reopened the app, which rebuilds the onboarding
        // stack with work email as its only route
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
        });

        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL]);

        await waitForBatchedUpdatesWithAct();

        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL]);

        // When Android's system back button is pressed
        const consumed = pressHardwareBack();

        await waitForBatchedUpdatesWithAct();

        // Then the press is handled here so it cannot close the onboarding modal, and the intent list replaces work
        // email, matching the header back button
        expect(consumed).toBe(true);
        await waitFor(() => {
            expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.PURPOSE]);
        });

        // Then the "finish setup" error is not shown, because the user had somewhere to go back to
        let errorMessage: OnyxEntry<string>;
        await TestHelper.getOnyxData({
            key: ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
            callback: (value) => {
                errorMessage = value ?? undefined;
            },
        });
        expect(errorMessage).toBeUndefined();
    });
});

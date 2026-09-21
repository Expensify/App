import {act, render, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';

import OnboardingWorkEmail from '@pages/OnboardingWorkEmail/index.native';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation/index.native';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Onboarding} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {HardwareBackPressEvent} from 'react-native/Libraries/Utilities/BackHandler';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {BackHandler} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
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
const mockHardwareBackPressEvent: HardwareBackPressEvent = {type: 'hardwareBackPress', timeStamp: 0};

// The native (`index.native.tsx`) screens are imported directly: only those register the hardware back handler under
// test, and Jest resolves the web `index.tsx` for a bare `@pages/...` import.
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
    let hardwareBackCallback: ((event: HardwareBackPressEvent) => boolean | null | undefined) | undefined;

    const pressHardwareBack = (): boolean | null | undefined => {
        let consumed: boolean | null | undefined;
        act(() => {
            consumed = hardwareBackCallback?.(mockHardwareBackPressEvent);
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
        hardwareBackCallback = undefined;
        backHandlerSpy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((event, handler) => {
            hardwareBackCallback = handler;
            return {remove: jest.fn()};
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

    it('should swallow a system back press while merging the account is blocked', async () => {
        // Given the merge is blocked, which is the one case where the header hides its back button
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
                isMergingAccountBlocked: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
        });

        renderOnboardingStack([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);

        await waitForBatchedUpdatesWithAct();

        // When Android's system back button is pressed
        const consumed = pressHardwareBack();

        await waitForBatchedUpdatesWithAct();

        // Then the press is consumed and nothing moves, matching the hidden header back button
        expect(consumed).toBe(true);
        expect(getOnboardingRouteNames()).toEqual([SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]);
        expect((await getOnboardingValues())?.shouldValidate).toBe(true);
    });
});

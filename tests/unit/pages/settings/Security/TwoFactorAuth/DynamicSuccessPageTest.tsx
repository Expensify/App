import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';

import DynamicSuccessPage from '@pages/settings/Security/TwoFactorAuth/DynamicSuccessPage';

import {clearTwoFactorAuthData, quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import {resumeOnboardingAfterRequired2FASetup} from '@userActions/Welcome/OnboardingFlow';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {CommonActions, NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../../utils/waitForBatchedUpdates';

let mockOnButtonPress: (() => void) | undefined;
let mockOnBackButtonPress: (() => void) | undefined;

jest.mock('@pages/settings/Security/TwoFactorAuth/SuccessPageBase', () => ({
    __esModule: true,
    default: ({onButtonPress, onBackButtonPress}: {onButtonPress: () => void; onBackButtonPress: () => void}) => {
        mockOnButtonPress = onButtonPress;
        mockOnBackButtonPress = onBackButtonPress;
        return null;
    },
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn());
jest.mock('@hooks/useDynamicForwardPath', () => jest.fn(() => undefined));

jest.mock('@userActions/TwoFactorAuthActions', () => ({
    clearTwoFactorAuthData: jest.fn(),
    quitAndNavigateBack: jest.fn(),
    setCodesAreCopied: jest.fn(),
}));

jest.mock('@userActions/Welcome/OnboardingFlow', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Welcome/OnboardingFlow'),
    resumeOnboardingAfterRequired2FASetup: jest.fn(),
}));

const mockedUseDynamicBackPath = jest.mocked(useDynamicBackPath);

const Stack = createPlatformStackNavigator<TwoFactorAuthNavigatorParamList>();
const RootStack = createPlatformStackNavigator<{Home: undefined; Modal: undefined}>();

function HomeScreen() {
    return null;
}

async function renderPage(initialParams?: TwoFactorAuthNavigatorParamList[typeof SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS]) {
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS}>
                    <Stack.Screen
                        name={SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS}
                        component={DynamicSuccessPage}
                        initialParams={initialParams}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdates();
}

async function renderPageUnderModal(initialParams?: TwoFactorAuthNavigatorParamList[typeof SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS]) {
    render(
        <OnyxListItemProvider>
            <NavigationContainer
                ref={navigationRef}
                initialState={{index: 1, routes: [{name: 'Home'}, {name: 'Modal'}]}}
            >
                <RootStack.Navigator>
                    <RootStack.Screen
                        name="Home"
                        component={HomeScreen}
                    />
                    <RootStack.Screen name="Modal">
                        {() => (
                            <Stack.Navigator initialRouteName={SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS}>
                                <Stack.Screen
                                    name={SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS}
                                    component={DynamicSuccessPage}
                                    initialParams={initialParams}
                                />
                            </Stack.Navigator>
                        )}
                    </RootStack.Screen>
                </RootStack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdates();
}

function dismissModal() {
    act(() => {
        navigationRef.dispatch(CommonActions.goBack());
    });
}

describe('DynamicSuccessPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnButtonPress = undefined;
        mockOnBackButtonPress = undefined;
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        jest.spyOn(Navigation, 'replaceFullscreenUnderRHP').mockImplementation(() => {});
        jest.spyOn(Navigation, 'revealRouteBeforeDismissingModal').mockImplementation((_route, options) => {
            options?.afterTransition?.();
        });
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('sends an admin who already finished onboarding Home after the required-2FA overlay setup', async () => {
        // Given the 2FA setup was opened from the require-2FA overlay (Security base with forceSetup) by a user who already completed onboarding
        mockedUseDynamicBackPath.mockReturnValue(ROUTES.SETTINGS_SECURITY.getRoute(true));
        await Onyx.merge(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await renderPage({forceSetup: 'true'});

        // When the user presses "Got it"
        mockOnButtonPress?.();

        // Then Home is revealed under the RHP and setup data is cleared, instead of staying on the Enabled page or resuming onboarding
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(ROUTES.HOME, expect.anything());
        expect(Navigation.replaceFullscreenUnderRHP).not.toHaveBeenCalled();
        expect(clearTwoFactorAuthData).toHaveBeenCalledWith(true, true);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.SETTINGS_2FA_ENABLED, expect.anything());
        expect(resumeOnboardingAfterRequired2FASetup).not.toHaveBeenCalled();
        expect(quitAndNavigateBack).not.toHaveBeenCalled();
    });

    it('sends an admin who already finished onboarding Home when they press back on the success page of the required-2FA overlay setup', async () => {
        // Given the 2FA setup was opened from the require-2FA overlay (Security base with forceSetup) by a user who already completed onboarding
        mockedUseDynamicBackPath.mockReturnValue(ROUTES.SETTINGS_SECURITY.getRoute(true));
        await Onyx.merge(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await renderPage({forceSetup: 'true'});

        // When the user presses the back button
        mockOnBackButtonPress?.();

        // Then Home is revealed under the RHP instead of returning to Settings > Security
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(ROUTES.HOME, expect.anything());
        expect(Navigation.replaceFullscreenUnderRHP).not.toHaveBeenCalled();
        expect(clearTwoFactorAuthData).toHaveBeenCalledWith(true, true);
        expect(quitAndNavigateBack).not.toHaveBeenCalled();
    });

    it('resumes onboarding after the required-2FA overlay setup when onboarding is incomplete', async () => {
        // Given the 2FA setup was opened from the require-2FA overlay (Security base with forceSetup) by a user who has not finished onboarding
        mockedUseDynamicBackPath.mockReturnValue(ROUTES.SETTINGS_SECURITY.getRoute(true));
        await Onyx.merge(ONYXKEYS.ACCOUNT, {twoFactorAuthSetupInProgress: true});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await renderPage({forceSetup: 'true'});

        // When the user presses "Got it"
        mockOnButtonPress?.();

        // Then Home is revealed and onboarding resumes, so the deferred openApp handoff still runs
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(ROUTES.HOME, expect.anything());
        expect(Navigation.replaceFullscreenUnderRHP).not.toHaveBeenCalled();
        expect(resumeOnboardingAfterRequired2FASetup).toHaveBeenCalled();
        expect(quitAndNavigateBack).not.toHaveBeenCalled();
    });

    it('keeps the RHP open on the Enabled page when 2FA was set up voluntarily from Settings > Security', async () => {
        // Given the 2FA setup was opened from Settings > Security without forceSetup by a user who already completed onboarding
        mockedUseDynamicBackPath.mockReturnValue(ROUTES.SETTINGS_SECURITY.getRoute());
        await Onyx.merge(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await renderPage();

        // When the user presses "Got it"
        mockOnButtonPress?.();

        // Then the user stays in the RHP on the Enabled page, and setup progress is cleared
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_2FA_ENABLED, {forceReplace: true});
        expect(clearTwoFactorAuthData).toHaveBeenCalledWith(true, true);
        expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        expect(Navigation.replaceFullscreenUnderRHP).not.toHaveBeenCalled();
        expect(quitAndNavigateBack).not.toHaveBeenCalled();
    });

    it('puts Home under the panel when a forced setup success screen is removed by back', async () => {
        // Given a completed forced setup is the only screen inside a modal
        mockedUseDynamicBackPath.mockReturnValue(ROUTES.SETTINGS_SECURITY.getRoute(true));
        await Onyx.merge(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await renderPageUnderModal({forceSetup: 'true'});

        // When Android back, browser back, or the overlay press removes the modal
        dismissModal();

        // Then Home is swapped under the panel and the existing button reveal is not used
        expect(Navigation.replaceFullscreenUnderRHP).toHaveBeenCalledTimes(1);
        expect(Navigation.replaceFullscreenUnderRHP).toHaveBeenCalledWith(ROUTES.HOME);
        expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        expect(quitAndNavigateBack).not.toHaveBeenCalled();
    });

    it('resumes onboarding when a forced setup success screen is removed by back', async () => {
        // Given the user still has to resume onboarding after the required setup
        mockedUseDynamicBackPath.mockReturnValue(ROUTES.SETTINGS_SECURITY.getRoute(true));
        await Onyx.merge(ONYXKEYS.ACCOUNT, {twoFactorAuthSetupInProgress: true});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        const runAfterTransitions = jest.spyOn(TransitionTracker, 'runAfterTransitions').mockImplementation(({callback}) => {
            callback();
            return {cancel: () => {}};
        });
        await renderPageUnderModal({forceSetup: 'true'});

        // When the modal is removed instead of using Got it or the header arrow
        dismissModal();

        // Then Home is swapped under the panel and onboarding resumes once
        expect(Navigation.replaceFullscreenUnderRHP).toHaveBeenCalledTimes(1);
        expect(Navigation.replaceFullscreenUnderRHP).toHaveBeenCalledWith(ROUTES.HOME);
        expect(clearTwoFactorAuthData).toHaveBeenCalledWith(false, true);
        expect(runAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: 'navigation'}));
        expect(resumeOnboardingAfterRequired2FASetup).toHaveBeenCalledTimes(1);
        expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
    });

    it('leaves a voluntary success screen on its own back path when the modal is removed', async () => {
        // Given 2FA was opened from Settings > Security with onboarding already complete
        mockedUseDynamicBackPath.mockReturnValue(ROUTES.SETTINGS_SECURITY.getRoute());
        await Onyx.merge(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await renderPageUnderModal();

        // When the modal is removed
        dismissModal();

        // Then the forced Home swap does not run
        expect(Navigation.replaceFullscreenUnderRHP).not.toHaveBeenCalled();
        expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        expect(resumeOnboardingAfterRequired2FASetup).not.toHaveBeenCalled();
    });
});

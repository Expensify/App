import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';

import DynamicSuccessPage from '@pages/settings/Security/TwoFactorAuth/DynamicSuccessPage';

import {clearTwoFactorAuthData, quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import {resumeOnboardingAfterRequired2FASetup} from '@userActions/Welcome/OnboardingFlow';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
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

describe('DynamicSuccessPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnButtonPress = undefined;
        mockOnBackButtonPress = undefined;
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
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
        expect(quitAndNavigateBack).not.toHaveBeenCalled();
    });
});

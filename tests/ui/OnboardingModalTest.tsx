import {act, render, screen, userEvent, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import * as AppActions from '@userActions/App';
import * as User from '@userActions/User';
import App from '@src/App';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(60000);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        triggerTransitionEnd: jest.fn(),
    };
});

const DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: false,
};

const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

TestHelper.setupApp();

async function signInAndGetApp(): Promise<void> {
    // Render the App and sign in as a test user.
    render(<App />);
    await waitForBatchedUpdatesWithAct();

    const hintText = Localize.translateLocal('loginForm.loginForm');
    const loginForm = await screen.findAllByLabelText(hintText);
    expect(loginForm).toHaveLength(1);

    await act(async () => {
        await TestHelper.signInWithTestUser();
    });
    await waitForBatchedUpdatesWithAct();

    User.subscribeToUserEvents();
    await waitForBatchedUpdates();

    AppActions.setSidebarLoaded();

    await waitForBatchedUpdatesWithAct();
}

async function completeOnboarding(): Promise<void> {
    Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
    await waitForBatchedUpdatesWithAct();

    const user = userEvent.setup();
    user.press(screen.getByText(Localize.translateLocal('onboarding.purpose.newDotManageTeam')));
    expect(await screen.findByTestId('BaseOnboardingEmployees')).toBeOnTheScreen();
    user.press(screen.getByText(Localize.translateLocal('onboarding.employees.1-10')));
    user.press(screen.getByText(Localize.translateLocal('common.continue')));
    expect(await screen.findByTestId('BaseOnboardingAccounting')).toBeOnTheScreen();
    user.press(screen.getByText(Localize.translateLocal('onboarding.accounting.noneOfAbove')));
    user.press(screen.getByText(Localize.translateLocal('common.continue')));
}

describe('OnboardingModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
        // Unsubscribe to pusher channels
        PusherHelper.teardown();
    });

    it('navigates to #admins room if onboarding purpose is "Manage my team\'s expenses" and has 1-10 employees (vsb) on large screens', async () => {
        mockedUseResponsiveLayout.mockReturnValue(DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE);
        await signInAndGetApp();
        await completeOnboarding();

        // This value will be cleared once onboarding modal is hidden so we need to get it before
        await waitForBatchedUpdates();
        const onboardingAdminsChatReportID = await new Promise<string>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value ?? '');
                },
            });
        });

        // Wait for onboarding modal to be hidden
        await waitFor(() => expect(screen.queryByTestId('BaseOnboardingAccounting')).not.toBeOnTheScreen());
        expect(Navigation.isActiveRoute(ROUTES.REPORT_WITH_ID.getRoute(onboardingAdminsChatReportID))).toBeTruthy();
    });

    it('navigates to LHN if onboarding purpose is "Manage my team\'s expenses" and has 1-10 employees (vsb) on small screens', async () => {
        mockedUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: true});
        await signInAndGetApp();
        await completeOnboarding();

        // Wait for onboarding modal to be hidden
        await waitFor(() => expect(screen.queryByTestId('BaseOnboardingAccounting')).not.toBeOnTheScreen());
        expect(Navigation.isActiveRoute(ROUTES.HOME)).toBeTruthy();
    });
});

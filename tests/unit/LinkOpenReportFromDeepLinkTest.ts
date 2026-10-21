import {navigateToConciergeChat} from '@libs/actions/Report';
import {setOnboardingErrorMessage} from '@libs/actions/Welcome';
import {setDeepLinkToOpenAfterOnboarding} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import {openReportFromDeepLink} from '@src/libs/actions/Link';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {getRootState: jest.fn()},
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        isActiveRoute: jest.fn(() => false),
        getTopmostReportId: jest.fn(),
        waitForProtectedRoutes: jest.fn(() => Promise.resolve()),
    },
}));
jest.mock('@libs/actions/Session', () => ({
    canAnonymousUserAccessRoute: jest.fn(() => true),
    isAnonymousUser: jest.fn(() => false),
    signOutAndRedirectToSignIn: jest.fn(),
    waitForUserSignIn: jest.fn(() => Promise.resolve()),
}));
jest.mock('@libs/actions/Report', () => ({
    doneCheckingPublicRoom: jest.fn(),
    navigateToConciergeChat: jest.fn(),
    openReport: jest.fn(),
}));
jest.mock('@libs/actions/Welcome', () => ({
    setOnboardingErrorMessage: jest.fn(),
}));
jest.mock('@libs/navigateAfterOnboarding', () => ({
    setDeepLinkToOpenAfterOnboarding: jest.fn(),
}));

const mockedNavigation = jest.mocked(Navigation);
const mockedNavigateToConciergeChat = jest.mocked(navigateToConciergeChat);
const mockedSetDeepLinkToOpenAfterOnboarding = jest.mocked(setDeepLinkToOpenAfterOnboarding);
const mockedNavigationRef = jest.mocked(navigationRef);
const mockedSetOnboardingErrorMessage = jest.mocked(setOnboardingErrorMessage);

const APP_URL = 'https://new.expensify.com';

function focusOn(screenName: string) {
    const state: NavigationState = {
        stale: false,
        type: 'stack',
        key: 'root',
        index: 0,
        routeNames: [screenName],
        routes: [{key: screenName, name: screenName}],
    };
    mockedNavigationRef.getRootState.mockReturnValue(state);
}

async function handleLinkCapturedBeforeOnboarding(route: string) {
    // The link arrives while signed out, then the new account signs up and still has onboarding ahead of it
    openReportFromDeepLink(`${APP_URL}/${route}`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
    await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
    await waitForBatchedUpdates();

    // Completing onboarding marks it done before its screens close, which is when the link is handled
    await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
    await waitForBatchedUpdates();
}

function replayParkedLink() {
    const openParkedLink = mockedSetDeepLinkToOpenAfterOnboarding.mock.calls.at(-1)?.[0];
    return openParkedLink?.();
}

describe('openReportFromDeepLink before onboarding', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, true);
    });

    it('parks the link instead of opening it under the onboarding modal', async () => {
        // Given onboarding is on screen when the link is handled
        focusOn(SCREENS.ONBOARDING.PURPOSE);

        // When a link captured before sign-up is processed
        await handleLinkCapturedBeforeOnboarding(ROUTES.SETTINGS_PROFILE.route);

        // Then it is handed to the post-onboarding navigation rather than opened now, which would flash the "Not here" page
        expect(mockedSetDeepLinkToOpenAfterOnboarding).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it('opens a parked link only once report data has loaded', async () => {
        // Given a link parked while onboarding was on screen
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await handleLinkCapturedBeforeOnboarding(ROUTES.SETTINGS_PROFILE.route);

        // When onboarding finishes while the new account's data is still loading
        expect(replayParkedLink()).toBe(true);
        await waitForBatchedUpdates();

        // Then nothing opens yet, because the route would sit on its loading skeleton
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();

        // When the data finishes loading
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await waitForBatchedUpdates();

        // Then the link opens
        expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_PROFILE.route, expect.objectContaining({waitForTransition: true}));
    });

    it('opens a parked Concierge link in the chat instead of through the Concierge page', async () => {
        // Given a Concierge link parked while onboarding was on screen
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await handleLinkCapturedBeforeOnboarding(ROUTES.CONCIERGE);

        // When onboarding finishes and the data has loaded
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        replayParkedLink();
        await waitForBatchedUpdates();

        // Then the chat opens directly, since the Concierge page is a URL entry page that shows a skeleton and redirects itself
        expect(mockedNavigateToConciergeChat).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it.each([`${ROUTES.CONCIERGE}/`, `${ROUTES.CONCIERGE}?referrer=email`])('opens a parked Concierge link written as %s in the chat as well', async (route) => {
        // Given a Concierge link with a trailing slash or a query string, parked while onboarding was on screen
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await handleLinkCapturedBeforeOnboarding(route);

        // When onboarding finishes and the data has loaded
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        replayParkedLink();
        await waitForBatchedUpdates();

        // Then it still skips the Concierge page, which would slide in as a panel before redirecting
        expect(mockedNavigateToConciergeChat).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it('also parks the link when onboarding is no longer the focused screen', async () => {
        // Given the onboarding screens already closed by the time the link is handled
        focusOn(NAVIGATORS.TAB_NAVIGATOR);

        // When a link captured before sign-up is processed
        await handleLinkCapturedBeforeOnboarding(ROUTES.SETTINGS_PROFILE.route);

        // Then it is still parked, because the account had to onboard when the link was captured
        expect(mockedSetDeepLinkToOpenAfterOnboarding).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it('opens a parked report link once the report itself has arrived', async () => {
        // Given a link to a report the new account has not loaded yet, parked while onboarding was on screen
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await handleLinkCapturedBeforeOnboarding(ROUTES.REPORT_WITH_ID.getRoute('123'));
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);

        // When onboarding finishes before the report is in Onyx
        replayParkedLink();
        await waitForBatchedUpdates();

        // Then it waits, because a missing report would be treated as not found and sent elsewhere
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();

        // When the report arrives
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, {reportID: '123'});
        await waitForBatchedUpdates();

        // Then the report opens
        expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('123'), expect.objectContaining({waitForTransition: true}));
    });

    it('does not park a link the app never replays', async () => {
        // Given onboarding is on screen
        focusOn(SCREENS.ONBOARDING.PURPOSE);

        // When the captured link is the test tools modal, which is app state in the URL rather than a destination
        await handleLinkCapturedBeforeOnboarding(ROUTES.TEST_TOOLS_MODAL.route);

        // Then it is dropped, without the back-button error, since onboarding is already complete when the link is handled
        expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
        expect(mockedSetOnboardingErrorMessage).not.toHaveBeenCalled();
    });
});

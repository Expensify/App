import {navigateToConciergeChat} from '@libs/actions/Report';
import {waitForUserSignIn} from '@libs/actions/Session';
import {setOnboardingErrorMessage} from '@libs/actions/Welcome';
import {setDeepLinkToOpenAfterOnboarding} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {runSessionCleanupCallbacks} from '@libs/SessionCleanup';

import CONST from '@src/CONST';
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

    afterEach(async () => {
        runSessionCleanupCallbacks();
        await waitForBatchedUpdates();
    });

    it.each([
        ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: '123'}),
        ROUTES.SEARCH_REPORT.getRoute({reportID: '123'}),
        ROUTES.SEARCH_REPORT.getRoute({reportID: '123', reportActionID: '456', backTo: 'search?q=type:invoice'}),
    ])('replays %s after sign-in for a workspace member who does not need onboarding', async (route) => {
        // Given a workspace member can skip onboarding without completing its stored flag.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        let finishSignIn: (() => void) | undefined;
        jest.mocked(waitForUserSignIn).mockImplementationOnce(
            () =>
                new Promise<boolean>((resolve) => {
                    finishSignIn = () => resolve(true);
                }),
        );
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});

        // When the link arrives before sign-in and OpenApp supplies workspace membership afterward.
        openReportFromDeepLink(`${APP_URL}/${route}`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        await waitForBatchedUpdates();
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        finishSignIn?.();
        await waitForBatchedUpdates();
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
        await waitForBatchedUpdates();

        // Then the complete destination opens once instead of waiting for onboarding the member will never see.
        try {
            expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
            expect(mockedNavigation.navigate).toHaveBeenCalledWith(route, expect.objectContaining({waitForTransition: true}));
            expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
        } finally {
            // Finish pending subscriptions after a failed assertion so the next test cannot consume this link.
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await waitForBatchedUpdates();
        }
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

    it.each([
        ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: '123'}),
        ROUTES.SEARCH_REPORT.getRoute({reportID: '123'}),
        ROUTES.SEARCH_REPORT.getRoute({reportID: '123', reportActionID: '456', backTo: 'search?q=type:invoice'}),
    ])('replays %s when an invitation arrives for a user without a workspace', async (route) => {
        // Given invitation status is not yet available when the signed-out link is captured.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, false);
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        openReportFromDeepLink(`${APP_URL}/${route}`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        await waitForBatchedUpdates();
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();

        // When OpenApp supplies the invitation without changing onboarding or workspace membership.
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {inviteType: CONST.ONBOARDING_INVITE_TYPES.INVOICE});
        await waitForBatchedUpdates();

        // Then the invitation alone releases the complete target, without parking it for onboarding.
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).toHaveBeenCalledWith(route, expect.objectContaining({waitForTransition: true}));
        expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
    });

    it('replays an invitation-only link when invitation data arrives before onboarding', async () => {
        // Given onboarding is not loaded yet, so invitation data alone cannot decide whether to replay.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, false);
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {inviteType: CONST.ONBOARDING_INVITE_TYPES.CHAT});
        openReportFromDeepLink(`${APP_URL}/search/view/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        await waitForBatchedUpdates();
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();

        // When the incomplete onboarding flag arrives after the invitation.
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        // Then the replay uses both values regardless of their arrival order.
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).toHaveBeenCalledWith('search/view/123/456', expect.objectContaining({waitForTransition: true}));
        expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
    });

    it('does not bypass an open onboarding flow for an invited user', async () => {
        // Given an invitation must not interrupt an onboarding flow that is already on screen.
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, false);
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {inviteType: CONST.ONBOARDING_INVITE_TYPES.INVOICE});
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});

        // When the link is handled while that flow remains incomplete.
        openReportFromDeepLink(`${APP_URL}/search/view/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        await waitForBatchedUpdates();

        // Then the flow keeps control, and its completion still parks the link for the normal handoff.
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await waitForBatchedUpdates();
        expect(mockedSetDeepLinkToOpenAfterOnboarding).toHaveBeenCalledTimes(1);
    });

    it('does not treat intro data without an invite type as an onboarding exemption', async () => {
        // Given an organic account can have intro data without having been invited.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, false);
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        openReportFromDeepLink(`${APP_URL}/search/view/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);

        // When intro data arrives without the inviteType field used by the onboarding selector.
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {});
        await waitForBatchedUpdates();

        // Then the link still waits for actual onboarding rather than bypassing it.
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
    });

    it('ignores invitation data that arrives after session cleanup', async () => {
        // Given a pending link belongs to an account whose invitation has not arrived yet.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, false);
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        openReportFromDeepLink(`${APP_URL}/search/view/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        await waitForBatchedUpdates();

        // When that session ends before invitation data for another session arrives.
        runSessionCleanupCallbacks();
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {inviteType: CONST.ONBOARDING_INVITE_TYPES.INVOICE});
        await waitForBatchedUpdates();

        // Then invitation changes cannot resurrect the previous account's link.
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
    });

    it('keeps an open onboarding flow in charge even after the user joins a workspace', async () => {
        // Given joining a workspace during onboarding must not dismiss the remaining steps.
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});

        // When a Search report link is captured while the flow still owns the screen.
        openReportFromDeepLink(`${APP_URL}/search/view/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        await waitForBatchedUpdates();

        // Then membership does not bypass that flow, and the link is parked only after completion.
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await waitForBatchedUpdates();
        expect(mockedSetDeepLinkToOpenAfterOnboarding).toHaveBeenCalledTimes(1);
    });

    it('does not replay a pending link into a later account after session cleanup', async () => {
        // Given the first account has a pending link while its onboarding state is incomplete.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        openReportFromDeepLink(`${APP_URL}/search/view/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        await waitForBatchedUpdates();

        // When that session ends and a different account loads its workspace and onboarding data.
        runSessionCleanupCallbacks();
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await waitForBatchedUpdates();

        // Then neither an immediate replay nor a parked callback carries the previous account's target forward.
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
    });

    it.each([{reportID: '123'}, {reportID: '123', errorFields: {notFound: {error: 'Report not found'}}}])(
        'cancels a report waiter when the session ends before the report resolves as %j',
        async (report) => {
            // Given a workspace member has signed in but the linked report has not arrived.
            focusOn(NAVIGATORS.TAB_NAVIGATOR);
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
            openReportFromDeepLink(`${APP_URL}/r/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
            await waitForBatchedUpdates();
            expect(mockedNavigation.navigate).not.toHaveBeenCalled();

            // When the session ends before a later account loads the report or its not-found response.
            runSessionCleanupCallbacks();
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, report);
            await waitForBatchedUpdates();

            // Then neither the old target nor its missing-report fallback can navigate the new session.
            expect(mockedNavigation.navigate).not.toHaveBeenCalled();
            expect(mockedNavigateToConciergeChat).not.toHaveBeenCalled();
        },
    );

    it('ignores an already queued report callback after session cleanup', async () => {
        // Given the report waiter exists and its callback may already have been queued for delivery.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        const connectSpy = jest.spyOn(Onyx, 'connectWithoutView');
        try {
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            openReportFromDeepLink(`${APP_URL}/r/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
            await waitForBatchedUpdates();
            const reportCallback = connectSpy.mock.calls.find(([options]) => options.key === `${ONYXKEYS.COLLECTION.REPORT}123`)?.[0].callback;
            expect(reportCallback).toBeDefined();

            // When cancellation happens before that captured callback is delivered.
            runSessionCleanupCallbacks();
            reportCallback?.({reportID: '123'}, `${ONYXKEYS.COLLECTION.REPORT}123`);

            // Then disconnecting is backed by a cancellation check, not just the absence of future notifications.
            expect(mockedNavigation.navigate).not.toHaveBeenCalled();
            expect(mockedNavigateToConciergeChat).not.toHaveBeenCalled();
        } finally {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, {reportID: '123'});
            await waitForBatchedUpdates();
            connectSpy.mockRestore();
        }
    });

    it('opens a member report once when the report arrives without a sign-out', async () => {
        // Given cancellation must not prevent a still-active session from finishing its report load.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
        openReportFromDeepLink(`${APP_URL}/r/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        await waitForBatchedUpdates();
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();

        // When the report arrives and then receives another update in the same session.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, {reportID: '123'});
        await waitForBatchedUpdates();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}123`, {reportName: 'Updated report'});
        await waitForBatchedUpdates();

        // Then loading completes once, without leaving a subscription that reopens the report.
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).toHaveBeenCalledWith('r/123/456', expect.objectContaining({waitForTransition: true}));
    });

    it.each([ROUTES.SETTINGS_PROFILE.route, ROUTES.CONCIERGE])('cancels the post-onboarding loading waiter for %s on sign-out', async (route) => {
        // Given onboarding has handed a parked link to a waiter for OpenApp's report data.
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await handleLinkCapturedBeforeOnboarding(route);
        expect(replayParkedLink()).toBe(true);
        await waitForBatchedUpdates();
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        expect(mockedNavigateToConciergeChat).not.toHaveBeenCalled();

        // When that session ends before the next account finishes loading.
        runSessionCleanupCallbacks();
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await waitForBatchedUpdates();

        // Then neither the normal route nor Concierge's special redirect can consume the old link.
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        expect(mockedNavigateToConciergeChat).not.toHaveBeenCalled();
    });

    it('ignores an already queued loading callback after session cleanup', async () => {
        // Given Concierge has a separate redirect that must also respect cancellation of a queued callback.
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        const connectSpy = jest.spyOn(Onyx, 'connectWithoutView');
        try {
            await handleLinkCapturedBeforeOnboarding(ROUTES.CONCIERGE);
            expect(replayParkedLink()).toBe(true);
            await waitForBatchedUpdates();
            const loadingCallback = connectSpy.mock.calls.find(([options]) => options.key === ONYXKEYS.IS_LOADING_REPORT_DATA)?.[0].callback;
            expect(loadingCallback).toBeDefined();

            // When a callback already queued before disconnection is delivered after sign-out.
            runSessionCleanupCallbacks();
            loadingCallback?.(false, ONYXKEYS.IS_LOADING_REPORT_DATA);

            // Then the special Concierge redirect cannot bypass session cancellation.
            expect(mockedNavigateToConciergeChat).not.toHaveBeenCalled();
            expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        } finally {
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await waitForBatchedUpdates();
            connectSpy.mockRestore();
        }
    });

    it('ignores queued onboarding work when protected routes become ready after sign-out', async () => {
        // Given all protected-route callbacks are held by an explicitly controlled promise.
        focusOn(NAVIGATORS.TAB_NAVIGATOR);
        const readiness = Promise.withResolvers<void>();
        mockedNavigation.waitForProtectedRoutes.mockReturnValue(readiness.promise);
        try {
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.HAS_NON_PERSONAL_POLICY, true);
            openReportFromDeepLink(`${APP_URL}/search/view/123/456`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
            await waitForBatchedUpdates();
            expect(mockedNavigation.waitForProtectedRoutes).toHaveBeenCalled();

            // When sign-out cancels the operation before readiness releases the queued callbacks.
            runSessionCleanupCallbacks();
            readiness.resolve();
            await waitForBatchedUpdates();

            // Then neither subscription can start a replay in the next session.
            expect(mockedNavigation.navigate).not.toHaveBeenCalled();
            expect(mockedSetDeepLinkToOpenAfterOnboarding).not.toHaveBeenCalled();
        } finally {
            runSessionCleanupCallbacks();
            readiness.resolve();
            await waitForBatchedUpdates();
            mockedNavigation.waitForProtectedRoutes.mockResolvedValue();
        }
    });

    it('does not start a parked replay after its session has ended', async () => {
        // Given a parked callback can outlive its owner if a caller already captured it.
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await handleLinkCapturedBeforeOnboarding(ROUTES.SETTINGS_PROFILE.route);
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);

        // When session cleanup happens before the captured callback is invoked.
        runSessionCleanupCallbacks();
        const handled = replayParkedLink();
        await waitForBatchedUpdates();

        // Then the cancelled callback declines the replay instead of starting another subscription.
        expect(handled).toBe(false);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it('cancels the report waiter created after a parked replay finishes loading', async () => {
        // Given onboarding finishes before either OpenApp or the target report has loaded.
        focusOn(SCREENS.ONBOARDING.PURPOSE);
        await handleLinkCapturedBeforeOnboarding('r/123/456');
        expect(replayParkedLink()).toBe(true);
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await waitForBatchedUpdates();
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();

        // When sign-out happens between the app-loading and report-loading stages.
        runSessionCleanupCallbacks();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, {reportID: '123'});
        await waitForBatchedUpdates();

        // Then cancellation remains effective across that handoff between waiters.
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

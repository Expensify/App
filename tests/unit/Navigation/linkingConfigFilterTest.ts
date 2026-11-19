import {hasAuthToken} from '@libs/CurrentUserStore';
import {openPendingNativeShare} from '@libs/Navigation/helpers/pendingNativeShare';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {runSessionCleanupCallbacks} from '@libs/SessionCleanup';
import {didUserLogInDuringSession} from '@libs/SessionUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/CurrentUserStore', () => ({
    hasAuthToken: jest.fn(() => false),
    getCurrentUserEmail: jest.fn(() => ''),
}));

jest.mock('@libs/SessionUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/SessionUtils'),
    didUserLogInDuringSession: jest.fn(() => true),
}));

const mockedHasAuthToken = jest.mocked(hasAuthToken);
const mockedDidUserLogInDuringSession = jest.mocked(didUserLogInDuringSession);

describe('linkingConfig.filter', () => {
    const shareDeepLink = `new-expensify://${ROUTES.SHARE_ROOT}`;
    const reportDeepLink = `${CONST.NEW_EXPENSIFY_URL}${ROUTES.REPORT_WITH_ID.getRoute('1')}`;

    beforeEach(() => {
        jest.clearAllMocks();
        // Resets the "onboarding settled" mark, like a sign-out does.
        runSessionCleanupCallbacks();
        mockedDidUserLogInDuringSession.mockReturnValue(true);
    });

    it('drops the native share deep link while signed out', () => {
        // Given nobody is signed in when the share extension opens the app
        mockedHasAuthToken.mockReturnValue(false);

        // When react-navigation asks whether to route the launch URL / url event
        const shouldRoute = linkingConfig.filter?.(shareDeepLink);

        // Then it must not keep the share as navigation state: openReportFromDeepLink parks it and the signed-in app opens it once onboarding is ruled out
        expect(shouldRoute).toBe(false);
    });

    it('drops the native share deep link right after sign-in, before onboarding is settled', () => {
        // Given the link arrives once the user is signed in, while the account is still loading, which is how HybridApp delivers it
        mockedHasAuthToken.mockReturnValue(true);

        // When react-navigation asks whether to route it
        const shouldRoute = linkingConfig.filter?.(shareDeepLink);

        // Then it is held back as well: routed now, the share flow would open just for onboarding to remove it
        expect(shouldRoute).toBe(false);
    });

    it('routes the native share deep link once onboarding is settled', () => {
        // Given a user who signed in during this session and for whom onboarding has been ruled out or has finished
        mockedHasAuthToken.mockReturnValue(true);
        openPendingNativeShare();

        // When they share a photo to the app later on
        const shouldRoute = linkingConfig.filter?.(shareDeepLink);

        // Then the share flow opens straight away
        expect(shouldRoute).toBe(true);
    });

    it('routes the native share deep link for a session that was already signed in at startup', () => {
        // Given a returning user whose session was on disk when the app started
        mockedHasAuthToken.mockReturnValue(true);
        mockedDidUserLogInDuringSession.mockReturnValue(false);

        // When react-navigation asks whether to route it
        const shouldRoute = linkingConfig.filter?.(shareDeepLink);

        // Then the share flow opens straight away, as before
        expect(shouldRoute).toBe(true);
    });

    it('still routes other deep links while signed out', () => {
        // Given nobody is signed in when a report link opens the app
        mockedHasAuthToken.mockReturnValue(false);

        // When react-navigation asks whether to route it
        const shouldRoute = linkingConfig.filter?.(reportDeepLink);

        // Then the filter only ever withholds the native share link
        expect(shouldRoute).toBe(true);
    });
});

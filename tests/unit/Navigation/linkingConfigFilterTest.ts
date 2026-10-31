import {hasAuthToken} from '@libs/CurrentUserStore';
import {linkingConfig} from '@libs/Navigation/linkingConfig';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/CurrentUserStore', () => ({
    hasAuthToken: jest.fn(() => false),
    getCurrentUserEmail: jest.fn(() => ''),
}));

const mockedHasAuthToken = jest.mocked(hasAuthToken);

describe('linkingConfig.filter', () => {
    const shareDeepLink = `new-expensify://${ROUTES.SHARE_ROOT}`;
    const reportDeepLink = `${CONST.NEW_EXPENSIFY_URL}${ROUTES.REPORT_WITH_ID.getRoute('1')}`;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('drops the native share deep link while signed out', () => {
        // Given nobody is signed in when the share extension opens the app
        mockedHasAuthToken.mockReturnValue(false);

        // When react-navigation asks whether to route the launch URL / url event
        const shouldRoute = linkingConfig.filter?.(shareDeepLink);

        // Then it must not keep the share as navigation state: openReportFromDeepLink parks it and the signed-in app opens it once onboarding is ruled out
        expect(shouldRoute).toBe(false);
    });

    it('routes the native share deep link while signed in', () => {
        // Given a signed-in user shares a photo to the app
        mockedHasAuthToken.mockReturnValue(true);

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

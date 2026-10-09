import {hasAuthToken} from '@libs/actions/Session';
import {linkingConfig} from '@libs/Navigation/linkingConfig';

jest.mock('@libs/actions/Session', () => ({
    hasAuthToken: jest.fn(),
}));

const mockedHasAuthToken = jest.mocked(hasAuthToken);
const SHARE_URL = 'new-expensify://share/root';

describe('linkingConfig.filter', () => {
    it('drops a share link while signed out', () => {
        // Given a signed-out user, so openReportFromDeepLink parks the share until we know whether they must onboard
        mockedHasAuthToken.mockReturnValue(false);

        // When Android hands the share link to react-navigation
        // Then it is dropped, so the share page doesn't flash when the user signs in
        expect(linkingConfig.filter?.(SHARE_URL)).toBe(false);
    });

    it('keeps a share link while signed in', () => {
        // Given a signed-in user, whose share is handled by react-navigation as before
        mockedHasAuthToken.mockReturnValue(true);

        // When Android hands the share link to react-navigation
        // Then it is kept, so the share page opens right away
        expect(linkingConfig.filter?.(SHARE_URL)).toBe(true);
    });

    it('keeps other links while signed out', () => {
        // Given a signed-out user
        mockedHasAuthToken.mockReturnValue(false);

        // When a link that is not the share flow arrives, including one that only starts with the share path
        // Then it is kept, because only the share flow is parked
        expect(linkingConfig.filter?.('new-expensify://settings/profile')).toBe(true);
        expect(linkingConfig.filter?.('https://new.expensify.com/share/root/submit')).toBe(true);
    });
});

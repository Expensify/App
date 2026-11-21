import isNativeShareLink from '@libs/Navigation/helpers/isNativeShareLink';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

describe('isNativeShareLink', () => {
    it.each([
        ['the bare share root route', ROUTES.SHARE_ROOT],
        ['the share root route with a leading slash', `/${ROUTES.SHARE_ROOT}`],
        ['the deep link the Android and iOS share extensions open', `new-expensify://${ROUTES.SHARE_ROOT}`],
        ['a web URL for the share root with a trailing slash', `${CONST.NEW_EXPENSIFY_URL}${ROUTES.SHARE_ROOT}/`],
        ['the share root with a query string', `${ROUTES.SHARE_ROOT}?foo=bar`],
    ])('matches %s', (_description, urlOrRoute) => {
        // Given a URL or route pointing at the root of the native share flow
        // When it is checked
        // Then it should be recognized as a native share link
        expect(isNativeShareLink(urlOrRoute)).toBe(true);
    });

    it.each([
        ['a report route', ROUTES.REPORT_WITH_ID.getRoute('1')],
        ['a route that only starts with the share root', `${ROUTES.SHARE_ROOT}s`],
        ['a route that only ends with the share root', `x${ROUTES.SHARE_ROOT}`],
        ['the share details route', ROUTES.SHARE_DETAILS.getRoute('1')],
        ['an empty route', ''],
        ['an undefined route', undefined],
    ])('does not match %s', (_description, urlOrRoute) => {
        // Given something that is not the root of the native share flow
        // When it is checked
        // Then it should not be treated as a native share link, so no unrelated deep link gets parked
        expect(isNativeShareLink(urlOrRoute)).toBe(false);
    });
});

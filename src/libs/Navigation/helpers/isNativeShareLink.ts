/**
 * Matches the root of the native share flow (`share/root`, see ROUTES.SHARE_ROOT), which the iOS and Android share
 * extensions open through a deep link once the shared file has been staged. Accepts a bare route (`share/root`) as well
 * as a full URL (`new-expensify://share/root`, `https://new.expensify.com/share/root`), with or without a trailing
 * slash, query string or fragment.
 */
const NATIVE_SHARE_LINK_REGEX = /(?:^|\/)share\/root\/?(?:[?#]|$)/;

function isNativeShareLink(urlOrRoute: string | null | undefined): boolean {
    if (!urlOrRoute) {
        return false;
    }

    return NATIVE_SHARE_LINK_REGEX.test(urlOrRoute);
}

export default isNativeShareLink;

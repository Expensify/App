/**
 * Determines whether the given URL points to an Expensify Travel (Trip) page.
 *
 * A link is considered a travel link if:
 * - it belongs to any `*.travel.expensify.com` domain, or
 * - it belongs to any `*.expensify.com` domain and contains a `/trips/` path segment
 *
 * The check is case-insensitive and safely handles invalid URLs.
 *
 * @param url - URL string to evaluate
 * @returns true if the URL is an Expensify Travel / Trip link, otherwise false
 */
function isTravelLink(url: string): boolean {
    if (!url) {
        return false;
    }

    try {
        const {hostname, pathname} = new URL(url.toLowerCase());

        // Any travel subdomain (prod, staging, dev, etc.)
        if (hostname.endsWith('travel.expensify.com')) {
            return true;
        }

        // Trip pages hosted on any expensify domain
        if (hostname.endsWith('expensify.com') && pathname.includes('/trips/')) {
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

/**
 * Extracts a relative path from a full URL.
 *
 * Example:
 * https://staging.new.expensify.com/trips/3737539511 -> /trips/3737539511
 *
 * Returns an empty string for invalid or empty URLs.
 *
 * @param url - Absolute URL string
 * @returns Relative URL path starting with `/`
 */
function getRelativeUrl(url: string): string {
    if (!url) {
        return '';
    }

    try {
        const {pathname, search, hash} = new URL(url);

        return `${pathname}${search}${hash}`;
    } catch {
        return '';
    }
}

export {isTravelLink, getRelativeUrl};

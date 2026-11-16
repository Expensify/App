import {getSearchParamFromUrl} from '@libs/Url';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';
import type {StoredMarketingAttribution} from '@src/types/onyx/MarketingAttribution';

import Onyx from 'react-native-onyx';

/**
 * The UTM params, Google Ads device and network, and Google Ads click IDs we capture from the landing URL, keyed by their backend request
 * param names. UTM params aren't present on new.expensify.com URLs today, but we capture them
 * anyway so attribution works automatically if that changes.
 */
const MARKETING_PARAM_KEYS: Array<keyof MarketingAttribution> = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'device', 'network', 'gclid', 'gbraid', 'wbraid'];

/**
 * Reads marketing attribution (UTM params, Google Ads device and network, and Google Ads click IDs) from the landing URL.
 * This only finds values on web, where ad traffic lands. It has no side effects, and returns undefined when the URL carries none of the params.
 */
function captureMarketingAttributionFromURL(): MarketingAttribution | undefined {
    if (typeof window === 'undefined' || !window.location) {
        return undefined;
    }

    const captured: MarketingAttribution = {};
    for (const key of MARKETING_PARAM_KEYS) {
        const value = getSearchParamFromUrl(window.location.href, key);
        if (value) {
            captured[key] = value;
        }
    }

    return Object.keys(captured).length > 0 ? captured : undefined;
}

/**
 * Persists the attribution read from the landing URL to Onyx so it can be sent during signup.
 * Does nothing when the user is already signed in to a real account, since attribution only matters for signup.
 *
 * We replace the whole stored attribution instead of merging into it, so values from different ad clicks
 * (e.g. a Google gclid and later Reddit UTMs) never get combined. A page load without any of the params
 * keeps the stored attribution.
 */
function saveMarketingAttribution(captured: MarketingAttribution | undefined, hasSession: boolean) {
    if (!captured || hasSession) {
        return;
    }

    Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, {...captured, capturedAt: Date.now()});
}

/**
 * Returns the stored attribution to send with a signup request, without the local capture time.
 * Google Ads only accepts click ID conversions for 90 days, so attribution older than that is cleared and ignored.
 * Values stored without a capture time are treated as expired, because we can't tell how old they are and crediting a
 * signup to a stale ad is worse than missing one.
 */
function getFreshMarketingAttribution(stored: StoredMarketingAttribution | undefined | null): MarketingAttribution | undefined {
    if (!stored) {
        return undefined;
    }

    const {capturedAt, ...attribution} = stored;
    if (typeof capturedAt !== 'number' || Date.now() - capturedAt > CONST.MARKETING_ATTRIBUTION_MAX_AGE_MS) {
        Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, null);
        return undefined;
    }

    return Object.keys(attribution).length > 0 ? attribution : undefined;
}

export {captureMarketingAttributionFromURL, saveMarketingAttribution, getFreshMarketingAttribution};

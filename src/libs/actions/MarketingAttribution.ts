import {getSearchParamFromUrl} from '@libs/Url';

import ONYXKEYS from '@src/ONYXKEYS';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';

import Onyx from 'react-native-onyx';

/**
 * The UTM params, Google Ads device and network, and Google Ads click IDs we capture from the landing URL, keyed by their backend request
 * param names. UTM params aren't present on new.expensify.com URLs today, but we capture them
 * anyway so attribution works automatically if that changes.
 */
const MARKETING_PARAM_KEYS: Array<keyof MarketingAttribution> = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'device', 'network', 'gclid', 'gbraid', 'wbraid'];

/**
 * Captures marketing attribution (UTM params, Google Ads device and network, and Google Ads click IDs) from the landing URL and persists it
 * to Onyx so it can be sent during signup. This only runs on web, where ad traffic lands, and reads
 * `window.location` directly at app startup before the router can strip the query string.
 *
 * When the URL carries any of the params, we replace the whole stored attribution instead of merging
 * into it, so values from different ad clicks (e.g. a Google gclid and later Reddit UTMs) never get
 * combined. A page load without any of the params keeps the stored attribution.
 */
function captureMarketingAttribution() {
    if (typeof window === 'undefined' || !window.location) {
        return;
    }

    const captured: MarketingAttribution = {};
    for (const key of MARKETING_PARAM_KEYS) {
        const value = getSearchParamFromUrl(window.location.href, key);
        if (value) {
            captured[key] = value;
        }
    }

    if (Object.keys(captured).length === 0) {
        return;
    }

    Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, captured);
}

// eslint-disable-next-line import/prefer-default-export
export {captureMarketingAttribution};

import Onyx from 'react-native-onyx';
import {getSearchParamFromUrl} from '@libs/Url';
import ONYXKEYS from '@src/ONYXKEYS';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';

/**
 * The UTM params and ad click IDs we capture from the landing URL, keyed by their backend request
 * param names. UTM params aren't present on new.expensify.com URLs today, but we capture them
 * anyway so attribution works automatically if that changes.
 */
const MARKETING_PARAM_KEYS: Array<keyof MarketingAttribution> = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'rdt_cid', 'li_fat_id'];

/**
 * Captures marketing attribution (UTM params and ad click IDs) from the landing URL and persists it
 * to Onyx so it can be sent during signup. This only runs on web, where ad traffic lands, and reads
 * `window.location` directly at app startup before the router can strip the query string.
 *
 * We merge (rather than set) so that a later page load with only some params doesn't clobber
 * previously-captured values, while present params overwrite for last-touch attribution.
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

    Onyx.merge(ONYXKEYS.MARKETING_ATTRIBUTION, captured);
}

// eslint-disable-next-line import/prefer-default-export
export {captureMarketingAttribution};

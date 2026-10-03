/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Marketing attribution captured from the landing URL (UTM params, Google Ads device and network, and Google Ads click IDs).
 * Keys match the request parameter names the backend reads during signup so they can be spread
 * directly into the SignUpUser request.
 */
type MarketingAttribution = {
    /** The campaign source (e.g. google, reddit) */
    utm_source?: string;

    /** The marketing medium (e.g. cpc, email) */
    utm_medium?: string;

    /** The specific campaign name */
    utm_campaign?: string;

    /** The paid keyword that triggered the ad */
    utm_term?: string;

    /** The campaign content used to differentiate ads */
    utm_content?: string;

    /** Google Ads device the click came from (c for computer, m for mobile, t for tablet) */
    device?: string;

    /** Google Ads network the click came from (e.g. g for Google Search, s for Search Partners, d for Display) */
    network?: string;

    /** Google Ads click ID */
    gclid?: string;

    /** Google Ads click ID for iOS app traffic, used when gclid isn't available */
    gbraid?: string;

    /** Google Ads click ID for iOS web traffic, used when gclid isn't available */
    wbraid?: string;
};

export default MarketingAttribution;

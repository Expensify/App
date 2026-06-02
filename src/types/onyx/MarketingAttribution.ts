/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Marketing attribution captured from the landing URL (UTM params and ad click IDs).
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

    /** The campaign content used to differentiate ads */
    utm_term?: string;

    /** The paid keyword that triggered the ad */
    utm_content?: string;

    /** Google Ads click ID */
    gclid?: string;

    /** Meta (Facebook) click ID */
    fbclid?: string;

    /** Reddit Ads click ID */
    rdt_cid?: string;

    /** LinkedIn Ads click ID */
    li_fat_id?: string;
};

export default MarketingAttribution;

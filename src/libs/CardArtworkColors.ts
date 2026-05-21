/**
 * Background fill colors for each card's large artwork SVG.
 *
 * These are used to pick WCAG-compliant overlay text colors in getCardHolderTextColor().
 * Card artwork never changes with the app theme, so overlay text must be anchored to the
 * artwork's actual background rather than to theme.textLight/textDark which can flip in
 * high-contrast mode.
 *
 * Each color is the dominant background fill of the corresponding SVG file. If you update
 * a card's artwork, update its entry here to match. The test in CardUtilsTest.ts
 * ('CardArtworkColors drift detection') will fail if these values diverge from the SVGs.
 *
 * To find a color: open the SVG, locate the first <rect> or background <path>, and read
 * its fill — either the inline fill="..." attribute or the CSS class it references.
 */

// Feed key → background color mappings.
// Keys are the runtime string values of CONST.COMPANY_CARD.FEED_BANK_NAME / CONST.EXPENSIFY_CARD.BANK.
// Lookup uses prefix-matching (see getCardFeedBackgroundColor), so partial feed-name
// suffixes (e.g. "vcf123") still resolve correctly.

/* eslint-disable @typescript-eslint/naming-convention */
const CARD_FEED_BACKGROUND_COLORS: Record<string, string> = {
    // assets/images/expensify-card.svg                         (.st0 fill)
    'Expensify Card': '#002e22',

    // assets/images/companyCards/large/card-visa-large.svg     (.st1 fill)
    vcf: '#003c73',

    // assets/images/companyCards/large/card-mastercard-large.svg  (.st4 background rect)
    cdf: '#780505',

    // assets/images/companyCards/large/card-amex-large.svg     (.st3 fill)
    // All Amex feed variants share the same artwork.
    gl1025: '#016fd0',
    gl1205: '#016fd0',
    'oauth.americanexpressfdx.com': '#016fd0',
    'americanexpressfd.us': '#016fd0',

    // assets/images/companyCards/large/card-bofa-large.svg     (.st1 fill)
    'oauth.bankofamerica.com': '#e31837',

    // assets/images/companyCards/large/card-capital_one-large.svg (.st1 fill)
    'oauth.capitalone.com': '#022247',

    // assets/images/companyCards/large/card-chase-large.svg    (.st1 fill)
    'oauth.chase.com': '#0f5ba7',

    // assets/images/companyCards/large/card-citi-large.svg     (.st0 fill)
    'oauth.citibank.com': '#0281c4',

    // assets/images/companyCards/large/card-wellsfargo-large.svg (.st2 fill)
    'oauth.wellsfargo.com': '#dd1e25',

    // assets/images/companyCards/large/card-brex-large.svg     (.st1 fill)
    'oauth.brex.com': '#15181d',

    // assets/images/companyCards/large/card-stripe-large.svg   (.st3 fill)
    stripe: '#635bff',

    // assets/images/companyCards/large/card-plaid-large.svg    (fill="#fff" on background rect)
    plaid: '#ffffff',
};
/* eslint-enable @typescript-eslint/naming-convention */

/** Background color of generic-light-large.svg — used when no feed entry matches. */
const GENERIC_CARD_BACKGROUND_COLOR = '#a2a9a3';

export {CARD_FEED_BACKGROUND_COLORS, GENERIC_CARD_BACKGROUND_COLOR};

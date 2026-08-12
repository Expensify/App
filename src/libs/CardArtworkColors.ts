import colors from '@styles/theme/colors';

/**
 * Background fill and overlay text color for each card's large artwork SVG.
 *
 * Card artwork never changes with the app theme, so overlay text must be anchored
 * to the artwork's actual background rather than to theme.textLight/textDark which
 * can flip in high-contrast mode.
 *
 * `background` is the dominant fill of the corresponding SVG file (see inline comments).
 * `text` is the design-system color that satisfies WCAG 2.1 AA contrast against it.
 *
 * If you update a card's artwork, update the `background` entry here to match and
 * re-verify that `text` still provides sufficient contrast. The test in CardUtilsTest.ts
 * ('CardArtworkColors drift detection') will fail if `background` diverges from the SVG.
 *
 * To find the background color: open the SVG, locate the first <rect> or background
 * <path>, and read its fill — either the inline fill="..." attribute or the CSS class.
 *
 * Keys are the runtime string values of CONST.COMPANY_CARD.FEED_BANK_NAME and
 * CONST.EXPENSIFY_CARD.BANK. Lookup uses longest-prefix matching (see getCardFeedColors),
 * so partial feed-name suffixes (e.g. "vcf123") resolve correctly, and more specific keys
 * always take precedence over shorter ones.
 */

type CardArtworkColors = {background: string; text: string};

/* eslint-disable @typescript-eslint/naming-convention */
const CARD_FEED_COLORS: Record<string, CardArtworkColors> = {
    // assets/images/expensify-card.svg                         (.st0 fill)
    'Expensify Card': {background: '#002e22', text: colors.white},

    // assets/images/companyCards/large/card-visa-large.svg     (.st1 fill)
    vcf: {background: '#003c73', text: colors.white},

    // assets/images/companyCards/large/card-mastercard-large.svg  (.st4 background rect)
    cdf: {background: '#780505', text: colors.white},

    // assets/images/companyCards/large/card-amex-large.svg     (.st3 fill)
    // All Amex feed variants share the same artwork.
    gl1025: {background: '#016fd0', text: colors.white},
    gl1205: {background: '#016fd0', text: colors.white},
    'oauth.americanexpressfdx.com': {background: '#016fd0', text: colors.white},
    'americanexpressfd.us': {background: '#016fd0', text: colors.white},

    // assets/images/companyCards/large/card-bofa-large.svg     (.st1 fill)
    'oauth.bankofamerica.com': {background: '#e31837', text: colors.white},

    // assets/images/companyCards/large/card-capital_one-large.svg (.st1 fill)
    'oauth.capitalone.com': {background: '#022247', text: colors.white},

    // assets/images/companyCards/large/card-chase-large.svg    (.st1 fill)
    'oauth.chase.com': {background: '#0f5ba7', text: colors.white},

    // assets/images/companyCards/large/card-citi-large.svg     (.st0 fill)
    'oauth.citibank.com': {background: '#0281c4', text: colors.white},

    // assets/images/companyCards/large/card-wellsfargo-large.svg (.st2 fill)
    'oauth.wellsfargo.com': {background: '#dd1e25', text: colors.white},

    // assets/images/companyCards/large/card-brex-large.svg     (.st1 fill)
    'oauth.brex.com': {background: '#15181d', text: colors.white},

    // assets/images/companyCards/large/card-stripe-large.svg   (.st3 fill)
    stripe: {background: '#635bff', text: colors.white},

    // assets/images/companyCards/large/card-plaid-large.svg    (fill="#fff" on background rect)
    plaid: {background: '#ffffff', text: colors.productLight900},
};
/* eslint-enable @typescript-eslint/naming-convention */

/** Colors for generic-light-large.svg — used when no feed entry matches. */
const GENERIC_CARD_COLORS: CardArtworkColors = {background: '#a2a9a3', text: colors.productLight900};

export type {CardArtworkColors};
export {CARD_FEED_COLORS, GENERIC_CARD_COLORS};

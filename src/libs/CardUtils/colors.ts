import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

/**
 * Background fill colors extracted from each card's SVG artwork.
 * These are design-time constants — the artwork never changes with app theme.
 * Used to compute WCAG-compliant overlay text colors.
 */
const CARD_FEED_BACKGROUND_COLORS: Record<string, string> = {
    [CONST.EXPENSIFY_CARD.BANK]: '#002e22',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: '#003c73',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: '#780505',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX]: '#016fd0',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_1205]: '#016fd0',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT]: '#016fd0',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_FILE_DOWNLOAD]: '#016fd0',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA]: '#e31837',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]: '#022247',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: '#0f5ba7',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK]: '#0281c4',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO]: '#dd1e25',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.BREX]: '#15181d',
    [CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE]: '#635bff',
    // Plaid-connected cards display a white card face
    plaid: '#ffffff',
};

/** Gray background of generic-light-large.svg; used when no specific feed matches. */
const GENERIC_CARD_BACKGROUND_COLOR = '#a2a9a3';

/**
 * Compute the WCAG 2.1 relative luminance of a hex color.
 * Returns a value in [0, 1] where 0 = black and 1 = white.
 */
function getRelativeLuminance(hex: string): number {
    const sanitized = hex.replace('#', '');
    const r = parseInt(sanitized.slice(0, 2), 16) / 255;
    const g = parseInt(sanitized.slice(2, 4), 16) / 255;
    const b = parseInt(sanitized.slice(4, 6), 16) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Returns a design-system text color (white or near-black) that meets WCAG 2.1 AA contrast
 * against the given card background hex color.
 * These colors are intentionally theme-independent: card artwork never changes with the app theme,
 * so overlay text must be anchored to the artwork's actual background, not to theme.textLight/textDark
 * which can flip in high-contrast mode.
 */
function getCardHolderTextColor(cardBackgroundHex: string): string {
    // WCAG crossover luminance: above this threshold dark text has better contrast; below, light text does.
    return getRelativeLuminance(cardBackgroundHex) > 0.179 ? colors.productLight900 : colors.white;
}

/**
 * Returns the background hex color for the card image shown for a given feed.
 * Uses prefix-matching to handle feed names that include a suffix (e.g. "vcf123").
 */
function getCardFeedBackgroundColor(cardFeed: string | undefined): string {
    if (!cardFeed) {
        return GENERIC_CARD_BACKGROUND_COLOR;
    }
    const feedKey = Object.keys(CARD_FEED_BACKGROUND_COLORS).find((key) => cardFeed.startsWith(key));
    return feedKey !== undefined ? CARD_FEED_BACKGROUND_COLORS[feedKey] : GENERIC_CARD_BACKGROUND_COLOR;
}

export {getCardFeedBackgroundColor, getCardHolderTextColor};

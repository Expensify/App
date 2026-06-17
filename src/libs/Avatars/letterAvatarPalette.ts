import colors from '@styles/theme/colors';

/** The background + foreground colour pair that renders a letter/initials avatar. */
type LetterAvatarColorStyle = {backgroundColor: string; fillColor: string};

/**
 * Stable key for a letter-avatar colour scheme, used to store and restore a user's choice.
 * Keys mirror the colour tokens in our Figma design system, so a key like "blue100" maps
 * directly to the Figma token of the same name.
 */
type LetterAvatarSchemeKey =
    | 'blue100'
    | 'blue400'
    | 'blue700'
    | 'green100'
    | 'green400'
    | 'green700'
    | 'yellow100'
    | 'yellow400'
    | 'yellow700'
    | 'tangerine100'
    | 'tangerine400'
    | 'tangerine700'
    | 'pink100'
    | 'pink400'
    | 'pink700'
    | 'ice100'
    | 'ice400'
    | 'ice700';

/**
 * The letter-avatar colour palette: scheme key → {background, fill}. Single source of truth for
 * letter/initials avatar colours — a restyle edits this table and nothing else.
 *
 * The keys are a persisted contract: a scheme a user picks is saved server-side, so keys may be
 * added or retired but never repurposed. Re-pointing a scheme's colours here is safe; renaming or
 * retiring a key strands existing stored picks, which fall back to the hashed default via
 * `isLetterAvatarSchemeKey` (see `getLetterAvatarScheme`).
 *
 * Insertion order is significant: hashed-default avatars index into `LETTER_AVATAR_COLOR_OPTIONS`
 * (the `Object.values` of this table), so reordering re-colours every default user.
 */
const LETTER_AVATAR_SCHEMES: Record<LetterAvatarSchemeKey, LetterAvatarColorStyle> = {
    blue100: {backgroundColor: colors.blue100, fillColor: colors.blue600},
    blue400: {backgroundColor: colors.blue400, fillColor: colors.blue700},
    blue700: {backgroundColor: colors.blue700, fillColor: colors.blue200},
    green100: {backgroundColor: colors.green100, fillColor: colors.green600},
    green400: {backgroundColor: colors.green400, fillColor: colors.green700},
    green700: {backgroundColor: colors.green700, fillColor: colors.green200},
    yellow100: {backgroundColor: colors.yellow100, fillColor: colors.yellow600},
    yellow400: {backgroundColor: colors.yellow400, fillColor: colors.yellow700},
    yellow700: {backgroundColor: colors.yellow700, fillColor: colors.yellow200},
    tangerine100: {backgroundColor: colors.tangerine100, fillColor: colors.tangerine600},
    tangerine400: {backgroundColor: colors.tangerine400, fillColor: colors.tangerine700},
    tangerine700: {backgroundColor: colors.tangerine700, fillColor: colors.tangerine200},
    pink100: {backgroundColor: colors.pink100, fillColor: colors.pink600},
    pink400: {backgroundColor: colors.pink400, fillColor: colors.pink700},
    pink700: {backgroundColor: colors.pink700, fillColor: colors.pink200},
    ice100: {backgroundColor: colors.ice100, fillColor: colors.ice600},
    ice400: {backgroundColor: colors.ice400, fillColor: colors.ice700},
    ice700: {backgroundColor: colors.ice700, fillColor: colors.ice200},
};

/** The schemes as an ordered array. Order mirrors `LETTER_AVATAR_SCHEMES` (significant — see above). */
const LETTER_AVATAR_COLOR_OPTIONS: LetterAvatarColorStyle[] = Object.values(LETTER_AVATAR_SCHEMES);

/** The first scheme in the table; used when no colour has been picked or resolved. */
const DEFAULT_LETTER_AVATAR_SCHEME: LetterAvatarColorStyle = LETTER_AVATAR_SCHEMES.blue100;

function isLetterAvatarSchemeKey(value: string): value is LetterAvatarSchemeKey {
    return value in LETTER_AVATAR_SCHEMES;
}

export {LETTER_AVATAR_SCHEMES, LETTER_AVATAR_COLOR_OPTIONS, DEFAULT_LETTER_AVATAR_SCHEME, isLetterAvatarSchemeKey};
export type {LetterAvatarColorStyle, LetterAvatarSchemeKey};

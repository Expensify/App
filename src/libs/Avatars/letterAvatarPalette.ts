import colors from '@styles/theme/colors';
import type {LetterAvatarColorStyle} from './PresetAvatarCatalog.types';

/**
 * A letter-avatar color scheme keyed by a stable, human-readable identifier.
 * The `key` is what appears in the avatar URL (`.../letter/{key}/{LETTER}.png`), so it must
 * stay stable: reordering this list never changes what an already-stored key resolves to.
 */
type LetterAvatarScheme = LetterAvatarColorStyle & {key: string};

/**
 * The single source of truth for letter-avatar colors. Consumed by the client renderer
 * (via `LETTER_AVATAR_COLOR_OPTIONS`) and by the offline PNG generator
 * (`scripts/generateLetterAvatars.ts`), so the pre-baked PNGs and the local SVG render can
 * never drift. Add new schemes by appending; never reorder or repurpose an existing `key`.
 */
const LETTER_AVATAR_SCHEMES = [
    {key: 'blue100', backgroundColor: colors.blue100, fillColor: colors.blue600},
    {key: 'blue400', backgroundColor: colors.blue400, fillColor: colors.blue700},
    {key: 'blue700', backgroundColor: colors.blue700, fillColor: colors.blue200},
    {key: 'green100', backgroundColor: colors.green100, fillColor: colors.green600},
    {key: 'green400', backgroundColor: colors.green400, fillColor: colors.green700},
    {key: 'green700', backgroundColor: colors.green700, fillColor: colors.green200},
    {key: 'yellow100', backgroundColor: colors.yellow100, fillColor: colors.yellow600},
    {key: 'yellow400', backgroundColor: colors.yellow400, fillColor: colors.yellow700},
    {key: 'yellow700', backgroundColor: colors.yellow700, fillColor: colors.yellow200},
    {key: 'tangerine100', backgroundColor: colors.tangerine100, fillColor: colors.tangerine600},
    {key: 'tangerine400', backgroundColor: colors.tangerine400, fillColor: colors.tangerine700},
    {key: 'tangerine700', backgroundColor: colors.tangerine700, fillColor: colors.tangerine200},
    {key: 'pink100', backgroundColor: colors.pink100, fillColor: colors.pink600},
    {key: 'pink400', backgroundColor: colors.pink400, fillColor: colors.pink700},
    {key: 'pink700', backgroundColor: colors.pink700, fillColor: colors.pink200},
    {key: 'ice100', backgroundColor: colors.ice100, fillColor: colors.ice600},
    {key: 'ice400', backgroundColor: colors.ice400, fillColor: colors.ice700},
    {key: 'ice700', backgroundColor: colors.ice700, fillColor: colors.ice200},
] satisfies LetterAvatarScheme[];

/** Back-compatible shape for the client renderer, which only needs the colors. */
const LETTER_AVATAR_COLOR_OPTIONS: LetterAvatarColorStyle[] = LETTER_AVATAR_SCHEMES.map(({backgroundColor, fillColor}) => ({backgroundColor, fillColor}));

export {LETTER_AVATAR_SCHEMES, LETTER_AVATAR_COLOR_OPTIONS};

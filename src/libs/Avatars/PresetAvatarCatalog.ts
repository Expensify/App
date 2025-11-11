/* eslint-disable @typescript-eslint/naming-convention */
import type {SvgProps} from 'react-native-svg';
import * as SeasonF1 from '@components/Icon/CustomAvatars/SeasonF1';
import * as DefaultAvatars from '@components/Icon/DefaultAvatars';
import * as LetterDefaultAvatars from '@components/Icon/WorkspaceDefaultAvatars';
import getFirstAlphaNumericCharacter from '@libs/getFirstAlphaNumericCharacter';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import type {AvatarEntry, DefaultAvatarIDs, LetterAvatarColorStyle, LetterAvatarIDs, PresetAvatarID, SeasonF1AvatarIDs} from './PresetAvatarCatalog.types';

const CDN_DEFAULT_AVATARS = `${CONST.CLOUDFRONT_URL}/images/avatars`;
const CDN_SEASON_F1 = `${CONST.CLOUDFRONT_URL}/images/avatars/custom-avatars/season-f1`;

const DEFAULT_AVATAR_PREFIX = `default-avatar`;

const LETTER_AVATAR_COLOR_OPTIONS: LetterAvatarColorStyle[] = [
    {backgroundColor: colors.blue100, fillColor: colors.blue600},
    {backgroundColor: colors.blue400, fillColor: colors.blue700},
    {backgroundColor: colors.blue700, fillColor: colors.blue200},
    {backgroundColor: colors.green100, fillColor: colors.green600},
    {backgroundColor: colors.green400, fillColor: colors.green700},
    {backgroundColor: colors.green700, fillColor: colors.green200},
    {backgroundColor: colors.yellow100, fillColor: colors.yellow600},
    {backgroundColor: colors.yellow400, fillColor: colors.yellow700},
    {backgroundColor: colors.yellow700, fillColor: colors.yellow200},
    {backgroundColor: colors.tangerine100, fillColor: colors.tangerine600},
    {backgroundColor: colors.tangerine400, fillColor: colors.tangerine700},
    {backgroundColor: colors.tangerine700, fillColor: colors.tangerine200},
    {backgroundColor: colors.pink100, fillColor: colors.pink600},
    {backgroundColor: colors.pink400, fillColor: colors.pink700},
    {backgroundColor: colors.pink700, fillColor: colors.pink200},
    {backgroundColor: colors.ice100, fillColor: colors.ice600},
    {backgroundColor: colors.ice400, fillColor: colors.ice700},
    {backgroundColor: colors.ice700, fillColor: colors.ice200},
];

const DEFAULTS: Record<DefaultAvatarIDs, AvatarEntry> = {
    'default-avatar_1': {local: DefaultAvatars.Avatar1, url: `${CDN_DEFAULT_AVATARS}/default-avatar_1.png`},
    'default-avatar_2': {local: DefaultAvatars.Avatar2, url: `${CDN_DEFAULT_AVATARS}/default-avatar_2.png`},
    'default-avatar_3': {local: DefaultAvatars.Avatar3, url: `${CDN_DEFAULT_AVATARS}/default-avatar_3.png`},
    'default-avatar_4': {local: DefaultAvatars.Avatar4, url: `${CDN_DEFAULT_AVATARS}/default-avatar_4.png`},
    'default-avatar_5': {local: DefaultAvatars.Avatar5, url: `${CDN_DEFAULT_AVATARS}/default-avatar_5.png`},
    'default-avatar_6': {local: DefaultAvatars.Avatar6, url: `${CDN_DEFAULT_AVATARS}/default-avatar_6.png`},
    'default-avatar_7': {local: DefaultAvatars.Avatar7, url: `${CDN_DEFAULT_AVATARS}/default-avatar_7.png`},
    'default-avatar_8': {local: DefaultAvatars.Avatar8, url: `${CDN_DEFAULT_AVATARS}/default-avatar_8.png`},
    'default-avatar_9': {local: DefaultAvatars.Avatar9, url: `${CDN_DEFAULT_AVATARS}/default-avatar_9.png`},
    'default-avatar_10': {local: DefaultAvatars.Avatar10, url: `${CDN_DEFAULT_AVATARS}/default-avatar_10.png`},
    'default-avatar_11': {local: DefaultAvatars.Avatar11, url: `${CDN_DEFAULT_AVATARS}/default-avatar_11.png`},
    'default-avatar_12': {local: DefaultAvatars.Avatar12, url: `${CDN_DEFAULT_AVATARS}/default-avatar_12.png`},
    'default-avatar_13': {local: DefaultAvatars.Avatar13, url: `${CDN_DEFAULT_AVATARS}/default-avatar_13.png`},
    'default-avatar_14': {local: DefaultAvatars.Avatar14, url: `${CDN_DEFAULT_AVATARS}/default-avatar_14.png`},
    'default-avatar_15': {local: DefaultAvatars.Avatar15, url: `${CDN_DEFAULT_AVATARS}/default-avatar_15.png`},
    'default-avatar_16': {local: DefaultAvatars.Avatar16, url: `${CDN_DEFAULT_AVATARS}/default-avatar_16.png`},
    'default-avatar_17': {local: DefaultAvatars.Avatar17, url: `${CDN_DEFAULT_AVATARS}/default-avatar_17.png`},
    'default-avatar_18': {local: DefaultAvatars.Avatar18, url: `${CDN_DEFAULT_AVATARS}/default-avatar_18.png`},
    'default-avatar_19': {local: DefaultAvatars.Avatar19, url: `${CDN_DEFAULT_AVATARS}/default-avatar_19.png`},
    'default-avatar_20': {local: DefaultAvatars.Avatar20, url: `${CDN_DEFAULT_AVATARS}/default-avatar_20.png`},
    'default-avatar_21': {local: DefaultAvatars.Avatar21, url: `${CDN_DEFAULT_AVATARS}/default-avatar_21.png`},
    'default-avatar_22': {local: DefaultAvatars.Avatar22, url: `${CDN_DEFAULT_AVATARS}/default-avatar_22.png`},
    'default-avatar_23': {local: DefaultAvatars.Avatar23, url: `${CDN_DEFAULT_AVATARS}/default-avatar_23.png`},
    'default-avatar_24': {local: DefaultAvatars.Avatar24, url: `${CDN_DEFAULT_AVATARS}/default-avatar_24.png`},
};

const SEASON_F1: Record<SeasonF1AvatarIDs, AvatarEntry> = {
    'car-blue100': {local: SeasonF1.CarBlue100, url: `${CDN_SEASON_F1}/car-blue100.png`},
    'car-green100': {local: SeasonF1.CarGreen100, url: `${CDN_SEASON_F1}/car-green100.png`},
    'car-ice100': {local: SeasonF1.CarIce100, url: `${CDN_SEASON_F1}/car-ice100.png`},
    'car-pink100': {local: SeasonF1.CarPink100, url: `${CDN_SEASON_F1}/car-pink100.png`},
    'car-tangerine100': {local: SeasonF1.CarTangerine100, url: `${CDN_SEASON_F1}/car-tangerine100.png`},
    'car-yellow100': {local: SeasonF1.CarYellow100, url: `${CDN_SEASON_F1}/car-yellow100.png`},
    'champagne-green400': {local: SeasonF1.ChampagneGreen400, url: `${CDN_SEASON_F1}/champagne-green400.png`},
    'cone-tangerine700': {local: SeasonF1.ConeTangerine700, url: `${CDN_SEASON_F1}/cone-tangerine700.png`},
    'flag-blue600': {local: SeasonF1.FlagBlue600, url: `${CDN_SEASON_F1}/flag-blue600.png`},
    'gasoline-tangerine400': {local: SeasonF1.GasolineTangerine400, url: `${CDN_SEASON_F1}/gasoline-tangerine400.png`},
    'helmet-blue400': {local: SeasonF1.HelmetBlue400, url: `${CDN_SEASON_F1}/helmet-blue400.png`},
    'helmet-green400': {local: SeasonF1.HelmetGreen400, url: `${CDN_SEASON_F1}/helmet-green400.png`},
    'helmet-ice400': {local: SeasonF1.HelmetIce400, url: `${CDN_SEASON_F1}/helmet-ice400.png`},
    'helmet-pink400': {local: SeasonF1.HelmetPink400, url: `${CDN_SEASON_F1}/helmet-pink400.png`},
    'helmet-tangerine400': {local: SeasonF1.HelmetTangerine400, url: `${CDN_SEASON_F1}/helmet-tangerine400.png`},
    'helmet-yellow400': {local: SeasonF1.HelmetYellow400, url: `${CDN_SEASON_F1}/helmet-yellow400.png`},
    'medal-yellow400': {local: SeasonF1.MedalYellow400, url: `${CDN_SEASON_F1}/medal-yellow400.png`},
    'podium-blue400': {local: SeasonF1.PodiumBlue400, url: `${CDN_SEASON_F1}/podium-blue400.png`},
    'speedometer-ice400': {local: SeasonF1.SpeedometerIce400, url: `${CDN_SEASON_F1}/speedometer-ice400.png`},
    'steeringwheel-pink400': {local: SeasonF1.SteeringWheelPink400, url: `${CDN_SEASON_F1}/steeringwheel-pink400.png`},
    'stopwatch-ice600': {local: SeasonF1.StopwatchIce600, url: `${CDN_SEASON_F1}/stopwatch-ice600.png`},
    'tire-green400': {local: SeasonF1.TireGreen400, url: `${CDN_SEASON_F1}/tire-green400.png`},
    'trophy-yellow600': {local: SeasonF1.TrophyYellow600, url: `${CDN_SEASON_F1}/trophy-yellow600.png`},
    'wrenches-pink600': {local: SeasonF1.WrenchesPink600, url: `${CDN_SEASON_F1}/wrenches-pink600.png`},
};

const LETTER_DEFAULTS: Record<LetterAvatarIDs, Omit<AvatarEntry, 'url'>> = {
    'letter-default-avatar_0': {local: LetterDefaultAvatars.Workspace0},
    'letter-default-avatar_1': {local: LetterDefaultAvatars.Workspace1},
    'letter-default-avatar_2': {local: LetterDefaultAvatars.Workspace2},
    'letter-default-avatar_3': {local: LetterDefaultAvatars.Workspace3},
    'letter-default-avatar_4': {local: LetterDefaultAvatars.Workspace4},
    'letter-default-avatar_5': {local: LetterDefaultAvatars.Workspace5},
    'letter-default-avatar_6': {local: LetterDefaultAvatars.Workspace6},
    'letter-default-avatar_7': {local: LetterDefaultAvatars.Workspace7},
    'letter-default-avatar_8': {local: LetterDefaultAvatars.Workspace8},
    'letter-default-avatar_9': {local: LetterDefaultAvatars.Workspace9},
    'letter-default-avatar_a': {local: LetterDefaultAvatars.WorkspaceA},
    'letter-default-avatar_b': {local: LetterDefaultAvatars.WorkspaceB},
    'letter-default-avatar_c': {local: LetterDefaultAvatars.WorkspaceC},
    'letter-default-avatar_d': {local: LetterDefaultAvatars.WorkspaceD},
    'letter-default-avatar_e': {local: LetterDefaultAvatars.WorkspaceE},
    'letter-default-avatar_f': {local: LetterDefaultAvatars.WorkspaceF},
    'letter-default-avatar_g': {local: LetterDefaultAvatars.WorkspaceG},
    'letter-default-avatar_h': {local: LetterDefaultAvatars.WorkspaceH},
    'letter-default-avatar_i': {local: LetterDefaultAvatars.WorkspaceI},
    'letter-default-avatar_j': {local: LetterDefaultAvatars.WorkspaceJ},
    'letter-default-avatar_k': {local: LetterDefaultAvatars.WorkspaceK},
    'letter-default-avatar_l': {local: LetterDefaultAvatars.WorkspaceL},
    'letter-default-avatar_m': {local: LetterDefaultAvatars.WorkspaceM},
    'letter-default-avatar_n': {local: LetterDefaultAvatars.WorkspaceN},
    'letter-default-avatar_o': {local: LetterDefaultAvatars.WorkspaceO},
    'letter-default-avatar_p': {local: LetterDefaultAvatars.WorkspaceP},
    'letter-default-avatar_q': {local: LetterDefaultAvatars.WorkspaceQ},
    'letter-default-avatar_r': {local: LetterDefaultAvatars.WorkspaceR},
    'letter-default-avatar_s': {local: LetterDefaultAvatars.WorkspaceS},
    'letter-default-avatar_t': {local: LetterDefaultAvatars.WorkspaceT},
    'letter-default-avatar_u': {local: LetterDefaultAvatars.WorkspaceU},
    'letter-default-avatar_v': {local: LetterDefaultAvatars.WorkspaceV},
    'letter-default-avatar_w': {local: LetterDefaultAvatars.WorkspaceW},
    'letter-default-avatar_x': {local: LetterDefaultAvatars.WorkspaceX},
    'letter-default-avatar_y': {local: LetterDefaultAvatars.WorkspaceY},
    'letter-default-avatar_z': {local: LetterDefaultAvatars.WorkspaceZ},
};

const DISPLAY_ORDER = [
    'car-blue100',
    'default-avatar_1',
    'helmet-blue400',
    'default-avatar_13',
    'default-avatar_7',
    'podium-blue400',
    'flag-blue600',
    'default-avatar_19',
    'car-green100',
    'default-avatar_2',
    'helmet-green400',
    'default-avatar_14',
    'default-avatar_8',
    'tire-green400',
    'champagne-green400',
    'default-avatar_20',
    'car-yellow100',
    'default-avatar_3',
    'helmet-yellow400',
    'default-avatar_15',
    'default-avatar_9',
    'medal-yellow400',
    'trophy-yellow600',
    'default-avatar_21',
    'car-tangerine100',
    'default-avatar_4',
    'helmet-tangerine400',
    'default-avatar_16',
    'default-avatar_10',
    'gasoline-tangerine400',
    'cone-tangerine700',
    'default-avatar_22',
    'car-pink100',
    'default-avatar_5',
    'helmet-pink400',
    'default-avatar_17',
    'default-avatar_11',
    'steeringwheel-pink400',
    'wrenches-pink600',
    'default-avatar_23',
    'car-ice100',
    'default-avatar_6',
    'helmet-ice400',
    'default-avatar_18',
    'default-avatar_12',
    'speedometer-ice400',
    'stopwatch-ice600',
    'default-avatar_24',
] as const satisfies readonly PresetAvatarID[];

const PRESET_AVATAR_CATALOG: Record<PresetAvatarID, AvatarEntry> = {
    ...DEFAULTS,
    ...SEASON_F1,
};

const buildOrderedAvatars = (): Array<{id: PresetAvatarID} & AvatarEntry> => {
    const allIDS = Object.keys(PRESET_AVATAR_CATALOG) as PresetAvatarID[];
    const explicit = DISPLAY_ORDER.filter((id) => id in PRESET_AVATAR_CATALOG);
    const explicitSet = new Set(explicit);
    const leftovers = allIDS.filter((id) => !explicitSet.has(id)).sort();
    const finalIDOrder = [...explicit, ...leftovers];
    return finalIDOrder.map((id) => ({
        id,
        ...PRESET_AVATAR_CATALOG[id],
    }));
};

/**
 * Returns a letter avatar component based on the first letter of the provided name.
 * @param name - The name to extract first letter/character from. (Expected 0-9, A-Z)
 * @returns Letter avatar component or null if no valid initial is found.
 */
function getLetterAvatar(name?: string): React.FC<SvgProps> | null {
    if (!name || name.length === 0) {
        return null;
    }
    const firstChar = getFirstAlphaNumericCharacter(name).toLowerCase();
    const workspaceKey = `letter-default-avatar_${firstChar}` as LetterAvatarIDs;

    if (!(workspaceKey in LETTER_DEFAULTS)) {
        return null;
    }

    return LETTER_DEFAULTS[workspaceKey].local;
}

const PRESET_AVATAR_CATALOG_ORDERED = buildOrderedAvatars();

const getAvatarLocal = (id: PresetAvatarID) => PRESET_AVATAR_CATALOG[id]?.local;
const getAvatarURL = (id: PresetAvatarID) => PRESET_AVATAR_CATALOG[id]?.url;

/**
 * Type guard to check if a value is a valid PresetAvatarID
 * @param value - The value to check
 * @returns True if the value is a valid PresetAvatarID
 */
function isPresetAvatarID(value: unknown): value is PresetAvatarID {
    return typeof value === 'string' && value in PRESET_AVATAR_CATALOG;
}

export {
    PRESET_AVATAR_CATALOG,
    PRESET_AVATAR_CATALOG_ORDERED,
    LETTER_AVATAR_COLOR_OPTIONS,
    LETTER_DEFAULTS,
    DEFAULT_AVATAR_PREFIX,
    getAvatarLocal,
    getAvatarURL,
    getLetterAvatar,
    isPresetAvatarID,
};

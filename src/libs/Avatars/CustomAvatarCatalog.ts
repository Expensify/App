/* eslint-disable @typescript-eslint/naming-convention */
import type {SvgProps} from 'react-native-svg';
import * as SeasonF1 from '@components/Icon/CustomAvatars/SeasonF1';
import * as DefaultAvatars from '@components/Icon/DefaultAvatars';
import CONST from '@src/CONST';

type DefaultAvatarIDs =
    | 'default-avatar_1'
    | 'default-avatar_2'
    | 'default-avatar_3'
    | 'default-avatar_4'
    | 'default-avatar_5'
    | 'default-avatar_6'
    | 'default-avatar_7'
    | 'default-avatar_8'
    | 'default-avatar_9'
    | 'default-avatar_10'
    | 'default-avatar_11'
    | 'default-avatar_12'
    | 'default-avatar_13'
    | 'default-avatar_14'
    | 'default-avatar_15'
    | 'default-avatar_16'
    | 'default-avatar_17'
    | 'default-avatar_18'
    | 'default-avatar_19'
    | 'default-avatar_20'
    | 'default-avatar_21'
    | 'default-avatar_22'
    | 'default-avatar_23'
    | 'default-avatar_24';

type SeasonF1AvatarIDs =
    | 'car-blue100'
    | 'car-green100'
    | 'car-ice100'
    | 'car-pink100'
    | 'car-tangerine100'
    | 'car-yellow100'
    | 'champagne-green400'
    | 'cone-tangerine700'
    | 'flag-blue600'
    | 'gasoline-tangerine400'
    | 'helmet-blue400'
    | 'helmet-green400'
    | 'helmet-ice400'
    | 'helmet-pink400'
    | 'helmet-tangerine400'
    | 'helmet-yellow400'
    | 'medal-yellow400'
    | 'podium-blue400'
    | 'speedometer-ice400'
    | 'steeringwheel-pink400'
    | 'stopwatch-ice600'
    | 'tire-green400'
    | 'trophy-yellow600'
    | 'wrenches-pink600';

const CDN_DEFAULT_AVATARS = `${CONST.CLOUDFRONT_URL}/images/avatars`;
const CDN_SEASON_F1 = `${CONST.CLOUDFRONT_URL}/images/avatars/custom-avatars/season-f1`;

type AvatarEntry = {local: React.FC<SvgProps>; url: string};
type CustomAvatarID = DefaultAvatarIDs | SeasonF1AvatarIDs;

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

const ALL_CUSTOM_AVATARS: Record<CustomAvatarID, AvatarEntry> = {
    ...DEFAULTS,
    ...SEASON_F1,
};

const getAvatarLocal = (id: CustomAvatarID) => ALL_CUSTOM_AVATARS[id].local;
const getAvatarURL = (id: CustomAvatarID) => ALL_CUSTOM_AVATARS[id].url;

export {ALL_CUSTOM_AVATARS, getAvatarLocal, getAvatarURL};
export type {DefaultAvatarIDs, SeasonF1AvatarIDs, CustomAvatarID};

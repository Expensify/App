/* eslint-disable @typescript-eslint/naming-convention */
import type {SvgProps} from 'react-native-svg';
import CONST from '@src/CONST';
import * as DefaultAvatars from '@components/Icon/DefaultAvatars';
import * as SeasonF1 from '@components/Icon/CustomAvatars/SeasonF1';

type DefaultAvatarIDs =
  | 'default-1' | 'default-2' | 'default-3' | 'default-4' | 'default-5'
  | 'default-6' | 'default-7' | 'default-8' | 'default-9' | 'default-10'
  | 'default-11'| 'default-12'| 'default-13'| 'default-14'| 'default-15'
  | 'default-16'| 'default-17'| 'default-18'| 'default-19'| 'default-20'
  | 'default-21'| 'default-22'| 'default-23'| 'default-24';

type SeasonF1AvatarIDs =
  | 'car-blue100' | 'car-green100' | 'car-ice100' | 'car-pink100' | 'car-tangerine100' | 'car-yellow100'
  | 'champagne-green400' | 'cone-tangerine700' | 'flag-blue600' | 'gasoline-tangerine400'
  | 'helmet-blue400' | 'helmet-green400' | 'helmet-ice400' | 'helmet-pink400' | 'helmet-tangerine400' | 'helmet-yellow400'
  | 'medal-yellow400' | 'podium-blue400' | 'speedometer-ice400' | 'steeringwheel-pink400'
  | 'stopwatch-ice600' | 'tire-green400' | 'trophy-yellow600' | 'wrenches-pink600';



  
const CDN_BASE = `${CONST.CLOUDFRONT_URL}/images/avatars`;
const CDN_SEASON_F1 = `${CDN_BASE}/custom-avatars/season-f1`;

type AvatarEntry = {local: React.FC<SvgProps>; url: string};
type CustomAvatarID = DefaultAvatarIDs | SeasonF1AvatarIDs;

const DEFAULTS: Record<DefaultAvatarIDs, AvatarEntry> = {
    'default-1':  {local: DefaultAvatars.Avatar1,  url: `${CDN_BASE}/default-avatar_1.png`},
    'default-2':  {local: DefaultAvatars.Avatar2,  url: `${CDN_BASE}/default-avatar_2.png`},
    'default-3':  {local: DefaultAvatars.Avatar3,  url: `${CDN_BASE}/default-avatar_3.png`},
    'default-4':  {local: DefaultAvatars.Avatar4,  url: `${CDN_BASE}/default-avatar_4.png`},
    'default-5':  {local: DefaultAvatars.Avatar5,  url: `${CDN_BASE}/default-avatar_5.png`},
    'default-6':  {local: DefaultAvatars.Avatar6,  url: `${CDN_BASE}/default-avatar_6.png`},
    'default-7':  {local: DefaultAvatars.Avatar7,  url: `${CDN_BASE}/default-avatar_7.png`},
    'default-8':  {local: DefaultAvatars.Avatar8,  url: `${CDN_BASE}/default-avatar_8.png`},
    'default-9':  {local: DefaultAvatars.Avatar9,  url: `${CDN_BASE}/default-avatar_9.png`},
    'default-10': {local: DefaultAvatars.Avatar10, url: `${CDN_BASE}/default-avatar_10.png`},
    'default-11': {local: DefaultAvatars.Avatar11, url: `${CDN_BASE}/default-avatar_11.png`},
    'default-12': {local: DefaultAvatars.Avatar12, url: `${CDN_BASE}/default-avatar_12.png`},
    'default-13': {local: DefaultAvatars.Avatar13, url: `${CDN_BASE}/default-avatar_13.png`},
    'default-14': {local: DefaultAvatars.Avatar14, url: `${CDN_BASE}/default-avatar_14.png`},
    'default-15': {local: DefaultAvatars.Avatar15, url: `${CDN_BASE}/default-avatar_15.png`},
    'default-16': {local: DefaultAvatars.Avatar16, url: `${CDN_BASE}/default-avatar_16.png`},
    'default-17': {local: DefaultAvatars.Avatar17, url: `${CDN_BASE}/default-avatar_17.png`},
    'default-18': {local: DefaultAvatars.Avatar18, url: `${CDN_BASE}/default-avatar_18.png`},
    'default-19': {local: DefaultAvatars.Avatar19, url: `${CDN_BASE}/default-avatar_19.png`},
    'default-20': {local: DefaultAvatars.Avatar20, url: `${CDN_BASE}/default-avatar_20.png`},
    'default-21': {local: DefaultAvatars.Avatar21, url: `${CDN_BASE}/default-avatar_21.png`},
    'default-22': {local: DefaultAvatars.Avatar22, url: `${CDN_BASE}/default-avatar_22.png`},
    'default-23': {local: DefaultAvatars.Avatar23, url: `${CDN_BASE}/default-avatar_23.png`},
    'default-24': {local: DefaultAvatars.Avatar24, url: `${CDN_BASE}/default-avatar_24.png`},
  };
  
const SEASON_F1: Record<SeasonF1AvatarIDs, AvatarEntry> = {
    'car-blue100':          {local: SeasonF1.CarBlue100,          url: `${CDN_SEASON_F1}/car-blue100.svg`},
    'car-green100':         {local: SeasonF1.CarGreen100,         url: `${CDN_SEASON_F1}/car-green100.svg`},
    'car-ice100':           {local: SeasonF1.CarIce100,           url: `${CDN_SEASON_F1}/car-ice100.svg`},
    'car-pink100':          {local: SeasonF1.CarPink100,          url: `${CDN_SEASON_F1}/car-pink100.svg`},
    'car-tangerine100':     {local: SeasonF1.CarTangerine100,     url: `${CDN_SEASON_F1}/car-tangerine100.svg`},
    'car-yellow100':        {local: SeasonF1.CarYellow100,        url: `${CDN_SEASON_F1}/car-yellow100.svg`},
    'champagne-green400':   {local: SeasonF1.ChampagneGreen400,   url: `${CDN_SEASON_F1}/champagne-green400.svg`},
    'cone-tangerine700':    {local: SeasonF1.ConeTangerine700,    url: `${CDN_SEASON_F1}/cone-tangerine700.svg`},
    'flag-blue600':         {local: SeasonF1.FlagBlue600,         url: `${CDN_SEASON_F1}/flag-blue600.svg`},
    'gasoline-tangerine400':{local: SeasonF1.GasolineTangerine400, url: `${CDN_SEASON_F1}/gasoline-tangerine400.svg`},
    'helmet-blue400':       {local: SeasonF1.HelmetBlue400,       url: `${CDN_SEASON_F1}/helmet-blue400.svg`},
    'helmet-green400':      {local: SeasonF1.HelmetGreen400,      url: `${CDN_SEASON_F1}/helmet-green400.svg`},
    'helmet-ice400':        {local: SeasonF1.HelmetIce400,        url: `${CDN_SEASON_F1}/helmet-ice400.svg`},
    'helmet-pink400':       {local: SeasonF1.HelmetPink400,       url: `${CDN_SEASON_F1}/helmet-pink400.svg`},
    'helmet-tangerine400':  {local: SeasonF1.HelmetTangerine400,  url: `${CDN_SEASON_F1}/helmet-tangerine400.svg`},
    'helmet-yellow400':     {local: SeasonF1.HelmetYellow400,     url: `${CDN_SEASON_F1}/helmet-yellow400.svg`},
    'medal-yellow400':      {local: SeasonF1.MedalYellow400,      url: `${CDN_SEASON_F1}/medal-yellow400.svg`},
    'podium-blue400':       {local: SeasonF1.PodiumBlue400,       url: `${CDN_SEASON_F1}/podium-blue400.svg`},
    'speedometer-ice400':   {local: SeasonF1.SpeedometerIce400,   url: `${CDN_SEASON_F1}/speedometer-ice400.svg`},
    'steeringwheel-pink400':{local: SeasonF1.SteeringwheelPink400, url: `${CDN_SEASON_F1}/steeringwheel-pink400.svg`},
    'stopwatch-ice600':     {local: SeasonF1.StopwatchIce600,     url: `${CDN_SEASON_F1}/stopwatch-ice600.svg`},
    'tire-green400':        {local: SeasonF1.TireGreen400,        url: `${CDN_SEASON_F1}/tire-green400.svg`},
    'trophy-yellow600':     {local: SeasonF1.TrophyYellow600,     url: `${CDN_SEASON_F1}/trophy-yellow600.svg`},
    'wrenches-pink600':     {local: SeasonF1.WrenchesPink600,     url: `${CDN_SEASON_F1}/wrenches-pink600.svg`},
};

const ALL_CUSTOM_AVATARS: Record<CustomAvatarID, AvatarEntry> = {
    ...DEFAULTS,
    ...SEASON_F1,
};

const getAvatarLocal = (id: CustomAvatarID) => ALL_CUSTOM_AVATARS[id].local;
const getAvatarUrl   = (id: CustomAvatarID) => ALL_CUSTOM_AVATARS[id].url;

export {
    ALL_CUSTOM_AVATARS,
    getAvatarLocal,
    getAvatarUrl,
};
export type {DefaultAvatarIDs, SeasonF1AvatarIDs, CustomAvatarID};
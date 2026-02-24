import type {SvgProps} from 'react-native-svg';

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

type LetterAvatarIDs =
    | 'letter-default-avatar_0'
    | 'letter-default-avatar_1'
    | 'letter-default-avatar_2'
    | 'letter-default-avatar_3'
    | 'letter-default-avatar_4'
    | 'letter-default-avatar_5'
    | 'letter-default-avatar_6'
    | 'letter-default-avatar_7'
    | 'letter-default-avatar_8'
    | 'letter-default-avatar_9'
    | 'letter-default-avatar_a'
    | 'letter-default-avatar_b'
    | 'letter-default-avatar_c'
    | 'letter-default-avatar_d'
    | 'letter-default-avatar_e'
    | 'letter-default-avatar_f'
    | 'letter-default-avatar_g'
    | 'letter-default-avatar_h'
    | 'letter-default-avatar_i'
    | 'letter-default-avatar_j'
    | 'letter-default-avatar_k'
    | 'letter-default-avatar_l'
    | 'letter-default-avatar_m'
    | 'letter-default-avatar_n'
    | 'letter-default-avatar_o'
    | 'letter-default-avatar_p'
    | 'letter-default-avatar_q'
    | 'letter-default-avatar_r'
    | 'letter-default-avatar_s'
    | 'letter-default-avatar_t'
    | 'letter-default-avatar_u'
    | 'letter-default-avatar_v'
    | 'letter-default-avatar_w'
    | 'letter-default-avatar_x'
    | 'letter-default-avatar_y'
    | 'letter-default-avatar_z';

type LetterAvatarColorStyle = {backgroundColor: string; fillColor: string};
type AvatarEntry = {local: React.FC<SvgProps>; url: string};
type PresetAvatarID = DefaultAvatarIDs | SeasonF1AvatarIDs;

type LetterAvatarVariant = {
    backgroundColor: string;
    fillColor: string;
    component: React.FC<SvgProps>;
};

export type {DefaultAvatarIDs, SeasonF1AvatarIDs, LetterAvatarIDs, PresetAvatarID, LetterAvatarVariant, LetterAvatarColorStyle, AvatarEntry};

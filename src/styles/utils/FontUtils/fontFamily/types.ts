import type {TextStyle} from 'react-native';

type FontFamilyKey =
    | 'SYSTEM'
    | 'MONOSPACE'
    | 'MONOSPACE_BOLD'
    | 'MONOSPACE_ITALIC'
    | 'MONOSPACE_BOLD_ITALIC'
    | 'EXP_NEUE'
    | 'EXP_NEUE_BOLD'
    | 'EXP_NEUE_ITALIC'
    | 'EXP_NEUE_BOLD_ITALIC'
    | 'EXP_NEW_KANSAS_MEDIUM'
    | 'EXP_NEW_KANSAS_MEDIUM_ITALIC'
    | 'CUSTOM_EMOJI_FONT';

type FontFamily = {
    fontFamily: string;
    fontStyle?: TextStyle['fontStyle'];
    fontWeight?: TextStyle['fontWeight'];
};

type FontFamilyStyles = Record<FontFamilyKey, FontFamily>;

export default FontFamilyStyles;

type FontFamilyKeys =
    | 'EXP_NEUE_ITALIC'
    | 'EXP_NEUE_BOLD'
    | 'EXP_NEUE'
    | 'EXP_NEW_KANSAS_MEDIUM'
    | 'EXP_NEW_KANSAS_MEDIUM_ITALIC'
    | 'SYSTEM'
    | 'MONOSPACE'
    | 'MONOSPACE_ITALIC'
    | 'MONOSPACE_BOLD'
    | 'MONOSPACE_BOLD_ITALIC';

type FontFamilyStyles = Record<FontFamilyKeys, string>;

export default FontFamilyStyles;

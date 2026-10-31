// Duplicated from React Native `TextStyle` so these stay the RN unions under both the legacy types and the Strict API.
// Indexing `TextStyle['fontStyle' | 'fontWeight']` widens to csstype (`"-moz-initial"`, bare `string`) once the Strict API is enabled.
type FontStyle = 'normal' | 'italic';

type FontWeight =
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900
    | 'ultralight'
    | 'thin'
    | 'light'
    | 'medium'
    | 'regular'
    | 'semibold'
    | 'condensedBold'
    | 'condensed'
    | 'heavy'
    | 'black';

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
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
};

type FontFamilyStyles = Record<FontFamilyKey, FontFamily>;

export default FontFamilyStyles;
export type {FontWeight};

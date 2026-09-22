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

export type {FontStyle, FontWeight};

import type {TextStyle} from 'react-native';

type WordBreakStyles = Record<'breakWord' | 'breakAll' | 'breakAllNonNative', Pick<TextStyle, 'wordBreak'>>;

export default WordBreakStyles;

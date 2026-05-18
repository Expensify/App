import type {TextStyle} from 'react-native';

type WordBreakStyles = Record<'breakWord' | 'breakAll', Pick<TextStyle, 'wordBreak'>>;

export default WordBreakStyles;

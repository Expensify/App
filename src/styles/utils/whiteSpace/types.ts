import type {TextStyle} from 'react-native';

type WhiteSpaceStyles = Record<'noWrap' | 'preWrap' | 'pre', Pick<TextStyle, 'whiteSpace'>>;

export default WhiteSpaceStyles;

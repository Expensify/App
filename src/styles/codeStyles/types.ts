import {TextStyle, ViewStyle} from 'react-native';

type CodeWordWrapperStyle = Partial<Pick<ViewStyle, 'height' | 'justifyContent'>>;
type CodeWordStyle = Partial<Pick<TextStyle, 'height' | 'top'>>;
type CodeTextStyle = Partial<Pick<TextStyle, 'lineHeight'>>;

export type {CodeWordWrapperStyle, CodeWordStyle, CodeTextStyle};

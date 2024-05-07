import type {TextStyle} from 'react-native';

type FontWeightStyles = Record<'normal' | 'medium' | 'bold', NonNullable<TextStyle['fontWeight']>>;

export default FontWeightStyles;

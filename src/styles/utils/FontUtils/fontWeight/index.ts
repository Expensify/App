import type {TextStyle} from 'react-native';

type FontWeightStyles = Record<'normal' | 'medium' | 'bold', NonNullable<TextStyle['fontWeight']>>;

const fontWeight: FontWeightStyles = {
    normal: '400',
    medium: '500',
    bold: '700',
};

export default fontWeight;

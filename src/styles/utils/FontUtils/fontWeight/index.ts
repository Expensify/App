import type {TextStyle} from 'react-native';

type FontWeightStyles = Record<'thin' | 'normal' | 'medium' | 'bold', NonNullable<TextStyle['fontWeight']>>;

const fontWeight: FontWeightStyles = {
    thin: '200',
    normal: '400',
    medium: '500',
    bold: '700',
};

export default fontWeight;

import type {FontWeight} from '@styles/utils/FontUtils/types';

type FontWeightStyles = Record<'normal' | 'medium' | 'bold', FontWeight>;

const fontWeight: FontWeightStyles = {
    normal: '400',
    medium: '500',
    bold: '700',
};

export default fontWeight;

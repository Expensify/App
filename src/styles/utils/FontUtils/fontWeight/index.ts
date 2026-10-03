// eslint-disable-next-line no-restricted-imports -- type-only; the alias restriction does not distinguish type imports
import type {FontWeight} from '@styles/utils/FontUtils/fontFamily/types';

type FontWeightStyles = Record<'normal' | 'medium' | 'bold', FontWeight>;

const fontWeight: FontWeightStyles = {
    normal: '400',
    medium: '500',
    bold: '700',
};

export default fontWeight;

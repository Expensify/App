import {ThemePreferenceWithoutSystem} from '@styles/theme/types';
import CONST from '@src/CONST';
import darkIllustrations from './themes/dark';
import lightIllustrations from './themes/light';
import type {IllustrationsType} from './types';

const Illustrations = {
    [CONST.THEME.LIGHT]: lightIllustrations,
    [CONST.THEME.DARK]: darkIllustrations,
} satisfies Record<ThemePreferenceWithoutSystem, IllustrationsType>;

const DefaultIllustrations = Illustrations[CONST.THEME.FALLBACK];

export default Illustrations;
export {DefaultIllustrations};

import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';
import CONST from '@src/CONST';
import darkIllustrations from './themes/dark';
import lightIllustrations from './themes/light';
import type IllustrationsType from './types';

const illustrations = {
    [CONST.THEME.LIGHT]: lightIllustrations,
    [CONST.THEME.DARK]: darkIllustrations,
    [CONST.THEME.LIGHT_CONTRAST]: lightIllustrations,
    [CONST.THEME.DARK_CONTRAST]: darkIllustrations,
} satisfies Record<ThemePreferenceWithoutSystem, IllustrationsType>;

const defaultIllustrations = illustrations[CONST.THEME.FALLBACK];

export default illustrations;
export {defaultIllustrations};

import {isHighContrastTheme} from '@styles/theme/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Detect whether high contrast is active. Logged-in users track contrast through PREFERRED_THEME, while the logged-out
 * sign-in flow tracks it via SIGN_IN_HIGH_CONTRAST_INTENT, so the intent (when set) takes precedence over the theme.
 */
function useIsHighContrast() {
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const [highContrastIntent] = useOnyx(ONYXKEYS.SIGN_IN_HIGH_CONTRAST_INTENT);
    const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
    const isHighContrast = highContrastIntent ?? isHighContrastTheme(currentTheme);
    return {currentTheme, isHighContrast};
}

export default useIsHighContrast;

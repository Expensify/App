import {isHighContrastTheme} from '@styles/theme/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Resolve whether high contrast is currently active. The logged-out sign-in flow tracks the user's choice via
 * SIGN_IN_HIGH_CONTRAST_INTENT, so it takes precedence; otherwise we fall back to whether the preferred theme is a high-contrast theme.
 */
function useIsHighContrast() {
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const [highContrastIntent] = useOnyx(ONYXKEYS.SIGN_IN_HIGH_CONTRAST_INTENT);

    const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
    const isHighContrast = highContrastIntent ?? isHighContrastTheme(currentTheme);

    return {currentTheme, isHighContrast};
}

export default useIsHighContrast;

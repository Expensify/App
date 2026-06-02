import {useEffect, useRef} from 'react';
import {getBaseTheme, getContrastTheme} from '@styles/theme/utils';
import {setHighContrastIntent, updateTheme} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * When a logged-out user enabled high contrast on the sign-in page, apply it to whatever base theme
 * the server returns once they sign in. OpenApp merges the server's nvp_preferredTheme before flipping
 * IS_LOADING_APP back to false, so the true -> false edge is when the server base theme is available.
 */
function useReconcileHighContrastIntent() {
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const [highContrastIntent] = useOnyx(ONYXKEYS.SIGN_IN_HIGH_CONTRAST_INTENT);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const wasLoadingApp = useRef<boolean | undefined>(undefined);

    useEffect(() => {
        const hasFinishedLoading = !!wasLoadingApp.current && !isLoadingApp;
        wasLoadingApp.current = isLoadingApp;
        if (!hasFinishedLoading || !highContrastIntent || !session?.authToken) {
            return;
        }
        const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
        const targetTheme = getContrastTheme(getBaseTheme(currentTheme));
        if (currentTheme !== targetTheme) {
            updateTheme(targetTheme, false);
        }
        setHighContrastIntent(null);
    }, [isLoadingApp, highContrastIntent, preferredTheme, session?.authToken]);
}

export default useReconcileHighContrastIntent;

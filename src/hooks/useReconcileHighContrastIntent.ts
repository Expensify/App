import {getBaseTheme, getContrastTheme} from '@styles/theme/utils';

import {setHighContrastIntent, updateTheme} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useOnyx from './useOnyx';

/**
 * Reconcile a logged-out user's high contrast choice from the sign-in page with the base theme the server returns once they sign in.
 * The intent is `true` when they enabled it, `false` when they disabled it, and cleared when there is nothing to reconcile.
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
        if (!hasFinishedLoading || highContrastIntent === undefined || !session?.authToken) {
            return;
        }
        const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
        const baseTheme = getBaseTheme(currentTheme);
        const targetTheme = highContrastIntent ? getContrastTheme(baseTheme) : baseTheme;
        if (currentTheme !== targetTheme) {
            updateTheme(targetTheme, false);
        }
        setHighContrastIntent(null);
    }, [isLoadingApp, highContrastIntent, preferredTheme, session?.authToken]);
}

export default useReconcileHighContrastIntent;

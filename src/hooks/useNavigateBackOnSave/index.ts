import {useEffect, useRef, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import type {Route} from '@src/ROUTES';

/**
 * `navigateBack` = direct goBack. `armNavigateBack` = goBack on next save (or immediately if already saved). One-shot — repeat arms are no-ops so a double-tap can't pop past the destination. `shouldSkipFocusRestore: true` only when the destination's Enter shortcut would be hijacked by a re-focused row.
 */
function useNavigateBackOnSave(
    isSaved: boolean,
    backTo: Route | undefined,
    {shouldSkipFocusRestore}: {shouldSkipFocusRestore: boolean},
): {navigateBack: () => void; armNavigateBack: () => void} {
    const [isArmed, setIsArmed] = useState(false);
    const hasNavigatedRef = useRef(false);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const armNavigateBack = () => {
        if (hasNavigatedRef.current) {
            return;
        }
        setIsArmed(true);
    };

    useEffect(() => {
        if (!isArmed || !isSaved || hasNavigatedRef.current) {
            return;
        }
        hasNavigatedRef.current = true;
        if (shouldSkipFocusRestore) {
            skipNextFocusRestore();
        }
        navigateBack();
    }, [isArmed, isSaved, navigateBack, shouldSkipFocusRestore]);

    return {navigateBack, armNavigateBack};
}

export default useNavigateBackOnSave;

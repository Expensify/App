import {useCallback, useEffect, useRef} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import type {Route} from '@src/ROUTES';

/**
 * `navigateBack` — direct goBack(), focus restores. `armNavigateBack` — arms the next `isSaved` transition to dispatch goBack once;
 * does not navigate immediately. Pass `shouldSkipFocusRestore: true` only when the destination has a submit Enter a re-focused row would hijack.
 */
function useNavigateBackOnSave(
    isSaved: boolean,
    backTo: Route | undefined,
    {shouldSkipFocusRestore}: {shouldSkipFocusRestore: boolean},
): {navigateBack: () => void; armNavigateBack: () => void} {
    const shouldNavigateAfterSaveRef = useRef(false);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const armNavigateBack = useCallback(() => {
        shouldNavigateAfterSaveRef.current = true;
    }, []);

    useEffect(() => {
        if (!isSaved || !shouldNavigateAfterSaveRef.current) {
            return;
        }
        shouldNavigateAfterSaveRef.current = false;
        if (shouldSkipFocusRestore) {
            skipNextFocusRestore();
        }
        navigateBack();
    }, [isSaved, navigateBack, shouldSkipFocusRestore]);

    return {navigateBack, armNavigateBack};
}

export default useNavigateBackOnSave;

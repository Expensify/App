import {useCallback, useEffect, useRef} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import type {Route} from '@src/ROUTES';

/**
 * Save-and-close flow for IOU step forms. `armNavigateBack()` from a submit handler navigates back once `isSaved` flips,
 * skipping focus-restore so the re-focused row doesn't swallow the next Enter. The returned `navigateBack` (for the Back
 * button) keeps restore intact.
 */
function useNavigateBackOnSave(isSaved: boolean, backTo: Route | undefined): {navigateBack: () => void; armNavigateBack: () => void} {
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
        skipNextFocusRestore();
        navigateBack();
    }, [isSaved, navigateBack]);

    return {navigateBack, armNavigateBack};
}

export default useNavigateBackOnSave;

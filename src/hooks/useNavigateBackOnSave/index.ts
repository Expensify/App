import {useCallback, useEffect, useRef} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import type {Route} from '@src/ROUTES';

/**
 * Save-and-close flow for IOU step forms: `armNavigateBack()` navigates back once `isSaved` flips. Pass
 * `shouldSkipFocusRestore` true only when the destination has a submit Enter a re-focused row would hijack (create flow);
 * editing an existing expense passes false so focus returns. `navigateBack` (the Back button) always restores.
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

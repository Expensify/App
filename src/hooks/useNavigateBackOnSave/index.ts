import {useEffect, useRef, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import type {Route} from '@src/ROUTES';

/**
 * `navigateBack` = direct goBack. `armNavigateBack` = goBack on next save (or immediately if already saved). `shouldSkipFocusRestore: true` only when the destination's Enter shortcut would be hijacked by a re-focused row.
 */
function useNavigateBackOnSave(
    isSaved: boolean,
    backTo: Route | undefined,
    {shouldSkipFocusRestore}: {shouldSkipFocusRestore: boolean},
): {navigateBack: () => void; armNavigateBack: () => void} {
    const [armCount, setArmCount] = useState(0);
    const lastProcessedArmRef = useRef(0);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const armNavigateBack = () => {
        setArmCount((count) => count + 1);
    };

    useEffect(() => {
        if (!isSaved || armCount === lastProcessedArmRef.current) {
            return;
        }
        lastProcessedArmRef.current = armCount;
        if (shouldSkipFocusRestore) {
            skipNextFocusRestore();
        }
        navigateBack();
    }, [isSaved, armCount, navigateBack, shouldSkipFocusRestore]);

    return {navigateBack, armNavigateBack};
}

export default useNavigateBackOnSave;

import {useEffect, useRef, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import type {Route} from '@src/ROUTES';

/**
 * `navigateBack` = direct goBack. `armNavigateBack` = goBack on next save (or immediately if already saved). Within a single save cycle the nav fires at most once; a fresh `isSaved` false→true cycle re-arms. `backTo` is snapshotted at arm time so a parent clearing route params between arm and save can't strand the user. `shouldSkipFocusRestore: true` only when the destination's Enter shortcut would be hijacked by a re-focused row.
 */
function useNavigateBackOnSave(
    isSaved: boolean,
    backTo: Route | undefined,
    {shouldSkipFocusRestore}: {shouldSkipFocusRestore: boolean},
): {navigateBack: () => void; armNavigateBack: () => void} {
    const [isArmed, setIsArmed] = useState(false);
    const hasNavigatedThisCycleRef = useRef(false);
    const armedBackToRef = useRef<Route | undefined>(undefined);
    const prevSavedRef = useRef(isSaved);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const armNavigateBack = () => {
        armedBackToRef.current = backTo;
        setIsArmed(true);
    };

    useEffect(() => {
        // A fresh `isSaved` false→true edge re-opens the gate for a subsequent save.
        if (!prevSavedRef.current && isSaved) {
            hasNavigatedThisCycleRef.current = false;
        }
        prevSavedRef.current = isSaved;

        if (!isArmed || !isSaved || hasNavigatedThisCycleRef.current) {
            return;
        }
        hasNavigatedThisCycleRef.current = true;
        setIsArmed(false);
        if (shouldSkipFocusRestore) {
            skipNextFocusRestore();
        }
        Navigation.goBack(armedBackToRef.current);
    }, [isArmed, isSaved, shouldSkipFocusRestore]);

    return {navigateBack, armNavigateBack};
}

export default useNavigateBackOnSave;

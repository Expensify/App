import {useEffect, useRef, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import type {Route} from '@src/ROUTES';

/**
 * `navigateBack` = direct goBack. `armNavigateBack` = goBack on next save (or immediately if already saved). Within a single save cycle the nav fires at most once; a fresh `isSaved` false→true cycle re-arms. Both `backTo` and `shouldSkipFocusRestore` are snapshotted at arm time so a parent re-derivation between arm and save can't strand the user or swap focus-restore behavior.
 */
function useNavigateBackOnSave(
    isSaved: boolean,
    backTo: Route | undefined,
    {shouldSkipFocusRestore}: {shouldSkipFocusRestore: boolean},
): {navigateBack: () => void; armNavigateBack: () => void} {
    const [isArmed, setIsArmed] = useState(false);
    const hasNavigatedThisCycleRef = useRef(false);
    const armedBackToRef = useRef<Route | undefined>(undefined);
    const armedShouldSkipRef = useRef(false);
    const prevSavedRef = useRef(isSaved);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const armNavigateBack = () => {
        armedBackToRef.current = backTo;
        armedShouldSkipRef.current = shouldSkipFocusRestore;
        setIsArmed(true);
    };

    useEffect(() => {
        // A fresh `isSaved` false→true edge re-opens the gate for a subsequent save.
        if (!prevSavedRef.current && isSaved) {
            hasNavigatedThisCycleRef.current = false;
        }
        prevSavedRef.current = isSaved;

        if (!isArmed || !isSaved) {
            return;
        }
        // Clear the stale arm so it can't auto-fire on the next isSaved cycle.
        if (hasNavigatedThisCycleRef.current) {
            setIsArmed(false);
            return;
        }
        hasNavigatedThisCycleRef.current = true;
        setIsArmed(false);
        if (armedShouldSkipRef.current) {
            skipNextFocusRestore();
        }
        Navigation.goBack(armedBackToRef.current);
    }, [isArmed, isSaved]);

    return {navigateBack, armNavigateBack};
}

export default useNavigateBackOnSave;

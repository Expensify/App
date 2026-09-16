import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import {useEffect, useRef, useState} from 'react';

/** `armNavigateBack` fires goBack once when `isSaved` next flips true (or immediately if already true); one-shot per cycle, `backTo` snapshotted at arm time. */
function useNavigateBackOnSave(isSaved: boolean, backTo: Route | undefined): {navigateBack: () => void; armNavigateBack: () => void} {
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
        Navigation.goBack(armedBackToRef.current, {shouldSkipFocusRestore: true});
    }, [isArmed, isSaved]);

    return {navigateBack, armNavigateBack};
}

export default useNavigateBackOnSave;

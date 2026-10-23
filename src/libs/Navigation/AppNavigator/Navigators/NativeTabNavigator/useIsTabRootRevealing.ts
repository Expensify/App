import {useState} from 'react';

/**
 * Whether the root screen of the focused tab is coming back into view while the navigation state still points at a
 * pushed screen, as during the iOS swipe-back gesture, which updates the state only once the gesture ends. Any change of
 * the tab or of whether it is at its root ends it, so the state always has the last word.
 */
function useIsTabRootRevealing(isAtTabRoot: boolean, activeTabKey: string | undefined): [boolean, (isRevealing: boolean) => void] {
    const [previous, setPrevious] = useState({isAtTabRoot, activeTabKey});
    const [revealingTabKey, setRevealingTabKey] = useState<string>();

    if (previous.isAtTabRoot !== isAtTabRoot || previous.activeTabKey !== activeTabKey) {
        setPrevious({isAtTabRoot, activeTabKey});
        setRevealingTabKey(undefined);
    }

    const setIsTabRootRevealing = (isRevealing: boolean) => setRevealingTabKey(isRevealing ? activeTabKey : undefined);

    return [!isAtTabRoot && !!revealingTabKey && revealingTabKey === activeTabKey, setIsTabRootRevealing];
}

export default useIsTabRootRevealing;

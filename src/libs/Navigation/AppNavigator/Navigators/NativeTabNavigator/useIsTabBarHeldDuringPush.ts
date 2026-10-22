import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useEffect, useState} from 'react';

/**
 * Whether the bar should stay up after a tab root pushed a screen within the same tab, until the push finishes, so the
 * new screen slides in under the bar before the bar hides.
 */
function useIsTabBarHeldDuringPush(isAtTabRoot: boolean, activeTabKey: string | undefined): boolean {
    const [previous, setPrevious] = useState({isAtTabRoot, activeTabKey});
    const [heldTabKey, setHeldTabKey] = useState<string>();

    if (previous.isAtTabRoot !== isAtTabRoot || previous.activeTabKey !== activeTabKey) {
        setPrevious({isAtTabRoot, activeTabKey});
        const isPushFromTabRoot = previous.isAtTabRoot && !isAtTabRoot && previous.activeTabKey === activeTabKey;
        setHeldTabKey(isPushFromTabRoot ? activeTabKey : undefined);
    }

    useEffect(() => {
        if (!heldTabKey) {
            return;
        }
        const handle = TransitionTracker.runAfterTransitions({callback: () => setHeldTabKey(undefined), waitForUpcomingTransition: 'navigation'});
        return () => handle.cancel();
    }, [heldTabKey]);

    return !!heldTabKey && heldTabKey === activeTabKey && !isAtTabRoot;
}

export default useIsTabBarHeldDuringPush;

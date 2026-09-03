import type {RefObject} from 'react';

import {useEffect, useEffectEvent, useRef, useState} from 'react';

type RevealableList = {
    getAbsoluteLastScrollOffset: () => number;
};

/**
 * Keeps a list that can be hidden by an `<Activity>` looking as it was built. A hidden subtree keeps its state but
 * unmounts its effects, so the effect below runs again when the list is revealed and its cleanup runs as it is hidden.
 *
 * Returns the version to key the list on. A revealed list starts at the top: its container lost the scroll position
 * while hidden while the recycler still reports the offset it was left at, which is what leaves the visible area blank.
 * The recycler takes an offset only from a scroll event, and scrolling to a top it already sits at produces none, so it
 * is replaced rather than scrolled: a new one starts where its container is.
 */
function useRevealedListReset(listRef: RefObject<RevealableList | null>, onHidden: () => void): number {
    const [revealedListVersion, setRevealedListVersion] = useState(0);
    const runOnHidden = useEffectEvent(onHidden);
    const hasEffectRunRef = useRef(false);

    useEffect(() => {
        // The first run is the real mount, where the list is where it belongs.
        if (hasEffectRunRef.current && listRef.current?.getAbsoluteLastScrollOffset()) {
            setRevealedListVersion((version) => version + 1);
        }
        hasEffectRunRef.current = true;

        return () => runOnHidden();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return revealedListVersion;
}

export default useRevealedListReset;

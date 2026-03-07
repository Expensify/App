import type {ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';

const DELAY_FOR_ACCESSIBILITY_TREE_SYNC = 100;

function useAccessibilityAnnouncement(message: string | ReactNode, shouldAnnounceMessage: boolean, shouldUsePersistentLiveRegionOnWeb = false) {
    const [liveRegionMessage, setLiveRegionMessage] = useState('');
    const liveRegionToggleRef = useRef(false);

    useEffect(() => {
        if (!shouldUsePersistentLiveRegionOnWeb || !shouldAnnounceMessage || typeof message !== 'string' || !message.trim()) {
            const clearTimeoutId = setTimeout(() => setLiveRegionMessage(''), 0);
            return () => clearTimeout(clearTimeoutId);
        }

        // Toggling content forces re-announcement even when the text doesn't change.
        const suffix = liveRegionToggleRef.current ? '\u200B' : '';
        liveRegionToggleRef.current = !liveRegionToggleRef.current;

        // Clear first so screen readers detect a change, then set the message on the next tick.
        const clearTimeoutId = setTimeout(() => setLiveRegionMessage(''), 0);
        const timeoutId = setTimeout(() => setLiveRegionMessage(`${message}${suffix}`), DELAY_FOR_ACCESSIBILITY_TREE_SYNC);

        return () => {
            clearTimeout(clearTimeoutId);
            clearTimeout(timeoutId);
        };
    }, [message, shouldAnnounceMessage, shouldUsePersistentLiveRegionOnWeb]);

    return {liveRegionMessage, shouldUsePersistentLiveRegion: shouldUsePersistentLiveRegionOnWeb} as const;
}

export default useAccessibilityAnnouncement;

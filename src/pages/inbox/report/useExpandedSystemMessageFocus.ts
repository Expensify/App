/** Completes a manual expansion handoff after commit, including when FlashList reuses an existing host. */
import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';

import {useEffect} from 'react';

function useExpandedSystemMessageFocus(reportActionID: string, targetRef: RefObject<ComponentRef<typeof View> | null>, onReady?: (target: ComponentRef<typeof View> | null) => void) {
    useEffect(() => {
        if (!onReady) {
            return;
        }

        // Recycled hosts need no new layout event; cancel if this row is reassigned or unmounted.
        const frame = requestAnimationFrame(() => onReady(targetRef.current));
        return () => cancelAnimationFrame(frame);
    }, [reportActionID, targetRef, onReady]);
}

export default useExpandedSystemMessageFocus;

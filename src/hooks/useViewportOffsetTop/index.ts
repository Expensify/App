import {useSyncExternalStore} from 'react';
import addViewportResizeListener from '@libs/VisualViewport';

/**
 * A hook that returns the offset of the top edge of the visual viewport
 */
function subscribe(callback: () => void) {
    const unsubscribe = addViewportResizeListener(callback);
    window.visualViewport?.addEventListener('scroll', callback);
    return () => {
        window.visualViewport?.removeEventListener('scroll', callback);
        unsubscribe();
    };
}

export default () => useSyncExternalStore(subscribe, () => window.visualViewport?.offsetTop ?? 0);

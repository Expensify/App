import addViewportResizeListener from '@libs/VisualViewport';

import {useSyncExternalStore} from 'react';

function getVisualViewportOffsetTop() {
    return window.visualViewport?.offsetTop ?? 0;
}

let offsetTop = getVisualViewportOffsetTop();

function subscribe(callback: () => void) {
    offsetTop = getVisualViewportOffsetTop();

    const handleViewportChange = () => {
        offsetTop = getVisualViewportOffsetTop();
        callback();
    };

    const unsubscribe = addViewportResizeListener(handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);
    return () => {
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
        unsubscribe();
    };
}

function getSnapshot() {
    return offsetTop;
}

export default () => useSyncExternalStore(subscribe, getSnapshot);

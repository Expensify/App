/**
 * The screen height with the soft keyboard closed. iOS browsers don't resize the page for the keyboard, and their
 * initial window height is stale after a rotation, so they use the document height. Other browsers resize the page,
 * so they use the initial window height.
 */
import useInitialDimensions from '@hooks/useInitialWindowDimensions';

import {isMobileWebKit} from '@libs/Browser';

import {useSyncExternalStore} from 'react';

function getDocumentHeight() {
    return document.documentElement.clientHeight;
}

let documentHeight = getDocumentHeight();

function subscribe(callback: () => void) {
    documentHeight = getDocumentHeight();

    const handleResize = () => {
        documentHeight = getDocumentHeight();
        callback();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}

function getSnapshot() {
    return documentHeight;
}

function useHeightWithoutKeyboard(): number {
    const {initialHeight} = useInitialDimensions();
    const currentDocumentHeight = useSyncExternalStore(subscribe, getSnapshot);

    return isMobileWebKit() ? currentDocumentHeight : initialHeight;
}

export default useHeightWithoutKeyboard;

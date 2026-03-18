import type {ReactNode} from 'react';
import {useEffect, useRef} from 'react';
import type UseAccessibilityAnnouncementOptions from './types';

const VISUALLY_HIDDEN_STYLE: Partial<CSSStyleDeclaration> = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: '0',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
};

/**
 * VoiceOver on Mac echoes the completed word ~500-750ms after the last keystroke
 * and takes ~300-500ms to speak it. Combined with the 1000ms debounce in
 * useDebouncedAccessibilityAnnouncement, this delay ensures the announcement
 * fires after VoiceOver finishes the word echo (~1300ms total from last keystroke).
 */
const ANNOUNCEMENT_DELAY_MS = 300;

let wrapper: HTMLDivElement | null = null;

function getWrapper(): HTMLDivElement {
    if (wrapper && document.body.contains(wrapper)) {
        return wrapper;
    }

    wrapper = document.createElement('div');
    wrapper.setAttribute('aria-live', 'assertive');
    wrapper.setAttribute('aria-atomic', 'true');
    Object.assign(wrapper.style, VISUALLY_HIDDEN_STYLE);
    document.body.appendChild(wrapper);

    return wrapper;
}

function useAccessibilityAnnouncement(message: string | ReactNode, shouldAnnounceMessage: boolean, options?: UseAccessibilityAnnouncementOptions) {
    const shouldAnnounceOnWeb = options?.shouldAnnounceOnWeb ?? false;
    const prevShouldAnnounceRef = useRef(false);

    useEffect(() => {
        if (!shouldAnnounceMessage) {
            prevShouldAnnounceRef.current = false;
            return;
        }

        if (prevShouldAnnounceRef.current || !shouldAnnounceOnWeb || typeof message !== 'string' || !message.trim()) {
            return;
        }

        prevShouldAnnounceRef.current = true;

        const container = getWrapper();

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const timer = setTimeout(() => {
            const node = document.createElement('div');
            node.setAttribute('role', 'alert');
            node.textContent = message;
            container.appendChild(node);
        }, ANNOUNCEMENT_DELAY_MS);

        return () => {
            clearTimeout(timer);
            prevShouldAnnounceRef.current = false;
        };
    }, [message, shouldAnnounceMessage, shouldAnnounceOnWeb]);
}

export default useAccessibilityAnnouncement;

import type {ReactNode} from 'react';
import {useEffect, useRef} from 'react';

type UseAccessibilityAnnouncementOptions = {
    shouldAnnounceOnNative?: boolean;
    shouldAnnounceOnWeb?: boolean;
};

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
 * and takes ~300-500ms to speak it. This web-only delay ensures our role="alert"
 * announcement fires after VoiceOver finishes speaking the word echo.
 */
const ANNOUNCEMENT_DELAY_MS = 1000;

let wrapper: HTMLDivElement | null = null;

function getWrapper(): HTMLDivElement {
    if (wrapper && document.body.contains(wrapper)) {
        return wrapper;
    }

    wrapper = document.createElement('div');
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

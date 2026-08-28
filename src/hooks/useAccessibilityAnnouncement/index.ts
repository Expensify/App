import type {ReactNode} from 'react';

import {useEffect, useRef} from 'react';

import type UseAccessibilityAnnouncementOptions from './types';
import type {AriaLivePoliteness} from './types';

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

const wrappers: Partial<Record<AriaLivePoliteness, HTMLDivElement>> = {};

function getAnnouncementRoot(): HTMLElement {
    const activeElement = document.activeElement;
    const activeDialog = activeElement instanceof HTMLElement ? activeElement.closest<HTMLElement>('[role="dialog"][aria-modal="true"]') : null;

    if (activeDialog) {
        return activeDialog;
    }

    const modalDialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]');
    return modalDialogs.item(modalDialogs.length - 1) ?? document.body;
}

function getWrapper(politeness: AriaLivePoliteness): HTMLDivElement {
    const root = getAnnouncementRoot();
    const existing = wrappers[politeness];

    if (existing && root.contains(existing)) {
        return existing;
    }

    if (existing?.parentElement) {
        existing.parentElement.removeChild(existing);
    }

    const wrapper = document.createElement('div');
    wrapper.setAttribute('aria-live', politeness);
    wrapper.setAttribute('aria-atomic', 'true');
    Object.assign(wrapper.style, VISUALLY_HIDDEN_STYLE);
    root.appendChild(wrapper);
    wrappers[politeness] = wrapper;

    return wrapper;
}

function useAccessibilityAnnouncement(message: string | ReactNode, shouldAnnounceMessage: boolean, options?: UseAccessibilityAnnouncementOptions) {
    const shouldAnnounceOnWeb = options?.shouldAnnounceOnWeb ?? false;
    const politeness = options?.politeness ?? 'assertive';
    const previousKeyRef = useRef(options?.announcementKey);
    const previousMessageRef = useRef('');

    useEffect(() => {
        if (!shouldAnnounceMessage) {
            previousMessageRef.current = '';
            return;
        }

        if (!shouldAnnounceOnWeb || typeof message !== 'string' || !message.trim()) {
            return;
        }

        const keyChanged = options?.announcementKey !== undefined && options.announcementKey !== previousKeyRef.current;
        previousKeyRef.current = options?.announcementKey;

        // Same gate as native: skip duplicates unless the message or announcementKey changes.
        if (!keyChanged && previousMessageRef.current === message) {
            return;
        }

        previousMessageRef.current = message;

        const timer = setTimeout(() => {
            const container = getWrapper(politeness);

            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            const node = document.createElement('div');
            // role=alert is mapped to assertive interruption — only use it for assertive announces.
            if (politeness === 'assertive') {
                node.setAttribute('role', 'alert');
            }
            node.textContent = message;
            container.appendChild(node);
        }, ANNOUNCEMENT_DELAY_MS);

        return () => {
            clearTimeout(timer);
        };
    }, [message, shouldAnnounceMessage, shouldAnnounceOnWeb, politeness, options?.announcementKey]);
}

export default useAccessibilityAnnouncement;

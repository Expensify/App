import asHostElement from '@components/Overlay/libs/asHostElement';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';
import OVERLAY_PORTAL_DATASET_KEY from '@components/Overlay/libs/portalMarkers';

import type {RefObject} from 'react';

import {useLayoutEffect} from 'react';

type SavedAttrs = {
    priorAriaHidden: string | null;
    priorInert: string | null;
    lockCount: number;
};

const saved = new WeakMap<Element, SavedAttrs>();

type ObserverEntry = {
    observer: MutationObserver;
    sweep: () => void;
};

const observerStack: ObserverEntry[] = [];

function findPortalRoot(node: Element | null): Element | null {
    let current: Element | null = node;
    while (current && current.parentElement && current.parentElement !== document.body) {
        current = current.parentElement;
    }
    return current?.parentElement === document.body ? current : null;
}

function acquire(rootSibling: Element): void {
    const existing = saved.get(rootSibling);
    if (existing) {
        existing.lockCount += 1;
        return;
    }
    saved.set(rootSibling, {
        priorAriaHidden: rootSibling.getAttribute('aria-hidden'),
        priorInert: rootSibling.getAttribute('inert'),
        lockCount: 1,
    });
    rootSibling.setAttribute('aria-hidden', 'true');
    rootSibling.setAttribute('inert', '');
}

function release(rootSibling: Element): void {
    const existing = saved.get(rootSibling);
    if (!existing) {
        return;
    }
    existing.lockCount -= 1;
    if (existing.lockCount > 0) {
        return;
    }
    // Restore only if our value is still there — concurrent legacy mutations win.
    if (rootSibling.getAttribute('aria-hidden') === 'true') {
        if (existing.priorAriaHidden === null) {
            rootSibling.removeAttribute('aria-hidden');
        } else {
            rootSibling.setAttribute('aria-hidden', existing.priorAriaHidden);
        }
    }
    if (rootSibling.getAttribute('inert') === '') {
        if (existing.priorInert === null) {
            rootSibling.removeAttribute('inert');
        } else {
            rootSibling.setAttribute('inert', existing.priorInert);
        }
    }
    saved.delete(rootSibling);
}

function pushObserverEntry(sweep: () => void): () => void {
    observerStack.at(-1)?.observer.disconnect();
    const observer = new MutationObserver(sweep);
    const entry: ObserverEntry = {observer, sweep};
    observerStack.push(entry);
    // sweep() only inspects direct body children, so only body's own childList can change the result — no subtree.
    observer.observe(document.body, {childList: true});
    return () => {
        observer.disconnect();
        const index = observerStack.indexOf(entry);
        if (index >= 0) {
            observerStack.splice(index, 1);
        }
        const newTop = observerStack.at(-1);
        if (newTop) {
            newTop.observer.observe(document.body, {childList: true});
            newTop.sweep();
        }
    };
}

function useAriaHideSiblings(containerRef: RefObject<AnchorNode | null>, isActive: boolean): void {
    useLayoutEffect(() => {
        if (!isActive || typeof document === 'undefined') {
            return undefined;
        }

        const acquired = new Set<Element>();

        const sweep = () => {
            // Re-resolve every sweep — a cached portalRoot can detach mid-teardown and break compareDocumentPosition.
            const host = asHostElement(containerRef.current);
            const ownPortalRoot = findPortalRoot(host);
            if (ownPortalRoot === null) {
                return;
            }
            for (const child of Array.from(document.body.children)) {
                if (child === ownPortalRoot || acquired.has(child)) {
                    continue;
                }
                const isOverlayPortal = child instanceof HTMLElement && child.dataset[OVERLAY_PORTAL_DATASET_KEY] !== undefined;
                if (isOverlayPortal) {
                    // eslint-disable-next-line no-bitwise -- compareDocumentPosition returns a bitmask; the & is the standard way to test DOCUMENT_POSITION_FOLLOWING.
                    const followsOwnPortal = (ownPortalRoot.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
                    if (followsOwnPortal) {
                        continue;
                    }
                }
                acquire(child);
                acquired.add(child);
            }
        };

        sweep();
        const detachObserver = pushObserverEntry(sweep);

        return () => {
            detachObserver();
            for (const sibling of acquired) {
                release(sibling);
            }
            acquired.clear();
        };
    }, [containerRef, isActive]);
}

export default useAriaHideSiblings;

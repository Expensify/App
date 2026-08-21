import type {PropsWithChildren} from 'react';

import React, {useRef} from 'react';

/**
 * Refuses every write to 'display' on the element. React hides a host element with
 * 'style.setProperty(display, none, important)' and reveals it by assigning to 'style.display', so both are
 * replaced. Returns a writer bound to the original method, so the observer below can reach past the patch.
 */
function pinDisplayToContents(element: HTMLDivElement) {
    const {style} = element;
    const setStyleProperty = style.setProperty.bind(style);
    const forceDisplayContents = () => setStyleProperty('display', 'contents', 'important');

    forceDisplayContents();

    try {
        Object.defineProperty(style, 'setProperty', {
            configurable: true,
            value: (property: string, value: string | null, priority?: string) => {
                if (property === 'display') {
                    return;
                }
                setStyleProperty(property, value, priority);
            },
        });
        Object.defineProperty(style, 'display', {
            configurable: true,
            get: () => 'contents',
            set: () => {},
        });
    } catch {
        // An environment that refuses to let the declaration be patched is left to the observer below.
    }

    return forceDisplayContents;
}

/**
 * Keeps children painted while React hides the surrounding subtree. React hides a hidden <Activity> with an inline
 * 'display: none !important' that no stylesheet rule can beat, so the element's own declaration refuses the write
 * instead. This is the web counterpart of the native view config in index.native.tsx.
 *
 * The MutationObserver only catches a React version that writes the style attribute as a whole. It cannot live in
 * an effect, because a hidden Activity unmounts the effects of its subtree, so a callback ref attaches it once per
 * element and lets the observer be collected together with the element.
 *
 * The 'inert' attribute takes the painted content out of the tab order while the screen is covered. It is a plain
 * div because react-native's View does not declare 'inert'.
 */
function CustomViewWrapper({style, inert, children}: PropsWithChildren<{style: React.CSSProperties; inert?: boolean}>) {
    const observedElementRef = useRef<HTMLDivElement | null>(null);

    const attachDisplayContentsEnforcer = (element: HTMLDivElement | null) => {
        if (!element || observedElementRef.current === element) {
            return;
        }
        observedElementRef.current = element;

        const forceDisplayContents = pinDisplayToContents(element);
        if (typeof MutationObserver === 'undefined') {
            return;
        }

        const observer = new MutationObserver(() => {
            if (element.style.getPropertyValue('display') === 'contents') {
                return;
            }
            forceDisplayContents();
        });
        observer.observe(element, {attributes: true, attributeFilter: ['style']});
    };

    return (
        <div
            ref={attachDisplayContentsEnforcer}
            inert={inert}
            style={style}
        >
            {children}
        </div>
    );
}

export default CustomViewWrapper;

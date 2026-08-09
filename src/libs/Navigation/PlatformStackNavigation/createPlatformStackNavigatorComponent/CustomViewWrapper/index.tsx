import type {PropsWithChildren} from 'react';

import React, {useRef} from 'react';

/**
 * Refuses every write to 'display' on the element and keeps the declaration reporting 'contents'. React hides a
 * host element with 'style.setProperty(display, none, important)' and reveals it with an assignment to
 * 'style.display', so both the method and the property have to be replaced. Every other property still goes
 * through untouched, which is why the style prop of this component may not carry 'display' itself.
 *
 * Returns a writer bound to the original method, for the fallback below to reach past the patch.
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
 * Keeps children painted while React hides the surrounding subtree. React hides the content of a hidden
 * <Activity> (and of a suspended tree) by writing an inline 'display: none !important' on its nearest host
 * elements. No stylesheet rule can win against that, so the element's own style declaration ignores those writes
 * instead. As a result the navigator's card visibility, not Activity, decides what is visible on screen. This is
 * the web counterpart of the native view config trick in index.native.tsx.
 *
 * Swallowing the write is what makes this cheap. React writes the display in the mutation phase and layout
 * effects force layout later in the same commit, so a value that really lands tears down the layout tree of the
 * whole covered screen, and putting the old value back costs a second full pass. Refusing both writes leaves
 * hiding and revealing a screen with no style invalidation at all.
 *
 * The MutationObserver is the fallback for a React version that writes the style attribute as a whole, which the
 * patch cannot see. It normally never fires. It must not live in an effect: a hidden Activity unmounts the
 * effects of its subtree, so an effect cleanup would disconnect the observer (discarding its pending records) in
 * the very commit that applies the display none. A callback ref attaches everything once per element instead. The
 * observer is deliberately never disconnected. After unmount the observer and the element only reference each
 * other, so both get garbage collected together.
 *
 * The content stays painted, so it stays in the tab order and can still take focus while its updates are deferred.
 * The 'inert' prop takes that away for as long as the screen is covered. It is the only part of this the navigator
 * does not already handle: react-navigation's CardA11yWrapper puts 'aria-hidden' and 'pointer-events: none' on
 * every card that is not focused, but neither of those touches the tab order. Because a hidden Activity does not
 * run effects, the flag has to be part of the rendered output rather than something an effect applies to the node.
 * This is a plain div, the same element react-navigation renders for the web branch of its Container, which is
 * what makes 'inert' available, because react-native's View does not declare it.
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

import type {PropsWithChildren} from 'react';

import React, {useRef} from 'react';

/**
 * Keeps children painted while React hides the surrounding subtree. React hides the content of a hidden
 * <Activity> (and of a suspended tree) by setting an inline 'display: none !important' on its nearest host
 * elements. No stylesheet rule can win against that, so a MutationObserver forces 'display: contents' back with
 * the same priority whenever the inline style changes. As a result the navigator's card visibility, not Activity,
 * decides what is visible on screen - the web counterpart of the native view config trick in index.native.tsx.
 *
 * The observer must not live in an effect: a hidden Activity unmounts the effects of its subtree, so an effect
 * cleanup would disconnect the observer (discarding its pending records) in the very commit that applies the
 * display none. A callback ref attaches the observer once instead. It is deliberately never disconnected; after
 * unmount the observer and the element only reference each other, so both get garbage collected together.
 *
 * The content stays painted, so it stays in the tab order and can still take focus while its updates are deferred.
 * The 'inert' prop takes that away for as long as the screen is covered. It is the only part of this the navigator
 * does not already handle: react-navigation's CardA11yWrapper puts 'aria-hidden' and 'pointer-events: none' on
 * every card that is not focused, but neither of those touches the tab order. Because a hidden Activity does not
 * run effects, the flag has to be part of the rendered output rather than something an effect applies to the node.
 * This is a plain div, the same element react-navigation renders for the web branch of its Container, which is
 * what makes 'inert' available - react-native's View does not declare it.
 */
function CustomViewWrapper({style, inert, children}: PropsWithChildren<{style: React.CSSProperties; inert?: boolean}>) {
    const observerRef = useRef<MutationObserver | null>(null);

    const attachDisplayContentsEnforcer = (element: HTMLDivElement | null) => {
        if (!element || observerRef.current || typeof MutationObserver === 'undefined') {
            return;
        }

        const forceDisplayContents = () => {
            if (element.style.getPropertyValue('display') === 'contents') {
                return;
            }
            element.style.setProperty('display', 'contents', 'important');
        };

        forceDisplayContents();
        const observer = new MutationObserver(forceDisplayContents);
        observer.observe(element, {attributes: true, attributeFilter: ['style']});
        observerRef.current = observer;
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

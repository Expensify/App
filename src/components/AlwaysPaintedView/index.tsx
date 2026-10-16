import {useRef} from 'react';

import type AlwaysPaintedViewProps from './types';

/**
 * Refuses every write to 'display' on the element. React hides a host element with
 * 'style.setProperty(display, none, important)' and reveals it by assigning to 'style.display', so both are
 * replaced. Blocking the writes keeps the element from ever reaching 'display: none'. A MutationObserver
 * fallback would only restore the value after the fact, so the element would still pass through 'display: none'
 * and the browser would pay for the layout reflow. The React version in use touches 'display' only through these
 * two entry points, so re-verify this after React upgrades.
 */
function pinDisplayToContents(element: HTMLDivElement) {
    const {style} = element;
    const setStyleProperty = style.setProperty.bind(style);

    setStyleProperty('display', 'contents', 'important');

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
}

/**
 * Web implementation that renders a `display: contents` host element, which generates no box and takes no layout
 * style. Native does the same through a view config (see index.native.tsx), so wrapper nodes don't hide the
 * navigation underlay during swipe-back or Activity visibility toggles.
 *
 * It is a plain div because react-native-web's View neither accepts `display: contents` nor declares `inert`. The
 * attribute goes on that same div, so `inert` needs no extra node here, unlike on native.
 */
function AlwaysPaintedView({inert, children}: AlwaysPaintedViewProps) {
    const pinnedElementRef = useRef<HTMLDivElement | null>(null);

    const attachDisplayContentsEnforcer = (element: HTMLDivElement | null) => {
        if (!element || pinnedElementRef.current === element) {
            return;
        }
        pinnedElementRef.current = element;
        pinDisplayToContents(element);
    };

    return (
        <div
            ref={attachDisplayContentsEnforcer}
            inert={inert}
        >
            {children}
        </div>
    );
}

export default AlwaysPaintedView;

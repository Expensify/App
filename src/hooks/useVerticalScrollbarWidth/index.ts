import {useEffect, useRef, useState} from 'react';

import type {ScrollableNodeHolder} from './types';
import type UseVerticalScrollbarWidth from './types';

/**
 * How much width a list's vertical scrollbar takes away from its content.
 *
 * Reports 0 when the platform draws the bar as an overlay, which is what macOS does unless the reader has asked for
 * the bar to stay visible. A classic bar reports its real width instead, so anything laid out against the list's own
 * width can account for the space the rows actually lost.
 *
 * The measurement is attached through a ref rather than read once, because a list swaps its scrolling element out
 * when it unmounts for an empty state.
 */
const useVerticalScrollbarWidth: UseVerticalScrollbarWidth = () => {
    const [scrollbarWidth, setScrollbarWidth] = useState(0);
    const observerRef = useRef<ResizeObserver | null>(null);

    const measureScrollbarRef = (instance: ScrollableNodeHolder | null) => {
        observerRef.current?.disconnect();
        observerRef.current = null;

        const node = instance?.getScrollableNode();

        if (!(node instanceof HTMLElement)) {
            setScrollbarWidth(0);
            return;
        }

        const measure = () => setScrollbarWidth(node.offsetWidth - node.clientWidth);

        measure();

        // The bar appearing shrinks the content box while leaving the border box alone, so a layout event never
        // reports it. Observing the content box does.
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        observerRef.current = observer;
    };

    useEffect(
        () => () => {
            observerRef.current?.disconnect();
        },
        [],
    );

    return {scrollbarWidth, measureScrollbarRef};
};

export default useVerticalScrollbarWidth;

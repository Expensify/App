import {useCallback, useEffect, useRef, useState} from 'react';
import * as Browser from '@libs/Browser';
import addViewportResizeListener from '@libs/VisualViewport';

/**
 * A hook that returns the offset of the top edge of the visual viewport
 */
export default function useViewportOffsetTop(shouldAdjustScrollView = false): number {
    const [viewportOffsetTop, setViewportOffsetTop] = useState(0);
    const cachedDefaultOffsetTop = useRef<number>(0);

    const updateOffsetTop = useCallback(
        (event?: Event) => {
            let targetOffsetTop = window.visualViewport?.offsetTop ?? 0;
            if (event?.target instanceof VisualViewport) {
                targetOffsetTop = event.target.offsetTop;
            }

            if (Browser.isMobileSafari() && shouldAdjustScrollView && window.visualViewport) {
                const clientHeight = document.body.clientHeight;
                const adjustScrollY = clientHeight - window.visualViewport.height;
                if (cachedDefaultOffsetTop.current === 0) {
                    cachedDefaultOffsetTop.current = targetOffsetTop;
                }

                if (adjustScrollY > targetOffsetTop) {
                    setViewportOffsetTop(adjustScrollY);
                } else if (targetOffsetTop !== 0 && adjustScrollY === targetOffsetTop) {
                    setViewportOffsetTop(cachedDefaultOffsetTop.current);
                } else {
                    setViewportOffsetTop(targetOffsetTop);
                }
            } else {
                setViewportOffsetTop(targetOffsetTop);
            }
        },
        [shouldAdjustScrollView],
    );

    useEffect(() => addViewportResizeListener(updateOffsetTop), [updateOffsetTop]);

    useEffect(() => {
        if (!shouldAdjustScrollView) {
            return;
        }
        window.scrollTo({top: viewportOffsetTop, behavior: 'smooth'});
    }, [shouldAdjustScrollView, viewportOffsetTop]);

    return viewportOffsetTop;
}

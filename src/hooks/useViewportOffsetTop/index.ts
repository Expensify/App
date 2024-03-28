import {useEffect, useRef, useState} from 'react';
import addViewportResizeListener from '@libs/VisualViewport';

/**
 * A hook that returns the offset of the top edge of the visual viewport
 */
export default function useViewportOffsetTop(shouldAdjustScrollView = false): number {
    const [viewportOffsetTop, setViewportOffsetTop] = useState(0);
    const initialHeight = useRef(window.visualViewport?.height ?? window.innerHeight).current;
    const cachedDefaultOffsetTop = useRef<number>(0);
    useEffect(() => {
        const updateOffsetTop = (event?: Event) => {
            let targetOffsetTop = window.visualViewport?.offsetTop ?? 0;
            if (event?.target instanceof VisualViewport) {
                targetOffsetTop = event.target.offsetTop;
            }

            if (shouldAdjustScrollView && window.visualViewport) {
                const adjustScrollY = Math.round(initialHeight - window.visualViewport.height);
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
        };
        updateOffsetTop();
        return addViewportResizeListener(updateOffsetTop);
    }, [initialHeight, shouldAdjustScrollView]);

    useEffect(() => {
        if (!shouldAdjustScrollView) {
            return;
        }
        window.scrollTo({top: viewportOffsetTop});
    }, [shouldAdjustScrollView, viewportOffsetTop]);

    return viewportOffsetTop;
}

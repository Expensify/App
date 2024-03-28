import {useCallback, useEffect, useRef, useState} from 'react';
import addViewportResizeListener from '@libs/VisualViewport';
import CONST from '@src/CONST';

/**
 * A hook that returns the offset of the top edge of the visual viewport
 */
export default function useViewportOffsetTop(shouldAdjustScrollView = false): number {
    const [viewportOffsetTop, setViewportOffsetTop] = useState(0);
    const initialHeight = useRef(0);
    const cachedDefaultOffsetTop = useRef<number>(0);

    const updateOffsetTop = useCallback(
        (event?: Event) => {
            let targetOffsetTop = window.visualViewport?.offsetTop ?? 0;
            if (event?.target instanceof VisualViewport) {
                targetOffsetTop = event.target.offsetTop;
            }

            if (shouldAdjustScrollView && window.visualViewport && initialHeight.current) {
                const adjustScrollY = Math.round(initialHeight.current - window.visualViewport.height);
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
                setViewportOffsetTop(0);
            }
        },
        [shouldAdjustScrollView],
    );

    useEffect(() => addViewportResizeListener(updateOffsetTop), [shouldAdjustScrollView, updateOffsetTop]);

    useEffect(() => {
        setTimeout(() => {
            initialHeight.current = window.visualViewport?.height ?? window.innerHeight;
            updateOffsetTop();
        }, CONST.TIMING.RESIZE_DEBOUNCE_TIME);
    }, [updateOffsetTop]);

    useEffect(() => {
        if (!shouldAdjustScrollView) {
            return;
        }
        window.scrollTo({top: viewportOffsetTop});
    }, [shouldAdjustScrollView, viewportOffsetTop]);

    return viewportOffsetTop;
}

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

            console.log(`___________ UpdateOffsetTop ___________`, window.visualViewport?.height, {initialHeight: initialHeight.current});
            if (shouldAdjustScrollView && window.visualViewport && initialHeight.current) {
                const adjustScrollY = Math.round(initialHeight.current - window.visualViewport.height);
                console.log(`___________ ___________`, { adjustScrollY, cachedDefaultOffsetTop: cachedDefaultOffsetTop.current });
                if (cachedDefaultOffsetTop.current === 0) {
                    console.log(`___________ CASE 0 ___________`, {targetOffsetTop});
                    cachedDefaultOffsetTop.current = targetOffsetTop;
                }

                if (adjustScrollY > targetOffsetTop) {
                    console.log(`___________ CASE 1 ___________`, {adjustScrollY, targetOffsetTop});
                    setViewportOffsetTop(adjustScrollY);
                } else if (targetOffsetTop !== 0 && adjustScrollY === targetOffsetTop) {
                    console.log(`___________ CASE 2 ___________`, {adjustScrollY, targetOffsetTop, cachedDefaultOffsetTop: cachedDefaultOffsetTop.current});
                    setViewportOffsetTop(cachedDefaultOffsetTop.current);
                } else {
                    console.log(`___________ CASE 3 ___________`, {adjustScrollY, targetOffsetTop});
                    setViewportOffsetTop(targetOffsetTop);
                }
            } else {
                console.log(`___________ CASE 4. ___________`, {targetOffsetTop, event});
                setViewportOffsetTop(0);
            }
        },
        [shouldAdjustScrollView],
    );

    useEffect(() => {
        return addViewportResizeListener(updateOffsetTop);
    }, [shouldAdjustScrollView, updateOffsetTop]);

    useEffect(() => {
        setTimeout(() => {
            initialHeight.current = window.visualViewport?.height ?? window.innerHeight;
            console.log(`___________ INIT ___________`, initialHeight.current);
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

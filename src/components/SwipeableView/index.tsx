import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import DomUtils from '@libs/DomUtils';
import SwipeableViewProps from './types';

// Min delta y in px to trigger swipe
const MIN_DELTA_Y = 25;

function SwipeableView({onSwipeUp, onSwipeDown, style, children}: SwipeableViewProps) {
    const ref = useRef<View | null>(null);
    const scrollableChildRef = useRef<HTMLElement | null>(null);
    const startY = useRef(0);
    const isScrolling = useRef(false);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const element = ref.current as unknown as HTMLElement;

        const handleTouchStart = (event: TouchEvent) => {
            startY.current = event.touches[0].clientY;
        };

        const handleTouchEnd = (event: TouchEvent) => {
            const deltaY = event.changedTouches[0].clientY - startY.current;
            const isSelecting = DomUtils.isActiveTextSelection();
            let canSwipeDown = true;
            let canSwipeUp = true;
            if (scrollableChildRef.current) {
                canSwipeUp = scrollableChildRef.current.scrollHeight - scrollableChildRef.current.scrollTop === scrollableChildRef.current.clientHeight;
                canSwipeDown = scrollableChildRef.current.scrollTop === 0;
            }

            if (deltaY > MIN_DELTA_Y && onSwipeDown && !isSelecting && canSwipeDown && !isScrolling.current) {
                onSwipeDown();
            }

            if (deltaY < -MIN_DELTA_Y && onSwipeUp && !isSelecting && canSwipeUp && !isScrolling.current) {
                onSwipeUp();
            }
            isScrolling.current = false;
        };

        const handleScroll = (event: Event) => {
            isScrolling.current = true;
            if (!event.target || scrollableChildRef.current) {
                return;
            }
            scrollableChildRef.current = event.target as HTMLElement;
        };

        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchend', handleTouchEnd);
        element.addEventListener('scroll', handleScroll, true);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('scroll', handleScroll);
        };
    }, [onSwipeDown, onSwipeUp]);

    return (
        <View
            ref={ref}
            style={style}
        >
            {children}
        </View>
    );
}

SwipeableView.displayName = 'SwipeableView';

export default SwipeableView;

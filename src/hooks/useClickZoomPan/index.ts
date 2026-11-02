import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import type {SyntheticEvent} from 'react';
import type {GestureResponderEvent} from 'react-native';

import {useEffect, useState} from 'react';

import type UseClickZoomPan from './types';

type ZoomDelta = {offsetX: number; offsetY: number};

/**
 * Desktop-web click-to-zoom with scroll/drag panning, shared by ImageView and the expanded chart:
 * click zooms in centered on the clicked point, scroll or drag pans, click again zooms out.
 */
const useClickZoomPan: UseClickZoomPan = ({scrollableRef, containerSize, zoomFactor}) => {
    const canUseTouchScreen = canUseTouchScreenUtil();

    const [isZoomed, setIsZoomed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [initialScrollLeft, setInitialScrollLeft] = useState(0);
    const [initialScrollTop, setInitialScrollTop] = useState(0);
    const [initialX, setInitialX] = useState(0);
    const [initialY, setInitialY] = useState(0);
    const [zoomDelta, setZoomDelta] = useState<ZoomDelta>();

    const onContainerPressIn = (e: GestureResponderEvent) => {
        const {pageX, pageY} = e.nativeEvent;
        setIsMouseDown(true);
        setInitialX(pageX);
        setInitialY(pageY);
        setInitialScrollLeft(scrollableRef.current?.scrollLeft ?? 0);
        setInitialScrollTop(scrollableRef.current?.scrollTop ?? 0);
    };

    /**
     * Convert touch point to zoomed point
     * @param x point when click zoom
     * @param y point when click zoom
     * @returns converted touch point
     */
    const getScrollOffset = (x: number, y: number) => {
        let offsetX = 0;
        let offsetY = 0;

        // Container size bigger than clicked position offset
        if (x <= containerSize.width / 2) {
            offsetX = 0;
        } else if (x > containerSize.width / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetX = x - containerSize.width / 2;
        }
        if (y <= containerSize.height / 2) {
            offsetY = 0;
        } else if (y > containerSize.height / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetY = y - containerSize.height / 2;
        }
        return {offsetX, offsetY};
    };

    const onContainerPress = (e?: GestureResponderEvent | KeyboardEvent | SyntheticEvent<Element, PointerEvent>) => {
        if (!isZoomed && !isDragging) {
            if (e && 'nativeEvent' in e && e.nativeEvent instanceof PointerEvent) {
                const {offsetX, offsetY} = e.nativeEvent;

                // Convert the click into zoomed-space coordinates so we scroll to the clicked location once zoomed
                const delta = getScrollOffset(offsetX * zoomFactor, offsetY * zoomFactor);
                setZoomDelta(delta);
            } else {
                setZoomDelta({offsetX: 0, offsetY: 0});
            }
        }

        if (isZoomed && isDragging && isMouseDown) {
            setIsDragging(false);
            setIsMouseDown(false);
        } else {
            setIsZoomed(!isZoomed);
            setIsMouseDown(false);
        }
    };

    const resetZoom = () => {
        setIsZoomed(false);
        setIsDragging(false);
        setIsMouseDown(false);
        setZoomDelta(undefined);
    };

    const trackPointerPosition = (event: MouseEvent) => {
        // Whether the pointer is released inside the scrollable container
        const isInsideContainer = event.target instanceof Node && scrollableRef.current?.contains(event.target);

        if (!isInsideContainer && isZoomed && isDragging && isMouseDown) {
            setIsDragging(false);
            setIsMouseDown(false);
        }
    };

    const trackMovement = (event: MouseEvent) => {
        if (!isZoomed) {
            return;
        }

        const scrollableContainer = scrollableRef.current;
        if (isDragging && isMouseDown && scrollableContainer) {
            const moveX = initialX - event.x;
            const moveY = initialY - event.y;
            scrollableContainer.scrollLeft = initialScrollLeft + moveX;
            scrollableContainer.scrollTop = initialScrollTop + moveY;
        }

        setIsDragging(isMouseDown);
    };

    useEffect(() => {
        const scrollableContainer = scrollableRef.current;
        if (!isZoomed || !zoomDelta || !scrollableContainer) {
            return;
        }
        scrollableContainer.scrollLeft = zoomDelta.offsetX;
        scrollableContainer.scrollTop = zoomDelta.offsetY;
    }, [zoomDelta, isZoomed, scrollableRef]);

    useEffect(() => {
        if (canUseTouchScreen) {
            return;
        }
        document.addEventListener('mousemove', trackMovement);
        document.addEventListener('mouseup', trackPointerPosition);

        return () => {
            document.removeEventListener('mousemove', trackMovement);
            document.removeEventListener('mouseup', trackPointerPosition);
        };
    }, [canUseTouchScreen, trackMovement, trackPointerPosition]);

    return {isZoomed, isDragging, onContainerPressIn, onContainerPress, resetZoom};
};

export default useClickZoomPan;

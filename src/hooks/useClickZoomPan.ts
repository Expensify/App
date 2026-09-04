import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import type {Dimensions} from '@src/types/utils/Layout';

import type {RefObject, SyntheticEvent} from 'react';
import type {GestureResponderEvent, View} from 'react-native';

import {useCallback, useEffect, useState} from 'react';

type ZoomDelta = {offsetX: number; offsetY: number};

type UseClickZoomPanParams = {
    /** The scrollable element the zoomed content overflows into */
    scrollableRef: RefObject<(View & HTMLDivElement) | null>;

    /** The size of the visible scroll area, used to center the clicked point after zooming */
    containerSize: Dimensions;

    /** Multiplier that maps a point in displayed (fitted) space to the same point in zoomed space */
    zoomFactor: number;
};

type UseClickZoomPanResult = {
    /** Whether the content is currently zoomed in */
    isZoomed: boolean;

    /** Whether the user is currently dragging to pan the zoomed content */
    isDragging: boolean;

    /** Press-in handler for the pressable zoom area — records the drag start position */
    onContainerPressIn: (e: GestureResponderEvent) => void;

    /** Press handler for the pressable zoom area — toggles zoom or ends a drag */
    onContainerPress: (e?: GestureResponderEvent | KeyboardEvent | SyntheticEvent<Element, PointerEvent>) => void;

    /** Resets all zoom/drag state, e.g. when the content reloads or its container closes */
    resetZoom: () => void;
};

/**
 * Desktop-web click-to-zoom with scroll/drag panning, shared by the image attachment viewer
 * (ImageView) and the expanded chart so both zoom identically: click zooms in centered on the
 * clicked point, mouse scroll or drag pans while zoomed, and clicking again zooms back out.
 */
function useClickZoomPan({scrollableRef, containerSize, zoomFactor}: UseClickZoomPanParams): UseClickZoomPanResult {
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

                // Multiplying clicked positions by the zoom factor to get zoomed-space coordinates
                // so that once we zoom we will scroll to the clicked location.
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
            // We first zoom and once its done then we scroll to the location the user clicked.
            setIsZoomed(!isZoomed);
            setIsMouseDown(false);
        }
    };

    const resetZoom = useCallback(() => {
        setIsZoomed(false);
        setIsDragging(false);
        setIsMouseDown(false);
        setZoomDelta(undefined);
    }, []);

    const trackPointerPosition = useCallback(
        (event: MouseEvent) => {
            // Whether the pointer is released inside the scrollable container
            const isInsideContainer = event.target instanceof Node && scrollableRef.current?.contains(event.target);

            if (!isInsideContainer && isZoomed && isDragging && isMouseDown) {
                setIsDragging(false);
                setIsMouseDown(false);
            }
        },
        [isDragging, isMouseDown, isZoomed, scrollableRef],
    );

    const trackMovement = useCallback(
        (event: MouseEvent) => {
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
        },
        [initialScrollLeft, initialScrollTop, initialX, initialY, isDragging, isMouseDown, isZoomed, scrollableRef],
    );

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
}

export default useClickZoomPan;

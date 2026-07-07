import useThemeStyles from '@hooks/useThemeStyles';

import {isMobile} from '@libs/Browser';

import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {Polygon, Svg} from 'react-native-svg';

import type SafeTriangleProps from './types';

type Point = [number, number];

type SafeTriangleOverlayProps = {
    submenuRef: React.RefObject<View | null>;
    containerRef: React.RefObject<View | null>;
};

type Rect = {
    top: number;
    left: number;
    width: number;
    height: number;
};

/** Time in ms before the safe triangle is cleared after cursor stops moving toward submenu */
const SAFE_TRIANGLE_CLEAR_DELAY_MS = 50;

const OFFSET = 2;

function isPointInPolygon(point: Point, polygon: Point[]) {
    const [x, y] = point;
    let isInside = false;
    const length = polygon.length;
    for (let i = 0, j = length - 1; i < length; j = i++) {
        const [xi, yi] = polygon.at(i) ?? [0, 0];
        const [xj, yj] = polygon.at(j) ?? [0, 0];
        const intersect = yi >= y !== yj >= y && x <= ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}

function SafeTriangleOverlay({submenuRef, containerRef}: SafeTriangleOverlayProps) {
    const styles = useThemeStyles();

    const [points, setPoints] = useState<string | null>(null);
    const [svgRect, setSvgRect] = useState<Rect | null>(null);

    const apexRef = useRef<Point | null>(null);
    const lastCursorPosition = useRef<Point | null>(null);
    const lastCursorTime = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const getCursorSpeed = (x: number, y: number): number | null => {
        const currentTime = performance.now();
        const elapsedTime = currentTime - lastCursorTime.current;

        if (lastCursorPosition.current === null || elapsedTime === 0) {
            lastCursorPosition.current = [x, y];
            lastCursorTime.current = currentTime;
            return null;
        }

        const deltaX = x - lastCursorPosition.current[0];
        const deltaY = y - lastCursorPosition.current[1];
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = distance / elapsedTime; // px / ms

        lastCursorPosition.current = [x, y];
        lastCursorTime.current = currentTime;

        return speed;
    };

    const clearTriangle = () => {
        setPoints(null);
        setSvgRect(null);
        apexRef.current = null;
    };

    const onMouseMove = (event: MouseEvent) => {
        clearTimeout(timeoutRef.current);

        const {clientX, clientY} = event;
        const speed = getCursorSpeed(clientX, clientY);

        if (!submenuRef.current) {
            clearTriangle();
            return;
        }

        const rect = submenuRef.current.getBoundingClientRect();
        if (!rect) {
            clearTriangle();
            return;
        }

        // If speed is slow, update the apex to the current cursor position
        if (speed === null || speed < 0.1) {
            apexRef.current = [clientX, clientY];
        }

        const [x, y] = apexRef.current ?? [clientX, clientY];

        // Create a polygon from apex to the submenu's left edge
        const cursorPoint: Point = [0, y - rect.top];

        // We subtract OFFSET from x-coordinates to account for the offset in the container's left style
        const topLeftSubMenuPoint: Point = [rect.left - x - OFFSET, 0];
        const bottomLeftSubMenuPoint: Point = [rect.left - x - OFFSET, rect.bottom - rect.top];

        const polygon = [cursorPoint, topLeftSubMenuPoint, bottomLeftSubMenuPoint];

        // Check if the current mouse position is within the safe triangle
        // The polygon points are relative to [x + OFFSET, rect.top], so we adjust the mouse position accordingly
        const isSafe = isPointInPolygon([clientX - x + OFFSET, clientY - rect.top], polygon);

        if (isSafe) {
            const pointsString = polygon.map((p) => p.join(',')).join(' ');
            setPoints(pointsString);
            setSvgRect({
                top: rect.top,
                left: x + OFFSET,
                height: rect.height,
                width: rect.left - x - OFFSET,
            });
            timeoutRef.current = setTimeout(clearTriangle, SAFE_TRIANGLE_CLEAR_DELAY_MS);
        } else {
            clearTriangle();
        }
    };

    useEffect(() => {
        const container = htmlDivElementRef(containerRef).current;
        if (!container) {
            return;
        }

        container.addEventListener('mousemove', onMouseMove, true);

        return () => {
            container.removeEventListener('mousemove', onMouseMove, true);
            clearTimeout(timeoutRef.current);
        };
    }, [onMouseMove, containerRef]);

    if (!points || !svgRect) {
        return null;
    }

    return (
        <Svg
            style={[styles.pFixed, styles.cursorPointer, svgRect, {zIndex: 1000}]}
            width={svgRect.width}
            height={svgRect.height}
            onWheel={clearTriangle}
            pointerEvents="none"
        >
            <Polygon
                points={points}
                fill="transparent"
                pointerEvents="auto"
            />
        </Svg>
    );
}

/**
 * A component that creates a "safe triangle" area between the cursor and a submenu.
 * This prevents the submenu from switching when the user moves the cursor
 * diagonally towards the submenu by rendering an invisible SVG overlay.
 */
function SafeTriangle({submenuRef, children}: SafeTriangleProps) {
    const styles = useThemeStyles();
    const containerRef = useRef<View>(null);

    if (isMobile()) {
        return children;
    }

    return (
        <View
            ref={containerRef}
            style={styles.flex1}
        >
            {children}
            <SafeTriangleOverlay
                containerRef={containerRef}
                submenuRef={submenuRef}
            />
        </View>
    );
}

export default SafeTriangle;

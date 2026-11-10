/** Draws the detected receipt's edge as an outline over the camera viewfinder, gliding toward each new detection. */
import useTheme from '@hooks/useTheme';

import type {SharedValue} from 'react-native-reanimated';

import {Canvas, Group, LinearGradient, Path, Skia, vec} from '@shopify/react-native-skia';
import React from 'react';
import {StyleSheet} from 'react-native';
import {useDerivedValue, useFrameCallback, useSharedValue} from 'react-native-reanimated';

import type {DocumentEdge} from './types';

import {EDGE_POINTS_PER_SIDE} from './edgeGeometry';

// A module-level value, not the import: under Worklets Bundle Mode a worklet must not capture an import.
const POINTS_PER_SIDE = EDGE_POINTS_PER_SIDE;

const STROKE_WIDTH = 2;
const FILL_OPACITY = 0.3;

const FILL_GRADIENT_ANGLE_DEG = 164;
const FILL_GRADIENT_START = -0.1712;
const FILL_GRADIENT_END = 0.9958;

const ALPHA_CHANNEL_INDEX = 3;

// Detections arrive about every 90 ms, so a shorter glide snaps to each one and the outline moves in steps.
const GLIDE_TIME_CONSTANT_MS = 60;

const SETTLED_DISTANCE = 0.25;

const DEFAULT_FRAME_MS = 16;

const FADE_OUT_TIME_CONSTANT_MS = 50;
const FADE_IN_TIME_CONSTANT_MS = 120;

type DocumentOutlineProps = {
    /** The receipt's edge in view points, or null when no receipt is found */
    edge: SharedValue<DocumentEdge | null>;

    /** Whether the receipt is moving too fast for the outline to follow it */
    isHidden?: SharedValue<boolean>;
};

function DocumentOutline({edge, isHidden}: DocumentOutlineProps) {
    const theme = useTheme();

    const opacity = useSharedValue(1);
    const shownEdge = useSharedValue<DocumentEdge | null>(null);
    useFrameCallback((frameInfo) => {
        const target = isHidden?.get() ? 0 : 1;
        const current = opacity.get();
        if (current !== target) {
            const timeConstant = target < current ? FADE_OUT_TIME_CONSTANT_MS : FADE_IN_TIME_CONSTANT_MS;
            const progress = 1 - Math.exp(-(frameInfo.timeSincePreviousFrame ?? DEFAULT_FRAME_MS) / timeConstant);
            const next = current + (target - current) * progress;
            opacity.set(Math.abs(target - next) < 0.01 ? target : next);
        }
    });
    useFrameCallback((frameInfo) => {
        const target = edge.get();
        const current = shownEdge.get();
        if (!target || !current || current.length !== target.length) {
            if (current !== target) {
                shownEdge.set(target);
            }
            return;
        }
        if (
            target.every((point, index) => {
                const from = current.at(index) ?? point;
                return Math.hypot(point.x - from.x, point.y - from.y) < SETTLED_DISTANCE;
            })
        ) {
            return;
        }
        const progress = 1 - Math.exp(-(frameInfo.timeSincePreviousFrame ?? DEFAULT_FRAME_MS) / GLIDE_TIME_CONSTANT_MS);
        shownEdge.set(
            target.map((point, index) => {
                const from = current.at(index) ?? point;
                return {
                    x: from.x + (point.x - from.x) * progress,
                    y: from.y + (point.y - from.y) * progress,
                };
            }),
        );
    });

    const path = useDerivedValue(() => {
        const outline = Skia.Path.Make();
        const points = shownEdge.get() ?? [];
        const first = points.at(0);
        if (!first) {
            return outline;
        }
        outline.moveTo(first.x, first.y);
        if (points.length % POINTS_PER_SIDE !== 0) {
            for (let index = 1; index < points.length; index++) {
                const point = points.at(index);
                if (point) {
                    outline.lineTo(point.x, point.y);
                }
            }
            outline.close();
            return outline;
        }
        for (let side = 0; side < points.length; side += POINTS_PER_SIDE) {
            const corner = points.at(side);
            const nextCorner = points.at((side + POINTS_PER_SIDE) % points.length);
            const firstPoint = points.at(side + 1);
            if (!corner || !nextCorner || !firstPoint) {
                continue;
            }
            // Curves through the midpoints between points draw the paper's edge as one smooth line, while the straight runs
            // into and out of each corner keep the corners sharp.
            outline.lineTo((corner.x + firstPoint.x) / 2, (corner.y + firstPoint.y) / 2);
            for (let index = side + 1; index < side + POINTS_PER_SIDE; index++) {
                const point = points.at(index);
                const following = index + 1 < side + POINTS_PER_SIDE ? points.at(index + 1) : nextCorner;
                if (!point || !following) {
                    continue;
                }
                outline.quadTo(point.x, point.y, (point.x + following.x) / 2, (point.y + following.y) / 2);
            }
            outline.lineTo(nextCorner.x, nextCorner.y);
        }
        outline.close();
        return outline;
    });

    // Skia only takes stops between 0 and 1, so the CSS stops outside that range move the ends of the gradient line instead.
    const fillGradient = useDerivedValue(() => {
        const points = shownEdge.get() ?? [];
        if (points.length === 0) {
            return {start: vec(0, 0), end: vec(0, 0)};
        }
        // A loop, not map callbacks: React Compiler hoists callbacks that capture nothing out of the worklet, and the UI
        // thread can't call them.
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        for (const point of points) {
            left = Math.min(left, point.x);
            top = Math.min(top, point.y);
            right = Math.max(right, point.x);
            bottom = Math.max(bottom, point.y);
        }
        const width = right - left;
        const height = bottom - top;
        const angle = (FILL_GRADIENT_ANGLE_DEG * Math.PI) / 180;
        const directionX = Math.sin(angle);
        const directionY = -Math.cos(angle);
        const lineLength = Math.abs(width * directionX) + Math.abs(height * directionY);
        const lineStartX = left + width / 2 - (directionX * lineLength) / 2;
        const lineStartY = top + height / 2 - (directionY * lineLength) / 2;
        return {
            start: vec(lineStartX + directionX * lineLength * FILL_GRADIENT_START, lineStartY + directionY * lineLength * FILL_GRADIENT_START),
            end: vec(lineStartX + directionX * lineLength * FILL_GRADIENT_END, lineStartY + directionY * lineLength * FILL_GRADIENT_END),
        };
    });
    const fillGradientStart = useDerivedValue(() => fillGradient.get().start);
    const fillGradientEnd = useDerivedValue(() => fillGradient.get().end);

    // Skia's 'transparent' is transparent black, which turns the middle of the gradient grey.
    const transparentSuccess = Skia.Color(theme.success).map((channel, index) => (index === ALPHA_CHANNEL_INDEX ? 0 : channel));

    return (
        <Canvas
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
        >
            <Group opacity={opacity}>
                <Path
                    path={path}
                    opacity={FILL_OPACITY}
                >
                    <LinearGradient
                        start={fillGradientStart}
                        end={fillGradientEnd}
                        colors={[theme.success, transparentSuccess]}
                    />
                </Path>
                <Path
                    path={path}
                    color={theme.success}
                    // eslint-disable-next-line react/style-prop-object -- this is a valid Skia style prop value
                    style="stroke"
                    strokeWidth={STROKE_WIDTH}
                    strokeJoin="round"
                />
            </Group>
        </Canvas>
    );
}

export default DocumentOutline;

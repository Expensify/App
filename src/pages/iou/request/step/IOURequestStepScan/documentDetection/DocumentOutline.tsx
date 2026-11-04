/** Draws the detected receipt as a four-sided outline over the camera viewfinder, gliding toward each new detection. */
import useTheme from '@hooks/useTheme';

import type {SharedValue} from 'react-native-reanimated';

import {Canvas, LinearGradient, Path, Skia, vec} from '@shopify/react-native-skia';
import React from 'react';
import {StyleSheet} from 'react-native';
import {useDerivedValue, useFrameCallback, useSharedValue} from 'react-native-reanimated';

import type DocumentQuad from './types';

const STROKE_WIDTH = 2;
const FILL_OPACITY = 0.3;

const FILL_GRADIENT_ANGLE_DEG = 164;
const FILL_GRADIENT_START = -0.1712;
const FILL_GRADIENT_END = 0.9958;

const ALPHA_CHANNEL_INDEX = 3;

const GLIDE_TIME_CONSTANT_MS = 40;

const SETTLED_DISTANCE = 0.25;

const DEFAULT_FRAME_MS = 16;

type DocumentOutlineProps = {
    quad: SharedValue<DocumentQuad | null>;
};

function DocumentOutline({quad}: DocumentOutlineProps) {
    const theme = useTheme();

    const shownQuad = useSharedValue<DocumentQuad | null>(null);
    useFrameCallback((frameInfo) => {
        const target = quad.get();
        const current = shownQuad.get();
        if (!target || !current || current.length !== target.length) {
            if (current !== target) {
                shownQuad.set(target);
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
        shownQuad.set(
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
        const corners = shownQuad.get();
        const [first, ...rest] = corners ?? [];
        if (!first) {
            return outline;
        }
        outline.moveTo(first.x, first.y);
        for (const corner of rest) {
            outline.lineTo(corner.x, corner.y);
        }
        outline.close();
        return outline;
    });

    // Skia only takes stops between 0 and 1, so the CSS stops outside that range move the ends of the gradient line instead.
    const fillGradient = useDerivedValue(() => {
        const corners = shownQuad.get() ?? [];
        if (corners.length === 0) {
            return {start: vec(0, 0), end: vec(0, 0)};
        }
        // A loop, not map callbacks: React Compiler hoists callbacks that capture nothing out of the worklet, and the UI
        // thread can't call them.
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        for (const point of corners) {
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
        </Canvas>
    );
}

export default DocumentOutline;

/**
 * Measures the vertical space available to a right-hand-panel text input and reports it to the child so the input can auto-grow while keeping submit controls visible.
 */
import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getKeyboardHeight from '@libs/getKeyboardHeight';

import variables from '@styles/variables';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {useLayoutEffect, useRef, useState} from 'react';
import {Platform, View} from 'react-native';

import ScrollView from './ScrollView';

type AutoGrowHeightInputContainerProps = {
    /** Render prop that receives the measured maximum height available to the auto-growing input. */
    children: (maxAutoGrowHeight: number) => ReactNode;

    /** Overrides how the inner content height is measured. */
    measureContent?: (content: View | null, callback: (contentHeight: number) => void) => void;

    /** Style applied to the outer scroll container. */
    style?: StyleProp<ViewStyle>;
};

type MeasurementPhase = 'normal' | 'clamp' | 'probe';
type PendingNativeLayout = {
    baseHeight: number;
    layoutHeight: number;
};

function areHeightsEqual(firstHeight: number, secondHeight: number) {
    return Math.abs(firstHeight - secondHeight) < 1;
}

function defaultMeasureContent(content: View | null, callback: (contentHeight: number) => void) {
    content?.measure((_x, _y, _width, contentHeight) => callback(contentHeight));
}

function AutoGrowHeightInputContainer({children, measureContent = defaultMeasureContent, style}: AutoGrowHeightInputContainerProps) {
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const {isKeyboardActive, isKeyboardShown, isKeyboardAnimatingRef, keyboardActiveHeight, keyboardHeight} = useKeyboardState();
    const {bottom} = useSafeAreaInsets();
    const isNativePlatform = Platform.OS !== 'web';
    const nativeKeyboardHeight =
        isNativePlatform && (isKeyboardActive || isKeyboardShown) ? Math.max(keyboardActiveHeight > 0 ? getKeyboardHeight(keyboardActiveHeight, bottom) : keyboardHeight, 0) : 0;
    const availableHeightRef = useRef<number>(variables.textInputAutoGrowMaxHeight);
    const viewportHeightRef = useRef(windowHeight);
    const keyboardHeightRef = useRef(nativeKeyboardHeight);
    const lastExactContainerHeightRef = useRef<number | null>(null);
    const pendingNativeLayoutRef = useRef<PendingNativeLayout | null>(null);
    const nativeKeyboardFallbackRef = useRef(false);
    const contentRef = useRef<View>(null);
    const contentLayoutRef = useRef({width: 0, height: 0});
    const containerWidthRef = useRef(0);
    const measurementGenerationRef = useRef(0);
    const measurementPhaseRef = useRef<MeasurementPhase>('normal');
    const maxAutoGrowHeightRef = useRef<number>(variables.textInputAutoGrowMaxHeight);
    const [measurementPhase, setMeasurementPhase] = useState<MeasurementPhase>('normal');
    const [measurementRequestVersion, setMeasurementRequestVersion] = useState(0);
    const [maxAutoGrowHeight, setMaxAutoGrowHeight] = useState<number>(variables.textInputAutoGrowMaxHeight);

    const startMeasurement = (phase: Exclude<MeasurementPhase, 'normal'>, nextMaxAutoGrowHeight: number, shouldReplaceActiveMeasurement = false) => {
        if (!shouldReplaceActiveMeasurement && measurementPhaseRef.current === phase && maxAutoGrowHeightRef.current === nextMaxAutoGrowHeight) {
            return;
        }

        measurementGenerationRef.current += 1;
        measurementPhaseRef.current = phase;
        maxAutoGrowHeightRef.current = nextMaxAutoGrowHeight;
        setMeasurementPhase(phase);
        setMeasurementRequestVersion((currentVersion) => currentVersion + 1);
        setMaxAutoGrowHeight(nextMaxAutoGrowHeight);
    };

    useLayoutEffect(() => {
        const previousViewportHeight = viewportHeightRef.current;
        if (isNativePlatform || windowHeight === previousViewportHeight) {
            return;
        }

        viewportHeightRef.current = windowHeight;
        const availableHeight = Math.max(availableHeightRef.current + windowHeight - previousViewportHeight, variables.componentSizeLarge);
        availableHeightRef.current = availableHeight;
        startMeasurement('clamp', availableHeight);
    }, [isNativePlatform, startMeasurement, windowHeight]);

    useLayoutEffect(() => {
        const previousKeyboardHeight = keyboardHeightRef.current;
        if (nativeKeyboardHeight === previousKeyboardHeight) {
            return;
        }

        const keyboardHeightDelta = nativeKeyboardHeight - previousKeyboardHeight;
        // A native layout can arrive before the keyboard context update. Do not apply the same transition twice when that exact layout already accounts for it.
        const pendingNativeLayout = pendingNativeLayoutRef.current;
        const expectedLayoutHeight = pendingNativeLayout ? Math.max(pendingNativeLayout.baseHeight - keyboardHeightDelta, variables.componentSizeLarge) : 0;
        const didExactLayoutAccountForKeyboard = !!pendingNativeLayout && areHeightsEqual(pendingNativeLayout.layoutHeight, expectedLayoutHeight);
        keyboardHeightRef.current = nativeKeyboardHeight;
        pendingNativeLayoutRef.current = null;
        nativeKeyboardFallbackRef.current = !didExactLayoutAccountForKeyboard;
        const availableHeight = didExactLayoutAccountForKeyboard ? availableHeightRef.current : Math.max(availableHeightRef.current - keyboardHeightDelta, variables.componentSizeLarge);
        availableHeightRef.current = availableHeight;
        startMeasurement('clamp', availableHeight);
    }, [nativeKeyboardHeight, startMeasurement]);

    useLayoutEffect(() => {
        if (measurementPhase === 'normal') {
            return;
        }

        const measurementGeneration = measurementGenerationRef.current;
        let isCancelled = false;
        measureContent(contentRef.current, (contentHeight) => {
            if (isCancelled || measurementGeneration !== measurementGenerationRef.current) {
                return;
            }

            const availableHeight = availableHeightRef.current;
            if (measurementPhase === 'clamp') {
                if (contentHeight > availableHeight && maxAutoGrowHeight > variables.componentSizeLarge) {
                    startMeasurement('probe', variables.componentSizeLarge);
                    return;
                }
                measurementPhaseRef.current = 'normal';
                setMeasurementPhase('normal');
                return;
            }

            const reservedContentHeight = Math.max(0, contentHeight - variables.componentSizeLarge);
            measurementPhaseRef.current = 'normal';
            maxAutoGrowHeightRef.current = Math.max(availableHeight - reservedContentHeight, variables.componentSizeLarge);
            setMeasurementPhase('normal');
            setMaxAutoGrowHeight(maxAutoGrowHeightRef.current);
        });

        return () => {
            isCancelled = true;
        };
    }, [maxAutoGrowHeight, measureContent, measurementPhase, measurementRequestVersion, startMeasurement]);

    return (
        <ScrollView
            style={[styles.flex1, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            onLayout={(event) => {
                const {height, width} = event.nativeEvent.layout;
                const availableHeight = Math.max(height, variables.componentSizeLarge);
                const didWidthChange = width !== containerWidthRef.current;
                const previousAvailableHeight = availableHeightRef.current;
                const isKeyboardTransitioning = isKeyboardAnimatingRef.current;
                containerWidthRef.current = width;

                if (isNativePlatform) {
                    if (isKeyboardShown && !isKeyboardActive) {
                        // On iOS, keyboardWillHide clears the active height before the view finishes animating back to its expanded allocation.
                        // Ignore those intermediate layouts until keyboardDidHide so they cannot become the next keyboard-open baseline.
                        viewportHeightRef.current = windowHeight;
                        startMeasurement('clamp', previousAvailableHeight, didWidthChange);
                        return;
                    }

                    // The exact parent allocation wins immediately. Keep a changed layout pending so a later keyboard signal can reconcile it with the old allocation.
                    const lastExactContainerHeight = lastExactContainerHeightRef.current;
                    if (lastExactContainerHeight === null) {
                        lastExactContainerHeightRef.current = availableHeight;
                        pendingNativeLayoutRef.current = null;
                        nativeKeyboardFallbackRef.current = false;
                    } else if (nativeKeyboardFallbackRef.current && areHeightsEqual(availableHeight, previousAvailableHeight)) {
                        lastExactContainerHeightRef.current = availableHeight;
                        pendingNativeLayoutRef.current = null;
                        nativeKeyboardFallbackRef.current = false;
                    } else if (nativeKeyboardFallbackRef.current && !didWidthChange) {
                        // Native can emit stale and intermediate allocations throughout the keyboard animation.
                        // Keep the keyboard-derived slot until onLayout reaches that exact allocation instead of adopting an animation frame as the next baseline.
                        viewportHeightRef.current = windowHeight;
                        startMeasurement('clamp', previousAvailableHeight, didWidthChange);
                        return;
                    } else if (pendingNativeLayoutRef.current) {
                        if (!areHeightsEqual(availableHeight, previousAvailableHeight)) {
                            pendingNativeLayoutRef.current.baseHeight = previousAvailableHeight;
                        }
                        pendingNativeLayoutRef.current.layoutHeight = availableHeight;
                        lastExactContainerHeightRef.current = availableHeight;
                    } else if (!isKeyboardTransitioning && !areHeightsEqual(availableHeight, lastExactContainerHeight)) {
                        // A settled layout change is the new exact baseline, but it must not be treated as a pending keyboard transition.
                        lastExactContainerHeightRef.current = availableHeight;
                    } else if (
                        // Only associate a layout delta with the pending keyboard reconciliation while the native keyboard is animating. Settled layout changes such as rotation or an optional approver section must not become a future keyboard baseline.
                        isKeyboardTransitioning &&
                        (!areHeightsEqual(availableHeight, lastExactContainerHeight) || (nativeKeyboardFallbackRef.current && !areHeightsEqual(availableHeight, previousAvailableHeight)))
                    ) {
                        pendingNativeLayoutRef.current = {
                            baseHeight: previousAvailableHeight,
                            layoutHeight: availableHeight,
                        };
                        nativeKeyboardFallbackRef.current = false;
                        lastExactContainerHeightRef.current = availableHeight;
                    }
                }

                availableHeightRef.current = availableHeight;
                viewportHeightRef.current = windowHeight;
                startMeasurement('clamp', availableHeight, didWidthChange);
            }}
        >
            <View
                ref={contentRef}
                onLayout={(event) => {
                    const {height: contentHeight, width: contentWidth} = event.nativeEvent.layout;
                    const didContentLayoutChange = contentWidth !== contentLayoutRef.current.width || contentHeight !== contentLayoutRef.current.height;
                    contentLayoutRef.current = {
                        width: contentWidth,
                        height: contentHeight,
                    };
                    const availableHeight = availableHeightRef.current;
                    const activeMeasurementPhase = measurementPhaseRef.current;
                    const activeMaxAutoGrowHeight = maxAutoGrowHeightRef.current;
                    if (activeMeasurementPhase !== 'normal') {
                        if (didContentLayoutChange) {
                            startMeasurement(activeMeasurementPhase, activeMaxAutoGrowHeight, true);
                        }
                        return;
                    }

                    if (contentHeight > availableHeight) {
                        startMeasurement('probe', variables.componentSizeLarge);
                    } else if (contentHeight < availableHeight && activeMaxAutoGrowHeight < availableHeight) {
                        startMeasurement('clamp', availableHeight);
                    }
                }}
            >
                {children(maxAutoGrowHeight)}
            </View>
        </ScrollView>
    );
}

export default AutoGrowHeightInputContainer;

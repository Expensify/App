/**
 * Measures the vertical space available to a right-hand-panel text input and reports it to the child so the input can auto-grow while keeping submit controls visible.
 */
import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';

import captureInputScrolledToEnd from '@libs/captureInputScrolledToEnd';
import getKeyboardHeight from '@libs/getKeyboardHeight';
import measureAutoGrowContent from '@libs/measureAutoGrowContent';
import measureAutoGrowSlot from '@libs/measureAutoGrowSlot';

import variables from '@styles/variables';

import type {ComponentRef, ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {useLayoutEffect, useRef, useState} from 'react';
import {Platform, View} from 'react-native';

import ScrollView from './ScrollView';

type AutoGrowHeightInputContainerProps = {
    /** Render prop that receives the measured maximum height available to the auto-growing input. */
    children: (maxAutoGrowHeight: number) => ReactNode;

    /** Style applied to the outer scroll container. */
    style?: StyleProp<ViewStyle>;

    /** Preserves a one-line web input slot inside a constrained form when the viewport is very short. */
    shouldKeepMinimumHeight?: boolean;

    /** Uses web viewport deltas when a panel's resized allocation has not emitted onLayout yet. Disable for fixed-height popovers. */
    shouldUseWebViewportHeightFallback?: boolean;
};

type MeasurementPhase = 'normal' | 'clamp' | 'probe';
type PendingNativeLayout = {
    baseHeight: number;
    layoutHeight: number;
};

function areHeightsEqual(firstHeight: number, secondHeight: number) {
    return Math.abs(firstHeight - secondHeight) < 1;
}

function AutoGrowHeightInputContainer({children, style, shouldKeepMinimumHeight = false, shouldUseWebViewportHeightFallback = true}: AutoGrowHeightInputContainerProps) {
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const {isKeyboardActive, isKeyboardShown, isKeyboardAnimatingRef, keyboardActiveHeight, keyboardHeight} = useKeyboardState();
    const {bottom} = useSafeAreaInsets();
    const isNativePlatform = Platform.OS !== 'web';
    // Android resizes the screen for the keyboard, so its exact layout already includes the keyboard. Subtracting it again would double-count it when the layout arrives first.
    const isIOS = Platform.OS === 'ios';
    // The form already reserves the bottom safe area, and the keyboard covers it, so the slot only loses the part of the keyboard above that area.
    // Subtracting the full keyboard left the slot that much shorter while the keyboard opened, and that much taller while it closed, until keyboardDidShow or keyboardDidHide measured it.
    const nativeKeyboardHeight =
        isIOS && (isKeyboardActive || isKeyboardShown) ? Math.max((keyboardActiveHeight > 0 ? getKeyboardHeight(keyboardActiveHeight, bottom) : keyboardHeight) - bottom, 0) : 0;
    const availableHeightRef = useRef<number>(variables.textInputAutoGrowMaxHeight);
    const viewportHeightRef = useRef(windowHeight);
    const keyboardHeightRef = useRef(nativeKeyboardHeight);
    const lastExactContainerHeightRef = useRef<number | null>(null);
    const containerRef = useRef<ComponentRef<typeof ScrollView>>(null);
    const keyboardBaselineHeightRef = useRef<number | null>(null);
    const settledKeyboardHeightRef = useRef(keyboardHeight);
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
    const restoreInputScrollRef = useRef<(() => void) | undefined>(undefined);
    const hasMeasuredInitialSlotRef = useRef(false);

    const startMeasurement = (phase: Exclude<MeasurementPhase, 'normal'>, nextMaxAutoGrowHeight: number, shouldReplaceActiveMeasurement = false) => {
        if (!shouldReplaceActiveMeasurement && measurementPhaseRef.current === phase && maxAutoGrowHeightRef.current === nextMaxAutoGrowHeight) {
            return;
        }

        if (!restoreInputScrollRef.current) {
            restoreInputScrollRef.current = captureInputScrolledToEnd(contentRef.current);
        }
        measurementGenerationRef.current += 1;
        measurementPhaseRef.current = phase;
        maxAutoGrowHeightRef.current = nextMaxAutoGrowHeight;
        setMeasurementPhase(phase);
        setMeasurementRequestVersion((currentVersion) => currentVersion + 1);
        setMaxAutoGrowHeight(nextMaxAutoGrowHeight);
    };

    // On web the first onLayout arrives after paint, so a long value painted at the default cap first and then jumped to the slot height.
    // The slot is already laid out here, so measure it before the first paint.
    useLayoutEffect(() => {
        if (isNativePlatform || hasMeasuredInitialSlotRef.current) {
            return;
        }

        hasMeasuredInitialSlotRef.current = true;
        measureAutoGrowSlot(containerRef.current?.getNativeScrollRef() ?? null, (slotHeight) => {
            const availableHeight = Math.max(slotHeight, variables.componentSizeLarge);
            availableHeightRef.current = availableHeight;
            startMeasurement('clamp', availableHeight);
        });
    }, [isNativePlatform, startMeasurement]);

    // A cap change can move the focused input away from the end of its text, so scroll it back once the new cap is applied.
    useLayoutEffect(() => {
        restoreInputScrollRef.current?.();
        if (measurementPhase !== 'normal') {
            return;
        }
        restoreInputScrollRef.current = undefined;
    }, [maxAutoGrowHeight, measurementPhase]);

    useLayoutEffect(() => {
        const previousViewportHeight = viewportHeightRef.current;
        if (isNativePlatform || !shouldUseWebViewportHeightFallback || windowHeight === previousViewportHeight) {
            return;
        }

        viewportHeightRef.current = windowHeight;
        const availableHeight = Math.max(availableHeightRef.current + windowHeight - previousViewportHeight, variables.componentSizeLarge);
        availableHeightRef.current = availableHeight;
        startMeasurement('clamp', availableHeight);
    }, [isNativePlatform, shouldUseWebViewportHeightFallback, startMeasurement, windowHeight]);

    useLayoutEffect(() => {
        const previousKeyboardHeight = keyboardHeightRef.current;
        if (nativeKeyboardHeight === previousKeyboardHeight) {
            return;
        }

        const keyboardHeightDelta = nativeKeyboardHeight - previousKeyboardHeight;
        keyboardBaselineHeightRef.current = availableHeightRef.current;
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

    // The keyboard-derived slot rarely matches the real allocation, because the form already reserves the bottom safe area that the keyboard covers.
    // While it differs, layouts during the animation are ignored, and none arrives after it ends, so the cap would stay wrong.
    // keyboardHeight changes only on keyboardDidShow and keyboardDidHide, once the keyboard has settled, so measure the real slot then.
    useLayoutEffect(() => {
        if (!isIOS || keyboardHeight === settledKeyboardHeightRef.current) {
            return;
        }

        settledKeyboardHeightRef.current = keyboardHeight;
        let isCancelled = false;
        containerRef.current?.getNativeScrollRef()?.measure((_x, _y, _width, measuredHeight) => {
            if (isCancelled) {
                return;
            }

            const settledHeight = Math.max(measuredHeight, variables.componentSizeLarge);
            const baselineHeight = keyboardBaselineHeightRef.current;
            // A slot that did not move is not resized by the keyboard, so the keyboard estimate stays the only way to keep the input above it.
            if (keyboardHeight !== settledKeyboardHeightRef.current || baselineHeight === null || areHeightsEqual(settledHeight, baselineHeight)) {
                return;
            }

            pendingNativeLayoutRef.current = null;
            nativeKeyboardFallbackRef.current = false;
            lastExactContainerHeightRef.current = settledHeight;
            if (areHeightsEqual(settledHeight, availableHeightRef.current)) {
                return;
            }

            availableHeightRef.current = settledHeight;
            startMeasurement('clamp', settledHeight);
        });

        return () => {
            isCancelled = true;
        };
    }, [isIOS, keyboardHeight, startMeasurement]);

    useLayoutEffect(() => {
        if (measurementPhase === 'normal') {
            return;
        }

        const measurementGeneration = measurementGenerationRef.current;
        let isCancelled = false;
        measureAutoGrowContent(contentRef.current, (contentHeight) => {
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
    }, [maxAutoGrowHeight, measurementPhase, measurementRequestVersion, startMeasurement]);

    return (
        <ScrollView
            ref={containerRef}
            style={[StyleUtils.getAutoGrowHeightInputContainerStyles(shouldKeepMinimumHeight), style]}
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

                if (isIOS) {
                    if (isKeyboardShown && !isKeyboardActive && lastExactContainerHeightRef.current !== null) {
                        // On iOS, keyboardWillHide clears the active height before the view finishes animating back to its expanded allocation.
                        // Ignore those intermediate layouts until keyboardDidHide so they cannot become the next keyboard-open baseline.
                        // A page that opens while the previous page's keyboard is hiding has no other layout yet, and an autofocused input can bring the
                        // keyboard back before keyboardDidHide, so nothing would measure the slot again. Its first layout is used instead.
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
                // Native can re-emit an unchanged allocation after the cap settles, as seen on Android. Restarting the clamp would regrow the input and flicker in a clamp and probe loop.
                if (isNativePlatform && !didWidthChange && areHeightsEqual(availableHeight, previousAvailableHeight)) {
                    return;
                }
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

                    // The settled cap can round a fraction of a pixel away from the allocation. Treating that as a change would measure forever.
                    if (areHeightsEqual(contentHeight, availableHeight)) {
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

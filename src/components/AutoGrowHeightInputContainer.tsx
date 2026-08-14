import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import ScrollView from './ScrollView';

type AutoGrowHeightInputContainerProps = {
    children: (maxAutoGrowHeight: number) => ReactNode;
    measureContent?: (content: View | null, callback: (contentHeight: number) => void) => void;
    style?: StyleProp<ViewStyle>;
};

type MeasurementPhase = 'normal' | 'clamp' | 'probe';

function defaultMeasureContent(content: View | null, callback: (contentHeight: number) => void) {
    content?.measure((_x, _y, _width, contentHeight) => callback(contentHeight));
}

function AutoGrowHeightInputContainer({children, measureContent = defaultMeasureContent, style}: AutoGrowHeightInputContainerProps) {
    const styles = useThemeStyles();
    const availableHeightRef = useRef(variables.textInputAutoGrowMaxHeight);
    const contentRef = useRef<View>(null);
    const contentLayoutRef = useRef({width: 0, height: 0});
    const containerWidthRef = useRef(0);
    const measurementGenerationRef = useRef(0);
    const measurementPhaseRef = useRef<MeasurementPhase>('normal');
    const maxAutoGrowHeightRef = useRef(variables.textInputAutoGrowMaxHeight);
    const [measurementPhase, setMeasurementPhase] = useState<MeasurementPhase>('normal');
    const [measurementRequestVersion, setMeasurementRequestVersion] = useState(0);
    const [maxAutoGrowHeight, setMaxAutoGrowHeight] = useState(variables.textInputAutoGrowMaxHeight);

    const startMeasurement = useCallback((phase: Exclude<MeasurementPhase, 'normal'>, nextMaxAutoGrowHeight: number, shouldReplaceActiveMeasurement = false) => {
        if (!shouldReplaceActiveMeasurement && measurementPhaseRef.current === phase && maxAutoGrowHeightRef.current === nextMaxAutoGrowHeight) {
            return;
        }

        measurementGenerationRef.current += 1;
        measurementPhaseRef.current = phase;
        maxAutoGrowHeightRef.current = nextMaxAutoGrowHeight;
        setMeasurementPhase(phase);
        setMeasurementRequestVersion((currentVersion) => currentVersion + 1);
        setMaxAutoGrowHeight(nextMaxAutoGrowHeight);
    }, []);

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
                containerWidthRef.current = width;
                availableHeightRef.current = availableHeight;
                startMeasurement('clamp', availableHeight, didWidthChange);
            }}
        >
            <View
                ref={contentRef}
                onLayout={(event) => {
                    const {height: contentHeight, width: contentWidth} = event.nativeEvent.layout;
                    const didContentLayoutChange = contentWidth !== contentLayoutRef.current.width || contentHeight !== contentLayoutRef.current.height;
                    contentLayoutRef.current = {width: contentWidth, height: contentHeight};
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

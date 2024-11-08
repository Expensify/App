import React, {useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import type {ModalProps} from 'react-native-modal';
import Animated, {Easing, useAnimatedRef, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import type {ThemeStyles} from '@src/styles';

type ContainerProps = Partial<ModalProps> & {
    isVisible: boolean;
    isContainerOpen: boolean;
    isTransitioning: boolean;
    isHeightCalculated: boolean;
    toggleCalculatedHeight: (value: boolean) => void;
    deviceHeight?: number | undefined | null;
    style?: ThemeStyles;
    onLayout?: (event: LayoutChangeEvent) => void;
    testName: string;
};

function Container({isVisible, isContainerOpen, isTransitioning, isHeightCalculated, toggleCalculatedHeight, style, onLayout, testName, ...props}: ContainerProps) {
    const animatedRef = useAnimatedRef();
    const [measuredHeight, setMH] = useState<number>(0);

    const translateY = useSharedValue(500);

    useEffect(() => {
        if (!isTransitioning) {
            return;
        }
        // console.log(testName, ' Container: isVisible & translateY', isVisible, isVisible ? 0 : 500);
        // eslint-disable-next-line react-compiler/react-compiler
        translateY.value = withDelay(0, withTiming(isVisible ? 0 : 500, {duration: 300, easing: Easing.inOut(Easing.ease)}));
        setMH(0);
    }, [isVisible, isTransitioning, translateY]);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{translateY: translateY.value}],
            opacity: !isHeightCalculated || (isVisible !== isContainerOpen && !isTransitioning) ? 0 : 1,
        };
    });
    return (
        <Animated.View
            ref={animatedRef}
            style={[style, animatedStyles]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <Animated.View
                // TODO: check this 100%
                style={{width: '100%'}}
                onLayout={(event) => {
                    const {height} = event.nativeEvent.layout;

                    // Early return if conditions are not met
                    if (measuredHeight || !height || measuredHeight === height) {
                        return;
                    }

                    setMH(height);
                    toggleCalculatedHeight(true);
                }}
            >
                {props.children}
            </Animated.View>
        </Animated.View>
    );
}

export default Container;

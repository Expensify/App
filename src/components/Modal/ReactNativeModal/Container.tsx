import React, {useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import Animated, {Easing, SlideInDown, useAnimatedRef, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';

type ContainerProps = Partial<ModalProps> & {
    isVisible: boolean;
    isContainerOpen: boolean;
    isTransitioning: boolean;
    isHeightCalculated: boolean;
    toggleCalculatedHeight: (value: boolean) => void;
    deviceHeight?: number | undefined | null;
    style?: any;
    onLayout?: (event: LayoutChangeEvent) => void;
    setMeasuredHeight: (value: number) => void;
};

function Container({isVisible, isContainerOpen, isTransitioning, isHeightCalculated, toggleCalculatedHeight, style, onLayout, setMeasuredHeight, testName, ...props}: ContainerProps) {
    const styles = useThemeStyles();
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
    }, [isVisible, isTransitioning]);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{translateY: translateY.value}],
            opacity: !isHeightCalculated || (isVisible !== isContainerOpen && !isTransitioning) ? 0 : 1,
        };
    });

    console.log('props: ', Object.keys(props).join('-'));
    return (
        <Animated.View
            ref={animatedRef}
            style={[style, animatedStyles]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            {...props.panHandlers}
        >
            <Animated.View
                // TODO: check this 100%
                style={{width: '100%'}}
                onLayout={(event) => {
                    if (!measuredHeight && event.nativeEvent.layout.height && measuredHeight !== event.nativeEvent.layout.height) {
                        // translateY.value = 500;
                        setMH(event.nativeEvent.layout.height);
                        setMeasuredHeight(event.nativeEvent.layout.height);
                        toggleCalculatedHeight(true);
                    }
                }}
            >
                {props.children}
            </Animated.View>
        </Animated.View>
    );
}

export default Container;

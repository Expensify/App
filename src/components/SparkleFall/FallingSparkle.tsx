import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import Animated, {SensorType, useAnimatedSensor, useAnimatedStyle, useFrameCallback, useSharedValue} from 'react-native-reanimated';
import Icon from '@components/Icon';
import {Sparkles} from '@components/Icon/Expensicons';
import { Dimensions } from 'react-native';

export interface FallingSparkleData {
    id: number;
    initialPosition: {
        x: number;
        y: number;
    };
    initialVelocity: {
        x: number;
        y: number;
    };
    color: string;
    delay: number;
}

export interface FallingSparkleRef {
    startAnimation: () => void;
}

export interface FallingSparkleProps extends FallingSparkleData {
    ref: React.RefObject<FallingSparkleRef | null>;
}

const GRAVITY = 30;
const SPEED = 100;

function FallingSparkle({initialPosition, initialVelocity, color, delay, ref}: FallingSparkleProps) {
    const {height: screenHeight} = Dimensions.get('window');
    const [isOffscreen, setIsOffscreen] = useState(false);

    const translateX = useSharedValue<number>(initialPosition.x);
    const translateY = useSharedValue<number>(initialPosition.y);
    
    const gravity = useAnimatedSensor(SensorType.GRAVITY);
    const frameCallback = useFrameCallback(({timeSincePreviousFrame, timeSinceFirstFrame}) => {
        const deviceGravity = gravity.sensor.get();
        const time = timeSinceFirstFrame / SPEED;

        translateY.set(initialPosition.y + initialVelocity.y * time + (1 / 2) * GRAVITY * time ** 2);
        translateX.set(translateX.get() + initialVelocity.x * time);
        if (translateY.get() > screenHeight) {
            setIsOffscreen(true);
        }
    }, false);

    // stop the animation when the sparkle is off the screen
    // uses a state flag and an effect because `frameCallback` can't be referenced inside itself
    useEffect(() => {
        if (frameCallback.isActive && isOffscreen) {
            frameCallback.setActive(false);
            translateY.set(initialPosition.y);
            translateX.set(initialPosition.x);
        }
    }, [frameCallback, isOffscreen]);

    const startAnimation = useCallback(() => {
        setTimeout(() => {
            frameCallback.setActive(true);
        }, delay);
    }, [initialPosition]);

    useImperativeHandle(ref, () => ({
        startAnimation,
    }));

    const style = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.get()}, {translateY: translateY.get()}],
    }));

    return (
        <Animated.View style={[style, {position: 'absolute', zIndex: 1000}]}>
            {(
                <Icon
                    fill={color}
                    src={Sparkles}
                    large
                />
            )}
        </Animated.View>
    );
}

export default FallingSparkle;

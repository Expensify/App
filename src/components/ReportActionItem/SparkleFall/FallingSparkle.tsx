import React, {useEffect, useRef, useState} from 'react';
import Animated, {SensorType, useAnimatedSensor, useAnimatedStyle, useFrameCallback, useSharedValue} from 'react-native-reanimated';
import Icon from '@components/Icon';
import {Star} from '@components/Icon/Expensicons';

export interface FallingSparkleProps {
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

const GRAVITY = 30;
const SPEED = 100;

function FallingSparkle({initialPosition, initialVelocity, color, delay, id}: FallingSparkleProps) {
    const [isActive, setIsActive] = useState(false);
    const gravity = useAnimatedSensor(SensorType.GRAVITY);

    const translateX = useSharedValue<number>(initialPosition.x);
    const translateY = useSharedValue<number>(initialPosition.y);

    const logRef = useRef(0);
    const frameCallback = useFrameCallback(({timeSincePreviousFrame, timeSinceFirstFrame}) => {
        const deviceGravity = gravity.sensor.get();
        const time = timeSinceFirstFrame / SPEED;

        translateY.set(initialPosition.y + initialVelocity.y * time + (1 / 2) * GRAVITY * time ** 2);
        translateX.set(translateX.get() + initialVelocity.x * time);
    }, false);

    useEffect(() => {
        setTimeout(() => {
            frameCallback.setActive(true);
            setIsActive(true);
            setTimeout(() => {
                frameCallback.setActive(false);
            }, 5000);
        }, delay);
    }, [initialPosition]);

    const style = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.get()}, {translateY: translateY.get()}],
    }));

    return (
        <Animated.View style={[style, {position: 'absolute'}]}>
            {isActive && (
                <Icon
                    fill={color}
                    src={Star}
                    small
                />
            )}
        </Animated.View>
    );
}

export default FallingSparkle;

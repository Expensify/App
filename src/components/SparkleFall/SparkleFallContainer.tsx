import React, {useCallback, useEffect, useImperativeHandle, useMemo, useState} from 'react';
import {Dimensions, View} from 'react-native';
import colors from '@styles/theme/colors';
import FallingSparkle, {FallingSparkleRef} from './FallingSparkle';

const VX_SPREAD = 3;
const VY_SPREAD = 50;
const DELAY_SPREAD = 500;
const DELAY_MULTIPLIER = 0.1;
const X0_SPREAD = 0;
const SCREEN_HEIGHT_DENOMINATOR = 4;
const SPARKLE_COUNT = 70;

const createSparkles = (count: number) => {
    const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

    return Array.from({length: count}, (_, index) => ({
        id: index,
        initialPosition: {x: screenWidth / 2 + (Math.random() * X0_SPREAD - X0_SPREAD / 2), y: screenHeight},
        initialVelocity: {
            x: Math.random() * VX_SPREAD - VX_SPREAD / 2,
            y: -(screenHeight / SCREEN_HEIGHT_DENOMINATOR) + Math.random() * VY_SPREAD - VY_SPREAD / 2,
        },
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: index * DELAY_MULTIPLIER + (-DELAY_SPREAD / 2 + Math.random() * DELAY_SPREAD),
        ref: React.createRef<FallingSparkleRef>(),
    }));
};

const COLORS = [colors.pink300, colors.pink400, colors.pink500]

function SparkleFallContainer({ ref }: { ref: React.RefObject<FallingSparkleRef | null> }) {
    const sparkles = useMemo(() => createSparkles(SPARKLE_COUNT), []);

    const onStart = useCallback(() => {
        console.log('onStart');
        sparkles.forEach((sparkle) => {
            sparkle.ref?.current?.startAnimation();
        });
    }, []);

    useEffect(() => {
        // @ts-ignore
        window.sparkle = () => onStart();
    }, []);

    useImperativeHandle(ref, () => ({
        startAnimation: onStart,
    }));

    return (
        // position is 100px down from top so that the sparkles start off the screen
        <View style={{position: 'absolute', top: 100, left: 0}}>
            {sparkles.map((sparkle) => (
                <FallingSparkle
                    ref={sparkle.ref}
                    delay={sparkle.delay}
                    key={`${sparkle.id}`}
                    id={sparkle.id}
                    initialPosition={sparkle.initialPosition}
                    initialVelocity={sparkle.initialVelocity}
                    color={sparkle.color}
                />
            ))}
        </View>
    );
}

export default SparkleFallContainer;

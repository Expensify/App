import React, {useCallback, useMemo, useState} from 'react';
import {Dimensions, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import Button from '@components/Button';
import colors from '@styles/theme/colors';
import FallingSparkle, {FallingSparkleProps} from './FallingSparkle';

interface SparkleFallContainerProps {}

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
    }));
};

const COLORS = [colors.pink300, colors.pink400, colors.pink500]

function SparkleFallContainer({}: SparkleFallContainerProps) {
    const [sparkles, setSparkles] = useState<FallingSparkleProps[]>([]);
    const [animKey, setAnimKey] = useState(0);

    const onStart = useCallback(() => {
        setAnimKey((prev) => prev + 1);
        setSparkles(createSparkles(SPARKLE_COUNT));
    }, []);

    return (
        <View style={{position: 'absolute', top: 100, left: 0}}>
            <Button
                success
                onPress={onStart}
            >
                <Text>Celebrate!</Text>
            </Button>
            {sparkles.map((sparkle) => (
                <FallingSparkle
                    delay={sparkle.delay}
                    key={`${sparkle.id}-${animKey}`}
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

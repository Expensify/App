import React, {useCallback, useImperativeHandle, useState} from 'react';
import type {Ref} from 'react';
import {Dimensions, View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import colors from '@styles/theme/colors';
import ConfettiParticle from './ConfettiParticle';
import type {ConfettiParticleData} from './ConfettiParticle';

type ParticleWithKeyId = ConfettiParticleData & {id: number};

type ConfettiCannonHandle = {
    trigger: () => void;
};

// Range of randomized initial velocities, centered around 0 (so 50 is [-25, 25])
const VX_SPREAD = 80;
const VY_SPREAD = 50;

// Delay parameters so the particles don't all shoot up at once
const DELAY_SPREAD = 500;
const DELAY_MULTIPLIER = 0.2;

// Base initial Y velocity is a function of screen height; this magic number controls that ratio
const SCREEN_HEIGHT_DENOMINATOR = 4.5;

const PARTICLE_COUNT = 60;
const COLORS = [colors.ice300, colors.ice400, colors.ice500];

const createSparkles = (count: number): ParticleWithKeyId[] => {
    const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

    return Array.from({length: count}, (_, index) => ({
        id: index,
        initialPosition: {x: screenWidth / 2, y: screenHeight},
        initialVelocity: {
            x: Math.random() * VX_SPREAD - VX_SPREAD / 2,
            y: -(screenHeight / SCREEN_HEIGHT_DENOMINATOR) + Math.random() * VY_SPREAD - VY_SPREAD / 2,
        },
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: index * DELAY_MULTIPLIER + (-DELAY_SPREAD / 2 + Math.random() * DELAY_SPREAD),
    }));
};

type ConfettiCannonContainerProps = {
    ref?: Ref<ConfettiCannonHandle>;
};

function ConfettiCannonContainer({ref}: ConfettiCannonContainerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);
    const [sparkles, setSparkles] = useState<ParticleWithKeyId[]>([]);
    const [animKey, setAnimKey] = useState(0);

    const trigger = useCallback(() => {
        setAnimKey((prev) => prev + 1);
        setSparkles(createSparkles(PARTICLE_COUNT));
    }, []);

    useImperativeHandle(ref, () => ({trigger}), [trigger]);

    return (
        <View
            style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100}}
            pointerEvents="none"
        >
            {sparkles.map((sparkle) => (
                <ConfettiParticle
                    delay={sparkle.delay}
                    key={`${sparkle.id}-${animKey}`}
                    iconSrc={icons.Sparkles}
                    initialPosition={sparkle.initialPosition}
                    initialVelocity={sparkle.initialVelocity}
                    color={sparkle.color}
                />
            ))}
        </View>
    );
}

export default ConfettiCannonContainer;
export type {ConfettiCannonHandle};

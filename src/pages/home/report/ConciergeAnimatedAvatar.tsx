import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';

import variables from '@styles/variables';

import React, {useState} from 'react';
import {View} from 'react-native';

/**
 * The branded "thinking" animation shown in place of the static Concierge avatar while Concierge is
 * generating a response. Each mount shows one of the zoom variants at random.
 */
const ANIMATION_VARIANTS = [
    LottieAnimations.ConciergeThinkingScanGradient,
    LottieAnimations.ConciergeThinkingScanOuterGlow,
    LottieAnimations.ConciergeThinkingInceptionTriangle,
    LottieAnimations.ConciergeThinkingHypnotized,
];

const SIZE = variables.avatarSizeNormal;

function ConciergeAnimatedAvatar() {
    // Pick a random variant once per mount so the animation stays stable across re-renders.
    const [ANIMATION] = useState(() => ANIMATION_VARIANTS[Math.floor(Math.random() * ANIMATION_VARIANTS.length)]);

    return (
        <View
            style={{
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
                overflow: 'hidden',
            }}
        >
            <Lottie
                source={ANIMATION}
                autoPlay
                loop
                style={{width: SIZE, height: SIZE}}
                webStyle={{width: SIZE, height: SIZE}}
            />
        </View>
    );
}

ConciergeAnimatedAvatar.displayName = 'ConciergeAnimatedAvatar';

export default ConciergeAnimatedAvatar;

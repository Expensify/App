import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

/**
 * The branded "thinking" animation shown in place of the static Concierge avatar while Concierge is
 * generating a response.
 */
const ANIMATION = LottieAnimations.ConciergeThinkingScanGradient;

const SIZE = variables.avatarSizeNormal;

function ConciergeAnimatedAvatar() {
    return (
        <View style={{width: SIZE, height: SIZE, borderRadius: SIZE / 2, overflow: 'hidden'}}>
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

import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

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

function ConciergeAnimatedAvatar() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    // Pick a random variant once per mount so the animation stays stable across re-renders.
    const [ANIMATION] = useState(() => ANIMATION_VARIANTS[Math.floor(Math.random() * ANIMATION_VARIANTS.length)]);

    return (
        <View style={[StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.DEFAULT), styles.overflowHidden]}>
            <Lottie
                source={ANIMATION}
                autoPlay
                loop
                style={styles.conciergeAnimatedAvatar}
                webStyle={styles.conciergeAnimatedAvatar}
            />
        </View>
    );
}

ConciergeAnimatedAvatar.displayName = 'ConciergeAnimatedAvatar';

export default ConciergeAnimatedAvatar;

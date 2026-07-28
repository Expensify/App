import Avatar from '@components/Avatar';
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
            {/* Plain Concierge avatar shown underneath while the Lottie animation isn't ready yet. Lottie renders a
                transparent placeholder until it loads, so the static image fills the grey gap and the animation
                paints over it once it starts. */}
            <View style={styles.pAbsolute}>
                <Avatar
                    source={CONST.CONCIERGE_ICON_URL}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />
            </View>
            <View style={styles.pAbsolute}>
                <Lottie
                    source={ANIMATION}
                    autoPlay
                    loop
                    style={styles.conciergeAnimatedAvatar}
                    webStyle={styles.conciergeAnimatedAvatar}
                />
            </View>
        </View>
    );
}

ConciergeAnimatedAvatar.displayName = 'ConciergeAnimatedAvatar';

export default ConciergeAnimatedAvatar;

import React from 'react';
import Animated, {Easing, Keyframe} from 'react-native-reanimated';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SidePaneOverlayProps = {
    /** Whether the side pane is displayed inside of RHP */
    isInNarrowPaneModal: boolean;

    /** Callback fired when pressing the backdrop */
    onBackdropPress: () => void;
};

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();

function SidePaneOverlay({isInNarrowPaneModal, onBackdropPress}: SidePaneOverlayProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const CustomFadeIn = new Keyframe({
        from: {opacity: 0},
        to: {
            opacity: 0.72,
            easing,
        },
    }).duration(CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN);

    const CustomFadeOut = new Keyframe({
        from: {opacity: 0.72},
        to: {
            opacity: 0,
            easing,
        },
    }).duration(CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT);

    return (
        <Animated.View
            style={styles.sidePaneOverlay(isInNarrowPaneModal)}
            entering={isInNarrowPaneModal ? undefined : CustomFadeIn}
            exiting={isInNarrowPaneModal ? undefined : CustomFadeOut}
        >
            <PressableWithoutFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
                onPress={onBackdropPress}
                style={styles.flex1}
            />
        </Animated.View>
    );
}

SidePaneOverlay.displayName = 'SidePaneOverlay';

export default SidePaneOverlay;

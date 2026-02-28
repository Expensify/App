import React from 'react';
import Animated, {Keyframe} from 'react-native-reanimated';
import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SidePanelOverlayProps = {
    /** Whether the Side Panel is displayed over RHP */
    shouldBeVisible: boolean;

    /** Callback fired when pressing the backdrop */
    onBackdropPress: () => void;
};

function SidePanelOverlay({shouldBeVisible, onBackdropPress}: SidePanelOverlayProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const CustomFadeIn = new Keyframe(getModalInAnimation('fadeIn')).duration(CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN);
    const CustomFadeOut = new Keyframe(getModalOutAnimation('fadeOut')).duration(CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT);

    return (
        <Animated.View
            style={[styles.sidePanelOverlay, styles.sidePanelOverlayOpacity(shouldBeVisible)]}
            entering={shouldBeVisible ? CustomFadeIn : undefined}
            exiting={shouldBeVisible ? CustomFadeOut : undefined}
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

export default SidePanelOverlay;

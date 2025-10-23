import React, {useMemo} from 'react';
import Animated, {Keyframe} from 'react-native-reanimated';
import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type HelpOverlayProps = {
    /** Whether the Side Panel is displayed over RHP */
    isRHPVisible: boolean;

    /** Callback fired when pressing the backdrop */
    onBackdropPress: () => void;
};

function HelpOverlay({isRHPVisible, onBackdropPress}: HelpOverlayProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const CustomFadeIn = useMemo(() => new Keyframe(getModalInAnimation('fadeIn')).duration(CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN), []);

    const CustomFadeOut = useMemo(() => new Keyframe(getModalOutAnimation('fadeOut')).duration(CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT), []);

    return (
        <Animated.View
            style={[styles.sidePanelOverlay, styles.sidePanelOverlayOpacity(isRHPVisible)]}
            entering={isRHPVisible ? undefined : CustomFadeIn}
            exiting={isRHPVisible ? undefined : CustomFadeOut}
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

HelpOverlay.displayName = 'HelpOverlay';

export default HelpOverlay;

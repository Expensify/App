import {PressableWithoutFeedback} from '@components/Pressable';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import Animated from 'react-native-reanimated';

type SidePanelOverlayProps = {
    /** Whether the Side Panel is displayed over RHP */
    shouldBeVisible: boolean;

    /** Callback fired when pressing the backdrop */
    onBackdropPress: () => void;
};

// On web we intentionally do NOT opt into reanimated `entering`/`exiting` layout animations.
// Reanimated's web layout-animation code hides the element with `visibility: hidden` until its
// `animationstart` event fires, and with the 1ms web animation duration that event can be missed
// when the main thread is busy, leaving the backdrop permanently hidden (and non-interactive).
// The fade is already driven by `styles.sidePanelOverlayOpacity(shouldBeVisible)`, and a 1ms
// animation is imperceptible on web anyway, so there is no visual regression.
function SidePanelOverlay({shouldBeVisible, onBackdropPress}: SidePanelOverlayProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Animated.View style={[styles.sidePanelOverlay, styles.sidePanelOverlayOpacity(shouldBeVisible)]}>
            <PressableWithoutFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
                onPress={onBackdropPress}
                style={styles.flex1}
                sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.BACKDROP}
            />
        </Animated.View>
    );
}

export default SidePanelOverlay;

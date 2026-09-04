import {PressableWithoutFeedback} from '@components/Pressable';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import Animated from 'react-native-reanimated';

type SidePanelOverlayProps = {
    /** Whether the Side Panel is displayed over RHP */
    shouldBeVisible: boolean;

    /** Callback fired when pressing the backdrop */
    onBackdropPress: () => void;
};

// This backdrop intentionally does NOT use reanimated `entering`/`exiting` layout animations.
// Reanimated's web implementation hides the element with `visibility: hidden` until its
// `animationstart` event fires, and with the 1ms web animation duration that event can be missed
// when the main thread is busy, leaving the backdrop permanently hidden (and non-interactive).
// The fade was imperceptible anyway, so it is dropped rather than made conditional per platform.
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
            />
        </Animated.View>
    );
}

export default SidePanelOverlay;

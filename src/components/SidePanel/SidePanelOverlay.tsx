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

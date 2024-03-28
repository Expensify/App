import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
import {Animated, View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type OverlayProps = {
    /* Callback to close the modal */
    onPress: () => void;

    /* Returns whether a modal is displayed on the left side of the screen. By default, the modal is displayed on the right */
    isModalOnTheLeft?: boolean;
};

function Overlay({onPress, isModalOnTheLeft = false}: OverlayProps) {
    const styles = useThemeStyles();
    const {current} = useCardAnimation();
    const {translate} = useLocalize();

    return (
        <Animated.View style={styles.overlayStyles(current, isModalOnTheLeft)}>
            <View style={[styles.flex1, styles.flexColumn]}>
                {/* In the latest Electron version buttons can't be both clickable and draggable.
             That's why we added this workaround. Because of two Pressable components on the desktop app
             we have 30px draggable ba at the top and the rest of the dimmed area is clickable. On other devices,
             everything behaves normally like one big pressable */}
                <PressableWithoutFeedback
                    style={[styles.draggableTopBar, styles.boxShadowNone]}
                    onPress={onPress}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    nativeID={CONST.OVERLAY.TOP_BUTTON_NATIVE_ID}
                    tabIndex={-1}
                />
                <PressableWithoutFeedback
                    style={[styles.flex1, styles.boxShadowNone]}
                    onPress={onPress}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    noDragArea
                    nativeID={CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID}
                    tabIndex={-1}
                />
            </View>
        </Animated.View>
    );
}

Overlay.displayName = 'Overlay';

export default Overlay;

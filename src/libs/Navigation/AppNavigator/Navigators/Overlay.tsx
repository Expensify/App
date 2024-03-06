import {useCardAnimation} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {Animated, View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';

type OverlayProps = {
    /* Callback to close the modal */
    onPress?: () => void;

    onOverlayClick?: () => void;

    /* Returns whether a modal is displayed on the left side of the screen. By default, the modal is displayed on the right */
    isModalOnTheLeft?: boolean;
};

function Overlay({onOverlayClick, onPress, isModalOnTheLeft = false}: OverlayProps) {
    const styles = useThemeStyles();
    const {current} = useCardAnimation();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useOnboardingLayout();

    // non-native styling uses fixed positioning not supported on native platforms
    const shouldUseNativeStyles = useMemo(() => {
        const os = getOperatingSystem();
        if ((os === CONST.OS.ANDROID || os === CONST.OS.IOS || os === CONST.OS.NATIVE) && shouldUseNarrowLayout) {
            return true;
        }
        return false;
    }, [shouldUseNarrowLayout]);

    return (
        <Animated.View style={shouldUseNativeStyles ? styles.nativeOverlayStyles(current) : styles.overlayStyles(current, isModalOnTheLeft)}>
            <View
                onClick={onOverlayClick}
                style={[styles.flex1, styles.flexColumn]}
            >
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

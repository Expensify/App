import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useIsSoftKeyboardOpen from '@hooks/useIsSoftKeyboardOpen';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import useReportBackButtonPress from '@pages/inbox/useReportBackButtonPress';

import CONST from '@src/CONST';

import type {SharedValue} from 'react-native-reanimated';

import React, {useEffect} from 'react';
import Reanimated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

/** Matches the header's own collapse so the button doesn't linger behind the keyboard animation. */
const KEYBOARD_FADE_DURATION = 150;

type FloatingBackButtonProps = {
    /** 0 while the header is fully open, 1 once it has fully collapsed. */
    collapseProgress: SharedValue<number>;
};

/**
 * Back button that fades in over the report actions as the header scrolls away, so leaving the report never requires
 * scrolling back up to bring the header's own back button into view first.
 *
 * Its opacity is read straight off the header's collapse rather than run as a second timing, so the two buttons
 * always cross over together no matter how the collapse was triggered (scroll, rotation).
 *
 * The keyboard is the exception: it collapses the header too, but there the space belongs to the composer, and a
 * button floating over the message being typed is in the way rather than a way out. So the keyboard fades it back
 * out, and closing the keyboard restores it only if scrolling had hidden the header anyway.
 */
function FloatingBackButton({collapseProgress}: FloatingBackButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const onBackButtonPress = useReportBackButtonPress();
    const isSoftKeyboardOpen = useIsSoftKeyboardOpen();

    // 1 while the keyboard is closed, 0 while it is open. Kept as a factor on the collapse rather than a branch, so
    // the two can overlap without either one snapping.
    const keyboardFade = useSharedValue(isSoftKeyboardOpen ? 0 : 1);
    useEffect(() => {
        keyboardFade.set(withTiming(isSoftKeyboardOpen ? 0 : 1, {duration: KEYBOARD_FADE_DURATION}));
    }, [isSoftKeyboardOpen, keyboardFade]);

    const animatedStyle = useAnimatedStyle(() => {
        const progress = collapseProgress.get() * keyboardFade.get();

        return {
            opacity: progress,
            // While the header is still more than half visible the press belongs to its back button, and a
            // near-invisible button must never swallow a tap meant for the message underneath it.
            pointerEvents: progress > 0.5 ? 'auto' : 'none',
        };
    });

    return (
        <Reanimated.View style={[styles.floatingReportBackButton, animatedStyle]}>
            <PressableWithoutFeedback
                onPress={() => onBackButtonPress()}
                style={[styles.flex1, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
                accessibilityHint={translate('accessibilityHints.navigateToChatsList')}
                accessibilityLabel={translate('common.back')}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_SCREEN.FLOATING_BACK_BUTTON}
            >
                <Icon
                    src={icons.BackArrow}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Reanimated.View>
    );
}

export default FloatingBackButton;

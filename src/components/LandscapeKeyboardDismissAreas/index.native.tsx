import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {Keyboard} from 'react-native';

/**
 * Lets a tap in a side safe area dismiss the keyboard in landscape. They only exist while the keyboard is shown, because
 * the native tab bar can sit in that inset and would never get the tap otherwise.
 */
function LandscapeKeyboardDismissAreas() {
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isKeyboardShown} = useKeyboardState();
    const {left, right} = useSafeAreaInsets();

    if (!isInLandscapeMode || !isKeyboardShown) {
        return null;
    }

    return (
        <>
            {left > 0 && (
                <PressableWithoutFeedback
                    style={[styles.getSafeAreaPressablePosition('left', left)]}
                    onPress={() => Keyboard.dismiss()}
                    role="none"
                    accessible={false}
                    sentryLabel={CONST.SENTRY_LABEL.SAFE_AREA.DISMISS_KEYBOARD_LANDSCAPE_MODE}
                />
            )}
            {right > 0 && (
                <PressableWithoutFeedback
                    style={[styles.getSafeAreaPressablePosition('right', right)]}
                    onPress={() => Keyboard.dismiss()}
                    role="none"
                    accessible={false}
                    sentryLabel={CONST.SENTRY_LABEL.SAFE_AREA.DISMISS_KEYBOARD_LANDSCAPE_MODE}
                />
            )}
        </>
    );
}

export default LandscapeKeyboardDismissAreas;

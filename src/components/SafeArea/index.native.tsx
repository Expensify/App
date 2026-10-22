import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {Keyboard, View} from 'react-native';

import type SafeAreaProps from './types';

function SafeArea({children}: SafeAreaProps) {
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {left, right} = useSafeAreaInsets();

    return (
        // Root screens pad the horizontal safe area themselves, so the native tab bar can sit in it.
        <View style={styles.iPhoneXSafeArea}>
            {children}
            {isInLandscapeMode && left > 0 && (
                <PressableWithoutFeedback
                    style={[styles.getSafeAreaPressablePosition('left', left)]}
                    onPress={() => Keyboard.dismiss()}
                    role="none"
                    accessible={false}
                    sentryLabel={CONST.SENTRY_LABEL.SAFE_AREA.DISMISS_KEYBOARD_LANDSCAPE_MODE}
                />
            )}
            {isInLandscapeMode && right > 0 && (
                <PressableWithoutFeedback
                    style={[styles.getSafeAreaPressablePosition('right', right)]}
                    onPress={() => Keyboard.dismiss()}
                    role="none"
                    accessible={false}
                    sentryLabel={CONST.SENTRY_LABEL.SAFE_AREA.DISMISS_KEYBOARD_LANDSCAPE_MODE}
                />
            )}
        </View>
    );
}

export default SafeArea;

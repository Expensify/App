import React from 'react';
import {Keyboard} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type SafeAreaProps from './types';

function SafeArea({children}: SafeAreaProps) {
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {left, right} = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={[styles.iPhoneXSafeArea]}
            edges={['left', 'right']}
        >
            {children}
            {isInLandscapeMode && left > 0 && (
                <PressableWithoutFeedback
                    style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: left}}
                    onPress={() => Keyboard.dismiss()}
                    role="none"
                    accessible={false}
                    sentryLabel={CONST.SENTRY_LABEL.SAFE_AREA.DISMISS_KEYBOARD_LANDSCAPE_MODE}
                />
            )}
            {isInLandscapeMode && right > 0 && (
                <PressableWithoutFeedback
                    style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: right}}
                    onPress={() => Keyboard.dismiss()}
                    role="none"
                    accessible={false}
                    sentryLabel={CONST.SENTRY_LABEL.SAFE_AREA.DISMISS_KEYBOARD_LANDSCAPE_MODE}
                />
            )}
        </SafeAreaView>
    );
}

export default SafeArea;
